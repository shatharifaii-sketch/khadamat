import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdminAnalytics } from '@/hooks/useAdminAnalytics';
import { Search, Eye, MessageSquare, Users, TrendingUp, Activity } from 'lucide-react';

export const AnalyticsDashboard = () => {
  const { 
    searchAnalytics, 
    serviceAnalytics, 
    conversationAnalytics, 
    analyticsSummary, 
    isLoading 
  } = useAdminAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const getActionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      view: 'مشاهدة',
      contact_click: 'نقر على التواصل',
      phone_click: 'نقر على الهاتف',
      email_click: 'نقر على الإيميل',
    };
    return labels[type] || type;
  };

  const getActionTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      view: 'bg-blue-100 text-blue-800',
      contact_click: 'bg-green-100 text-green-800',
      phone_click: 'bg-orange-100 text-orange-800',
      email_click: 'bg-purple-100 text-purple-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Search className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">إجمالي البحث</p>
                <p className="text-2xl font-bold">{analyticsSummary?.totalSearches || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">مشاهدات الخدمات</p>
                <p className="text-2xl font-bold">{analyticsSummary?.totalServiceViews || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">نقرات التواصل</p>
                <p className="text-2xl font-bold">{analyticsSummary?.totalContacts || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">المحادثات</p>
                <p className="text-2xl font-bold">{analyticsSummary?.totalConversations || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="searches" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="searches">البحث</TabsTrigger>
          <TabsTrigger value="services">الخدمات</TabsTrigger>
          <TabsTrigger value="conversations">المحادثات</TabsTrigger>
          <TabsTrigger value="top-content">المحتوى الأكثر شعبية</TabsTrigger>
        </TabsList>

        <TabsContent value="searches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>آخر عمليات البحث</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {searchAnalytics.slice(0, 20).map((search) => (
                  <div key={search.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{search.search_query}</p>
                      <p className="text-sm text-muted-foreground">
                        {search.category && `الفئة: ${search.category} • `}
                        {search.location && `الموقع: ${search.location} • `}
                        نتائج: {search.results_count}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(search.created_at).toLocaleString('ar')}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>آخر تفاعلات الخدمات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {serviceAnalytics.slice(0, 20).map((analytic) => (
                  <div key={analytic.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{analytic.service?.title || 'خدمة محذوفة'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getActionTypeBadge(analytic.action_type)}>
                          {getActionTypeLabel(analytic.action_type)}
                        </Badge>
                        {analytic.service?.category && (
                          <span className="text-sm text-muted-foreground">
                            {analytic.service.category}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(analytic.created_at).toLocaleString('ar')}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>آخر المحادثات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conversationAnalytics.slice(0, 20).map((conv) => (
                  <div key={conv.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{conv.service?.title || 'خدمة محذوفة'}</p>
                      <p className="text-sm text-muted-foreground">
                        {conv.message_count} رسالة • 
                        آخر نشاط: {new Date(conv.last_activity_at).toLocaleString('ar')}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      بدأت: {new Date(conv.started_at).toLocaleString('ar')}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="top-content" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>أكثر المصطلحات بحثاً</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsSummary?.topSearchTerms?.slice(0, 10).map((term, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="font-medium">{term.query}</span>
                      <Badge variant="secondary">{term.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>أكثر الخدمات مشاهدة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsSummary?.topViewedServices?.slice(0, 10).map((service, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="font-medium">{service.title}</span>
                      <Badge variant="secondary">{service.views}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};