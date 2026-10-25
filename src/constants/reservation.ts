export enum ReservationStatusEnum {
  IN_PROGRESS = "IN_PROGRESS",
  RESERVED = "RESERVED",
  COMPLETED = "COMPLETED",
  CANCELED = "CANCELED",
  DEPARTING = "DEPARTING",
  ARRIVING = "ARRIVING",
  IN_HOUSE = "IN_HOUSE",
  NO_SHOW = "NO_SHOW",
  PENDING = "PENDING",
  DEPARTED = "DEPARTED",
}

export enum ExpectedStatusEnum {
  ARRIVING = "ARRIVING",
  DEPARTED = "DEPARTING",
  IN_HOUSE = "IN_HOUSE",
}

export type StatusDisplayInfo = {
  label: string;
  color: string;
  contrastColor?: string;
};

export const reservationExpectedStatusDisplayValues: Record<
  ExpectedStatusEnum,
  StatusDisplayInfo
> = {
  [ExpectedStatusEnum.ARRIVING]: {
    label: "Arriving",
    color: "#B4E520", // Green background
    contrastColor: "#000000", // Black text
  },
  [ExpectedStatusEnum.IN_HOUSE]: {
    label: "In-House",
    color: "#99DBE7",
    contrastColor: "#000000",
  },
  [ExpectedStatusEnum.DEPARTED]: {
    label: "Departed",
    color: "#FFAFC8",
    contrastColor: "#000000",
  },
};

export const reservationStatusDisplayValues: Record<
  ReservationStatusEnum,
  StatusDisplayInfo
> = {
  [ReservationStatusEnum.RESERVED]: {
    label: "Reserved",
    color: "#000000",
    contrastColor: "#FFFFFF",
  },
  [ReservationStatusEnum.ARRIVING]: {
    label: "Arriving",
    color: "#B4E520", // Green background
    contrastColor: "#000000", // Black text
  },
  [ReservationStatusEnum.IN_HOUSE]: {
    label: "In-House",
    color: "#99DBE7",
    contrastColor: "#000000",
  },
  [ReservationStatusEnum.DEPARTED]: {
    label: "Departed",
    color: "#FFAFC8",
    contrastColor: "#000000",
  },
  [ReservationStatusEnum.NO_SHOW]: {
    label: "No Show",
    color: "#FF8000",
    contrastColor: "#000000",
  },
  [ReservationStatusEnum.CANCELED]: {
    label: "Cancelled",
    color: "#7F7F7F",
    contrastColor: "#FFFFFF",
  },
  [ReservationStatusEnum.PENDING]: {
    label: "Pending",
    color: "#010040",
    contrastColor: "#fff",
  },
  [ReservationStatusEnum.DEPARTING]: {
    label: "Departing",
    color: "#FFAFC8",
    contrastColor: "#000", // Black text
  },
  [ReservationStatusEnum.IN_PROGRESS]: {
    label: "In Progress",
    color: "#fff",
  },
  [ReservationStatusEnum.COMPLETED]: {
    label: "Completed",
    color: "#7F7F7F",
    contrastColor: "#FFFFFF",
  },
};
