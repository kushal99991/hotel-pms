import React from "react";
import { Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import { PaymentTotalsData } from "../PaymentTotals/PaymentTotals";
import { CompletionInformation } from "../StripePayment/StripePayment";
import { SimpleIntent } from "types/payments";
import {
  IPaymentMethodResponse,
  IReservationResponse,
} from "types/reservationTypes";
import { PayByPaymentSettings } from "types/payments";
import { IFolioResponse } from "types/folios";
import PayByMethodOrStripe from "../PayByCardOrStripe/PayByMethodOrStripe";
import { PaymentCaptureTypeEnum } from "constants/payments";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  reservationId: number;
  reservation?: IReservationResponse;
  manageDescription?: boolean;
  // pass-through props to StripePayment
  stripeIntent: SimpleIntent;
  totalsData: PaymentTotalsData;
  paymentDisabled?: boolean;
  onCompleteClick?: () => void;
  completeInformation?: CompletionInformation;
  // pass-through to PayWithMethod
  paymentMethods: IPaymentMethodResponse[];
  folios?: IFolioResponse[];
  reservationLoading?: boolean;
  currentFolioId?: number;
  paySettings?: PayByPaymentSettings;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  open,
  stripeIntent,
  totalsData,
  currentFolioId,
  onCompleteClick,
  onClose,
  title,
  completeInformation,
  paymentMethods,
  folios,
  reservationLoading,
  reservation,
  paySettings,
}) => {
  function handleClose() {
    onClose?.();
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{ sx: { minWidth: "50%" } }}
    >
      <DialogTitle>{title}</DialogTitle>
      <IconButton
        aria-label="close"
        onClick={handleClose}
        sx={(theme) => ({
          position: "absolute",
          right: 8,
          top: 8,
          color: theme.palette.grey[500],
        })}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent>
        <PayByMethodOrStripe
          manageDescription
          reservation={reservation}
          reservationLoading={reservationLoading}
          paymentMethods={paymentMethods}
          totalsData={totalsData}
          folios={folios}
          onPayWithMethodClose={handleClose}
          currentFolioId={currentFolioId}
          paySettings={
            paySettings ?? {
              capture_type: PaymentCaptureTypeEnum.IMMEDIATE, // revisit if we need deferred here
            }
          }
          existingIntent={
            stripeIntent?.client_secret ? stripeIntent : undefined
          }
          onCompleteClick={onCompleteClick}
          completeInformation={completeInformation}
        />
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
