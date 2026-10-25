import { ICustomRoomStatus } from "constants/room";

export interface ICreateHousekeeperBoard {
  date: Date;
  status: "string";
  notes: "string";
  shift_id: 0;
  housekeeper_id: 0;
}

interface IRoomType {
  id: number;
  type: string;
  name: string;
}

export interface IHouseRoomNumberList {
  id: number;
  roomNumber: string;
  roomType?: string;
  state: string;
  floor?: string;
  status: IRoomStatus;
  frontdesk_status?: IRoomStatus;
  housekeeping_status?: string;
  room_status?: ICustomRoomStatus;
  roomTypeId: number;
  room_type?: string;
  room_type_info?: IRoomType;
  date?: Date;
  updated_at?: Date;
  credits?: number;
  checkin?: Date;
  checkout?: Date;
  completed?: boolean;
}

export interface IHouseRoomNumberListView {
  room: {
    id: number;
    room_number: string;
    roomType?: string;
    state?: string;
    housekeeping_status: IRoomStatus;
    frontdesk_status?: string;
    room_type_id: number;
    date?: Date;
    checkin?: Date;
    checkout?: Date;
    completed?: boolean;
    floor?: number;
    reservation?: {
      id: number;
      checkin_time: string | null;
      checkout_time: string | null;
      expected_checkin_time: string | null;
      expected_checkout_time: string | null;
    };
    image?: string | null;
    wing?: string;
  };
  credits?: number;
  service_credits?: {
    id: number;
    service_type: string;
  };
}

export interface ISaveBoard {
  shift_id: number;
  date: string;
  housekeeper_id: number;
  rooms: number[];
}
export interface IUpdateStatusRoom {
  housekeeping_status?: string;
  room_status?: string[];
  frontdesk_status?: string;
  id?: number[];
}

export interface IShift {
  id: number;
  name: string;
  start_time: Date;
  end_time: Date;
}

export interface IRoom {
  id: number;
  room_number: string;
  housekeeping_status: string;
  frontdesk_status: string;
  room_type_id: number;
  room_type: {
    id: number;
    type: string;
    name: string;
  };
  floor?: number;
}

export interface ITask {
  id: number;
  priority: string;
  inspection_status: string;
  status: string;
  notes: string;
  start_time: Date | null;
  end_time: Date | null;
  board_id: number;
  room_id: number;
  room: IRoom;
  inspector_id: number | null;
  reservation?: {
    id: number;
    checkin_time?: string;
    checkout_time?: string;
    expected_checkin_time?: string;
    expected_checkout_time?: string;
  };
  service_credits?: {
    id: number;
    service_type: string;
  };
  inspector: any | null; // This can be typed more strictly if inspector object structure is known
  credits: number;
}

export interface IUserDepartment {
  id: number;
  department_name: string;
}

export interface IRole {
  id: number;
  name: string;
  description: string;
}

export interface IHousekeeper {
  id: number;
  email: string;
  user_name: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_verified: boolean;
  default_property_id: number;
  user_department: IUserDepartment;
  roles: IRole[];
  last_login_at: Date;
}

export interface IHousekeeperBoard {
  active?: boolean;
  id: number;
  date: Date;
  property_id: number;
  status: string;
  notes: string;
  shift: IShift;
  housekeeper: IHousekeeper;
  tasks: ITask[];

  created_by_user?: {
    id: number;
    first_name: string;
    last_name: string;
  };
  archived_by_user?: {
    id: number;
    first_name: string;
    last_name: string;
  };
  archived_at?: Date | null;
}
export interface IBoardIndex {
  id: number;
  room: string;
  service: string;
  credits: number;
  checkin: date;
  notes: string;
  completeted: boolean;
}

export interface IHousekeeperView {
  totalCredits: number;
  housekeeperName: string;
}

export interface IBoardIndexCount {
  roomCount: number;
  totalCredits: number;
  staffCount: number;
  allCompleted: boolean;
  shiftId: number;
  shiftName: string;
  date: string;
  notes: string;
}
export interface IService {
  id: number; // Unique identifier for the service
  service_type: string; // Type of service, e.g., REFRESH
  description: string; // Detailed description of the service
  credits: number; // Credits associated with the service
  room_type_id: number; // Room type ID the service applies to
  room_type?: {
    id: number;
    type: string; // QQNS, QQADA, etc.
    name: string;
  };
}

export interface ICustomStatus {
  house_keeping: {
    name: string;
    full_name: string;
    description: string;
    color_code: string;
    category: string;
  }[];
  house_keeping_applicable: {
    name: string;
    full_name: string;
    description: string;
    color_code: string;
    category: string;
  }[];
  front_desk: {
    name: string;
    full_name: string;
    description: string;
    color_code: string;
  }[];
  board_activity: {
    name: string;
    description: string;
  }[];
  task_inspection_status: {
    name: string;
    description: string;
  }[];
  task_priority: {
    name: string;
    description: string;
  }[];
  task_status: {
    name: string;
    description: string;
  }[];
  house_keeping_service: {
    name: string;
    description: string;
  }[];
}

export interface IRoomBlockListRequest {
  property_id: number;
  start_date?: string;
  end_date?: string;
  room_ids?: string;
}

export interface ICreateRoomBlockRequest {
  property_id: number;
  start_date?: string;
  end_date?: string;
  room_id?: string;
  reason?: string;
  status?: string;
}

export interface IRoomBlockListResponse {
  date: string;
  room_id: number;
  id: number;
  reason: string;
  status: string;
}
