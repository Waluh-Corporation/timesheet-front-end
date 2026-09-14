import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import type { Role, Company } from "@/lib/types";
import { fetchCompanies } from "@/services/masterData";
import { newUserService } from "../services/newUserService";

export const DUMMY_DEPARTMENTS = ["Engineering", "HR", "Finance", "Sales"];
export const DUMMY_DIVISIONS = ["Software", "Recruiting", "Accounting", "Enterprise"];
export const DUMMY_SITES = ["Jakarta", "Bandung", "Surabaya", "Bali"];

export function useNewUser() {
  const router = useRouter();
  const { notify } = useToast();
  
  const [companies, setCompanies] = useState<Company[]>([]);
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
    fetchCompanies().then((comps) => setCompanies(comps || []));
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
    creating,
    createUser,
  };
}
