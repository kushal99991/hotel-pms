import { IReservation } from "./reservationTypes";

export interface IServiceRequest {
  id: number;
  request: string;
  description: string;
  posting_code_id: number;
  rate: number;
  created_at: string;
  updated_at: string;
}

export interface IAddServiceRequest {
  id?: number;
  request: string;
  description: string;
  posting_code_id: number;
  rate: number;
  posting_code_department_id?: number;
}

export interface IServiceRequestResponse {
  id: number;
  service_request_id: number;
  reservation_id: number;
  service_request: IServiceRequest;
  reservation: IReservation;
  status: "PENDING" | "COMPLETED" | "UNABLE_TO_COMPLETE" | "CANCEL";
  comments?: string;
}

// export enum IServiceRequestStatus {
//   PENDING = "PENDING",
//   COMPLETED = "COMPLETED",
//   CLOSED = "CLOSED",
// }

export enum ServiceRequestStatusEnum {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  CLOSED = "CLOSED",
}

export interface IUpdateReservationServiceRequest {
  id?: number;
  service_request_id: number;
  reservation_id: number;
  status?: string;
  comment?: string;
}
