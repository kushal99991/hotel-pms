import { PaymentMethodTypesEnum } from "constants/paymentMethods";
import { IChargeResponse } from "types/charges";
import { IPaymentResponse } from "types/payments";

export interface ComputedFolioRowProps {
  payment_amount?: number;
  payment_date?: string;
  method_type: PaymentMethodTypesEnum;
}

export type FolioTableRow = (IPaymentResponse | IChargeResponse) &
  ComputedFolioRowProps;
