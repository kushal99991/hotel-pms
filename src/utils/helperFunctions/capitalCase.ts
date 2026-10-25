import { mapKeys, snakeCase, isPlainObject } from "lodash";

type TSnakeCase = Record<string, T> | Array<T> | T;

export function toCapitalCase(str: string, delimeter?: string): string {
  if (!str?.length) {
    return "";
  }
  const splitDelimeter = delimeter ?? "_";
  return str
    .split(splitDelimeter)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export const toSnakeCase = (obj: TSnakeCase): TSnakeCase => {
  if (Array.isArray(obj)) {
    return obj.map((v) => toSnakeCase(v)); // Recursively apply toSnakeCase to each element in the array
  } else if (isPlainObject(obj)) {
    return mapKeys(obj, (_value, key) => snakeCase(key)); // Convert keys to snake_case
  }

  if (isPlainObject(obj)) {
    const result: Record<string, T> = {};
    Object.keys(obj).forEach((key) => {
      result[snakeCase(key)] = toSnakeCase(obj[key]); // Recursively apply toSnakeCase to each value
    });
    return result;
  }

  return obj; // Return the value as is if it's not an array or object
};
