import { api } from "@/lib/api";
import type {
  ActivityStatus,
  Company,
  CompanyRequest,
  Department,
  Project,
  Approver,
  ApproverRequest,
  Holiday,
  DepartmentRequest,
  Division,
  DivisionRequest,
  Site,
  SiteRequest,
} from "@/lib/types";

export async function fetchActivityStatuses(): Promise<ActivityStatus[]> {
  try {
    return await api<ActivityStatus[]>("/api/v1/activity-statuses");
  } catch (err) {
    console.error("Failed to load activity statuses", err);
    return [];
  }
}

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
    // In doc.json, Admin fetch might be /api/v1/admin/departments, but /api/v1/departments also works. We'll use admin.
    return await api<Department[]>(`/api/v1/admin/departments${q}`);
  } catch (err) {
    console.error("Failed to load departments", err);
    return [];
  }
}

export async function createDepartment(data: DepartmentRequest): Promise<Department> {
  return api<Department>("/api/v1/admin/departments", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateDepartment(
  id: number,
  data: Partial<DepartmentRequest>
): Promise<Department> {
  return api<Department>(`/api/v1/admin/departments/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteDepartment(id: number): Promise<{ message: string }> {
  return api<{ message: string }>(`/api/v1/admin/departments/${id}`, {
    method: "DELETE",
  });
}

export async function fetchDivisions(): Promise<Division[]> {
  try {
    return await api<Division[]>("/api/v1/admin/divisions");
  } catch (err) {
    console.error("Failed to load divisions", err);
    return [];
  }
}

export async function createDivision(data: DivisionRequest): Promise<Division> {
  return api<Division>("/api/v1/admin/divisions", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateDivision(
  id: number,
  data: Partial<DivisionRequest>
): Promise<Division> {
  return api<Division>(`/api/v1/admin/divisions/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteDivision(id: number): Promise<{ message: string }> {
  return api<{ message: string }>(`/api/v1/admin/divisions/${id}`, {
    method: "DELETE",
  });
}

export async function fetchSites(): Promise<Site[]> {
  try {
    return await api<Site[]>("/api/v1/admin/sites");
  } catch (err) {
    console.error("Failed to load sites", err);
    return [];
  }
}

export async function createSite(data: SiteRequest): Promise<Site> {
  return api<Site>("/api/v1/admin/sites", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateSite(
  id: number,
  data: Partial<SiteRequest>
): Promise<Site> {
  return api<Site>(`/api/v1/admin/sites/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteSite(id: number): Promise<{ message: string }> {
  return api<{ message: string }>(`/api/v1/admin/sites/${id}`, {
    method: "DELETE",
  });
}

export async function fetchProjects(): Promise<Project[]> {
  try {
    return await api<Project[]>("/api/v1/projects");
  } catch (err) {
    console.error("Failed to load projects", err);
    return [];
  }
}

export async function fetchApprovers(
  roleType?: "team_leader" | "department_head"
): Promise<Approver[]> {
  try {
    const q = roleType ? `?role_type=${roleType}` : "";
    return await api<Approver[]>(`/api/v1/approvers${q}`);
  } catch (err) {
    console.error("Failed to load approvers", err);
    return [];
  }
}

// Admin Master Data APIs
export async function createCompany(data: CompanyRequest): Promise<Company> {
  return api<Company>("/api/v1/admin/companies", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateCompany(
  id: number,
  data: Partial<CompanyRequest>
): Promise<Company> {
  return api<Company>(`/api/v1/admin/companies/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteCompany(id: number): Promise<{ message: string }> {
  return api<{ message: string }>(`/api/v1/admin/companies/${id}`, {
    method: "DELETE",
  });
}

export async function createApprover(data: ApproverRequest): Promise<Approver> {
  return api<Approver>("/api/v1/admin/approvers", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateApprover(
  id: number,
  data: Partial<ApproverRequest>
): Promise<Approver> {
  return api<Approver>(`/api/v1/admin/approvers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteApprover(id: number): Promise<{ message: string }> {
  return api<{ message: string }>(`/api/v1/admin/approvers/${id}`, {
    method: "DELETE",
  });
}

export async function syncHolidays(year: number): Promise<{ message: string; count?: number }> {
  return api<{ message: string; count?: number }>(`/api/v1/holidays/sync?year=${year}`, {
    method: "POST",
  });
}

export async function fetchAllHolidays(year: number): Promise<Holiday[]> {
  try {
    return await api<Holiday[]>(`/api/v1/holidays/all?year=${year}`);
  } catch (err) {
    console.error("Failed to load all holidays", err);
    return [];
  }
}

export async function checkSetupStatus(): Promise<{ initialized: boolean }> {
  return api<{ initialized: boolean }>("/api/v1/setup/status", { auth: false });
}
