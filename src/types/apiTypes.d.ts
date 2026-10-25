export interface ErrorPayload {
  detail?: IValidationErrorResponse[];
  message?: string;
  error?: string;
}

export interface IValidationErrorResponse {
  loc: string[];
  msg: string;
  type: string;
}

export interface ResponsePayload<T = unknown> {
  data: T;
  status: number;
  message: string;
}

export interface SimpleErrorResponse {
  error?: string;
  message?: string;
}

export interface ErrorResponse {
  status: boolean;
  message: string;
  data: IValidationErrorResponse[] | SimpleErrorResponse | null;
  code?: number;
}

export interface ErrorResultResponse {
  status: boolean;
  message: string;
  result: IValidationErrorResponse[] | null;
  code?: number;
}

export interface ApiError<T> {
  response: T;
  status: boolean;
  message: string;
}
