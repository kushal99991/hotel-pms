import moment from "moment-timezone";
import { ErrorResponse } from "types/apiTypes";
import _ from "lodash";
import { IRateCodeListResponse } from "types/roomRateTypes";

export const transformErrorResponse = (error: ErrorResponse) => {
  if (error?.message) {
    return error.message;
  }

  if (Array.isArray(error?.data)) {
    return error.data.map((err) => err.msg).join(", *");
  } else if (error?.data?.message) {
    return error.data.message;
  }

  return (
    error?.message || "An unexpected error occurred. Please try again later."
  );
};

export function pluralValue(
  value: number | string,
  singularString: string,
  pluralString: string
) {
  const numericValue = +value;
  if (!Number.isNaN(numericValue)) {
    if (numericValue === 1) {
      return `${value} ${singularString}`;
    }
  }
  return `${value} ${pluralString}`;
}

export const addTimeToApiDate = (apiDate: string) => {
  return `${apiDate} 00:00:00`;
};

export const getMoment = (
  date?: string | Date | null,
  timezone = "America/Los_Angeles",
  preserveTimeInNewTimezone?: boolean
) => {
  return date
    ? moment(date).tz(timezone, preserveTimeInNewTimezone)
    : moment().tz(timezone, preserveTimeInNewTimezone);
};

/**
 * Converts a UTC time to a given timezone.
 *
 * @param utcDate - The UTC date string or Date object.
 * @param timezone - The target timezone (e.g., "America/Los_Angeles").
 * @returns A moment object converted to the given timezone.
 */
export const convertUtcToTimezone = (
  utcDate?: string | Date | null,
  timezone = "America/Los_Angeles"
) => {
  return utcDate ? moment.utc(utcDate).tz(timezone) : moment.utc().tz(timezone);
};

/**
 * Sorts rate codes alphabetically and groups children under their parents.
 * Handles multi-level hierarchies (children, grandchildren, etc.)
 *
 * @param rates - List of rate codes
 * @returns Flattened list: [Parent A, Child A1, Grandchild A1a, Child A2, Parent B, Child B1, ...]
 */
export function sortRateCodesByInheritance(
  rates: IRateCodeListResponse[]
): IRateCodeListResponse[] {
  if (!rates || rates.length === 0) return [];

  // Create a map for quick lookup
  const rateMap = new Map<number, IRateCodeListResponse>();
  rates.forEach((rate) => {
    rateMap.set(rate.id, rate);
  });

  // Group children by parent ID
  const childrenGrouped = _.groupBy(
    rates.filter((r) => r.parent_rate_code_id),
    "parent_rate_code_id"
  );

  // Recursive function to add a rate and all its descendants
  const addRateAndDescendants = (
    rate: IRateCodeListResponse,
    result: IRateCodeListResponse[]
  ): void => {
    result.push(rate);

    // Get all direct children of this rate
    const children = childrenGrouped[rate.id] || [];

    // Sort children alphabetically
    const sortedChildren = [...children].sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    // Recursively add each child and its descendants
    sortedChildren.forEach((child) => {
      addRateAndDescendants(child, result);
    });
  };

  // Get all root parents (no parent_rate_code_id)
  const rootParents = rates
    .filter((r) => !r.parent_rate_code_id)
    .sort((a, b) => a.name.localeCompare(b.name));

  const result: IRateCodeListResponse[] = [];

  // Process each root parent and all its descendants
  rootParents.forEach((parent) => {
    addRateAndDescendants(parent, result);
  });

  return result;
}
