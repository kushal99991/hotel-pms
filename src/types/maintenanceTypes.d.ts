import { IUserDepartment } from "./houseKeeperTypes";

export interface IUserRole {
  id: number;
  name: string;
  description: string;
}

export interface IUser {
  id: number;
  email: string;
  user_name: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_verified: boolean;
  profile_image: string | null;
  profile_status: string;
  property_access: any; // Define as needed
  default_property_id: number;
  user_department: string | null;
  departments?: IUserDepartment[];
  roles: IUserRole[];
  last_login_at: string;
}

export interface IRoom {
  id: number;
  room_number: string;
  housekeeping_status: string;
  frontdesk_status: string;
  room_type_id: number;
  room_type: string | null;
  wing: string;
  floor: number;
}

export interface IMaintenanceType {
  id: number;
  property_id: number;
  parent_id: number;
  parent: IMaintenanceType | null; // Recursive type
  service_code: string;
  service_subject: string;
  service_request: string;
  service_discussion: any[]; // Define the structure if known
  service_status: string;
  service_notes: string;
  room_id: number;
  room_status: string;
  room: IRoom;
  location: string;
  documents: any[]; // Define the structure if known
  assigned_to: number | null;
  assigned_by: number;
  assigned_to_user: IUser | null;
  assigned_by_user: IUser;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  closed_by: number | null;
  closed_by_user: IUser | null;
}

// types.ts

export interface IMaintenanceEnum {
  result: {
    service_status: string[];
    service_priority: string[];
    service_codes: string[];
  };
}
export interface ICreateMaintenance {
  property_id: number;
  parent_id?: number;
  service_code: string;
  service_subject: string;
  service_request: string;
  service_priority?: string;
  service_notes?: string;
  room_id?: number;
  room_status?: string;
  location?: string;
  assigned_by?: number | null;
  assigned_to?: number | null;
  expected_start_date?: string;
  expected_completion_date: string;
}
