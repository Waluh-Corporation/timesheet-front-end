import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import type { Role, Company, Department, Division, Site } from "@/lib/types";
import { fetchCompanies, fetchDepartments, fetchDivisions, fetchSites } from "@/app/(admin)/master-data/services/masterData";
import { newUserService } from "../services/newUserService";

export function useNewUser() {
  const router = useRouter();
  const { notify } = useToast();
  
  const [companies, setCompanies] = useState<Company[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [divisions, setDivisions] = useState<string[]>([]);
  const [sites, setSites] = useState<string[]>([]);
  const [rawDepartments, setRawDepartments] = useState<Department[]>([]);
  const [rawDivisions, setRawDivisions] = useState<Division[]>([]);
  const [rawSites, setRawSites] = useState<Site[]>([]);
  
  const [creating, setCreating] = useState(false);

  const emptyForm = {
    username: "",
    email: "",
    role: "user" as Role,
    name: "",
    bni_id: "",
    employee_id: "",
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
      setRawDepartments(depts || []);
      setRawDivisions(divs || []);
      setRawSites(sts || []);
      setDepartments(depts ? depts.map(d => d.name || (d as any).department_name || (d as any).title) : []);
      setDivisions(divs ? divs.map(d => d.name || (d as any).title || (d as any).division_name) : []);
      setSites(sts ? sts.map(s => s.name || (s as any).site_name || (s as any).location) : []);
    });
  }, []);

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const selectedComp = companies.find(
        (c) => c.id === form.company_id || c.name === form.company || c.code === form.company
      );
      const selectedDiv = rawDivisions.find(
        (d) => d.name === form.division || d.code === form.division
      );
      const selectedDept = rawDepartments.find(
        (d) => d.name === form.department || d.code === form.department
      );
      const selectedSite = rawSites.find(
        (s) => s.name === form.site || s.code === form.site
      );

      const payload = {
        ...form,
        company_id: selectedComp ? selectedComp.id : undefined,
        company: selectedComp ? selectedComp.name : form.company,
        division_id: selectedDiv ? selectedDiv.id : undefined,
        department_id: selectedDept ? selectedDept.id : undefined,
        site_id: selectedSite ? selectedSite.id : undefined,
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
