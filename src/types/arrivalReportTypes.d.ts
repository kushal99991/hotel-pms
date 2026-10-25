export type BillingStatus = "Paid" | "Pending";

export interface ArrivalGuest {
  id: number;
  roomNumber: string;
  roomType: string;
  wing: string;
  floorLevel: number;
  guestName: string;
  arrivalDate: string;
  arrivalTime: string;
  departureDate: string;
  adults: number;
  children: number;
  rateCode: string;
  source: string;
  billingStatus: BillingStatus;
  outstandingBalance: number;
  specialRequests?: string;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface ArrivalFilters {
  dateRange: DateRange;
  roomTypes?: string[];
  floorLevels?: number[];
  wings?: string[];
  billingStatus?: BillingStatus;
}
