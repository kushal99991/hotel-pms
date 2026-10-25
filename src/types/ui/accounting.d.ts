import { ReservationPaymentStatus } from "constants/payments";
import {
  IDirectBillingAccountResponse,
  IPaymentResponse,
} from "types/payments";
import { IPaymentMethodResponse } from "types/reservationTypes";

interface TransactionsByReservation {
  [reservationId: number]: {
    reservationId: number;
    guestName: string;
    arrivalDate: string;
    departureDate: string;
    balance: number;
    reservationTotal?: number;
    settledAmount?: number;
    settledByPaymentAmount?: number;
    aging: number;
    site?: number;
  };
}

interface AccountTransactionRow {
  folioId?: number;
  paymentId?: number;
  payment?: IPaymentResponse;
  chargeId?: number;
  detail: string;
  additionalDetail?: string;
  arrivalDate?: string;
  departureDate?: string;
  balance?: number;
  credit?: number;
  aging?: number;
  groupCode?: number;
  site?: number;
  invoice?: number;
  datePosted?: string;
  fullyApplied?: boolean;
  partiallyApplied?: boolean;
  paymentStatus?: ReservationPaymentStatus;
  key: string;
  reservationTotal?: number;
}

interface SettlementTransactionRow extends AccountTransactionRow {
  settledAmount: number;
  settledByPaymentAmount?: number;
}

interface SelectedPaymentProps {
  selectedPaymentId?: number;
}

interface SelectedChargeProps {
  selectedChargeId?: number;
}

interface SelectedReservationProps {
  selectedResId?: number;
}

type AdditionationalModalProps = SelectedPaymentProps &
  SelectedReservationProps &
  SelectedChargeProps;

export interface AccountModalViewProps {
  account?: IDirectBillingAccountResponse;
  accounts?: IDirectBillingAccountResponse[];
  paymentMethods?: IPaymentMethodResponse[];
  onRefresh?: () => void;
  onClose?: (refresh?: boolean) => void;
  setRefreshOnBackdrop?: React.Dispatch<React.SetStateAction<boolean>>;
  additionalProps?: AdditionationalModalProps;
}
