import { IOraganization } from "./org";

interface IPropertyBaseValues {
  id?: number;
  name: string;
  description: string;
  phone?: string;
  phone_toll_free?: string;
  fax?: string;
  email?: string;
  address_1?: string;
  address_2?: string;
  country?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  lat?: number;
  lng?: number;
  checkin_time?: string;
  checkout_time?: string;
  cover_photo?: string;
  timezone?: string;
  property_type?: "HOTEL" | "RV_CAMP" | "CASINO" | "BOAT_SLIP";
  max_stay_duration_days?: number;
  incidentals_per_night?: number;
  max_reservations_per_request?: number;
  booking_window?: number;
}

interface IPropertyMetrics extends IPropertyBaseValues {
  rating_avg?: number;
  rating_star?: number;
  price_avg: string;
  tax_rate: number;
  floor_count: number;
  room_count: number;
  occupancy_count: number;
}

export interface IPropertyLogo {
  logo: string;
}

export interface IProperty extends IPropertyMetrics {
  logo: string;
  timezone: string;
  is_active: boolean;
  organization_id: number;
  checkin_time: string;
  checkout_time: string;
  max_stay_duration_days: number;
  max_reservations_per_request?: number;
  booking_window?: number;
  incidentals_per_night?: number;
  cancellation_policy: string;
  cancellation_policy_duration_days: number;
  created_at?: string;
  updated_at?: string;
  parent_organization: IOraganization;
  cover_photo?: string;
  property_type?: "HOTEL" | "RV_CAMP" | "CASINO" | "BOAT_SLIP";
}

export interface IPropertyApiReponse {
  data: IProperty;
}

export interface IPropertyRequest {
  id?: number;
  name: string;
  description: string;
  phone?: string;
  phone_toll_free?: string;
  fax?: string;
  email?: string;
  address_1?: string;
  address_2?: string;
  city?: string;
  state?: string;
  country?: string;
  zip_code?: string;
  lat?: number;
  lng?: number;
  organization_id?: number;
  timezone?: string;
  floor_count?: number;
  room_count?: number;
  property_type?: string;
}

export interface IAmenityAssignedProperty {
  id: number;
  additional_charge: boolean;
  featured: boolean;
  icon_path: string | null;
  updated_at: string;
  description: string | null;
  name: string;
  category_id: number;
  created_at: string;
  category: IAmenityCategory;
}

export interface IAmenityCategory {
  description: string | null;
  id: number;
  name: string;
  icon_path: string | null;
}

export interface IAmenityAssignedProperty {
  id?: number;
  additional_charge: boolean;
  icon_path: string | null;
  updated_at: string;
  description: string | null;
  name: string;
  category_id: number;
  created_at: string;
  category: IAmenityCategory;
}

export interface IAddPropertyAmenitiesRequest {
  id?: string;
  name: string;
  description: string;
  additional_charge: boolean;
  featured: boolean;
  category_id: number;
  icon_path?: string;
}

export type PropertyAmenitiesState = {
  amenities: IAmenityAssignedProperty[];
  propertyAmenities: IAmenityAssignedProperty[];
  pendingLinkAmenity: { name: string; id: number };
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string;
};

export type TAmendPropertyAmenityLink = {
  property_id: number | string;
  property_amenity_id: number | string;
};

export type TAmendPropertyAmenityRequest = {
  propertyId?: number | string;
  propertyAmenityId?: number | string;
};
export interface IPropertyAmenity {
  id?: number;
  additional_charge: boolean;
  featured: boolean;
  icon_path: string | null;
  updated_at: string;
  description: string | null;
  name: string;
  category_id: number;
  created_at: string;
  category: IAmenityCategory;
}

export interface IPropertyAmenityCategory {
  id: number;
  name: string;
  description: string;
  icon_path: string | null;
}
