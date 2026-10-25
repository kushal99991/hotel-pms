import { ICustomRoomStatus } from "constants/room";
interface IRoomType {
  id: number;
  type: string;
  name: string;
}
export interface IRoomNumberListResponse {
  id: number;
  room_id?: number;
  room_number: string;
  date: string;
  state: string;
  frontdesk_status: string;
  frontdesk_status_desc: string;
  housekeeping_status: string;
  housekeeping_status_desc: string;
  room_type_id: number;
  floor?: string;
  room_type?: IRoomType;
  wing?: string;
  updated_at?: Date;
  room_status?: ICustomRoomStatus;
  room_status_linking?: { room_status: string }[];
  occupied_by?: {
    id: number;
    confirmation_id: string;
  };
  // Newly added optional fields from API
  adjacent_room?: number | string | null;
  adjacent_rooms?: IAdjacentRoomInfo[];
  child_rooms?: IChildRoomInfo[];
  description?: string | null;
  image?: string | null;
  is_in_commission?: boolean;
  name?: string | null;
  parent_room?: number | string | null;
  parent_room_id?: number | null;
  property_id?: number;
  size_area?: string | number | null;
}

export interface IAdjacentRoomInfo {
  id: number;
  room_number: string | null;
  image: string | null;
  name: string | null;
  description: string | null;
  size_area: string | null;
}

export interface IChildRoomInfo extends IAdjacentRoomInfo {
  adjacent_rooms?: IAdjacentRoomInfo[];
}

export interface INewRoomNumberListResponse extends IRoomNumberListResponse {
  property_id: number;
  suggested_service?: ISuggestedServiceResponse;
  reservation?: Record<string, unknown>; // Replace `unknown` with detailed structure if available.
  room_type?: string; // Add if not present in the original interface.
}

export interface IRoomNumberList {
  id: number;
  roomNumber: string;
  state: string;
  status: string;
  roomTypeId: number;
  reservationStatus?: string;
  frontdesk_status?: string;
  housekeeping_status: string;
  room_type?: string;
  room_type_info?: IRoomType;
  floor?: string;
  wing?: string;
  updated_at?: Date;
  room_status?: ICustomRoomStatus;
  occupied_by?: {
    id: number;
    confirmation_id: string;
  };
  // Newly added optional passthrough fields
  adjacent_room?: number | string | null;
  adjacent_rooms?: IAdjacentRoomInfo[];
  child_rooms?: IChildRoomInfo[];
  description?: string | null;
  image?: string | null;
  is_in_commission?: boolean;
  name?: string | null;
  parent_room?: number | string | null;
  parent_room_id?: number | null;
  property_id?: number;
  size_area?: string | number | null;
}

export interface IOccupancyForecastReport {
  name: string;
  [key: `date_${string}`]: number | string;
}

export interface ISuggestedService {
  id: number;
  service_type: string;
  description: string;
  credits: number;
  room_type_id: number;
}

export interface INewRoomNumberList extends IRoomNumberList {
  housekeeping_status?: IRoomStatus;
  housekeeperId?: number;
  boardId?: number;
  taskId?: number;
  notes?: string;
  frontdesk_status?: IRoomStatus;
  property_id: number;
  suggested_service?: ISuggestedService;
  reservation?: Record<string, unknown>; // Replace `unknown` with a detailed type if known.
  credit?: number;
}

export interface IGetRoomListRequest {
  limit?: number;
  offset: number;
  roomTypeId?: number;
  property_id?: number;
  room_type_rental_type?: string;
}

export interface IGetRoomAvailableRequest {
  startDate: string;
  endDate: string;
  roomTypeId: string;
}

// rooms/availability (new format)
export interface IRoomAvailabilityIdsResponse {
  date: string;
  room_type_id: number;
  available_room_ids: number[];
}

export interface IRoomInfo {
  room_status: string;
  room_state: string;
}

export interface IAvailability {
  Available: {
    [roomNumber: string]: RoomInfo;
  };
}

export interface IDateAvailability {
  [roomType: string]: Availability;
}

export interface IRoomAvailability {
  [date: string]: DateAvailability;
}

export interface IRoomAmenitiesCategory {
  id: number;
  name: string;
  description: string;
  icon_path: string;
}

export interface IRoomNumberRoom {
  room_number: string;
  id?: string;
  room_id?: string;
  wing?: string | null;
  floor?: string | number | null;
  new?: boolean;
}

export interface IRoomNumberAssign {
  room_type_id: number;
  property_id?: number | null;
  wing?: string | null;
  floor?: number | null;
  inventory?: number | null;
  danger_drop_rooms?: boolean;
  rooms: IRoomNumberRoom[];
}

export interface IRoomAutoGenerateNumber {
  wing?: string;
  floor?: number;
  start_room_number: number;
  room_range: (number | undefined)[];
  skip_numbers: (number | undefined)[];
}

export interface IRoomAssignResponse {
  id: number;
  property_id: number;
  room_number: string;
  housekeeping_status: string;
  frontdesk_status: string;
  room_type_id: number;
  room_type: string | null;
  wing: string;
  floor: number;
}

export interface IRoomNumberCreateRequest {
  room_type_id: number;
  property_id: number;
  wing?: string | null;
  floor?: number | null;
  room_number: string;
}

export interface IRoomNumberCreateBulkRequest {
  danger_drop_rooms?: boolean;
  data: IRoomNumberCreateRequest[];
}
