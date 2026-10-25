import { ChargeStatusEnum } from "constants/charges";
import { PostingCodeTypes } from "constants/payments";

export interface IAdjustmentPostingCodeResponse {
  adjustment: boolean;
  adjustment_posting_code?: number;
  code: number;
  description?: string;
  id: number;
  is_active: boolean;
  name: string;
  posting_code_department_id: number;
  type: PostingCodeTypes;
}

export interface IPostingCodeResponse {
  name: string;
  code: number;
  adjustment?: boolean;
  posting_code_department_id: number;
  adjustment_posting_code?: IAdjustmentPostingCodeResponse;
  description?: string;
  id: number;
  type: string;
  department: {
    name: string;
    code: number;
    id: number;
  };
}

export interface IChargeResponse {
  posting_code_id: number;
  amount: string;
  description: string;
  date: string;
  status?: ChargeStatusEnum;
  parent_charge_id?: number;
  folio_id: number;
  folio_type?: string;
  reservation_id: number;
  direct_billing_account_id?: number;
  id: number;
  posting_code: IPostingCodeResponse;
  sub_charges?: IChargeResponse[];
  incidentals_per_night?: string;
  incidentals_total?: string;
  created_at: string;
  updated_at: string;
}

export interface IMoveChargeItem {
  reservation_id: number;
  charge_id: number;
  folio_type_dest: string;
  cascade_move: boolean;
}

export interface IMoveChargeBody {
  items: IMoveChargeItem[];
}
