import { IChargeResponse } from "./charges";
import { IPaymentResponse } from "./payments";
import { IPaymentMethodResponse } from "./reservationTypes";

export interface IFolio {
  id: number;
  charge_type: string;
  amount: number;
  description: string;
  status: string;
  parent_charge_id?: number;
}

export interface IFolioResponse {
  A?: IFolio;
  id: number;
  type: string;
  charges: IChargeResponse[];
  payments: IPaymentResponse[];
  amount_needed_to_settle?: string;
  balance?: string;
  primary_payment_method: IPaymentMethodResponse | null;
}
