import { IPaymentMethodResponse } from "types/reservationTypes";
import { IPaymentResponse } from "types/payments";
import { PaymentParent } from "types/ui/payments";
import { PaymentParentEnum } from "constants/ui/payments";
import { PaymentMethodType } from "constants/payments";

type PaymentParentBase = {
  id: number;
  paymentType: PaymentMethodType;
};

export type PaymentParent =
  | (PaymentParentBase & {
      type: PaymentParentEnum.RESERVATION;
      rate_code_id?: number;
    })
  | (PaymentParentBase & { type: PaymentParentEnum.DBA })
  | (PaymentParentBase & {
      type: PaymentParentEnum.SALES_GROUP;
      rate_code_id?: number;
    });

export interface AddDirectBillPayProps {
  totalsData?: PaymentTotalsData;
  paymentDisabled?: boolean;
  onPaymentSuccessClick?: () => void;
  onMethodCreateSuccess?: (newMethod: IPaymentMethodResponse) => void;
  onSuccessLabel?: string;
  paymentLabel?: string;
  reservationId: number;
  destinationFolio?: number;
  buttonText?: string;
  parent?: PaymentParent;
}

export type PaymentMethodDisplayValues = {
  name: string;
  number: string;
};

interface PaymentRowData extends IPaymentResponse {
  payment_amount?: number;
}

interface DirectBillPayButtonProps {
  actions?: {
    cancel?: () => void;
  };
  buttonLabels?: {
    cancel?: string;
    action?: string;
  };
}

interface TotalsByFolio {
  totalBalance: number;
  folios: {
    [folioType: string]: {
      folioId: number;
      balance: number;
    };
  };
}

export enum NewPaymentOptions {
  CARD = "CARD",
  DIRECT_BILL = "DIRECT_BILL",
}

export interface NewPaymentOption {
  type: NewPaymentOptions;
  label: string;
  iconColor?: string;
  onClick: () => void;
  icon: OverridableComponent<SvgIconTypeMap<unknown, "svg">> & {
    muiName: string;
  };
}
