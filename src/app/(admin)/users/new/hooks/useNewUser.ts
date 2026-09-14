import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import type { Role, Company, Department } from "@/lib/types";
import { fetchCompanies, fetchDepartments, fetchDivisions, fetchSites } from "@/services/masterData";
import { newUserService } from "../services/newUserService";

export function useNewUser() {
  const router = useRouter();
  const { notify } = useToast();
  
  const [companies, setCompanies] = useState<Company[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [divisions, setDivisions] = useState<string[]>([]);
  const [sites, setSites] = useState<string[]>([]);
  
  const [creating, setCreating] = useState(false);

  const emptyForm = {
    username: "",
    email: "",
    role: "user" as Role,
    name: "",
    bni_id: "",
    mii_id: "",
    division: "",
    department: "",
    site: "",
    company: "",
    company_id: 0,
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    Promise.all([
      fetchCompanies(),
      fetchDepartments(),
      fetchDivisions(),
      fetchSites(),
    ]).then(([comps, depts, divs, sts]) => {
      setCompanies(comps || []);
      setDepartments(depts ? depts.map(d => d.name || (d as any).department_name || (d as any).title) : []);
      setDivisions(divs ? divs.map(d => d.name || d.title || d.division_name) : []);
      setSites(sts ? sts.map(s => s.name || s.site_name || s.location) : []);
    });
  }, []);

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const selectedComp = companies.find(
        (c) => c.id === form.company_id || c.name === form.company || c.code === form.company
      );
      const payload = {
        ...form,
        company_id: selectedComp ? selectedComp.id : undefined,
        company: selectedComp ? selectedComp.name : form.company,
      };
      await newUserService.createUser(payload);
      notify("User created — a setup email has been sent.", "success");
      router.push("/users");
    } catch (error) {
      const err = error as Error;
      notify(err.message || "Create failed", "error");
    } finally {
      setCreating(false);
    }
  };

  return {
    form,
    setForm,
    companies,
    departments,
    divisions,
    sites,
    creating,
    createUser,
  };
}
