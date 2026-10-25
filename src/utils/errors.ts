import {
  IValidationErrorResponse,
  SimpleErrorResponse,
  ErrorResponse,
} from "types/apiTypes";

function isValidationErrorArray(
  data: IValidationErrorResponse[] | SimpleErrorResponse | null
): data is IValidationErrorResponse[] {
  return Array.isArray(data) && data.length > 0;
}

export function hasMultipleErrors(error: ErrorResponse): boolean {
  if (error.message) return false;
  if (isValidationErrorArray(error.data)) return error.data.length > 1;
  return false;
}

export function getErrorMessages(error: ErrorResponse): string | string[] {
  if (error.message) return error.message;

  if (isValidationErrorArray(error.data)) {
    const msgs = error.data.map((e) => e.msg);
    return msgs.length === 1 ? msgs[0] : msgs;
  }

  return (
    (error.data as SimpleErrorResponse)?.message ??
    "An unexpected error occurred"
  );
}

export function isErrorResponse(error: unknown): error is ErrorResponse {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    "message" in error &&
    "data" in error
  );
}
