import { api } from "@/lib/api";
import type {
  AdminProfileChange,
  ProfileChangeRequest,
  ProfileChangeRequestDTO,
  ChangePasswordRequest,
  ChangePasswordResponse,
} from "@/lib/types";

// User profile change requests
export async function submitProfileChange(
  dto: ProfileChangeRequestDTO
): Promise<{ message: string; data?: any }> {
  return api<{ message: string; data?: any }>("/api/v1/profile/change", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export async function fetchMyProfileChanges(): Promise<ProfileChangeRequest[]> {
  try {
    return await api<ProfileChangeRequest[]>("/api/v1/profile/changes");
  } catch (err) {
    console.error("Failed to load user profile changes", err);
    return [];
  }
}

// User change password
export async function changePassword(
  req: ChangePasswordRequest
): Promise<ChangePasswordResponse> {
  return api<ChangePasswordResponse>("/api/v1/users/change-password", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

// Admin profile change reviews
export async function fetchAdminProfileChanges(
  status?: string
): Promise<AdminProfileChange[]> {
  try {
    const query = status ? `?status=${encodeURIComponent(status)}` : "";
    return await api<AdminProfileChange[]>(`/api/v1/admin/profile-changes${query}`);
  } catch (err) {
    console.error("Failed to load admin profile changes", err);
    return [];
  }
}

export async function reviewProfileChange(
  id: number,
  action: "approve" | "reject"
): Promise<{ message: string }> {
  return api<{ message: string }>(
    `/api/v1/admin/profile-changes/${id}/review?action=${action}`,
    {
      method: "POST",
      body: JSON.stringify({}),
    }
  );
}
