import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

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
        localStorage.setItem('visitingDate', newDate);

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
        lastVisit: visitingDate,
        newVisitDate: null
    }
}

export const useWebsiteAnalytics = () => {
    const location = useLocation();

    useEffect(() => {
        // async function checkAnalytics() {
        //     const result = checkVisitData();

        //     if (result.isNewVisit) {
        //         //TODO: SAVE IN SUPABASE
        //         //  Save path data with location.pathname

        //         const { error } = await supabase.from("web_analytics").insert({
        //             visitor_id: result.id,
        //             visit_date: result.newVisitDate ?? result.lastVisit,
        //             path: location.pathname
        //         });

        //         if (error) {
        //             console.error("Analytics error:", error);
        //             return;
        //         }
        //     }
        // }

        // checkAnalytics();
    }, [location]);
}