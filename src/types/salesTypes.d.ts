import { DailyRevenueFilterType } from "services/reportSlice";
import { IReservationResponse } from "./reservationTypes";
import { SalesGroupPaymentType } from "constants/sales";

export type UserDepartment = {
  id: number;
  department_name: string;
};

export type IUserType = {
  id: number;
  email: string;
  user_name: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_verified: boolean;
  profile_image: string;
  profile_status: string;
  property_access: any[];
  default_property_id: number;
  user_department: UserDepartment;
  roles: any[];
  last_login_at: string;
};

export type IGuestType = {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  cell_phone: string;
  address: string;
  email: string;
  country: string;
  gender: string;
  birth_date: string;
  document_type: string;
  document_number: string;
  document_issue_date: string;
  document_issuing_country: string;
  document_expiration_date: string;
  custom_fields: Record<string, any>;
  note: string;
  tax_id: string;
  company_name: string;
  company_tax_id: string;
  created_at: string;
  updated_at: string;
};

export interface CreateSalesContact {
  property_id: number;
  notes?: string;
  role?: string;
  billing_country?: string;
  billing_zip?: string;
  billing_state?: string;
  billing_city?: string;
  billing_address?: string;
  billing_email?: string;
  billing_fax?: string;
  billing_phone_ext?: string;
  billing_phone?: string;
  billing_name?: string;
  address?: string;
  country: string;
  email?: string;
  cell_phone?: string;
  phone_extension?: string;
  phone?: string;
  last_name: string;
  first_name: string;
}

export interface ISalesContract extends CreateSalesContact {
  id: number;
}

export interface IAccountRequest {
  property_id?: number;

  first_name: string;
  last_name: string;
  country: string;

  phone: string;
  phone_extension?: string;
  cell_phone?: string;
  email: string;
  address?: string;

  billing_name: string;
  billing_phone: string;
  billing_phone_ext?: string;
  billing_fax?: string;
  billing_email: string;
  billing_address: string;
  billing_city: string;
  billing_state: string;
  billing_zip: string;
  billing_country?: string;

  role?: string;
  notes?: string;
}

export interface ISalesAccountGroup {
  sales_account_id: number;
  group_code: string;
  group_name: string;
  group_type: string;
  group_description: string;
  group_status: string;
  group_arrival_date: Date;
  group_departure_date: Date;
  group_release_date: Date;
  group_cutoff_date: Date;
  group_attributes: string[];
  id: number;
  created_at: Date;
  updated_at: Date;
}

/**
 * Sales Groups (property-level list)
 * Endpoint: /sales/group/list/?property_id=...
 */
export interface ISalesGroupListItem {
  group_code: string;
  group_name: string;
  group_description: string | null;
  group_status: string | null;
  group_arrival_date: string | null;
  shoulder_arrival_date: string | null;
  shoulder_departure_date: string | null;
  group_departure_date: string | null;
  group_release_date: string | null;
  group_cutoff_date: string | null;
  group_attributes: unknown[] | null;
  catering: boolean;
  banquet: boolean;
  contract_signed: boolean;
  shoulder_dates: boolean;
  market_segment: string | null;
  booking_channel: string | null;
  sales_distribution: string | null;
  method_of_payment: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  phone_extension: string | null;
  cell_phone: string | null;
  address: string | null;
  email: string | null;
  country: string | null;
  notes: string | null;
  property_id: number;
  sales_contact_id: number | null;
  rate_code_id: number | null;
  id: number;
  rooms_booked: number;
  rooms_booked_by_type: Record<string, number>;
  rooms_blocked: number;
  rooms_blocked_by_type: Record<string, number>;
  sales_contact: ISalesGroupSalesContact | null;
  created_at: string;
  updated_at: string;
}

/**
 * Sales Group Block (room allocation by date)
 */
export interface ISalesGroupBlock {
  id: number;
  date: string;
  room_type_id: number;
  alloc_count: number;
  reserved_count: number | null;
}

/**
 * Sales Group Payment Routing Connection
 */
export interface ISalesGroupPaymentRoutingConnection {
  posting_code_department_id: number | null;
}

/**
 * Sales Group Payment Routing
 */
export interface ISalesGroupPaymentRouting {
  folio?: string | null;
  payment_type?: SalesGroupPaymentType;
  posting_code_department_ids?: ISalesGroupPaymentRoutingConnection[];
  routing_targets?: ISalesGroupPaymentRoutingConnection[];
  target_dept_group?: { name: string } | null;
}

/**
 * Sales Group Detail (single group by ID)
 * Endpoint: /sales/group/{id}
 * Extends ISalesGroupListItem with blocks, payment_routing, reservations
 */
export interface ISalesGroupDetail extends ISalesGroupListItem {
  status: string;
  blocks: ISalesGroupBlock[];
  payment_routing?: ISalesGroupPaymentRouting | null;
  reservations: unknown[];
}

export interface ISalesGroupSalesContact {
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  phone_extension: string | null;
  cell_phone: string | null;
  email: string | null;
  country: string | null;
  address: string | null;

  billing_name: string | null;
  billing_phone: string | null;
  billing_phone_ext: string | null;
  billing_fax: string | null;
  billing_email: string | null;
  billing_address: string | null;
  billing_city: string | null;
  billing_state: string | null;
  billing_zip: string | null;
  billing_country: string | null;

  role: string | null;
  notes: string | null;
}

export interface ISalesAccountGroupRequest {
  group_code?: string;
  group_name: string;
  group_description?: string;
  group_status?: string;
  group_arrival_date: string;
  shoulder_arrival_date?: string;
  shoulder_departure_date?: string;
  group_departure_date: string;
  group_release_date: string;
  group_cutoff_date: string;
  group_attributes?: any[];
  catering?: boolean;
  banquet?: boolean;
  contract_signed?: boolean;
  shoulder_dates?: boolean;
  booking_channel?: string;
  market_segment?: string;
  sales_distribution?: string;
  method_of_payment?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  phone_extension?: string;
  cell_phone?: string;
  address?: string;
  email?: string;
  country?: string;
  notes?: string;
  property_id: number;
  sales_contact_id?: number;
  rate_code_id?: number;
  status?: string;
  payment_routing?: object[];
  sales_contact?: number | CreateSalesContact;
  group_blocks?: GroupBlock[];
}

type GroupBlock = {
  start_date: string;
  end_date: string;
  room_type_id: number;
  alloc_count?: number;
};

export interface IUpdateSalesAccountGroupRequest
  extends ISalesAccountGroupRequest {
  group_id: number;
}

export interface SalesGroup extends ISalesAccountGroupRequest {
  id: number;
}

export interface Event {
  // location: ReactNode;
  // menu: any;
  // beo: any;
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  booker: string;
  organization: string;
  phone: string;
  email: string;
  payment: "Paid" | "Pending" | "Cancelled";
  attendees: number;
  sittingArrangement: string;
  meetingSpace: string;
  notes: string;
  color: string;
  contrastColor?: string;
  isShoulder?: boolean;
  // location: string;
}

export interface SalesData {
  label: string;
  value: number;
  color: string;
}

export interface GroupData {
  id: number;
  groupName: string;
  company: string;
  groupStatus: string;
  contractSigned: string;
  arrivalDate: string;
  departureDate: string;
  shoulderDates: string;
  roomsCommitted: number;
  roomsBooked: number;
  cutOffDate: string;
  releaseDate: string;
  banquet: string;
  catering: string;
  paymentMethod: string;
  rateCode: string;
  groupCode: string;
  segment: string;
  reservation?: IReservationResponse | null;
}

export interface MetricData {
  occupancy: string;
  averageRate: string;
  revPar: string;
  revenueToday: string;
  revenueMTD: string;
  revenueYTD: string;
  revenueLY: string;
}

export interface ChartItem {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

export interface IRoomingGuestSchema {
  first_name: string;
  last_name: string;
  email: string;
}

export interface IRoomingStaySchema {
  room_type_id: number;
  rate_code_id: number;
  primary_guest: boolean;
  guests: IRoomingGuestSchema[];
  special_requests?: string;
  children_count: number;
  adults_count: number;
  tax_exemption_id?: number;
}

export interface IRoomingSchema {
  startDate: Date;
  endDate: Date;
  stay: IRoomingStaySchema[];
}

/**
 * Daily Reports Schema
 */

export interface IReportDailyRevenueRequest {
  property_id?: number;
  filter_type?: DailyRevenueFilterType;
  reporting_date?: string;
}

export interface IDailyRevenueData {
  name: string;
  today: number;
  month_to_date: number;
  last_year_mtd: number;
  year_to_date: number;
  last_year_to_date: number;
}

export interface IReportDailyRevenueResponse {
  report_name: string;
  report_date: string;
  data: IDailyRevenueData[];
  path: string;
}
