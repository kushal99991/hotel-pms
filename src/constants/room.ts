export enum IRoomStatus {
  VC = "VC",
  VAC = "VAC",
  VCI = "VCI",
  VD = "VD",
  OOO = "OOO",
  OOS = "OOS",
  OCC = "OCC",
  PUP = "PUP",
  NS = "NS",
  OC = "OC",
  OD = "OD",
  IP = "IP",
  DND = "DND",
  OFF = "OFF",
}

// housekeepingStatusEnum.ts
export enum HousekeepingStatusEnum {
  VC = "Vacant Clean",
  VCI = "Vacant Clean Inspected",
  VD = "Vacant Dirty",
  OOO = "Out of Order",
  OOS = "Out of Service",
  PUP = "Pick Up",
  NS = "No Show",
  DO = "Due Out (Expected Departure)",
  LCO = "Late Check Out",
  ED = "Early Departure",
  OC = "Occupied Clean",
  OD = "Occupied Dirty",
  IP = "In Progress",
  DND = "Do Not Disturb",
}

// frontdeskStatusEnum.ts
export enum FrontdeskStatusEnum {
  VAC = "Vacant",
  OCC = "Occupied",
  OOO = "Out Of Order",
  OOS = "Out Of Service",
}

export enum ICustomRoomStatus {
  RDY = "RDY",
  RFS = "RFS",
  USF = "USF",
  DND = "DND",
  PET = "PET",
  DO = "DO",
  LCO = "LCO",
  ED = "ED",
}

export enum RoomRentalTypes {
  RENTAL_SPACE = "RENTAL_SPACE",
  EVENT_SPACE = "EVENT_SPACE",
  GUEST_ROOM = "GUEST_ROOM",
}
