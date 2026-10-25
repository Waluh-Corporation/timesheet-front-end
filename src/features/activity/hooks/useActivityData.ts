"use client";

import { useState, useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { fetchActivityById, createActivity } from "../services/activityService";
import type { DailyActivity, ActivityStatus } from "@/lib/types";
import {
  useProjectsQuery,
  useActivityStatusesQuery,
  useEligibleWitnessesQuery,
} from "@/services/queries/useMasterDataQueries";
import { useDashboardActivitiesQuery } from "@/features/dashboard/useDashboardQueries";
import { fetchPreviousDayActivity } from "@/services/activityService";
import { useToast } from "@/components/Toast";
import { useRouter } from "next/navigation";

const DEFAULT_STATUSES: ActivityStatus[] = [
  { code: "P", name: "Present", is_working_day: true, sort_order: 1 },
  { code: "S", name: "Sick", is_working_day: false, sort_order: 2 },
  { code: "PM", name: "Permission", is_working_day: false, sort_order: 3 },
  { code: "V", name: "Leave", is_working_day: false, sort_order: 4 },
  { code: "BT", name: "Business Trip", is_working_day: true, sort_order: 5 },
  { code: "X", name: "Off", is_working_day: false, sort_order: 6 },
];

export const useActivityData = (initialId: string | null, defaultDate: string) => {
  const [activeId, setActiveId] = useState<string | null>(initialId);
  const [form, setForm] = useState<DailyActivity>({
    date: defaultDate,
    start_time: "08:00",
    end_time: "17:00",
    status: "P",
    activity: "",
    project_name: "",
    project_id: "",
    app_impacted: "",
    is_berita_acara: false,
    berita_acara_notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copying, setCopying] = useState(false);
  const { notify } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Master data queries cached with 5-minute staleTime
  const { data: projectsData } = useProjectsQuery();
  const { data: statusesData } = useActivityStatusesQuery();
  const { data: witnessesData } = useEligibleWitnessesQuery();

  const projects = useMemo(() => projectsData || [], [projectsData]);
  const statuses = useMemo(
    () => (statusesData && statusesData.length > 0 ? statusesData : DEFAULT_STATUSES),
    [statusesData]
  );
  const witnesses = useMemo(() => witnessesData || [], [witnessesData]);

  // Resolve designated monthly witness using 1-minute cached dashboard activities query
  const d = form.date ? new Date(form.date) : new Date();
  const y = d.getFullYear() || new Date().getFullYear();
  const m = (d.getMonth() + 1) || (new Date().getMonth() + 1);
  const { data: dashboardActs } = useDashboardActivitiesQuery(y, m);
  const monthlyWitness = dashboardActs?.monthlyWitness;

  useEffect(() => {
    const loadInitial = async () => {
      if (!initialId) return;
      setLoading(true);
      try {
        const data = await fetchActivityById(initialId);
        const matchedProj =
          (data.project_ref_id ? projects.find((p) => p.id === data.project_ref_id) : undefined) ||
          (data.project_name ? projects.find((p) => p.name?.trim().toLowerCase() === data.project_name.trim().toLowerCase()) : undefined) ||
          (data.project_id ? projects.find((p) => p.code?.trim().toLowerCase() === data.project_id.trim().toLowerCase()) : undefined);

        setForm({
          ...data,
          project_ref_id: data.project_ref_id || matchedProj?.id,
          project_name: data.project_name || matchedProj?.name || "",
          project_id: data.project_id || matchedProj?.code || "",
          app_impacted:
            data.project_name ||
            matchedProj?.name ||
            "",
          is_berita_acara: !!data.is_berita_acara,
          berita_acara_notes: data.berita_acara_notes || "",
          witness_id: data.witness_id,
        });
        setActiveId(initialId);
      } catch (err) {
        const error = err as Error;
        notify(error.message || "Failed to load activity", "error");
      } finally {
        setLoading(false);
      }
    };

    void loadInitial();
  }, [initialId, notify, projects]);

  const set = <K extends keyof DailyActivity>(k: K, v: DailyActivity[K]) => {
    setForm((prev) => ({ ...prev, [k]: v }));
  };

  const copyPreviousDay = async () => {
    setCopying(true);
    try {
      const prev = await fetchPreviousDayActivity(form.date);
      if (prev) {
        const matchedProj =
          (prev.project_ref_id ? projects.find((p) => p.id === prev.project_ref_id) : undefined) ||
          (prev.project_name ? projects.find((p) => p.name?.trim().toLowerCase() === prev.project_name.trim().toLowerCase()) : undefined) ||
          (prev.project_id ? projects.find((p) => p.code?.trim().toLowerCase() === prev.project_id.trim().toLowerCase()) : undefined);

        setForm((curr) => ({
          ...curr,
          activity: prev.activity || curr.activity,
          start_time: "",
          end_time: "",
          status: prev.status || curr.status,
          project_ref_id: prev.project_ref_id || matchedProj?.id || curr.project_ref_id,
          project_id: prev.project_id || matchedProj?.code || curr.project_id,
          project_name: prev.project_name || matchedProj?.name || curr.project_name,
          app_impacted: prev.app_impacted || matchedProj?.app_impacted || curr.app_impacted,
          is_berita_acara: prev.is_berita_acara !== undefined ? prev.is_berita_acara : curr.is_berita_acara,
          berita_acara_notes: prev.berita_acara_notes !== undefined ? prev.berita_acara_notes : curr.berita_acara_notes,
        }));
        notify("Successfully copied previous day's activity 📋", "success");
      }
    } catch (err) {
      const error = err as Error;
      notify(error.message || "No activity data found from previous day", "error");
    } finally {
      setCopying(false);
    }
  };

  const setProjectDetails = (projectIdStr: string) => {
    if (!projectIdStr) {
      setForm((prev) => ({
        ...prev,
        project_ref_id: undefined,
        project_id: "",
        project_name: "",
        app_impacted: "",
      }));
      return;
    }

    const pId = Number.parseInt(projectIdStr, 10);
    const p = projects.find((proj) => proj.id === pId);

    if (p) {
      setForm((prev) => ({
        ...prev,
        project_ref_id: p.id,
        project_id: p.code,
        project_name: p.name,
        app_impacted: p.name || "",
      }));
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.start_time && form.end_time) {
      if (form.end_time <= form.start_time) {
        notify("Time Out must be greater than Time In", "error");
        return;
      }
    }

    setSaving(true);
    try {
      const { witness_id, witness, ...activityData } = form;
      const payload = {
        ...activityData,
        date: form.date ? form.date.split("T")[0] : "",
      };

      await createActivity(payload);
      await queryClient.invalidateQueries({ queryKey: ["activities"] });
      notify(activeId ? "Activity updated" : "Activity saved", "success");
      router.push("/dashboard");
    } catch (err) {
      const error = err as Error;
      notify(error.message || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  return {
    form,
    set,
    setProjectDetails,
    submit,
    loading,
    saving,
    copying,
    copyPreviousDay,
    activeId,
    projects,
    statuses,
    witnesses,
    monthlyWitness,
  };
};
