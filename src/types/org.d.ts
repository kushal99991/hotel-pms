export interface IOrgChildPropertyResponse {
  id: number;
  name: string;
  description: string;
  logo: string | null;
  country: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  zip_code: string | number;
  timezone: string;
  email: string;
  phone: string;
  phone_toll_free: string;
  fax: string | number;
  rating_avg: number;
  rating_star: number;
  price_avg: number;
  tax_rate: number;
  floor_count: number;
  room_count: number;
  occupancy_count: number;
  lat: number;
  lng: number;
  is_active: boolean;
  organization_id: number;
  checkin_time: string;
  checkout_time: string;
  max_stay_duration_days: number;
  cancellation_policy: string;
  cancellation_policy_duration_days: number;
}

export interface IOrg {
  [x: string]: ReactNode;
  id: number;
  name: string;
  phone: string;
  address: string;
  email: string;
  description: string;
  logo: string;
  childProperty: OrgChildProperty[];
}

export interface IOrgLogo {
  logo: string;
}

export interface IOrgResponse {
  id: number;
  name: string;
  phone: string;
  address: string;
  email: string;
  description: string;
  logo: string;
  child_property: IOrgChildProperty[];
}

export interface IOraganization {
  name: string;
  phone: string;
  address: string;
  email: string;
  description: string;
  logo?: string | null;
}

export interface IOraganizationRequest {
  id: number;
  data: IOraganization;
}
