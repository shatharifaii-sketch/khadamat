import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Bell, Users, Search, Settings, MessageSquare, TrendingUp, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RealtimeStats {
  dailyVisitors: number;
  totalSignups: number;
  newServicesCount: number;
  activeMessages: number;
  recentSearches: string[];
  topClickedServices: Array<{ title: string; clicks: number }>;
  activeConversations: Array<{ service_title: string; message_count: number }>;
}

interface Notification {
  id: string;
  type: 'new_user' | 'new_service' | 'new_message' | 'high_activity';
  message: string;
  timestamp: Date;
  read: boolean;
}

export const RealTimeTracker = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<RealtimeStats>({
    dailyVisitors: 0,
    totalSignups: 0,
    newServicesCount: 0,
    activeMessages: 0,
    recentSearches: [],
    topClickedServices: [],
    activeConversations: []
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    loadRealTimeStats();
    const interval = setInterval(loadRealTimeStats, 30000); // Update every 30 seconds

    // Set up real-time subscriptions
    const profilesChannel = supabase
      .channel('profiles-changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'profiles' },
        (payload) => {
          addNotification('new_user', `مستخدم جديد: ${payload.new.full_name || 'مستخدم'}`);
          loadRealTimeStats();
        }
      )
      .subscribe();

    const servicesChannel = supabase
      .channel('services-changes')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'services' },
        (payload) => {
          addNotification('new_service', `خدمة جديدة: ${payload.new.title}`);
          loadRealTimeStats();
        }
      )
      .subscribe();

    const contactsChannel = supabase
      .channel('contacts-changes')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'contact_submissions' },
        (payload) => {
          addNotification('new_message', `نموذج تواصل جديد من: ${payload.new.name}`);
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

      // Get total signups
      const { count: totalSignups } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get today's new services
      const { count: newServices } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      // Get contact forms today
      const { count: activeMessages } = await supabase
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
        .neq('action_type', 'view');

      const clickCounts = (serviceClicks || []).reduce((acc: any, item: any) => {
        const title = item.service?.title || 'خدمة محذوفة';
        acc[title] = (acc[title] || 0) + 1;
        return acc;
      }, {});

      const topClicked = Object.entries(clickCounts)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 5)
        .map(([title, clicks]) => ({ title, clicks: clicks as number }));

      // Get recent contact forms by service
      const { data: conversations } = await supabase
        .from('contact_submissions')
        .select('*')
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        dailyVisitors: dailySignups || 0,
        totalSignups: totalSignups || 0,
        newServicesCount: newServices || 0,
        activeMessages: activeMessages || 0,
        recentSearches: (searchData || []).map(s => s.search_query),
        topClickedServices: topClicked,
        activeConversations: (conversations || []).map((c, index) => ({
          service_title: c.name || `نموذج ${index + 1}`,
          message_count: 1
        })).slice(0, 5)
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
              التتبع المباشر
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
                <p className="text-sm text-muted-foreground">زوار اليوم</p>
                <p className="text-2xl font-bold">{stats.dailyVisitors}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">إجمالي المشتركين</p>
                <p className="text-2xl font-bold">{stats.totalSignups}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Settings className="h-8 w-8 text-purple-500" />
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
                <p className="text-2xl font-bold">{stats.activeMessages}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              آخر عمليات البحث
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.recentSearches.slice(0, 8).map((search, index) => (
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
            <CardTitle>الخدمات الأكثر تفاعلاً</CardTitle>
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
            <CardTitle>نماذج التواصل الحديثة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.activeConversations.map((conv, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                  <span className="text-sm font-medium truncate">{conv.service_title}</span>
                  <Badge variant="secondary">{conv.message_count} نموذج</Badge>
                </div>
              ))}
              {stats.activeConversations.length === 0 && (
                <p className="text-muted-foreground text-sm">لا توجد نماذج تواصل حديثة</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};