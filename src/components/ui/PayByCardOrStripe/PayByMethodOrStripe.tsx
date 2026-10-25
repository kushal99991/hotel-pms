import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";

import { PaymentTotalsData } from "../PaymentTotals/PaymentTotals";
import { CompletionInformation } from "../StripePayment/StripePayment";
import PayWithMethod, {
  IPayWithNewSettings,
} from "../PayWithMethod/PayWithMethod";
import { SimpleIntent } from "types/payments";
import {
  IPaymentMethodResponse,
  IReservationResponse,
} from "types/reservationTypes";
import { IFolioResponse } from "types/folios";
import { isValidMethod, methodsHaveValidMethod } from "utils/payments";
import { PayByPaymentSettings } from "types/payments";
import PayWithNewMethod from "../PayWithNewMethod/PayWithNewMethod";
import { PayWithNewMethodViews } from "constants/paymentMethods";
import { PaymentMethodTypesEnum } from "constants/paymentMethods";
import { hasUserAddedMethods } from "utils/paymentMethods";
import { NewPaymentOption, PaymentParent } from "types/ui/payments";
import { NewPaymentOptions } from "constants/payments";

interface PayByMethodOrStripeProps {
  reservation?: IReservationResponse;
  paySettings: PayByPaymentSettings;
  newIntentNeeded?: () => boolean;
  forceLoadingWait?: number;
  hideTotals?: boolean;
  onCompleteClick?: () => void;
  disablePayment?: boolean;
  hideDirectBill?: boolean;
  descriptionRequired?: boolean;
  manageDescription?: boolean;
  parent?: PaymentParent;
  // pass-through props to StripePayment
  totalsData: PaymentTotalsData;
  onPaymentSuccess?: () => void;
  onStripePaymentComplete?: () => any;
  cardOnly?: boolean;
  completeInformation?: CompletionInformation;
  existingIntent?: SimpleIntent;
  // pass-through to PayWithMethod
  paymentMethods: IPaymentMethodResponse[];
  folios?: IFolioResponse[];
  reservationLoading?: boolean;
  currentFolioId?: number;
  currentMethodId?: number;
  payWithNewSettings?: IPayWithNewSettings;
  onPayWithMethodClose?: () => void;
  hidePrimaryMessage?: boolean;
}

const PayByMethodOrStripe: React.FC<PayByMethodOrStripeProps> = ({
  cardOnly,
  descriptionRequired,
  manageDescription,
  totalsData,
  currentFolioId,
  currentMethodId,
  onPayWithMethodClose,
  onCompleteClick,
  onPaymentSuccess,
  onStripePaymentComplete,
  newIntentNeeded,
  forceLoadingWait,
  completeInformation,
  paymentMethods,
  payWithNewSettings,
  folios,
  reservation,
  paySettings,
  reservationLoading,
  hideTotals,
  existingIntent,
  disablePayment,
  hideDirectBill,
  hidePrimaryMessage,
  parent,
}) => {
  const [showPayWithNew, setShowPayWithNew] = useState(false);
  const [description, setDescription] = useState<string>(
    paySettings?.description ?? ""
  );
  const [payWithNewView, setPayWithNewView] = useState<
    PayWithNewMethodViews | undefined
  >(undefined);

  useEffect(() => {
    const validPaymentPresent = methodsHaveValidMethod(paymentMethods);
    if (!reservationLoading && !validPaymentPresent) {
      setShowPayWithNew(true);
    }
  }, [paymentMethods, setShowPayWithNew, reservationLoading]);

  function handleDescriptionChange(newDescription?: string) {
    if (newDescription != null) {
      setDescription(newDescription);
    }
  }

  const finalSettings = { ...paySettings };
  if (manageDescription) {
    finalSettings.description = description;
  }

  function handlePayWithCard() {
    setPayWithNewView(PayWithNewMethodViews.CARD);
    setShowPayWithNew(true);
  }

  function handlePayWithNew() {
    setShowPayWithNew(true);
  }

  function handleDirectBillCancel() {
    setShowPayWithNew(false);
  }

  function handleBackClick() {
    setShowPayWithNew(false);
  }

  function filterNewMethods(availableMethods: NewPaymentOption[]) {
    return availableMethods.filter((m) => m.type !== NewPaymentOptions.CARD);
  }
  const methods = paymentMethods
    .filter((pm) => {
      const isCashOrCheck =
        pm.payment_type === PaymentMethodTypesEnum.CASH ||
        pm.payment_type === PaymentMethodTypesEnum.CHECK;
      return pm.future_use || isCashOrCheck;
    })
    .filter(isValidMethod);
  const hasAddedMethod = hasUserAddedMethods(methods);
  const noPaymentShowing = !hasAddedMethod && !currentMethodId;
  return (
    <Box>
      {!showPayWithNew && (
        <PayWithMethod
          descriptionRequired={descriptionRequired}
          manageDescription={manageDescription}
          onDescriptionChange={handleDescriptionChange}
          reservationId={reservation?.id ?? -1}
          currentFolioId={currentFolioId}
          currentPaymentId={currentMethodId}
          totals={totalsData}
          folios={folios}
          paySettings={finalSettings}
          paymentMethods={methods}
          onPayWithNew={handlePayWithNew}
          onPayWithNewCard={handlePayWithCard}
          payWithNewSettings={payWithNewSettings}
          forceLoadingWait={forceLoadingWait}
          hideTotals={hideTotals}
          onClose={onPayWithMethodClose}
          onPaymentComplete={onCompleteClick}
          onPaymentSuccess={onPaymentSuccess}
          completeSettings={completeInformation}
          hidePrimaryMessage={hidePrimaryMessage}
          parent={parent}
        />
      )}
      {showPayWithNew && (
        <PayWithNewMethod
          allowDirectBill={!hideDirectBill}
          onBackClick={handleBackClick}
          currentFolioId={currentFolioId}
          availableMethodsFilter={
            noPaymentShowing ? filterNewMethods : undefined
          }
          cardOnly={cardOnly}
          totalsData={totalsData}
          paymentDisabled={disablePayment}
          existingIntent={existingIntent}
          newIntentNeeded={newIntentNeeded}
          onCompleteClick={onStripePaymentComplete ?? onCompleteClick}
          onPaymentSuccess={onPaymentSuccess}
          completeInformation={completeInformation}
          forceLoadingWait={forceLoadingWait}
          hideTotals={hideTotals}
          paySettings={finalSettings}
          reservation={reservation}
          onDirectBillCancel={handleDirectBillCancel}
          selectedView={payWithNewView}
          manageDescription={manageDescription}
          descriptionRequired={descriptionRequired}
          onDescriptionChange={handleDescriptionChange}
          parent={parent}
        />
      )}
    </Box>
  );
};

export default PayByMethodOrStripe;
