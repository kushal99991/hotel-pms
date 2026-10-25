export enum GroupStatusEnum {
  TENTATIVE = "TENTATIVE",
  PROSPECTIVE = "PROSPECTIVE",
  HOLD = "HOLD",
  WAIT_LIST = "WAIT_LIST",
  BLOCKED = "BLOCKED",
  DEFINITE = "DEFINITE",
  CANCELED = "CANCELED",
}

export enum SalesGroupPaymentType {
  DBA = "DBA",
  IPO = "IPO",
}

export enum SalesDistributionsEnum {
  WEDDING_BLOCK = "Wedding Block",
  GOV = "GOV",
  BT = "Business",
  SMERF = "SMERF",
  BANQ_CATER = "BANQ_CATER",
}

export const salesDistributionOptions = Object.entries(SalesDistributionsEnum).map(
  ([key, name]) => {
    let label = name;
    if (key === "GOV") label = "Government";
    if (key === "BANQ_CATER") label = "Banquet / Catering";
    return { value: name, label };
  }
);

export type GroupStatusDisplayInfo = {
  label: string;
  color: string;
  contrastColor?: string;
};

/**
 * Used by form dropdowns (ex: `AddNewSalesGroup`) and can also carry UI metadata.
 * NOTE: `id` + `label` are required by the current Autocomplete implementation.
 */
export interface IGroupStatusListItem {
  id: GroupStatusEnum;
  label: string;
  description: string;
  bg_color: string;
  text_color: string;
}

export const groupStatusList: IGroupStatusListItem[] = [
  {
    id: GroupStatusEnum.TENTATIVE,
    label: "Tentative",
    description: "Reservation is tentative and not yet confirmed",
    bg_color: "#FFF3B0", // light yellow
    text_color: "#000000",
  },
  {
    id: GroupStatusEnum.PROSPECTIVE,
    label: "Prospective",
    description: "Potential reservation, inquiry stage",
    bg_color: "#E6E6FA", // lavender
    text_color: "#000000",
  },
  {
    id: GroupStatusEnum.HOLD,
    label: "Hold",
    description: "Reservation is temporarily held",
    bg_color: "#FFD966", // amber
    text_color: "#000000",
  },
  {
    id: GroupStatusEnum.WAIT_LIST,
    label: "Wait List",
    description: "Reservation is on the waiting list",
    bg_color: "#C9DAF8", // light blue
    text_color: "#000000",
  },
  {
    id: GroupStatusEnum.BLOCKED,
    label: "Blocked",
    description: "Rooms are blocked and unavailable for booking",
    bg_color: "#999999", // dark gray
    text_color: "#1A1A1A",
  },
  {
    id: GroupStatusEnum.DEFINITE,
    label: "Definite",
    description: "Reservation is confirmed and guaranteed",
    bg_color: "#34C759", // green
    text_color: "#003D14",
  },
  {
    id: GroupStatusEnum.CANCELED,
    label: "Canceled",
    description: "Group reservation has been canceled",
    bg_color: "#7F7F7F", // gray
    text_color: "#1A1A1A",
  },
];

export const groupStatusDisplayValues: Record<
  GroupStatusEnum,
  GroupStatusDisplayInfo
> = {
  [GroupStatusEnum.TENTATIVE]: {
    label: "Tentative",
    color: "#FFF3B0", // light yellow
    contrastColor: "#000000",
  },
  [GroupStatusEnum.PROSPECTIVE]: {
    label: "Prospective",
    color: "#E6E6FA", // lavender
    contrastColor: "#000000",
  },
  [GroupStatusEnum.HOLD]: {
    label: "Hold",
    color: "#FFD966", // amber
    contrastColor: "#000000",
  },
  [GroupStatusEnum.WAIT_LIST]: {
    label: "Wait List",
    color: "#C9DAF8", // light blue
    contrastColor: "#000000",
  },
  [GroupStatusEnum.BLOCKED]: {
    label: "Blocked",
    color: "#999999", // dark gray
    contrastColor: "#1A1A1A",
  },
  [GroupStatusEnum.DEFINITE]: {
    label: "Definite",
    color: "#34C759", // green
    contrastColor: "#003D14",
  },
  [GroupStatusEnum.CANCELED]: {
    label: "Canceled",
    color: "#7F7F7F", // gray
    contrastColor: "#1A1A1A",
  },
};

/**
 * Group Type dropdown options.
 * Backend currently treats `group_type` as a free-form string, so this list is
 * purely UI-driven and can be expanded later without API changes.
 */
export type GroupTypeOption = { id: string; label: string };

export const groupTypeList: GroupTypeOption[] = [
  { label: "Corporate Groups", id: "Corporate Groups" },
  { label: "Social Events", id: "Social Events" },
  { label: "Tour Groups", id: "Tour Groups" },
  { label: "Association Groups", id: "Association Groups" },
  { label: "SMERF Groups", id: "SMERF Groups" },
  { label: "Sports Teams", id: "Sports Teams" },
  {
    label: "Government and Military Groups",
    id: "Government and Military Groups",
  },
  {
    label: "University and School Groups",
    id: "University and School Groups",
  },
];
