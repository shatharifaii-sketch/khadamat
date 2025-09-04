import React, { Suspense, useState } from 'react'
import ActivityChart, { ActivityChartProps } from './ActivityChart'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { BarChart3, Search, Settings, TrendingUp, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { AnalyticsSummary } from '@/types/analytics'
import ErrorBoundary from '../ErrorBoundary'
import { ServiceManagement } from './ServiceManagement'
import { UserManagement } from './UserManagement'
import { Json, Tables } from '@/integrations/supabase/types'
import { Service } from '@/hooks/useAdminFunctionality'
import { ServiceEditModal } from './ServiceEditModal'

interface Props {
    analyticsSummary: AnalyticsSummary;
    adminData: {
        services: Service[];
        profiles: Tables<'profiles'>[];
    };
    stats: {
        publishedServices: number;
        serviceProviders: number;
        totalServices: number;
        totalUsers: number;
        todaySignups: number;
    };
    loginStats: Json;
    dailyStats: {
        day: string;
        user_count: number;
    }[];
    monthlyStats: {
        month: string;
        user_count: number;
    }[];
    yearlyStats: {
        year: string;
        user_count: number;
    }[];
}

const AdminView = ({ analyticsSummary, adminData, stats, dailyStats, monthlyStats, yearlyStats }: Props) => {
    const [selectedService, setSelectedService] = useState<Service | null>(null);
      const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
      
    return (
        <div>
            {/* Simple Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">إجمالي المستخدمين</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalUsers}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">إجمالي الخدمات</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalServices}</div>
                    </CardContent>
                </Card>
            </div>

            {/* ACTIVITY CHARTS */}
            <ActivityChart
                dailyStats={dailyStats}
                monthlyStats={monthlyStats}
                yearlyStats={yearlyStats}
            />

            {/* Main Admin Tabs */}
            <Tabs defaultValue="analytics" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="analytics" className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        التحليلات
                    </TabsTrigger>
                    <TabsTrigger value="users" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        المستخدمين
                    </TabsTrigger>
                    <TabsTrigger value="services" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        الخدمات
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="analytics">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>إحصائيات المستخدمين</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between">
                                    <span>إجمالي المستخدمين:</span>
                                    <span className="font-bold">{stats.totalUsers}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>مقدمي الخدمات:</span>
                                    <span className="font-bold">{stats.serviceProviders}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>المنضمين اليوم:</span>
                                    <span className="font-bold">{stats.todaySignups}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>إحصائيات الخدمات</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between">
                                    <span>إجمالي الخدمات:</span>
                                    <span className="font-bold">{stats.totalServices}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>الخدمات المنشورة:</span>
                                    <span className="font-bold">{stats.publishedServices}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Search className="h-5 w-5 text-primary" />
                                    أكثر الكلمات بحثاً
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {analyticsSummary?.topSearchTerms && analyticsSummary.topSearchTerms.length > 0 ? (
                                    <div className="space-y-3">
                                        {analyticsSummary.topSearchTerms.slice(0, 5).map((term, index) => (
                                            <div key={term.query} className="flex justify-between items-center">
                                                <span className="font-medium">#{index + 1} {term.query}</span>
                                                <Badge variant="secondary">{term.count} مرة</Badge>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground text-center py-4">لا توجد عمليات بحث بعد</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-primary" />
                                    أكثر الخدمات نقراً
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {analyticsSummary?.topViewedServices && analyticsSummary.topViewedServices.length > 0 ? (
                                    <div className="space-y-3">
                                        {analyticsSummary.topViewedServices.slice(0, 5).map((service, index) => (
                                            <div key={service.service_id} className="flex justify-between items-center">
                                                <span className="font-medium truncate">#{index + 1} {service.title}</span>
                                                <Badge variant="secondary">{service.views} مشاهدة</Badge>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground text-center py-4">لا توجد مشاهدات بعد</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="users">
                    {/* User Management */}
                    <UserManagement users={adminData?.profiles} />
                </TabsContent>

                {/** Service Management */}
                <TabsContent value="services">
                    <ServiceManagement
                        services={adminData.services}
                        users={adminData.profiles}
                        onServiceUpdated={() => { }}
                    />
                </TabsContent>
            </Tabs>

            {/** Service Edit Modal  */}
        <ServiceEditModal 
          service={selectedService}
          isOpen={isServiceModalOpen}
          onClose={() => {
            setIsServiceModalOpen(false);
            setSelectedService(null);
          }}
          onServiceUpdated={() => {}}
        /> 
        </div>
    )
}

export default AdminView