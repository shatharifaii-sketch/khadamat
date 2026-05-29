import React, { Suspense, useEffect, useState } from 'react'
import ActivityChart, { ActivityChartProps } from './ActivityChart'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { BadgePercent, BarChart3, Eye, Search, Settings, TrendingUp, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { AnalyticsSummary } from '@/types/analytics'
import ErrorBoundary from '../ErrorBoundary'
import { ServiceManagement } from './ServiceManagement'
import { UserManagement, UserProfile } from './UserManagement'
import { Json, Tables } from '@/integrations/supabase/types'
import { Service } from '@/hooks/useAdminFunctionality'
import { ServiceEditModal } from './ServiceEditModal'
import CouponsManagement from './CouponsManagement'
import PendingServicesManagement from './PendingServicesManagement'
import WebAnalytics from './WebAnalytics'
import WebLineChart from './WebLineChart'
import { useTranslation } from 'react-i18next'
import useWebAnalytics from '@/hooks/useWebAnalytics'

interface Props {
    analyticsSummary: AnalyticsSummary;
    adminData: {
        services: Service[];
        profiles: UserProfile[];
        coupons: Tables<'coupons'>[];
        pendingServices: Service[];
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
    const { t } = useTranslation("admin");
    const lang = localStorage.getItem("language") || "en";
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
//     const { 
//     analyticsData, 
//     analyticsLoading, 
//     topPaths, 
//     visitsPerDay,
//     dailyStats: analyticsDailyStats,
//     monthlyStats: analyticsMonthlyStats,
//     yearlyStats: analyticsYearlyStats,
//     deviceStats
//   } = useWebsiteAnalytics();

    const {
        analyticsData,
        refreshAnalytics,
        topPaths,
        visitsPerDay,
        yearlyStats: analyticsYearlyStats,
        monthlyStats: analyticsMonthlyStats,
        dailyStats: analyticsDailyStats,
        deviceStats
    } = useWebAnalytics();

    useEffect(() => {
        refreshAnalytics();
    }, [refreshAnalytics])
    
    return (
        <div>
            {/* Simple Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8" dir={lang === "ar" ? "rtl" : "ltr"}>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-start">
                            {t("stats.total_users")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-start">{stats.totalUsers}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-start">
                            {t("stats.total_services")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-start">{stats.totalServices}</div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="activity" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="activity" className="flex items-center justify-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        {t("stats.user_activity_analytics")}
                    </TabsTrigger>
                    <TabsTrigger value="web_analytics" className="flex items-center justify-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        {t("stats.activity_analytics")}
                    </TabsTrigger>
                </TabsList>

                {/* ACTIVITY CHARTS */}
                <TabsContent value='activity'>
                    <ActivityChart
                        dailyStats={dailyStats}
                        monthlyStats={monthlyStats}
                        yearlyStats={yearlyStats}
                    />
                </TabsContent>
                <TabsContent value='web_analytics'>
                    <WebLineChart
                        dailyStats={analyticsDailyStats}
                        monthlyStats={analyticsMonthlyStats}
                        yearlyStats={analyticsYearlyStats}
                    />
                </TabsContent>
            </Tabs>

            {/* Main Admin Tabs */}
            <Tabs defaultValue="analytics" className="space-y-6">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="analytics" className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        {t("table.header.analytics")}
                    </TabsTrigger>
                    <TabsTrigger value="users" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {t("table.header.users")}
                    </TabsTrigger>
                    <TabsTrigger value="services" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        {t("table.header.services")}
                    </TabsTrigger>
                    <TabsTrigger value="pending-services" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        {t("table.header.pending_services")}
                    </TabsTrigger>
                    <TabsTrigger value="coupons" className="flex items-center gap-2">
                        <BadgePercent className="h-4 w-4" />
                        {t("table.header.coupons")}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="analytics">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {t("table.analytics.user_analytics")}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between">
                                    <span>{t("table.analytics.total_users")}:</span>
                                    <span className="font-bold">{stats.totalUsers}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>{t("table.analytics.service_providers")}:</span>
                                    <span className="font-bold">{stats.serviceProviders}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>{t("table.analytics.today_signups")}:</span>
                                    <span className="font-bold">{stats.todaySignups}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>{t("table.analytics.service_analytics")}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between">
                                    <span>{t("table.analytics.total_services")}:</span>
                                    <span className="font-bold">{stats.totalServices}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>{t("table.analytics.published_services")}:</span>
                                    <span className="font-bold">{stats.publishedServices}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Search className="h-5 w-5 text-primary" />
                                    {t("table.analytics.top_search_terms")}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {analyticsSummary?.topSearchTerms && analyticsSummary.topSearchTerms.length > 0 ? (
                                    <div className="space-y-3">
                                        {analyticsSummary.topSearchTerms.slice(0, 5).map((term, index) => (
                                            <div key={term.query} className="flex justify-between items-center">
                                                <span className="font-medium">#{index + 1} {term.query}</span>
                                                <Badge variant="secondary">
                                                    x {term.count}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground text-center py-4">{t("table.analytics.no_search_terms")}</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-primary" />
                                    {t("table.analytics.top_viewed_services")}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {analyticsSummary?.topViewedServices && analyticsSummary.topViewedServices.length > 0 ? (
                                    <div className="space-y-3">
                                        {analyticsSummary.topViewedServices.slice(0, 5).map((service, index) => (
                                            <div key={service.service_id} className="flex justify-between items-center">
                                                <span className="font-medium truncate">#{index + 1} {service.title}</span>
                                                <Badge variant="secondary">{service.views} <Eye size={14} className='ml-2'/></Badge>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground text-center py-4">
                                        {t("table.analytics.no_viewed_services")}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <WebAnalytics
                        topPaths={topPaths}
                        visitsPerDay={visitsPerDay}
                        deviceStats={deviceStats}
                    />
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

                {/** Pending Services Management */}
                <TabsContent value="pending-services">
                    <PendingServicesManagement
                        services={adminData.pendingServices}
                        onServiceUpdated={() => { }}
                    />
                </TabsContent>

                {/** Coupon Management */}
                <TabsContent value="coupons">
                    <CouponsManagement
                        coupons={adminData.coupons}
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
                onServiceUpdated={() => { }}
            />
        </div>
    )
}

export default AdminView