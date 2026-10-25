import { IUser } from "./authTypes";

export interface MessageNotification {
  success: boolean;
  results: MessageResult[];
  detail: string;
}

export interface UpdateMessageNotification {
  success: boolean;
  results: MessageResult;
  detail: string;
}

export interface MessageResult {
  tenant_name: string;
  category: string;
  created_date: string; // ISO date string
  id: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  message: string;
  level: string;
  type: string;
  data: IHouskeepingData;
  origin: string;
  socket_id: number;
  expires_at: number; // Unix timestamp
  meta: NotificationMeta;
}

export interface IHouskeepingData {
  service: string;
  room_number: string;
  room_id: number;
  request: string;
  department: string;
  user?: IUser;
  read: boolean;
}

export interface ReservationData {
  detail: string;
  arrival_date: string; // ISO date string
  confirmation_id: string;
  guest_count: string;
  room_type: string;
  read: boolean;
  room_id?: number;
}

export interface NotificationMeta {
  iss: number; // Issued at (Unix timestamp)
  sub: string;
  user_name: string;
  tenant: string;
  pid: string;
  allow: null | string;
  dprt: string[];
  role: string;
  exp: number;
}

export interface IMessageAlertRequest {
  room: string;
  filter?: string;
}

export interface ISendNotificationRequest {
  id?: string;
  room: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  message: string;
  level: "property" | string;
  type: "MESSAGE" | string;
  data: {
    service: string;
    room_number: string;
    room_id: number;
    request: string;
    department: string;
    read?: boolean;
  };
  origin: string;
}
