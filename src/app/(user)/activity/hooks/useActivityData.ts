import { useState, useEffect } from "react";
import { fetchActivityById, createActivity } from "../services/api";
import type { DailyActivity, Project, ActivityStatus } from "@/lib/types";
import { fetchProjects, fetchActivityStatuses } from "@/app/(admin)/master-data/services/masterData";
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
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [statuses, setStatuses] = useState<ActivityStatus[]>(DEFAULT_STATUSES);
  const { notify } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchActivityStatuses().then((res) => {
      if (res && res.length > 0) setStatuses(res);
    });

    fetchProjects().then((data) => {
      if (data) setProjects(data);
    });

    const loadInitial = async () => {
      if (!initialId) return;
      setLoading(true);
      try {
        const [data, projs] = await Promise.all([
          fetchActivityById(initialId),
          fetchProjects(),
        ]);
        if (projs) setProjects(projs);
        const matchedProj = projs?.find(
          (p) =>
            p.id === data.project_ref_id ||
            p.code === data.project_id ||
            p.name === data.project_name
        );
        setForm({
          ...data,
          project_ref_id: data.project_ref_id || matchedProj?.id,
          project_name: data.project_name || matchedProj?.name || "",
          project_id: data.project_id || matchedProj?.code || "",
          app_impacted:
            data.project_name ||
            matchedProj?.name ||
            "",
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
  }, [initialId, notify]);

  const set = <K extends keyof DailyActivity>(k: K, v: DailyActivity[K]) => {
    setForm((prev) => ({ ...prev, [k]: v }));
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
      const payload = {
        ...form,
        date: form.date ? form.date.split("T")[0] : "",
      };

      await createActivity(payload);
      notify(activeId ? "Activity updated" : "Activity saved", "success");
      router.push("/dashboard");
    } catch (err) {
      const error = err as Error;
      notify(error.message || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  return { form, set, setProjectDetails, submit, loading, saving, activeId, projects, statuses };
};
