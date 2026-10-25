import { date } from "yup";

export type AuthErrorType =
  | "missing_token"
  | "invalid_token"
  | "session_expired"
  | "unknown_error";

// types.ts
export type ForgotPasswordFlowType =
  | "email form"
  | "error"
  | "reset password"
  | "password changed";

export interface IForgotPasswordRequest {
  email: string;
}

export interface IForgotPasswordResponse {
  email: string;
}
export interface IPasswordResetCodeResponse {
  success: boolean;
  error: string | null;
  message: string;
}

export interface IResetPasswordRequest {
  newPassword: string;
  confirmPassword: string;
  resetCode?: string | null;
}

export interface IResetPasswordResponse {
  email: string;
}

export interface ILoginForm {
  domain: string;
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface Role {
  id: number;
  name: string;
  description: string;
}
export interface Department {
  id: number;
  department_name: string;
  department_description: string;
  department_slug: string;
  is_active: number;
  users: [];
  created_at: Date;
  updated_at: date;
}

export interface IDepartmentRequest {
  limit?: number;
  offset?: number;
  property_id?: number;
  department_name?: string;
}

export interface RoleResponse {
  result: Role[];
}

export interface IUserResponse {
  id: number;
  email: string;
  name: string;
  userName: string;
  firstName: string;
  lastName: string;
  image: string;
  isActive: boolean;
  isVerified: boolean;
  defaultPropertyId: number;
  userDepartment: string | null;
  departments?: Department[];
  roles: Role[];
  lastLoginAt: string;
  accessToken: string;
  domain: string;
  profileStatus?: string;
  profileImage?: string;
  propertyAccess?: number[];
}

export interface IUser {
  id: number;
  email: string;
  name: string;
  user_name: string;
  first_name: string;
  last_name: string;
  image: string;
  is_active: boolean;
  is_verified: boolean;
  default_property_id: number;
  user_department: { department_name: string; id: number } | null;
  departments: Department[];
  roles: Role[];
  last_login_at: string;
  access_token: string;
  domain: string;
  profile_status?: string;
  profile_image?: string;
  property_access?: number[];
}

export interface IAddUserRequest {
  userName: string;
  email: string;
  password: string;
  department: string;
  role: string;
  property: string;
  firstName: string;
  lastName: string;
  isActive?: string;
}
export interface IUpdateUserRequest extends Omit<IAddUserRequest, "password"> {
  id: string;
  department?: string; // Now optional
  role?: string; // Now optional
}
export interface IAddRoleRequest {
  name: string;
  description: string;
}
export interface IAddRoleResponse {
  name: string;
  description: string;
  id: number;
}

export interface IEditRoleRequest {
  id: string;
  name: string;
  description: string;
}
export interface IAddRoleAssignRequest {
  user: string;
  roles: string;
}

export interface IUpdateUserDetail {
  first_name?: string;
  last_name?: string;
  email?: string;
}

export interface IPropertyAssignResponse {
  id: number;
  result: number[]; // Array of property IDs that the user has access to
  message: string;
  success: boolean;
  error: string | null;
  params: {
    user_id: number;
    property_id: number;
    action: "ADD" | "REMOVE";
  };
}
