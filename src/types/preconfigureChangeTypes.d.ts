import { IPostingCode } from "./financialSettingTypes";

export interface IPreconfigureCharges {
  id: number;
  name: string;
  amount: number;
  posting_code: IPostingCode | null;
  description: string;
  max_qty: number;
}

export interface IPreconfigureChargesRequest {
  limit: number;
  page: number;
  property_id?: number;
}

export interface IAddPreconfigureChargesRequest {
  id?: number;
  name: string;
  amount: number;
  posting_code_id: number;
  posting_code_department_id: number;
  description?: string;
  max_qty?: number;
  property_id?: number;
}
