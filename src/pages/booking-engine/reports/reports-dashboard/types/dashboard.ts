export interface KPIData {
  occupancyRate: number;
  averageDailyRate: number;
  revenuePerRoom: number;
  totalBookings: number;
}

export interface Room {
  roomNumber: string;
  type: string;
  status: "occupied" | "vacant" | "maintenance";
  guestName?: string;
  checkIn?: string;
  checkOut?: string;
}

export interface RevenueData {
  date: string;
  roomRevenue: number;
  foodBeverageRevenue: number;
  otherRevenue: number;
  totalRevenue: number;
}

export interface Reservation {
  id: string;
  guestName: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  status: "confirmed" | "pending" | "cancelled";
  totalAmount: number;
}
