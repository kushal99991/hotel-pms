import { ReservationStatusEnum } from "constants/reservation";

export interface RoomSummaryItem {
  room_number: string;
  room_type: string;
  room_type_name: string;
  frontdesk_status: string;
  housekeeping_status: string;
  reservation_status: ReservationStatusEnum;
}

export interface StatusInfo {
  name: string;
  full_name: string;
  description: string;
  color_code: string;
}

export interface RoomStats {
  housekeeping_stats: Record<string, number>;
  frontdesk_stats: Record<string, number>;
  housekeeping_info: StatusInfo[];
  frontdesk_info: StatusInfo[];
}

export interface RoomSummaryResponse {
  room_summary: RoomSummaryItem[];
  room_stats: RoomStats;
}
