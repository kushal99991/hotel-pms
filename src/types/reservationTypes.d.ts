import { IRoomStatus } from "constants/room";
import { PaymentRouting } from "types/paymentRoutingTypes";
import {
  IAvailabilityFeeResponse,
  IAvailabilityTaxResponse,
  IRoomType,
  IRoomTypeResponse,
} from "./roomTypes";
import { IFolioResponse } from "types/folios";
import { IPaymentProviderResponse, IPaymentResponse } from "./payments";
import {
  PaymentChargeTypeEnum,
  PaymentMethodStatusEnum,
} from "constants/payments";
import { ReservationStatusEnum } from "constants/reservation";
import { IUser } from "./authTypes";
import { PaymentMethodTypesEnum } from "constants/paymentMethods";
import { IReservationStatusEnum } from "./settingTypes";

export interface ReservationDetailsState {
  reservation?: IReservationResponse;
  paymentMethods?: IPaymentMethodResponse[];
  charges?: ICalculatedCharge;
  outstandingTotals?: PaymentTotalsData;
  guestVerified?: boolean;
  incidentalsCollected?: boolean;
  reservationLoading?: boolean;
}

export interface ControlledResDetailsState {
  guestVerified?: boolean;
  incidentalsCollected?: boolean;
}

export interface ICommentResponse {
  id: number;
  reservation_id: number;
  property_id: number;
  user_id: number;
  comment: string;
  created_at: string;
  updated_at: string;
  updated_by: number | null;
  user: IUser;
}

export interface ICurrentRoomInfo {
  id: number;
  room_number: string;
  frontdesk_status: IRoomStatus;
  frontdesk_status_description: string;
  housekeeping_status: string;
  housekeeping_status_description: string;
  room_type_id: number;
  floor?: number;
  wing?: string;
  room_status?: string;
  room_status_linking?: { room_status: string }[];
}

export interface IRatePlan {
  id: number;
  name: string;
  description: string;
  start_date: string | null;
  end_date: string | null;
  property_id: number;
  rules: {
    id: number;
    rate_plan_id: number;
    rule_key: string;
    rule_value: string;
  }[];
  typed_rules: {
    min_stay: number;
    allow_to_extend_stay: boolean;
    breakfast_included: boolean;
    suppressed_rates: boolean;
    parking_included: boolean;
  };
}

export interface IRateCodeResponse {
  id: number;
  name: string;
  description: string;
  property_id: number;
  suppressed: boolean;
  type: string;
  parent_rate_code_id: number | null;
  rate_plan: IRatePlan;
}

export interface IAddRoom {
  arrivalDepatureDate: {
    checkIn: Date;
    checkOut: Date;
  };
  roomCount: number;
  roomType: string[];
  rate: string;
}

export interface IPaymentDetail {
  cardHolderName?: string;
  cardHolderAddress?: string;
  cardHolderCountry?: string;
  cardHolderPhone?: string;
  cardHolderEmail?: string;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  cardName?: string;
  paymentType: "Card" | "Cash";
}

export interface IReservation {
  id?: number;
  startDate: Date;
  endDate: Date;
  propId: number;
  rateCode: number;
  reservationUuid?: string;
  roomTypeIds: string[];
  guestId?: IGuest | null;
  marketSegment: string;
  bookingChannel: string;
  stays: IStay[];
  guest?: IFullGuest | null;
  groupId?: number;
  paymentDetail?: IPaymentDetail;
  payment?: PaymentChargeTypeEnum;
  fees?: IAvailabilityFeeResponse[];
  taxes?: IAvailabilityTaxResponse[];
}

export interface IUpdateReservationRequest {
  id?: number;
  status?: ReservationStatusEnum;
  special_requests?: string;
  expected_checkin_time?: string;
  expected_checkout_time?: string;
  checkin_time?: string;
  checkout_time?: string;
  market_segment?: string;
  booking_channel: string;
}

export interface IUpdateReservationResponse {
  end_date: Date;
  reservation_holder_id: number;
  reservation_id: number;
  special_requests: string;
  start_date: Date;
  status: string;
  user_id: number;
}

export interface IUpdateReservation {
  endDate: Date;
  reservationHolderId: number;
  reservationId: number;
  specialRequests: string;
  startDate: Date;
  status: string;
  userId: number;
}

export interface ISelectedRoom {
  roomNumber: number;
  guests: IGuest[];
}

export interface IStay {
  roomTypeId: number;
  childrenCount?: number;
  adultCount?: number;
  guests?: IGuest[] | null;
  roomList?: ISelectedRoom[];
  specialRequests?: string | null;
  totalPrice?: number;
  primaryGuest?: boolean;
  expectedCheckinTime?: Date | null;
  expectedCheckOutTime?: Date | null;
  noOfRooms?: number;
  roomType?: IRoomType;
  custom_rates?: { [date: string]: number };
  tax_exemption_id?: number; // Added for tax exemption support
  // Computed flags added at submit-time
  reservation_holder_is_also_guest?: boolean;
  reservation_holder_is_primary_guest?: boolean;
}

export interface IGuest {
  firstName: string;
  lastName: string;
  email?: string | null;
  id?: number;
  primaryGuest?: boolean;
}

export interface IFullGuest {
  first_name: string;
  id?: number;
  last_name: string;
  email: string;
  country?: string;
  phone?: string;
  cell_phone?: string;
  address?: string;
  gender?: string;
  birth_date?: string;
  document_type?: string;
  document_number?: string;
  document_issue_date?: string;
  document_issuing_country?: string;
  document_expiration_date?: string;
  custom_fields?: Array<any>;
  note?: string;
  tax_id?: string;
  company_name?: string;
  company_tax_id?: string;
}

export interface IReservationStayDetails {
  date: Date;
  fee: number;
  price: number;
  reservationId: number;
  roomId: number | null;
  roomTypeId: number;
  tax: number;
}

export interface IReservationDetail {
  reservationId: number;
  confirmation_id?: string;
  folios: IFolioResponse;
  market_segment: string;
  firstName: string;
  lastName: string;
  guestId: number;
  reservationStatus: ReservationStatusEnum;
  roomType: string;
  roomTypeId?: number;
  room: string;
  rate: string;
  arrival: string;
  departure: string;
  expectedCheckIn: string;
  expectedCheckOut: string;
  checkInTime: string;
  rateCodeId?: number;
  rateCodeName?: string;
  checkOutTime: string;
  balance: number;
  guests: IGuestDetail[];
  reservationStayDetails: IReservationStayDetails[];
  selectRoomList: {
    roomType: string;
    roomStatus: IRoomStatus;
    roomNumber: string;
    date: Date;
  }[];
}

export interface IGuestDetail {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  incognito?: boolean;
  vip?: boolean;
}

export interface IPaymentMethodResponse {
  pp_customer_id: string;
  pp_method_id: string;
  future_use: boolean;
  direct_billing_account_id?: number;
  direct_billing_account_name?: string;
  globally_avail: boolean;
  last4: string;
  exp_month: number;
  exp_year: number;
  country: string;
  brand: string;
  id: number;
  card_holder: number;
  created_at: string;
  updated_at: string;
  pp_response?: IPaymentProviderResponse;
  payment_type: PaymentMethodTypesEnum;
  status?: PaymentMethodStatusEnum;
}

export interface IReservationStayDetailsResponse {
  price?: number;
  tax?: number;
  fee?: number;
  date: Date;
  reservation_id?: number;
  room_type_id?: number;
  room_id: number | null;
  nightly_rate: string;
  room_info: {
    room_number: number;
    state?: string;
    status?: RoomStatus;
  } | null;
}

export interface IPlannedRoomInfo {
  id: number;
  room_number: string;
  frontdesk_status: IRoomStatus;
  frontdesk_status_description: string;
  housekeeping_status: string;
  housekeeping_status_description: string;
  room_type_id: number;
  floor?: number;
  wing?: string;
  room_status?: string;
  room_status_linking?: { room_status: string }[];
}
interface IGuestResponse {
  first_name: string;
  last_name: string;
  email?: string | null;
  country?: string;
  id: number;
}

export interface IReservationResponse {
  booking_channel: string;
  adults_count?: number;
  children_count: number;
  confirmation_id?: string;
  balance?: string;
  incognito?: boolean;
  current_room_info: ICurrentRoomInfo;
  planned_room?: ICurrentRoomInfo;
  folios: IFolioResponse[];
  market_segment: string;
  payment_methods: IPaymentMethodResponse[];
  payments: IPaymentResponse[];
  rate_code: IRateCodeResponse;
  id: number;
  status: ReservationStatusEnum;
  statusInfo: IReservationStatusEnum;
  start_date: string;
  end_date: string;
  special_requests: string;
  checkin_time: string;
  checkout_time: string;
  expected_checkin_time: string;
  expected_checkout_time: string;
  guests: IGuestResponse[];
  primary_guest_id: number;
  reservation_holder_info: IGuestResponse;
  reservation_first_guest_info: IGuestResponse;
  reservation_stay_details: IReservationStayDetailsResponse[];
  room_type: IRoomTypeResponse;
  selectRoomList?: any[];
  comments?: ICommentResponse[];
  payment_routing?: PaymentRouting;
  is_guaranteed?: boolean;
  group?: {
    reservations: { id: number; confirmation_id: string }[];
    group_code?: string;
    group_name?: string;
    id?: number;
  };
}
export interface IReservationFilter {
  property_id?: number;
  reservation_status?: string | null;
  start_date?: string;
  end_date?: string;
  departing_date?: string;
  arriving_date?: string;
  expected_status?: string;
  confirmation_number?: string;
  first_name?: string;
  last_name?: string;
  wing?: string;
  floor?: string;
  room_type?: string;
  rate_code?: string;
  last_4_digits?: string;
  expected_checkin_time?: string;
  expected_checkout_time?: string;
  room_number?: string;
  reservation_id?: string;
  card_type?: string;
  group_code?: string;
}

export interface IGuestResponse {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  country?: string;
  document_type?: string;
  document_number?: string;
  document_issue_date?: Date | null;
  document_issuing_country?: string;
  document_expiration_date?: Date | null;
  incognito?: boolean;
  vip?: boolean;
}

export interface VerifyGuest {
  first_name: string;
  last_name: string;
  email: string;
  id?: number;
  document_type?: string;
  document_number?: string;
  document_issue_date?: Date | null;
  document_issuing_country?: string;
  document_expiration_date?: Date | null;
}

export interface IRoomAssign {
  roomId: number;
}

export interface IRoomTypeWithStays {
  roomTypeId: number;
  stays: IStay[];
}

export interface IReservationCreationResponse {
  data: {
    payment_intent: {
      client_secret: string;
      amount: number;
      object: string;
    };
    reservations: {
      folio_id: number;
      payment_id: number;
      reservation_id: number;
    }[];
  };
}

export interface CheckOutStateValue {
  completed: boolean;
  message: string;
  showMoreByDefault?: boolean;
  hasMoreContent?: boolean;
  viewMoreContent?: any;
}

export interface CheckOutState {
  refundOwed?: CheckOutStateValue;
  balanceOwed?: CheckOutStateValue;
  correctDate?: CheckOutStateValue;
}

type CheckOutStateKey = keyof CheckOutState;

export interface IReservationCommentRequest {
  reservation_id: number;
  property_id: number;
  comment: string;
}
export interface IHistory {
  id: number;
  user_id: number;
  property_id: number;
  table_id: number;
  table_name: string;
  category: string;
  action: string;
  details: string;
  attributes: Record<string, any>[];
  created_at: string;
  created_on: string;
}
interface IGetHistoryParams {
  table_id: number;
  property_id: number;
  category: string;
}

export interface IReservationEmailConfirmation {
  guest_emails: { email: string }[];
}

export interface IReservationEmailConfirmationRequest {
  reservation_id: number;
  guest_emails: string[];
}

export interface IEmailResponse {
  success: boolean;
  message: string;
  result: IEmailResult;
}

export interface IPerNightRateUpdateRequest {
  reservation_id: number;
  rates_to_update: {
    date: string;
    rate: number;
  }[];
}

export interface IPerNightRateUpdateResponse {
  id: number;
  reservation_stay_details: {
    date: string;
    room_id: number | null;
    room_info: any | null;
    nightly_rate: string;
    custom_rate: boolean;
  }[];
}

interface IEmailResult {
  email_to: string[];
  email_from: string;
  reservation_id: number;
  property_id: number;
  email_sent: boolean;
}

// Define the interface for the raw API response
interface IInventoryResponse {
  room_type_id: number;
  rate_code_id: number;
  date: string;
  reserved_count: number;
  allocated_per_rate: number;
  available_count: number;
}

// Define the interface for the transformed response
interface IInventory {
  roomTypeId: number;
  rateCodeId: number;
  date: string;
  reservedCount: number;
  allocatedPerRate: number;
  availableCount: number;
}

export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

interface IRoomTypeInfo {
  id: number;
  type: string;
  name: string;
}

export interface Room {
  id?: number;
  number: string;
  type: string;
  floor: number;
  maxOccupancy: number;
  room_type: IRoomTypeInfo | null;
  housekeeping_status?: string;
  frontdesk_status?: string;
}
