import {
  ExpectedStatusEnum,
  ReservationStatusEnum,
} from "constants/reservation";
import Dayjs from "dayjs";

export type SearchByOption =
  | "First Name"
  | "Last Name"
  | "Email"
  | "Address"
  | "Stay Status"
  | "Reservation Status";

export interface IQuickSearchParams {
  firstName: string;
  lastName: string;
  propertyId?: number; // Optional property ID
  address?: string; // Optional address
  email?: string; // Optional email
  phoneNumber?: string; // Optional phone number
  startDate?: Dayjs | null; // Optional start date
  endDate?: Dayjs | null; // Optional end date
  reservationStatus?: string; // Optional reservation status
  reservationStayStatus?: string; // Optional reservation stay status
}

export interface IQuickSearchResponse {
  columns: (keyof IReservation)[];
  data: IReservation[];
}

export interface IReservation {
  GUEST_ID: string;
  FIRST_NAME: string;
  LAST_NAME: string;
  PHONE_NUMBER: string;
  ADDRESS: string;
  EMAIL: string;
  RESERVATION_STATUS: string;
  STAY_STATUS: string;
  ARRIVAL: string;
  DEPARTURE: string;
}

export interface IQuickSearch {
  columns: string[];
  data: IReservation[];
}

export interface GuestByStayDate {
  FIRST_NAME: string;
  LAST_NAME: string;
  RESERVATION_STATUS: ReservationStatusEnum;
  ROOM_TYPE: string;
  ROOM: string;
  RATE: string;
  RATE_CODE_NAME: string;
  ARRIVAL: string;
  DEPARTURE: string;
  RESERVATION_ID: string;
  EXPECTED_CHECK_IN: string;
  EXPECTED_CHECK_OUT: string;
  BALANCE: number;
  GUESTS?: {
    email?: string;
    first_name?: string;
    id?: number;
    last_name?: string;
  }[];
}
export interface StayDateResponse {
  columns: string[];
  data: GuestByStayDate[];
}

export interface IStayDate {
  columns: string[];
  data: GuestByStayDate[];
}

export interface IGuestStayParams {
  propertyId: number;
  date: string;
  status?: ExpectedStatusEnum;
}

export interface IGuest {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  cell_phone: string | null;
  country: string;
  address: string;
  custom_fields: Record<string, any> | null;
  reservations: IReservation[];
}

export interface ILinkGuestWithReservationResponse {
  message: string;
  reservation_id: number;
  guests: number[];
}
