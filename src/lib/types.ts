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
  is_joint_leave?: boolean;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
  is_active: boolean;
  name: string;
  mii_id?: string;
  employee_id?: string;
  bni_id?: string;
  division?: string;
  department?: string;
  department_id?: number;
  department_rel?: Department;
  site?: string;
  company?: string;
  company_id?: number;
  company_rel?: Company;
  position?: string;
  group_name?: string;
  created_at: string;
  updated_at?: string;
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
  mii_id?: string;
  employee_id?: string;
  bni_id?: string;
  division?: string;
  department?: string;
  department_id?: number;
  site?: string;
  company_id?: number;
  reviewed_by?: number;
  reviewer_name?: string;
  reviewed_at?: string;
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
  employee_id?: string;
  bni_id?: string;
  division?: string;
  department?: string;
  department_id?: number;
  company_id?: number;
  site?: string;
  status: "pending" | "approved" | "rejected";
  reviewed_by?: number;
  reviewer_name?: string;
  reviewed_at?: string;
  created_at: string;
}

export interface ProfileChangeRequestDTO {
  name?: string;
  employee_id?: string;
  bni_id?: string;
  company_id?: number;
  department?: string;
  department_id?: number;
  division?: string;
  site?: string;
}

export interface Approver {
  id: number;
  name: string;
  role_type: "team_leader" | "department_head";
  title?: string;
  is_active: boolean;
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
  department_head_id?: number;
  team_leader?: Approver;
  department_head?: Approver;
}

export interface PaginationMeta {
  current_page: number;
  limit: number;
  total_items: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  code: number;
  status: string;
  data: T;
  pagination?: PaginationMeta;
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

