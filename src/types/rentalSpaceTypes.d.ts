export interface IRentalSpace {
  id: number;
  name: string;
  description?: string;
  max_adults?: number;
  size_area?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface IRentalSpaceRequest {
  property_id: number;
  status?: string;
  search?: string;
}

export interface IRentalSpaceResponse {
  data: IRentalSpace[];
  total: number;
  page: number;
  limit: number;
}

export enum RentalSpaceStatus {
  AVAILABLE = "Available",
  UNAVAILABLE = "Unavailable",
}

export interface IRentalSpaceSection {
  name: string;
  description?: string;
  max_adults?: number;
  size_area?: string;
}

export interface ICreateRentalSpaceRequest {
  name: string;
  room_type_id: number;
  description?: string;
  max_adults?: number;
  size_area?: string;
  sections?: IRentalSpaceSection[];
  adjacent_rooms?: number[][];
}
