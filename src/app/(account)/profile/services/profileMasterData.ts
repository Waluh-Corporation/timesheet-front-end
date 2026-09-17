import { api } from "@/lib/api";
import type { Company, Department, Division, Site } from "@/lib/types";

export async function fetchCompanies(): Promise<Company[]> {
  try {
    return await api<Company[]>("/api/v1/companies");
  } catch (err) {
    console.error("Failed to load companies", err);
    return [];
  }
}

export async function fetchDepartments(companyId?: number): Promise<Department[]> {
  try {
    const q = companyId ? `?company_id=${companyId}` : "";
    return await api<Department[]>(`/api/v1/departments${q}`);
  } catch (err) {
    console.error("Failed to load departments", err);
    return [];
  }
}

export async function fetchDivisions(): Promise<Division[]> {
  try {
    return await api<Division[]>("/api/v1/divisions");
  } catch (err) {
    console.error("Failed to load divisions", err);
    return [];
  }
}

export async function fetchSites(): Promise<Site[]> {
  try {
    return await api<Site[]>("/api/v1/sites");
  } catch (err) {
    console.error("Failed to load sites", err);
    return [];
  }
}
