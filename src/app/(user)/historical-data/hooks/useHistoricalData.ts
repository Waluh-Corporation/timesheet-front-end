import { useState, useEffect, useMemo } from "react";
import { fetchHistoricalActivities } from "../services/api";
import { fetchProjects } from "@/services/masterData";
import { useToast } from "@/components/Toast";
import type { DailyActivity, Project } from "@/lib/types";

export function useHistoricalData() {
  const { notify } = useToast();
  const [activities, setActivities] = useState<DailyActivity[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterMonth, setFilterMonth] = useState<number | "">("");
  const [filterYear, setFilterYear] = useState<number | "">("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterApp, setFilterApp] = useState<string>("All");

  useEffect(() => {
    async function load() {
      try {
        const [acts, projs] = await Promise.all([
          fetchHistoricalActivities(),
          fetchProjects(),
        ]);

        const projList = projs || [];
        setProjects(projList);

        const projById = new Map<number, Project>();
        const projByCode = new Map<string, Project>();
        const projByName = new Map<string, Project>();

        projList.forEach((p) => {
          if (p.id) projById.set(p.id, p);
          if (p.code) projByCode.set(p.code.toLowerCase(), p);
          if (p.name) projByName.set(p.name.toLowerCase(), p);
        });

        const resolvedActivities = (acts || []).map((act) => {
          const matchedProj =
            (act.project_ref_id ? projById.get(act.project_ref_id) : undefined) ||
            act.project_ref ||
            (act.project_id ? projByCode.get(act.project_id.toLowerCase()) : undefined) ||
            (act.project_name ? projByName.get(act.project_name.toLowerCase()) : undefined);

          const appImpacted =
            act.app_impacted?.trim() ||
            act.project_ref?.app_impacted?.trim() ||
            matchedProj?.app_impacted?.trim() ||
            "";

          return {
            ...act,
            app_impacted: appImpacted,
          };
        });

        const sorted = resolvedActivities.sort((a, b) => b.date.localeCompare(a.date));
        setActivities(sorted);
      } catch (err: any) {
        notify(err.message || "Failed to load historical activities", "error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [notify]);

  const uniqueStatuses = useMemo(() => {
    return Array.from(new Set(activities.map((a) => a.status)))
      .filter((s): s is string => Boolean(s))
      .sort((a, b) => a.localeCompare(b));
  }, [activities]);

  const uniqueApps = useMemo(() => {
    const apps = new Set<string>();
    // Fetch directly from projects API
    projects.forEach((p) => {
      if (p.app_impacted && p.app_impacted.trim()) {
        apps.add(p.app_impacted.trim());
      }
    });
    // Include any app_impacted found in historical activities
    activities.forEach((a) => {
      if (a.app_impacted && a.app_impacted.trim()) {
        apps.add(a.app_impacted.trim());
      }
    });
    return Array.from(apps).sort((a, b) => a.localeCompare(b));
  }, [projects, activities]);

  const uniqueYears = useMemo(() => {
    const years = new Set(
      activities
        .map((a) => {
          if (!a.date) return null;
          return Number(a.date.split("-")[0]);
        })
        .filter(Boolean) as number[]
    );

    const sortedYears = Array.from(years).sort((a, b) => b - a);

    if (sortedYears.length === 0) {
      sortedYears.push(new Date().getFullYear());
    }

    return sortedYears;
  }, [activities]);

  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
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
      uniqueStatuses,
      uniqueApps,
      uniqueYears,
    },
  };
}
