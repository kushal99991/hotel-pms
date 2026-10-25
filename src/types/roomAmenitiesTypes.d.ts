export interface IRoomAmenity {
  id: number;
  name: string;
  description: string;
  featured: boolean;
  additional_charge: boolean;
  charge: string;
  category_id: number;
  icon_path: string;
}

export interface IRoomAmenityRequest {
  name: string;
  description: string;
  featured: boolean;
  additional_charge: boolean;
  charge: number;
  category_id: number;
  icon_path?: string;
  property_id?: number;
}

export interface IRoomAmenityAttachResponse {
  room_type_id: number;
  room_amenity_id: number;
}
