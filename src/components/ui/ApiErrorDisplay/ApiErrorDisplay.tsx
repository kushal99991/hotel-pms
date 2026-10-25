import { SerializedError } from "@reduxjs/toolkit";
import { ReactNode } from "react";
import { ErrorResponse } from "types/apiTypes";
import {
  getErrorMessages,
  hasMultipleErrors,
  isErrorResponse,
} from "utils/errors";

interface ApiErrorDisplayProps {
  error: ErrorResponse | SerializedError;
  getSingleErrorString?: (message: string) => string;
  getMultipleErrorStrings?: (messages: string[]) => string[];
  renderSingle?: (message: string) => ReactNode;
  renderMultiple?: (messages: string[]) => ReactNode;
  multipleErrorsHeader?: ReactNode;
}

export default function ApiErrorDisplay({
  error,
  getSingleErrorString,
  getMultipleErrorStrings,
  renderSingle,
  renderMultiple,
  multipleErrorsHeader,
}: ApiErrorDisplayProps) {
  if (!isErrorResponse(error)) {
    return (
      <span>
        {(error as SerializedError).message ?? "An unexpected error occurred"}
      </span>
    );
  }
  const messages = getErrorMessages(error);
  const isMultiple = hasMultipleErrors(error);

  if (isMultiple) {
    const messageArray = messages as string[];

    if (renderMultiple) return <>{renderMultiple(messageArray)}</>;

    const displayMessages = getMultipleErrorStrings
      ? getMultipleErrorStrings(messageArray)
      : messageArray;

    return (
      <ul>
        {multipleErrorsHeader}
        {displayMessages.map((msg, i) => (
          <li key={i}>{msg}</li>
        ))}
      </ul>
    );
  }

  const message = messages as string;

  if (renderSingle) return <>{renderSingle(message)}</>;

  const displayMessage = getSingleErrorString
    ? getSingleErrorString(message)
    : message;

  return <span>{displayMessage}</span>;
}
