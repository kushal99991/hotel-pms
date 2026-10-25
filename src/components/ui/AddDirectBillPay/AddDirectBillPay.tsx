import React, { useState } from "react";
import { useCreatePaymentMethodMutation } from "services/paymentsSlice";
import { AddDirectBillPayProps } from "types/ui/payments";
import { CreateMethodBody } from "types/payments";
import DirectBillForm from "../DirectBillForm/DirectBillForm";
import { paymentApiIdFromParent } from "utils/payments";

const AddDirectBillPay: React.FC<AddDirectBillPayProps> = ({
  paymentDisabled,
  onPaymentSuccessClick,
  onMethodCreateSuccess,
  onSuccessLabel,
  paymentLabel,
  destinationFolio,
  reservationId,
  parent,
}) => {
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState("");
  const [linkDirectBillAccount, { isLoading }] =
    useCreatePaymentMethodMutation();

  async function handleAttachClick(accountId: number) {
    setPaymentLoading(true);
    let payload = {
      reservation_id: reservationId > 0 ? reservationId : undefined,
      direct_billing_account_id: accountId,
    } as CreateMethodBody;
    if (destinationFolio) {
      payload.folio_id = destinationFolio;
    }
    if (parent) {
      const idBody = paymentApiIdFromParent(parent);
      payload = {
        ...payload,
        ...idBody,
        payment_type: parent.paymentType,
      };
    }
    const response = await linkDirectBillAccount(payload);
    if (response.error) {
      setPaymentError(response.error as string);
    } else {
      setPaymentSuccess("Direct Billing Account successfully attached");
      onMethodCreateSuccess?.(response.data);
    }
    setPaymentLoading(false);
  }
  return (
    <DirectBillForm
      buttonDisabled={paymentDisabled}
      successMessage={paymentSuccess}
      errorMessage={paymentError}
      buttonLabel={paymentLabel}
      successButtonLabel={onSuccessLabel}
      loading={isLoading || paymentLoading}
      onSubmit={handleAttachClick}
      onContinue={onPaymentSuccessClick}
    />
  );
};

export default AddDirectBillPay;
