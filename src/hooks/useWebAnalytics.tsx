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

function countUnique(rows: AnalyticsRow[], bucketOf: (r: AnalyticsRow) => string) {
  const buckets = new Map<string, Set<string>>();
  for (const r of rows) {
    if (!r.session_id) continue;
    const key = bucketOf(r);
    if (!buckets.has(key)) buckets.set(key, new Set());
    buckets.get(key)!.add(r.session_id);
  }
  return [...buckets.entries()].map(([bucket, set]) => ({ bucket, session_count: set.size })).sort((a, b) => a.bucket.localeCompare(b.bucket));
}

const iso = (r: AnalyticsRow) => new Date(r.created_at).toISOString();

function dailyCutoff(): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCMonth(d.getUTCMonth() - 3);
  return d;
}

function monthlyCutoff(): Date {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - 11, 1));
}

function yearlyCutoff(): Date {
  return new Date(Date.UTC(new Date().getUTCFullYear() - 2, 0, 1));
}

function since(data: AnalyticsRow[], cutoff: Date) {
  const t = cutoff.getTime();
  return data.filter((r) => new Date(r.created_at).getTime() >= t);
}

function getDailyStats(data: AnalyticsRow[]) {
  return countUnique(since(data, dailyCutoff()), (r) => iso(r).slice(0, 10)).map(({ bucket, session_count }) => ({ day: bucket, user_count: session_count }))
}

function getMonthlyStats(data: AnalyticsRow[]) {
  return countUnique(since(data, monthlyCutoff()), (r) => iso(r).slice(0, 7)).map(({ bucket, session_count }) => ({ month: `${bucket}-01`, user_count: session_count }));
}

function getYearlyStats(data: AnalyticsRow[]) {
  return countUnique(since(data, yearlyCutoff()), (r) => iso(r).slice(0, 7)).map(({ bucket, session_count }) => ({ month: `${bucket}-01`, user_count: session_count }))
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

const COLUMNS = "created_at, session_id, normalized_path, is_mobile";

async function fetchPageViewSince(cutoff: Date): Promise<AnalyticsRow[]> {
  const pageSize = 1000;
  const rows: AnalyticsRow[] = [];

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase.from("analytics_page_views")
    .select(COLUMNS)
    .gte("created_at", cutoff.toISOString())
    .order("created_at", { ascending: true })
    .order("id", { ascending: true })
    .range(from, from + pageSize - 1)

    if (error) throw error;
    rows.push(...(data as AnalyticsRow[]));
    if (data.length < pageSize) break;
  }

  console.log(rows)

  return rows
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
    queryKey: ["analytics", "last-3-months"],
    queryFn: () => fetchPageViewSince(yearlyCutoff()),
    staleTime: 5 * 60 * 1000
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
    const recent = since(data, dailyCutoff());

    return {
        topPaths: getTopPaths(recent),
        visitsPerDay: getVisitsPerDay(data),
        dailyStats: getDailyStats(data),
        monthlyStats: getMonthlyStats(data),
        yearlyStats: getYearlyStats(data),
        deviceStats: getDeviceStats(recent)
    };
  }, [analyticsData]);

  return {
    analyticsData,
    refreshAnalytics: refetchAnalytics,
    ...derived
  }
};

export default useWebAnalytics;