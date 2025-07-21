
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Bell, Users, Search, Settings, MessageSquare, TrendingUp, Activity, Eye, MousePointer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RealtimeStats {
  dailySignups: number;
  totalUsers: number;
  newServicesCount: number;
  activeContactForms: number;
  recentSearches: string[];
  topClickedServices: Array<{ title: string; clicks: number }>;
  serviceViews: Array<{ title: string; views: number }>;
  todayContactForms: Array<{ name: string; time: string }>;
}

interface Notification {
  id: string;
  type: 'new_user' | 'new_service' | 'new_contact' | 'high_activity';
  message: string;
  timestamp: Date;
  read: boolean;
}

export const RealTimeTracker = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<RealtimeStats>({
    dailySignups: 0,
    totalUsers: 0,
    newServicesCount: 0,
    activeContactForms: 0,
    recentSearches: [],
    topClickedServices: [],
    serviceViews: [],
    todayContactForms: []
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    loadRealTimeStats();
    const interval = setInterval(loadRealTimeStats, 30000); // Update every 30 seconds

    // Set up real-time subscriptions for live updates
    const profilesChannel = supabase
      .channel('profiles-live')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'profiles' },
        (payload) => {
          addNotification('new_user', `مستخدم جديد: ${payload.new.full_name || 'مستخدم'}`);
          loadRealTimeStats();
        }
      )
      .subscribe();

    const servicesChannel = supabase
      .channel('services-live')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'services' },
        (payload) => {
          addNotification('new_service', `خدمة جديدة: ${payload.new.title}`);
          loadRealTimeStats();
        }
      )
      .subscribe();

    const contactsChannel = supabase
      .channel('contacts-live')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'contact_submissions' },
        (payload) => {
          addNotification('new_contact', `نموذج تواصل جديد من: ${payload.new.name}`);
          loadRealTimeStats();
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(servicesChannel);
      supabase.removeChannel(contactsChannel);
    };
  }, []);

  const loadRealTimeStats = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get daily signups
      const { count: dailySignups } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      // Get total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get today's new services
      const { count: newServices } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      // Get today's contact forms
      const { count: activeContactForms } = await supabase
        .from('contact_submissions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      // Get recent searches (last 10)
      const { data: searchData } = await supabase
        .from('search_analytics')
        .select('search_query')
        .order('created_at', { ascending: false })
        .limit(10);

      // Get top clicked services today
      const { data: serviceClicks } = await supabase
        .from('service_analytics')
        .select(`
          service_id,
          service:services(title)
        `)
        .gte('created_at', today.toISOString())
        .eq('action_type', 'contact_click');

      const clickCounts = (serviceClicks || []).reduce((acc: any, item: any) => {
        const title = item.service?.title || 'خدمة محذوفة';
        acc[title] = (acc[title] || 0) + 1;
        return acc;
      }, {});

      const topClicked = Object.entries(clickCounts)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 5)
        .map(([title, clicks]) => ({ title, clicks: clicks as number }));

      // Get service views today
      const { data: serviceViewsData } = await supabase
        .from('service_analytics')
        .select(`
          service_id,
          service:services(title)
        `)
        .gte('created_at', today.toISOString())
        .eq('action_type', 'view');

      const viewCounts = (serviceViewsData || []).reduce((acc: any, item: any) => {
        const title = item.service?.title || 'خدمة محذوفة';
        acc[title] = (acc[title] || 0) + 1;
        return acc;
      }, {});

      const topViewed = Object.entries(viewCounts)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 5)
        .map(([title, views]) => ({ title, views: views as number }));

      // Get today's contact forms
      const { data: todayContacts } = await supabase
        .from('contact_submissions')
        .select('name, created_at')
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      setStats({
        dailySignups: dailySignups || 0,
        totalUsers: totalUsers || 0,
        newServicesCount: newServices || 0,
        activeContactForms: activeContactForms || 0,
        recentSearches: (searchData || []).map(s => s.search_query),
        topClickedServices: topClicked,
        serviceViews: topViewed,
        todayContactForms: (todayContacts || []).map(c => ({
          name: c.name,
          time: new Date(c.created_at).toLocaleTimeString('ar')
        }))
      });

    } catch (error) {
      console.error('Error loading real-time stats:', error);
    }
  };

  const addNotification = (type: Notification['type'], message: string) => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 19)]); // Keep last 20

    // Show toast for important notifications
    toast({
      title: "إشعار جديد",
      description: message,
    });
  };

  const markNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Notifications Bar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              التتبع المباشر والإشعارات
            </CardTitle>
            <div className="relative">
              <Button
                variant="outline"
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) markNotificationsAsRead();
                }}
                className="relative"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-background border rounded-lg shadow-lg z-10">
                  <div className="p-4">
                    <h3 className="font-semibold mb-3">الإشعارات الأخيرة</h3>
                    {notifications.length === 0 ? (
                      <p className="text-muted-foreground text-sm">لا توجد إشعارات</p>
                    ) : (
                      <div className="space-y-2">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-2 rounded text-sm ${
                              notification.read ? 'bg-muted/50' : 'bg-muted'
                            }`}
                          >
                            <p className="font-medium">{notification.message}</p>
                            <p className="text-xs text-muted-foreground">
                              {notification.timestamp.toLocaleString('ar')}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Real-time Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">تسجيلات اليوم</p>
                <p className="text-2xl font-bold">{stats.dailySignups}</p>
                <p className="text-xs text-muted-foreground">من أصل {stats.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Settings className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">خدمات جديدة اليوم</p>
                <p className="text-2xl font-bold">{stats.newServicesCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">نماذج تواصل اليوم</p>
                <p className="text-2xl font-bold">{stats.activeContactForms}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">معدل النشاط</p>
                <p className="text-2xl font-bold">
                  {stats.dailySignups + stats.newServicesCount + stats.activeContactForms}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Search className="h-4 w-4" />
              آخر عمليات البحث
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.recentSearches.slice(0, 6).map((search, index) => (
                <div key={index} className="p-2 bg-muted rounded text-sm">
                  {search}
                </div>
              ))}
              {stats.recentSearches.length === 0 && (
                <p className="text-muted-foreground text-sm">لا توجد عمليات بحث حديثة</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MousePointer className="h-4 w-4" />
              الخدمات الأكثر تفاعلاً
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.topClickedServices.map((service, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                  <span className="text-sm font-medium truncate">{service.title}</span>
                  <Badge variant="secondary">{service.clicks}</Badge>
                </div>
              ))}
              {stats.topClickedServices.length === 0 && (
                <p className="text-muted-foreground text-sm">لا توجد تفاعلات اليوم</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Eye className="h-4 w-4" />
              الخدمات الأكثر مشاهدة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.serviceViews.map((service, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                  <span className="text-sm font-medium truncate">{service.title}</span>
                  <Badge variant="outline">{service.views}</Badge>
                </div>
              ))}
              {stats.serviceViews.length === 0 && (
                <p className="text-muted-foreground text-sm">لا توجد مشاهدات اليوم</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="h-4 w-4" />
              نماذج التواصل الحديثة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.todayContactForms.map((contact, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                  <span className="text-sm font-medium truncate">{contact.name}</span>
                  <span className="text-xs text-muted-foreground">{contact.time}</span>
                </div>
              ))}
              {stats.todayContactForms.length === 0 && (
                <p className="text-muted-foreground text-sm">لا توجد نماذج تواصل حديثة</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
