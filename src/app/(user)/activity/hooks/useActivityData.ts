import { useState, useEffect } from "react";
import { fetchActivityById, createActivity } from "../services/api";
import { api } from "@/lib/api";
import type { DailyActivity, Project } from "@/lib/types";
import { useToast } from "@/components/Toast";
import { useRouter } from "next/navigation";

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
  const { notify } = useToast();
  const router = useRouter();

  // Load initial data
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await api<Project[]>("/api/v1/projects", { method: "GET" });
        setProjects(data || []);
      } catch (err) {
        console.error("Failed to load projects", err);
      }
    };

    const loadInitial = async () => {
      setLoading(true);
      try {
        if (initialId) {
          const data = await fetchActivityById(initialId);
          setForm(data);
          setActiveId(initialId);
        }
      } catch (err) {
        const error = err as Error;
        notify(error.message || "Failed to load activity", "error");
      } finally {
        setLoading(false);
      }
    };
    
    void loadProjects();
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
        app_impacted: ""
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
        app_impacted: p.app_impacted || ""
      }));
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        date: form.date ? form.date.split("T")[0] : ""
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

  return { form, set, setProjectDetails, submit, loading, saving, activeId, projects };
};
