import { supabase } from "@/integrations/supabase/client";
import { useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import { isMobile } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

/* -----------------------------
   Types
------------------------------ */

type AnalyticsRow = {
  id: string;
  session_id: string;
  visitor_id: string;
  path: string;
  normalized_path: string;
  created_at: string;
  is_mobile?: boolean;
};

/* -----------------------------
   Route Normalization
------------------------------ */

const dynamicRoutes = [
  {
    pattern: /^\/chat\/[^/]+\/[^/]+\/[^/]+\/[^/]+$/,
    normalized: "/chat/:id/:client_id/:service_id/:provider_id",
  },
  {
    pattern: /^\/find-service\/[^/]+$/,
    normalized: "/find-service/:id",
  },
  {
    pattern: /^\/profile\/[^/]+$/,
    normalized: "/profile/:id",
  },
];

function normalizePath(path: string) {
  const match = dynamicRoutes.find((r) => r.pattern.test(path));
  return match?.normalized || path;
}

/* -----------------------------
   Storage helpers
------------------------------ */

function getVisitorId() {
  let id = localStorage.getItem("visitorId");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("visitorId", id);
  }
  return id;
}

function getSessionId() {
  let id = localStorage.getItem("sessionId");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("sessionId", id);
  }
  return id;
}

/* -----------------------------
   Analytics helpers
------------------------------ */

function getTopPaths(data: AnalyticsRow[]) {
    const map: Record<string, number> = {};
    for (const r of data) map[r.normalized_path] = (map[r.normalized_path] || 0) + 1;

    return Object.entries(map)
        .map(([path, count]) => ({ path, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
}

function getVisitsPerDay(data: AnalyticsRow[]) {
    const map: Record<string, number> = {}

    for (const r of data) {
        const d = new Date(r.created_at).toISOString().split("T")[0];
        map[d] = (map[d] || 0) + 1;
    }

    return Object.entries(map)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));
}

function getDailyStats(data: AnalyticsRow[]) {
    const map: Record<string, number> = {};

    for (const r of data) {
        const day = new Date(r.created_at).toISOString().split("T")[0];
        map[day] = (map[day] || 0) + 1;
    }

    return Object.entries(map)
        .map(([day, user_count]) => ({
            day,
            user_count
        }));
}

function getMonthlyStats(data: AnalyticsRow[]) {
    const map: Record<string, number> = {};

    for (const r of data) {
        const d = new Date(r.created_at);
        const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
        map[key] = (map[key] || 0) + 1;
    }

    return Object.entries(map)
        .map(([month, user_count]) => ({
            month: `${month}-01`,
            user_count
        }))
}

function getYearlyStats(data: AnalyticsRow[]) {
    const map: Record<string, number> = {};

    for (const r of data) {
        const year = new Date(r.created_at).getFullYear().toString();
        map[year] = (map[year] || 0) + 1;
    }

    return Object.entries(map)
        .map(([year, user_count]) => ({
            year: `${year}-01-01`,
            user_count
        }));
}

function getDeviceStats(data: AnalyticsRow[]) {
    let mobile = 0;
    let desktop = 0;

    for (const r of data) {
        if (r.is_mobile) mobile++;
        else desktop++;
    }

    const total = mobile + desktop;

    return {
        mobile,
        desktop,
        mobilePercent: total ? Math.round((mobile / total) * 100) : 0,
        desktopPercentage: total ? Math.round((desktop / total) * 100) : 0
    }
}

/* -----------------------------
   Hook
------------------------------ */

export const useWebAnalytics = () => {
  const location = useLocation();

  const lastTrackedPath = useRef<string | null>(null);
  const sessionInitialized = useRef(false);

  /* -----------------------------
     FETCH ANALYTICS
  ------------------------------ */
  const { data: analyticsData = [], refetch: refetchAnalytics } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
        const { data, error } = await supabase
            .from("analytics_page_views")
            .select("*");
        
        if (error) throw error;
        return data as AnalyticsRow[];
    }
  })

  /* -----------------------------
     1. Init session once
  ------------------------------ */
  useEffect(() => {
    if (sessionInitialized.current) return;

    const initSession = async () => {
      const sessionId = getSessionId();
      const visitorId = getVisitorId();

      const { error } = await supabase.from("analytics_sessions").upsert(
        {
          id: sessionId,
          visitor_id: visitorId,
          is_mobile: isMobile,
          user_agent: navigator.userAgent,
          last_seen_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

      if (error) {
        console.error("Session init error:", error);
      }
    };

    initSession();
    sessionInitialized.current = true;
  }, []);

  /* -----------------------------
     2. Track page views
  ------------------------------ */
  useEffect(() => {
    if (location.pathname.startsWith("/admin")) return;

    const sessionId = getSessionId();
    const visitorId = getVisitorId();

    const normalizedPath = normalizePath(location.pathname);

    // 🔒 Prevent duplicates (StrictMode + rerenders safety)
    if (lastTrackedPath.current === normalizedPath) return;
    lastTrackedPath.current = normalizedPath;

    const timeout = setTimeout(async () => {
      const { error } = await supabase.from("analytics_page_views").insert({
        session_id: sessionId,
        visitor_id: visitorId,
        path: location.pathname,
        normalized_path: normalizedPath,
        is_mobile: isMobile
      });

      if (error) {
        console.error("Analytics insert error:", error);
      }
    }, 150); // small debounce prevents double fires

    return () => clearTimeout(timeout);
  }, [location.pathname]);

  /* -----------------------------
     DERIVED METRICS
  ------------------------------ */
  const derived = useMemo(() => {
    const data = analyticsData ?? [];

    return {
        topPaths: getTopPaths(data),
        visitsPerDay: getVisitsPerDay(data),
        dailyStats: getDailyStats(data),
        monthlyStats: getMonthlyStats(data),
        yearlyStats: getYearlyStats(data),
        deviceStats: getDeviceStats(data)
    };
  }, [analyticsData]);

  return {
    analyticsData,
    refreshAnalytics: refetchAnalytics,
    ...derived
  }
};

export default useWebAnalytics;