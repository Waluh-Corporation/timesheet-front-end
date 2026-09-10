import { useState, useEffect, useMemo } from "react";
import { fetchHistoricalActivities } from "../services/api";
import { useToast } from "@/components/Toast";
import type { DailyActivity } from "@/lib/types";

export function useHistoricalData() {
  const { notify } = useToast();
  const [activities, setActivities] = useState<DailyActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterMonth, setFilterMonth] = useState<number | "">("");
  const [filterYear, setFilterYear] = useState<number | "">("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterApp, setFilterApp] = useState<string>("All");

  useEffect(() => {
    async function load() {
      try {
        const acts = await fetchHistoricalActivities();
        const sorted = (acts || []).sort((a, b) => b.date.localeCompare(a.date));
        setActivities(sorted);
      } catch (err: any) {
        notify(err.message, "error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [notify]);

  const uniqueStatuses = useMemo(() => {
    return Array.from(new Set(activities.map(a => a.status))).filter((s): s is string => Boolean(s)).sort((a, b) => a.localeCompare(b));
  }, [activities]);

  const uniqueApps = useMemo(() => {
    return Array.from(new Set(activities.map(a => a.app_impacted))).filter((a): a is string => Boolean(a)).sort((a, b) => a.localeCompare(b));
  }, [activities]);

  const uniqueYears = useMemo(() => {
    const years = new Set(activities.map(a => {
      if (!a.date) return null;
      return Number(a.date.split("-")[0]);
    }).filter(Boolean) as number[]);
    
    const sortedYears = Array.from(years).sort((a, b) => b - a);
    
    if (sortedYears.length === 0) {
      sortedYears.push(new Date().getFullYear());
    }
    
    return sortedYears;
  }, [activities]);

  const filteredActivities = useMemo(() => {
    return activities.filter(act => {
      if (filterYear) {
        if (!act.date?.startsWith(filterYear.toString())) return false;
      }
      if (filterMonth) {
        if (!act.date) return false;
        const m = Number(act.date.split("-")[1]);
        if (m !== filterMonth) return false;
      }
      if (filterStatus !== "All") {
        const s = act.status;
        if (s !== filterStatus) return false;
      }
      if (filterApp !== "All") {
        if (act.app_impacted !== filterApp) return false;
      }
      return true;
    });
  }, [activities, filterMonth, filterYear, filterStatus, filterApp]);

  return {
    loading,
    activities,
    filteredActivities,
    filters: {
      filterMonth, setFilterMonth,
      filterYear, setFilterYear,
      filterStatus, setFilterStatus,
      filterApp, setFilterApp,
    },
    options: {
      uniqueStatuses,
      uniqueApps,
      uniqueYears,
    }
  };
}
