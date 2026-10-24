export type Role = "admin" | "user";

export interface Company {
  id: number;
  code: string;
  name: string;
  created_at?: string;
}

export interface Department {
  id: number;
  code?: string;
  name: string;
  division?: string;
  company_id?: number;
  is_active: boolean;
}

export interface Project {
  id: number;
  code: string;
  name: string;
  app_impacted?: string;
  company_id?: number;
  is_active: boolean;
}

export interface ActivityStatus {
  code: string;
  name: string;
  description?: string;
  is_working_day: boolean;
  sort_order: number;
}

export interface Holiday {
  id?: number;
  date: string;
  description: string;
  company_id?: number;
  is_civic?: boolean;
  is_joint_leave?: boolean;
  is_religious?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
  is_active: boolean;
  is_anonymized?: boolean;
  name: string;
  mii_id?: string;
  employee_id?: string;
  bni_id?: string;
  division?: string;
  division_id?: number;
  division_rel?: Division;
  department?: string;
  department_id?: number;
  department_rel?: Department;
  site?: string;
  site_id?: number;
  site_rel?: Site;
  company?: string;
  company_id?: number;
  company_rel?: Company;
  position?: string;
  group_name?: string;
  signature_file_key?: string;
  created_at: string;
  updated_at?: string;
}

export interface WitnessResponse {
  id: number;
  name: string;
}

export interface UpdateMonthlyWitnessRequest {
  year: number;
  month: number;
  witness_id: number;
}

export interface DailyActivity {
  id?: number;
  date: string; // YYYY-MM-DD
  start_time: string;
  end_time: string;
  status: string;
  activity: string;
  project_name: string;
  project_id: string;
  app_impacted: string;
  project_ref_id?: number;
  project_ref?: Project;
  status_ref?: ActivityStatus;
  is_berita_acara?: boolean;
  berita_acara_notes?: string;
  witness_id?: number | null;
  witness?: WitnessResponse;
}

export interface Passkey {
  id: number;
  user_id?: number;
  friendly_name: string;
  authenticator_aaguid?: string;
  icon?: string;
  icon_light?: string;
  icon_dark?: string;
  created_at: string;
}

export interface ProfileChangeRequest {
  id: number;
  user_id: number;
  status: "pending" | "approved" | "rejected";
  name: string;
  email?: string;
  mii_id?: string;
  employee_id?: string;
  bni_id?: string;
  division?: string;
  division_id?: number;
  division_rel?: Division;
  department?: string;
  department_id?: number;
  department_rel?: Department;
  site?: string;
  site_id?: number;
  site_rel?: Site;
  company_id?: number;
  company_rel?: Company;
  notes?: string;
  position?: string;
  group_name?: string;
  reviewed_by?: number;
  reviewer_name?: string;
  reviewed_at?: string;
  reviewer?: User;
  created_at: string;
  updated_at?: string;
  user?: User;
}

export interface AdminProfileChange {
  id: number;
  user_id: number;
  user_name?: string;
  user_email?: string;
  name?: string;
  email?: string;
  employee_id?: string;
  bni_id?: string;
  division?: string;
  division_id?: number;
  department?: string;
  department_id?: number;
  company_id?: number;
  site?: string;
  site_id?: number;
  notes?: string;
  status: "pending" | "approved" | "rejected";
  reviewed_by?: number;
  reviewer_name?: string;
  reviewed_at?: string;
  created_at: string;
}

export interface ProfileChangeRequestDTO {
  name?: string;
  email?: string;
  employee_id?: string;
  bni_id?: string;
  company_id?: number;
  department?: string;
  department_id?: number;
  division?: string;
  division_id?: number;
  site?: string;
  site_id?: number;
  notes?: string;
}

export interface Approver {
  id: number;
  name: string;
  role_type: "team_leader" | "department_head";
  title?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface OvertimeEntry {
  id?: number;
  user_id?: number;
  daily_activity_id?: number;
  date: string;
  start_time: string;
  end_time: string;
  task_description: string;
  team_leader_id?: number;
  team_leader_name?: string;
  department_head_id?: number;
  department_head_name?: string;
  team_leader?: Approver;
  department_head?: Approver;
}

export interface PaginationMeta {
  current_page?: number;
  page?: number;
  limit: number;
  total_items?: number;
  total_rows?: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  code: number;
  status: string;
  data: T;
  pagination?: PaginationMeta;
  monthly_witness?: WitnessResponse;
}

export interface OvertimeRequest {
  id?: number;
  date: string;
  start_time: string;
  end_time: string;
  task_description: string;
  team_leader_id?: number;
  department_head_id?: number;
}

export interface CompanyRequest {
  code: string;
  name: string;
}

export interface DepartmentRequest {
  code?: string;
  name: string;
  division?: string;
  division_id?: number;
  company_id?: number;
  is_active?: boolean;
}


export interface Division {
  id: number;
  code: string;
  name: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DivisionRequest {
  code: string;
  name: string;
  is_active?: boolean;
}

export interface Site {
  id: number;
  code: string;
  name: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SiteRequest {
  code: string;
  name: string;
  is_active?: boolean;
}

export interface ApproverRequest {
  name: string;
  role_type: "team_leader" | "department_head";
  title?: string;
  is_active?: boolean;
}

export interface SetupStatusResponse {
  is_initialized: boolean;
  requires_setup: boolean;
  admin_count: number;
  is_new?: string;
}

export interface InitSetupRequest {
  admin: {
    name: string;
    username: string;
    email: string;
    password: string;
  };
  companies?: {
    code: string;
    name: string;
  }[];
  departments?: {
    code: string;
    name: string;
    company_code: string;
    division?: string;
  }[];
  approvers?: {
    name: string;
    role_type: "team_leader" | "department_head";
    title?: string;
    company_code?: string;
  }[];
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

export interface ChangePasswordResponse {
  code: number;
  status: string;
  message: string;
}

export interface WebAuthnOriginsResponse {
  origins: string[];
}

export interface LoginResponse {
  token: string;
  refresh_token: string;
  user?: User;
}

export interface RefreshRequest {
  refresh_token: string;
}

export interface RefreshResponse {
  token: string;
  refresh_token: string;
}

export interface LogoutRequest {
  refresh_token?: string;
}

export interface DepartmentQueryParams {
  division?: string;
  division_id?: number;
}

export interface UpdateUserRequestDTO {
  name?: string;
  email?: string;
  role?: Role;
  is_active?: boolean;
  employee_id?: string;
  bni_id?: string;
  company?: string;
  company_id?: number;
  division?: string;
  division_id?: number;
  department?: string;
  department_id?: number;
  site?: string;
  site_id?: number;
}

export interface CreateUserRequestDTO {
  username: string;
  email: string;
  role: Role;
  name?: string;
  employee_id?: string;
  bni_id?: string;
  company?: string;
  company_id?: number;
  division?: string;
  division_id?: number;
  department?: string;
  department_id?: number;
  site?: string;
  site_id?: number;
}

export interface ActivityFilterParams {
  page?: number;
  limit?: number;
  year?: number;
  month?: number;
  start_date?: string;
  end_date?: string;
  status_id?: number;
  sort?: "asc" | "desc";
  all?: boolean;
}

export interface UpdatePasskeyRequest {
  name: string;
}

export interface VerifyResetTokenRequest {
  token: string;
}

export interface VerifyResetTokenResponse {
  valid: boolean;
  status: string;
  message: string;
  email?: string;
  username?: string;
}

export interface AuthenticatorItem {
  aaguid: string;
  name: string;
  icon?: string;
  icon_light?: string;
  icon_dark?: string;
  updated_at?: string;
}

export interface AuthenticatorListResponse {
  authenticators: AuthenticatorItem[];
  page: number;
  limit: number;
  total: number;
}

export interface AuthenticatorSyncResponse {
  synced_at: string;
  total_synced: number;
}

export type TimesheetJobStatus = "queued" | "processing" | "completed" | "failed";

export interface TimesheetJobResponse {
  id: string;
  user_id: number;
  month: number;
  year: number;
  status: TimesheetJobStatus;
  download_url?: string;
  error_message?: string;
  expires_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface GenerateRequest {
  month: number;
  year: number;
}

export interface HolidayDTO {
  date: string;
  description: string;
  is_civic?: boolean;
  is_cuti_bersama?: boolean;
  is_joint_leave?: boolean;
  is_religious?: boolean;
}

export interface AdminPasskeyResponse {
  id: number;
  friendly_name: string;
  authenticator_aaguid?: string;
  icon?: string;
  created_at: string;
}

export interface UpdateDepartmentRequest {
  code?: string;
  name: string;
  division?: string;
  division_id?: number;
  is_active?: boolean;
}

export interface UpdateDivisionRequest {
  code?: string;
  name: string;
  is_active?: boolean;
}

export interface UpdateSiteRequest {
  code?: string;
  name: string;
  is_active?: boolean;
}

export function isUserAnonymized(
  u?: { username?: string; name?: string; email?: string; is_anonymized?: boolean } | null
): boolean {
  if (!u) return false;
  if (typeof u.is_anonymized === "boolean") {
    return u.is_anonymized;
  }
  return Boolean(
    u.username?.startsWith("deleted_user_") ||
    u.name?.startsWith("ANONYMIZED_USER_") ||
    (u.email?.startsWith("deleted_") && u.email?.endsWith("@timesheet.local"))
  );
}

// ==========================================
// Digital Signatures, Berita Acara & Verification
// ==========================================

export interface UploadSignatureRequest {
  signature_base64: string;
}

export interface UserSignatureResponse {
  has_signature: boolean;
  signature_url?: string;
  file_key?: string;
  updated_at?: string;
}

export interface SignTimesheetRequest {
  month: number;
  year: number;
}

export interface RevokeTimesheetRequest {
  month: number;
  year: number;
}

export interface TimesheetStatusResponse {
  id?: string;
  user_id?: number;
  month?: number;
  year?: number;
  is_signed?: boolean;
  status: "draft" | "signed" | "revoked" | string;
  signed_at?: string;
  signature_hash?: string;
  document_hash?: string;
  can_sign?: boolean;
  can_revoke?: boolean;
  verification_token?: string;
  verification_url?: string;
}

export interface SubmitBeritaAcaraRequest {
  month: number;
  year: number;
  witness_id?: number; // Opsional: kosongkan atau hilangkan jika sudah ada saksi bulanan
}

export interface WitnessActionRequest {
  action: "approve" | "reject";
  notes?: string;
}

export interface BeritaAcaraStatusResponse {
  id?: string | number;
  user_id?: number;
  employee_name?: string;
  month: number;
  year: number;
  status: "draft" | "submitted" | "pending_witness" | "signed" | "approved" | "rejected" | "revoked" | string;
  witness_id?: number;
  witness_name?: string;
  witness?: WitnessResponse;
  submitted_at?: string;
  reviewed_at?: string;
  employee_signed_at?: string;
  witness_signed_at?: string;
  witness_rejection_notes?: string;
  notes?: string;
  verification_token?: string;
  document_hash?: string;
  verification_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface WitnessRequestItem {
  id: string | number;
  user_id: number;
  user?: User;
  user_name?: string;
  month: number;
  year: number;
  status: string;
  submitted_at: string;
  activities_count?: number;
  notes?: string;
}

export interface DocVerificationResponse {
  is_valid: boolean;
  document_type?: "timesheet" | "berita_acara" | string;
  user_name?: string;
  employee_id?: string;
  period?: string;
  signed_at?: string;
  witness_name?: string;
  witness_signed_at?: string;
  verification_token?: string;
  hash?: string;
}


