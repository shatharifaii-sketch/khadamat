import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useIsMobile } from "./use-mobile";
import { isMobile } from "@/lib/utils";

type visitData = {
    id: string;
    visitingDate: string;
}

type checkVisitDataResult = {
    id: string;
    isNewVisit: boolean;
    lastVisit: string;
    newVisitDate?: string;
}

type AnalyticsRow = {
    id: number;
    visitor_id: string;
    path: string;
    is_new_visit: boolean;
    created_at: string;
    is_mobile: boolean;
}

const VISIT_THRESHOLD_MS = 30 * 60 * 1000;

function getVisitData(): visitData {
    let id = localStorage.getItem('visitorId');
    let visitingDate = localStorage.getItem('visitingDate');

    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem('visitorId', id);
    }

    if (!visitingDate) {
        visitingDate = new Date().toISOString();
        localStorage.setItem('visitingDate', visitingDate);
    }

    return { id, visitingDate };
}

function checkVisitData(): checkVisitDataResult {
    const { id, visitingDate } = getVisitData();

    const now = Date.now();
    const lastVisit = new Date(visitingDate).getTime();

    const diff = now - lastVisit;
    const isNewVisit = diff > VISIT_THRESHOLD_MS;

    if (isNewVisit) {
        const newDate = new Date().toISOString();
        localStorage.setItem("visitingDate", newDate);

        return {
            id,
            isNewVisit: true,
            lastVisit: visitingDate,
            newVisitDate: newDate
        };
    }

    return {
        id,
        isNewVisit: false,
        lastVisit: visitingDate
    };
}

function getTopPaths(data: AnalyticsRow[]) {
    const counts: Record<string, number> = {};

    data.forEach((row) => {
        counts[row.path] = (counts[row.path] || 0) + 1;
    });

    return Object.entries(counts).map(([path, count]) => ({ path, count })).sort((a, b) => b.count - a.count).slice(0, 5);
}

function getVisitsPerDay(data: AnalyticsRow[]) {
    const counts: Record<string, number> = {};

    data.forEach((row) => {
        if (!row.is_new_visit) return;

        const date = new Date(row.created_at).toISOString().split("T")[0];

        counts[date] = (counts[date] || 0) + 1;
    });

    return Object.entries(counts).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date));
}

function getDailyStats(data: AnalyticsRow[]) {
    const map: Record<string, number> = {};

    data.forEach((row) => {
        if (!row.is_new_visit) return;
        if (row.path.startsWith("/admin")) return;

        const day = new Date(row.created_at).toISOString().split("T")[0];

        map[day] = (map[day] || 0) + 1;
    });

    return Object.entries(map).map(([day, user_count]) => ({ day, user_count })).sort((a, b) => a.day.localeCompare(b.day));
}

function getMonthlyStats(data: AnalyticsRow[]) {
    const map: Record<string, number> = {};

    data.forEach((row) => {
        if (!row.is_new_visit) return;
        if (row.path.startsWith("/admin")) return;

        const date = new Date(row.created_at);
        const key = `${date.getFullYear()}-${date.getMonth() + 1}`;

        map[key] = (map[key] || 0) + 1;
    });

    return Object.entries(map).map(([month, user_count]) => ({
        month: `${month}-01`,
        user_count
    })).sort((a, b) => a.month.localeCompare(b.month));
}

function getYearlyStats(data: AnalyticsRow[]) {
    const map: Record<string, number> = {};

    data.forEach((row) => {
        if (!row.is_new_visit) return;
        if (row.path.startsWith("/admin")) return;

        const year = new Date(row.created_at).getFullYear().toString();

        map[year] = (map[year] || 0) + 1;
    });

    return Object.entries(map).map(([year, user_count]) => ({
        year: `${year}-01-01`,
        user_count
    })).sort((a, b) => a.year.localeCompare(b.year));
}

function getDeviceStats(data: AnalyticsRow[]) {
    let mobile = 0;
    let desktop = 0;

    data.forEach((row) => {
        if (!row.is_new_visit) return;

        if (row.is_mobile) {
            mobile++;
        } else {
            desktop++;
        }
    });

    const total = mobile + desktop;

    return {
        mobile,
        desktop,
        mobilePercent: total ? Math.round((mobile / (total)) * 100) : 0,
        desktopPercentage: total ? Math.round((desktop / (total)) * 100) : 0
    }
}

export const useWebsiteAnalytics = () => {
    const queryClient = useQueryClient();
    const location = useLocation();

    const {
        data: analyticsData,
        isLoading: analyticsLoading
    } = useQuery({
        queryKey: ["analytics"],
        queryFn: async () => {
            const { data, error } = await supabase.from("web_analytics_dev").select("*").not("path", "like", "/admin%").order("created_at", { ascending: false });

            if (error) throw error;
            return data;
        }
    });

    useEffect(() => {
        if (location.pathname.startsWith("/admin")) return;

        async function track() {
            const result = checkVisitData();

            const { error } = await supabase.from("web_analytics_dev").insert({
                visitor_id: result.id,
                path: location.pathname,
                is_new_visit: result.isNewVisit,
                is_mobile: isMobile
            });

            if (error) {
                console.error("Analytics error:", error);
            }

            // update last visited path
            localStorage.setItem("visitedPath", location.pathname);
        }

        track();
    }, [location]);

    useEffect(() => {
        const channel = supabase
            .channel('analytics-changes')
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "web_analytics_dev"
                },
                (payload) => {
                    const newRow = payload.new;

                    queryClient.setQueryData(["analytics"], (old: any) => {
                        if (!old) return [newRow];

                        if (old.find((item: any) => item.id === newRow.id)) {
                            return old;
                        }

                        return [newRow, ...old];
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [queryClient]);



    return {    
        analyticsData,
        analyticsLoading,
        topPaths: analyticsData ? getTopPaths(analyticsData) : [],
        visitsPerDay: analyticsData ? getVisitsPerDay(analyticsData) : [],
        dailyStats: analyticsData ? getDailyStats(analyticsData) : [],
        monthlyStats: analyticsData ? getMonthlyStats(analyticsData) : [],
        yearlyStats: analyticsData ? getYearlyStats(analyticsData) : [],
        deviceStats: analyticsData ? getDeviceStats(analyticsData) : null
    };
}