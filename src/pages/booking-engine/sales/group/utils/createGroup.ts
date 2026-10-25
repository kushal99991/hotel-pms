import { appConfig } from "config/app.config";
import { GroupAvailabilityData } from "hooks/useGetGroupAvailabiilty";
import { GroupFormBlock } from "forms/schemas/salesGroup.validations";
import { getMoment } from "utils/helperFunctions/common";

export interface GroupCreationDates {
  arrival: Date;
  departure: Date;
  shoulderArrival?: Date;
  shoulderDeparture?: Date;
}

export function isShoulderDate(
  date: Date,
  groupDates: GroupCreationDates,
  timezone?: string
) {
  if (!groupDates.arrival || !groupDates.departure) {
    return false;
  }
  const dateMoment = getMoment(date, timezone);
  const arrivalMoment = getMoment(groupDates.arrival, timezone);
  const departureMoment = getMoment(groupDates.departure, timezone);
  if (groupDates.shoulderArrival) {
    const shoulderMoment = getMoment(groupDates.shoulderArrival, timezone);
    if (
      dateMoment.isSameOrAfter(shoulderMoment, "day") &&
      dateMoment.isBefore(arrivalMoment, "day")
    ) {
      return true;
    }
  }

  if (groupDates.shoulderDeparture) {
    if (dateMoment.isSameOrAfter(departureMoment, "day")) {
      return true;
    }
  }
  return false;
}

export function availabilityForDate(
  date: Date,
  groupDates: GroupCreationDates,
  availability?: GroupAvailabilityData,
  timezone?: string
) {
  if (!availability) {
    return null;
  }
  if (!groupDates.arrival || !groupDates.departure) {
    return null;
  }
  const dateMoment = getMoment(date, timezone);
  const arrivalMoment = getMoment(groupDates.arrival, timezone);
  const departureMoment = getMoment(groupDates.departure, timezone);
  if (groupDates.shoulderArrival) {
    const shoulderMoment = getMoment(groupDates.shoulderArrival);
    if (
      dateMoment.isSameOrAfter(shoulderMoment, "day") &&
      dateMoment.isBefore(arrivalMoment, "day")
    ) {
      return availability.shoulderStartAvailability?.availability;
    }
  }

  if (groupDates.shoulderDeparture) {
    if (dateMoment.isSameOrAfter(departureMoment, "day")) {
      return availability.shoulderEndAvailability?.availability;
    }
  }

  return availability.mainAvailability?.availability;
}

// build a key to compare to current blocks key for controlled
// refreshing of the blocks in the UI after a fetch
export function buildAvailabilityKey(
  availabilityData?: GroupAvailabilityData
): string {
  if (!availabilityData) {
    return "";
  }
  const allAvailability = [
    ...(availabilityData.mainAvailability?.availability ?? []),
    ...(availabilityData.shoulderStartAvailability?.availability ?? []),
    ...(availabilityData.shoulderEndAvailability?.availability ?? []),
  ];

  if (!allAvailability.length) return "";

  const allDates = allAvailability
    .flatMap((a) => Object.keys(a.pricing))
    .sort();
  const roomTypeIds = [
    ...new Set(allAvailability.map((a) => a.roomTypeId)),
  ].sort();

  if (!allDates.length) return "";

  const start = allDates[0];
  const end = allDates[allDates.length - 1];

  return `${start}_${end}_${roomTypeIds.join("-")}`;
}

// build a key to compare to availability key for controlled
// refreshing of the blocks in the UI after a fetch
export function buildBlocksKey(
  blocks: GroupFormBlock[],
  timezone: string
): string {
  if (!blocks.length) return "";

  const dates = blocks
    .map((b) =>
      getMoment(b.start_date, timezone)
        .startOf("day")
        .format(appConfig.dateApiFormat)
    )
    .sort();
  const roomTypeIds = [...new Set(blocks.map((b) => b.room_type_id))].sort();

  const start = dates[0];
  const end = dates[dates.length - 1];

  return `${start}_${end}_${roomTypeIds.join("-")}`;
}
