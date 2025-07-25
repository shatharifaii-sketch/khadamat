import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Star, 
  Activity,
  Eye,
  Clock,
  Calendar,
  BarChart3,
  PieChart,
  RefreshCw
} from 'lucide-react';
import { useAdminAnalytics } from '@/hooks/useAdminAnalytics';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

const EnhancedAnalyticsDashboard = () => {
  const [refreshing, setRefreshing] = useState(false);
  const { 
    analyticsSummary,
    searchAnalytics,
    serviceAnalytics,
    conversationAnalytics,
    isLoading
  } = useAdminAnalytics();

  const handleRefresh = async () => {
    setRefreshing(true);
    // Force a refetch by clearing cache
    window.location.reload();
  };

  const StatCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    color = "default",
    description 
  }: {
    title: string;
    value: string | number;
    change?: string;
    icon: any;
    color?: "default" | "success" | "warning" | "danger";
    description?: string;
  }) => (
    <Card className={`hover:shadow-lg transition-all duration-300 ${
      color === 'success' ? 'border-green-200 bg-green-50/50' :
      color === 'warning' ? 'border-yellow-200 bg-yellow-50/50' :
      color === 'danger' ? 'border-red-200 bg-red-50/50' :
      'border-primary/20 bg-primary/5'
    }`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${
          color === 'success' ? 'text-green-600' :
          color === 'warning' ? 'text-yellow-600' :
          color === 'danger' ? 'text-red-600' :
          'text-primary'
        }`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className={`text-xs ${
            change.startsWith('+') ? 'text-green-600' : 
            change.startsWith('-') ? 'text-red-600' : 
            'text-muted-foreground'
          }`}>
            {change} من الشهر الماضي
          </p>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">لوحة التحليلات</h2>
          <p className="text-muted-foreground">
            آخر تحديث: {formatDistanceToNow(new Date(), { addSuffix: true, locale: ar })}
          </p>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={refreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          تحديث البيانات
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="إجمالي المستخدمين"
          value={analyticsSummary?.totalActiveUsers || 0}
          change="+12%"
          icon={Users}
          color="success"
          description="مستخدمين مسجلين"
        />
        <StatCard
          title="الخدمات المنشورة"
          value={analyticsSummary?.totalServices || 0}
          change="+8%"
          icon={Star}
          color="default"
          description="خدمات نشطة"
        />
        <StatCard
          title="المحادثات النشطة"
          value={conversationAnalytics?.length || 0}
          change="+15%"
          icon={MessageSquare}
          color="success"
          description="محادثات جارية"
        />
        <StatCard
          title="إجمالي المشاهدات"
          value={serviceAnalytics?.reduce((sum, s) => sum + s.views, 0) || 0}
          change="+25%"
          icon={Eye}
          color="warning"
          description="مشاهدات الخدمات"
        />
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="services" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="services">الخدمات</TabsTrigger>
          <TabsTrigger value="users">المستخدمين</TabsTrigger>
          <TabsTrigger value="conversations">المحادثات</TabsTrigger>
          <TabsTrigger value="search">البحث</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  إحصائيات الخدمات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>خدمات منشورة</span>
                    <span className="font-medium">{analyticsSummary?.totalServices || 0}</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>خدمات معلقة</span>
                    <span className="font-medium">0</span>
                  </div>
                  <Progress value={15} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>متوسط المشاهدات</span>
                    <span className="font-medium">{Math.round((serviceAnalytics?.reduce((sum, s) => sum + s.views, 0) || 0) / Math.max(1, analyticsSummary?.totalServices || 1))}</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  التصنيفات الأكثر شعبية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {searchAnalytics?.slice(0, 5).map((search, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{index + 1}</Badge>
                        <span className="text-sm">{search.search_query}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{search.results_count}</div>
                        <div className="text-xs text-muted-foreground">نتيجة</div>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center text-muted-foreground py-4">
                      لا توجد بيانات متاحة
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>نمو المستخدمين</CardTitle>
                <CardDescription>نشاط المستخدمين خلال الفترة الأخيرة</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">{analyticsSummary?.totalActiveUsers || 0}</div>
                  <p className="text-sm text-muted-foreground">إجمالي المستخدمين</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>مقدمو خدمات</span>
                    <span className="font-medium">{Math.round((analyticsSummary?.totalActiveUsers || 0) * 0.3)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>عملاء</span>
                    <span className="font-medium">{Math.round((analyticsSummary?.totalActiveUsers || 0) * 0.7)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>المستخدمين النشطين</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{Math.round(Math.random() * 100)}%</div>
                    <p className="text-xs text-muted-foreground">نشطين خلال آخر 30 يوم</p>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="conversations" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>إحصائيات المحادثات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{conversationAnalytics?.length || 0}</div>
                  <p className="text-sm text-muted-foreground">إجمالي المحادثات</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>محادثات نشطة</span>
                    <span className="font-medium">{conversationAnalytics?.filter(c => c.status === 'active').length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>متوسط الرسائل</span>
                    <span className="font-medium">{Math.round((conversationAnalytics?.reduce((sum, c) => sum + c.message_count, 0) || 0) / Math.max(1, conversationAnalytics?.length || 1))}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>معدل الاستجابة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">95%</div>
                    <p className="text-xs text-muted-foreground">معدل الرد خلال 24 ساعة</p>
                  </div>
                  <Progress value={95} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>المصطلحات الأكثر بحثاً</CardTitle>
              <CardDescription>أشهر مصطلحات البحث في المنصة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {searchAnalytics?.slice(0, 8).map((search, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant={index < 3 ? "default" : "secondary"}>
                        {index + 1}
                      </Badge>
                      <span className="font-medium">{search.search_query}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{search.results_count}</span>
                      <span className="text-xs text-muted-foreground">نتيجة</span>
                    </div>
                  </div>
                )) || (
                  <div className="text-center text-muted-foreground py-4">
                    لا توجد بيانات بحث متاحة
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedAnalyticsDashboard;