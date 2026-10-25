import { IUser } from "./authTypes";

export interface IReservation {
  id: number;
  guest_name?: string;
  room_number?: string;
}

export enum LostAndFoundStatusEnum {
  PENDING = "PENDING",
  RETURNED = "RETURNED",
  ARCHIVED = "ARCHIVED",
}

export interface ILostAndFoundItem {
  id: number;
  user_id: number;
  returned_by_user_id?: number | null;
  reservation_id?: number | null;

  // Item details
  item_name?: string | null;
  item_description: string;
  item_category?: string | null;
  item_attributes?: string | null;
  item_value_over_100?: boolean;
  item_storage_location?: string | null;

  // Found details
  location_found: string;
  datetime_found: string; // ISO date string
  found_by_name?: string | null;

  // Guest details
  guest_name?: string | null;
  guest_contact?: string | null;
  guest_contacted?: boolean;
  guest_room_number?: string | null;

  // Status and return info
  status: LostAndFoundStatusEnum;
  return_date?: string | null; // ISO date string
  returned_to?: string | null;

  // Notes
  notes?: string | null;
  release_note?: string | null;

  // Timestamps
  created_at: string; // ISO date string
  updated_at: string; // ISO date string

  // Relationships
  user?: IUser;
  returned_by?: IUser | null;
  reservation?: IReservation | null;
}

export interface ICreateLostAndFoundItem {
  property_id?: number;
  status?: string;
  user_id: number;
  returned_by_user_id?: number | null;
  reservation_id?: number | null;

  // Item details
  item_name?: string;
  item_description: string;
  item_category?: string;
  item_attributes?: string;
  item_value_over_100?: boolean;
  item_storage_location?: string;

  // Found details
  location_found: string;
  datetime_found: string; // ISO date string
  found_by_name?: string;

  // Guest details
  guest_name?: string;
  guest_contact?: string;
  guest_contacted?: boolean;
  guest_room_number?: string;

  // Status and return info
  return_date?: string | null; // ISO date string
  returned_to?: string;

  // Notes
  notes?: string;
  release_notes?: string;
}

export interface IUpdateLostAndFoundItem {
  id: number;
  returned_by_user_id?: number | null;
  reservation_id?: number | null;

  // Item details
  item_name?: string;
  item_description?: string;
  item_category?: string;
  item_attributes?: string;
  item_value_over_100?: boolean;
  item_storage_location?: string;

  // Found details
  location_found?: string;
  datetime_found?: string; // ISO date string
  found_by_name?: string;

  // Guest details
  guest_name?: string;
  guest_contact?: string;
  guest_contacted?: boolean;
  guest_room_number?: string;

  // Status and return info
  status?: LostAndFoundStatusEnum;
  return_date?: string | null; // ISO date string
  returned_to?: string;

  // Notes
  notes?: string;
  release_note?: string;
}

export interface ILostAndFoundResponse {
  data: ILostAndFoundItem[];
  total: number;
  page: number;
  limit: number;
}

export interface ILostAndFoundListParams {
  limit?: number;
  offset?: number;
  property_id?: number;
  status?: LostAndFoundStatusEnum;
  search?: string;
  date_from?: string;
  date_to?: string;
}

export interface IReturnLostAndFoundItem {
  id: number;
  returned_by_user_id: number;
  returned_to: string;
  return_date: string; // ISO date string
  release_note?: string;
  status: LostAndFoundStatusEnum.RETURNED;
}

export interface IArchiveLostAndFoundItem {
  id: number;
  status: LostAndFoundStatusEnum.ARCHIVED;
  release_note?: string;
}

// Categories that might be useful for dropdowns
export interface ILostAndFoundCategory {
  id: string;
  label: string;
}

export const LOST_AND_FOUND_CATEGORIES: ILostAndFoundCategory[] = [
  { id: "ELECTRONICS", label: "Electronics" },
  { id: "CLOTHING", label: "Clothing" },
  { id: "JEWELRY", label: "Jewelry" },
  { id: "PERSONAL_ITEMS", label: "Personal Items" },
  { id: "DOCUMENTS", label: "Documents" },
  { id: "BAGS_LUGGAGE", label: "Bags & Luggage" },
  { id: "BOOKS_MEDIA", label: "Books & Media" },
  { id: "TOILETRIES", label: "Toiletries" },
  { id: "OTHER", label: "Other" },
];

export interface ICreateLostAndFoundForm
  extends Omit<
    ICreateLostAndFoundItem,
    "datetime_found" | "user_id" | "return_date"
  > {
  datetime_found?: Date | undefined;
  departure_date?: Date | undefined;
  guest_contacted_date?: Date | undefined;
  release_date?: Date | undefined; // This maps to return_date in backend
  release_notes?: string;
  user_id?: string;
}
