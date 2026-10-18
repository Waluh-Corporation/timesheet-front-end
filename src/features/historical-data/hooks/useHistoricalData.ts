"use client";

import { useState, useEffect, useMemo } from "react";
import type { DailyActivity } from "@/lib/types";
import { fetchHistoricalActivities } from "../services/historicalDataService";

export function useHistoricalData() {
  const [activities, setActivities] = useState<DailyActivity[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [filterMonth, setFilterMonth] = useState<number | "">("");
  const [filterYear, setFilterYear] = useState<number | "">("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterApp, setFilterApp] = useState<string>("All");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await fetchHistoricalActivities({ all: true });
        if (Array.isArray(data)) {
          setActivities(data);
        }
      } catch (err) {
        console.error("Failed to load historical activities:", err);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const uniqueYears = useMemo(() => {
    const years = new Set<number>();
    activities.forEach((act) => {
      if (act.date) {
        const y = new Date(act.date).getFullYear();
        if (!Number.isNaN(y)) years.add(y);
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [activities]);

  const uniqueStatuses = useMemo(() => {
    const statuses = new Set<string>();
    activities.forEach((act) => {
      if (act.status) statuses.add(act.status);
    });
    return Array.from(statuses).sort((a, b) => a.localeCompare(b));
  }, [activities]);

  const uniqueApps = useMemo(() => {
    const apps = new Set<string>();
    activities.forEach((act) => {
      const app = act.app_impacted || act.project_ref?.app_impacted;
      if (app) apps.add(app);
    });
    return Array.from(apps).sort((a, b) => a.localeCompare(b));
  }, [activities]);

  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      if (!act.date) return false;
      const d = new Date(act.date);
      const actYear = d.getFullYear();
      const actMonth = d.getMonth() + 1;

      if (filterYear !== "" && actYear !== filterYear) return false;
      if (filterMonth !== "" && actMonth !== filterMonth) return false;
      if (filterStatus !== "All" && act.status !== filterStatus) return false;

      const currentApp = act.app_impacted || act.project_ref?.app_impacted;
      if (filterApp !== "All" && currentApp !== filterApp) return false;

      return true;
    });
  }, [activities, filterMonth, filterYear, filterStatus, filterApp]);

  return {
    loading,
    filteredActivities,
    filters: {
      filterMonth,
      setFilterMonth,
      filterYear,
      setFilterYear,
      filterStatus,
      setFilterStatus,
      filterApp,
      setFilterApp,
    },
    options: {
      uniqueYears,
      uniqueStatuses,
      uniqueApps,
    },
  };
}
