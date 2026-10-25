import { appConfig } from "config/app.config";
import { parse as parseDate } from "date-fns";
import moment from "moment";

/**
 * Formats a Date object into a string based on the given format.
 * @param date - The date to format.
 * @param dateFormat - The desired format string (default is "yyyy-MM-dd").
 * @returns Formatted date string.
 */
export const formatToDisplayDate = (
  date: Date,
  dateFormat: string = appConfig.displayDateFormat
): string => {
  return moment(date).format(dateFormat);
};

/**
 * Parses a date string into a Date object based on the given format.
 * @param dateString - The date string to parse.
 * @param dateFormat - The format of the date string (default is "yyyy-MM-dd").
 * @returns Parsed Date object.
 */
export const parseFromDate = (
  dateString: string,
  dateFormat: string = "yyyy-MM-dd"
): Date => {
  return parseDate(dateString, dateFormat, new Date());
};

// only for changing api date format of "YYYY-MM-DD" to display date format of "MM/DD/YYYY"
export const modifyToDisplayDate = (apiDateString: string): string => {
  if (!apiDateString) {
    return apiDateString;
  }
  const dateParts = apiDateString.split("-");
  if (dateParts.length !== 3) {
    return apiDateString;
  }
  // Year is index 0, Month at index 1, day at index 2
  return `${dateParts[1]}/${dateParts[2]}/${dateParts[0]}`;
};
