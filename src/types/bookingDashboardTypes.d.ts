export interface DashboardSuccessResponse {
  num: number;
  date: string;
  status: string;
  customStatus: stirng;
  description?: string;
}

export interface DashboardValidationError {
  detail: {
    loc: [string, number];
    msg: string;
    type: string;
  }[];
}

export type DashboardResponse =
  | DashboardSuccessResponse[]
  | DashboardValidationError
  | null;

type BaseDataRowFields = Omit<DashboardSuccessResponse, "num">;

interface CustomReportRequired extends BaseDataRowFields {
  customReport: string;
  num?: number;
  error?: string;
  error?: string;
  customStatus?: string;
}

interface NumRequired extends BaseDataRowFields {
  customReport?: string;
  num: number;
  error?: string;
}

export interface FinancialErrors {
  guestReadyError: string;
  soldError: string;
  revenueError: string;
}

export interface FinancialData {
  guestReady: DashboardSuccessResponse;
  sold: DashboardSuccessResponse;
  revenue: DashboardSuccessResponse;
}

export interface FinancialDataResponse {
  data: FinancialData;
  errors: FinancialErrors;
}

export type DataRowFields = CustomReportRequired | NumRequired;

export interface IHouseCountApiParams {
  date: dayjs;
  propertyId: number;
}

export interface IHouseCountApiResponse {
  data: GuestStatusList;
}

interface GuestStatus {
  num: number;
  date: string;
  status: string;
  customStatus: string;
  description: string;
}

// Separate types for params and booking channels
type ParamsType = {
  property_id: number;
  date: string;
};

type BookingChannelType = {
  WALK_IN: number;
  CALL_IN: number;
  TRAVEL_AGENT: number;
  ONLINE_DIRECT: number;
  ONLINE_3RD_PARTY: number;
  ONLINE_3RD_PARTY_OTA: number;
  GROUPS: number;
};

// Main interface using the above types
interface HouseBreakdownType {
  params: ParamsType;
  total_rooms: number;
  total_guests: number;
  total_occupied: number;
  total_out_of_service: number;
  total_out_of_order: number;
  total_vacant: number;
  total_dirty: number;
  total_clean: number;
  total_clean_inspected: number;
  total_vacant_clean_rooms: number;
  total_occupied_clean_rooms: number;
  total_vacant_dirty_rooms: number;
  total_occupied_dirty_rooms: number;
  property_name: string;
  booking_channels: BookingChannelType;
}

export interface IResGuestCount {
  year: number;
  month: string;
  count: number;
}
export interface IResGuestCountRequest {
  property_id: number;
  include_children?: boolean;
}

export type GuestStatusList = GuestStatus[];

export interface ICompReservation {
  first_name: string;
  last_name: string;
  arrival_date: string;
  departure_date: string;
  reservation_id: number;
  room_number: string | null;
  reservation_status: string;
  rate_code: string;
  rate_amount: number;
}

export interface ICompReservationsRequest {
  property_id: number;
  date?: string;
  arrival_date?: string;
  departure_date?: string;
}
