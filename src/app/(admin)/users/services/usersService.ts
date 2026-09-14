import { api } from "@/lib/api";
import { fetchCompanies } from "@/services/masterData";
import type { User, ProfileChangeRequest, Passkey } from "@/lib/types";

export const usersService = {
  getUsers: () => api<User[]>("/api/v1/admin/users"),
  getPendingChanges: () => api<ProfileChangeRequest[]>("/api/v1/admin/profile-changes?status=pending"),
  getCompanies: () => fetchCompanies(),
  
  toggleActive: (id: number, is_active: boolean) => 
    api(`/api/v1/admin/users/${id}`, { method: "PATCH", body: JSON.stringify({ is_active }) }),
    
  deactivateUser: (id: number) => 
    api(`/api/v1/admin/users/${id}`, { method: "DELETE" }),
    
  assignCompany: (id: number, company_id?: number, company?: string) =>
    api(`/api/v1/admin/users/${id}`, { method: "PATCH", body: JSON.stringify({ company_id, company }) }),
    
  getPasskeys: (id: number) => 
    api<Passkey[]>(`/api/v1/admin/users/${id}/passkeys`),
    
  removePasskey: (userId: number, pkId: number) => 
    api(`/api/v1/admin/users/${userId}/passkeys/${pkId}`, { method: "DELETE" }),
    
  reviewChange: (id: number, action: "approve" | "reject") => 
    api(`/api/v1/admin/profile-changes/${id}/review?action=${action}`, { method: "POST", body: JSON.stringify({}) }),
};
