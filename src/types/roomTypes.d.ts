import { TaxRateType } from "constants/taxes";
import { IPropertyResponse } from "./property";
import { IRoomAmenity } from "./roomAmenitiesTypes";
import { RoomRentalTypes } from "constants/room";

export interface IGetRoomTypeRequest {
  propertyId: number;
}

export interface IGetRoomTypeAvailabilityRequest {
  startDate: string;
  endDate: string;
  roomTypeIds: string;
  numberOfGuests: string;
  rateCode: string;
  property_id: string;
}

export interface IGetRoomTypeAvailabilityResponse {
  room_type_id: string;
  rooms_needed_of_this_type: number;
  rooms_available: number;
  pricing: IPricing;
  room_type: {
    id: number;
    type: string;
    type_description: string;
    adults: number;
    children: number;
    size_beds: number;
    property_id: number;
    occupancy: number;
  };
}

export interface IAvailabilityFeeResponse {
  description: string;
  id: number;
  name: string;
  rate: string;
  starts_from: string;
}

export interface IAvailabilityTaxResponse {
  description: string;
  id: number;
  name: string;
  rate: string;
  starts_from: string;
  type: TaxRateType;
}

export interface IGetRoomTypeAvailabilityMainResponse {
  availability: IGetRoomTypeAvailabilityResponse[];
  reservation_token: string;
  fees: IAvailabilityFeeResponse[];
  taxes: IAvailabilityTaxResponse[];
}

interface IPricing {
  [date: string]: string; // Date string (YYYY-MM-DD) as key and price as value
}

interface IRoomType {
  id: number;
  type: string;
  typeDescription: string;
  adults: number;
  children: number;
  sizeBeds: number;
  propertyId: number;
  occupancy: number;
}

export interface IGetRoomTypeAvailability {
  roomType: IRoomType;
  roomTypeId: number;
  roomsNeededOfThisType: number;
  roomsAvailable: number;
  pricing: IPricing;
  noRooms?: number;
}

export interface IGetRoomTypeAvailabilityUpdateResponse {
  availability: IGetRoomTypeAvailability[];
  reservationUuid: string;
  fees: IAvailabilityFeeResponse[];
  taxes: IAvailabilityTaxResponse[];
}

export interface IRoomTypeResponse {
  id: number;
  type: string;
  name?: string;
  type_description: string;
  smoking: boolean;
  type_icon: string;
  type_description: string;
  size_area: string;
  inventory: number;
  occupancy: number;
  adults: number;
  children: number;
  size_beds: number;
  property_id: number;
  created_at: string;
  updated_at: string;
  property: IPropertyResponse;
  smoking: boolean;
  image?: string;
  rental_type: RoomRentalTypes;
  amenities: IRoomAmenity[];
}

export interface IRoomTypes {
  id: number;
  type: string;
  name?: string;
  typeIcon: string;
  typeDescription: string;
  sizeArea: string;
  inventory: number;
  occupancy: number;
  adults: number;
  children: number;
  sizeBeds: number;
  propertyId: number;
  smoking?: boolean;
  createdAt: string;
  updatedAt: string;
  image?: string[];
  rentalType: RoomRentalTypes;
  amenities: IRoomAmenity[];
}

export interface IRateCodeResponse {
  id: number;
  name: string;
  description: string;
  suppressed?: boolean;
  property_id?: number;
  type?: string;
  active?: boolean;
}

export interface IRoomTypeInventoryResponse {
  room_type: string;
  type_icon: string;
  type_description: string;
  date: string;
  available_count: number;
  room_type_id: number;
}

export interface IRoomTypeInventory {
  roomType: string;
  typeIcon: string;
  typeDescription: string;
  date: string;
  availableCount: number;
  roomTypeId: number;
}

export interface IRoomAssignRequest {
  reservationId: number;
  startDate: string;
  endDate: string;
  roomId: number;
  old_room_id?: number;
}

export interface IRoomTypeRequest {
  id?: number;
  name: string;
  type: string;
  type_icon?: string;
  image?: string | null;
  type_description: string;
  size_area?: string;
  inventory?: number;
  occupancy?: number;
  adults: number;
  children: number;
  smoking?: boolean;
  size_beds: number;
  property_id?: string;
  rental_type: RoomRentalTypes;
}

export interface ICreateBulkRoomNumberResponse {
  detail: string;
  rooms: IRoomTypes[];
}
