import { useState, useEffect } from "react";
import { useToast } from "@/components/Toast";
import { useAuth } from "@/lib/auth";
import type { Company, Department, Division, Site, ProfileChangeRequestDTO } from "@/lib/types";
import { fetchCompanies, fetchDepartments, fetchDivisions, fetchSites } from "../services/profileMasterData";
import { submitProfileChange } from "@/services/profileChange";

export function useProfileForm(onSuccess?: () => void) {
  const { user, refresh } = useAuth();
  const { notify } = useToast();

  const [form, setForm] = useState({
    name: "",
    email: "",
    employee_id: "",
    bni_id: "",
    division: "",
    site: "",
    company_id: 0,
    department_id: 0,
    department: "",
    notes: "",
  });

  const [companies, setCompanies] = useState<Company[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      setLoading(true);
      const [comps, divs, sts] = await Promise.all([
        fetchCompanies(),
        fetchDivisions(),
        fetchSites(),
      ]);
      setCompanies(comps || []);
      setDivisions(divs || []);
      setSites(sts || []);
      setLoading(false);
    }
    init();
  }, []);

  useEffect(() => {
    if (user && companies.length > 0) {
      const matchedCompany = companies.find(
        (c) =>
          (user.company_id && c.id === user.company_id) ||
          (user.company && c.name?.toLowerCase() === user.company.toLowerCase()) ||
          (user.company && c.code?.toLowerCase() === user.company.toLowerCase())
      );
      setForm({
        name: user.name || "",
        email: user.email || "",
        employee_id: user.employee_id || user.mii_id || "",
        bni_id: user.bni_id || "",
        division: user.division || "",
        site: user.site || "",
        company_id: matchedCompany ? matchedCompany.id : user.company_id || 0,
        department_id: user.department_id || 0,
        department: user.department || "",
        notes: "",
      });
    }
  }, [user, companies]);

  useEffect(() => {
    if (form.division) {
      fetchDepartments({ division: form.division }).then((depts) => {
        setDepartments(depts || []);
      });
    } else {
      fetchDepartments().then((depts) => {
        setDepartments(depts || []);
      });
    }
  }, [form.division]);

  const setFieldValue = (k: keyof typeof form, v: any) => setForm((prev) => ({ ...prev, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const selectedDiv = divisions.find((d) => d.name === form.division || d.code === form.division);
      const selectedSite = sites.find((s) => s.name === form.site || s.code === form.site);

      const payload: ProfileChangeRequestDTO = {
        name: form.name.trim() || undefined,
        email: form.email.trim() || undefined,
        employee_id: form.employee_id.trim() || undefined,
        bni_id: form.bni_id.trim() || undefined,
        division: form.division.trim() || undefined,
        division_id: selectedDiv ? selectedDiv.id : undefined,
        site: form.site.trim() || undefined,
        site_id: selectedSite ? selectedSite.id : undefined,
        company_id: form.company_id ? Number(form.company_id) : undefined,
        department_id: form.department_id ? Number(form.department_id) : undefined,
        department: form.department.trim() || undefined,
        notes: form.notes.trim() || undefined,
      };

      await submitProfileChange(payload);
      notify("Change requested — waiting for admin approval.", "success");
      if (onSuccess) onSuccess();
      refresh();
    } catch (err: any) {
      notify(err.message || "Request failed", "error");
    } finally {
      setSaving(false);
    }
  };

  return {
    form,
    setFieldValue,
    submit,
    companies,
    departments,
    divisions,
    sites,
    saving,
    loading
  };
}
