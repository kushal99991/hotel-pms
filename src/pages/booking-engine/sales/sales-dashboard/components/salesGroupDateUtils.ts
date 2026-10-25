import { ISalesGroupListItem } from "types/salesTypes";
import { getMoment } from "utils/helperFunctions/common";

export const isGroupActiveOnDate = (
  group: ISalesGroupListItem,
  date: string,
  timezone: string
): boolean => {
  const day = getMoment(date, timezone, true).startOf("day");

  const startDate = group.shoulder_arrival_date ?? group.group_arrival_date;
  const endDate = group.shoulder_departure_date ?? group.group_departure_date;
  if (!startDate || !endDate) return false;

  const start = getMoment(startDate, timezone, true).startOf("day");
  const end = getMoment(endDate, timezone, true).startOf("day");
  return day.isBetween(start, end, "day", "[]");
};

export const isGroupOnShoulderDate = (
  group: ISalesGroupListItem,
  date: string,
  timezone: string
): boolean => {
  if (!group.shoulder_arrival_date && !group.shoulder_departure_date) {
    return false;
  }
  const day = getMoment(date, timezone, true).startOf("day");
  if (group.shoulder_arrival_date) {
    const start = getMoment(
      group.shoulder_arrival_date,
      timezone,
      true
    ).startOf("day");
    const shoulderEnd = getMoment(
      group.group_arrival_date,
      timezone,
      true
    ).startOf("day");
    if (day.isBetween(start, shoulderEnd, "day", "[)")) return true;
  }
  if (group.shoulder_departure_date) {
    const shoulderDepartureStart = getMoment(
      group.group_departure_date,
      timezone,
      true
    ).startOf("day");
    const shoulderDeparture = getMoment(
      group.shoulder_departure_date,
      timezone,
      true
    ).startOf("day");
    if (day.isBetween(shoulderDepartureStart, shoulderDeparture, "day", "(]"))
      return true;
  }
  return false;
};
