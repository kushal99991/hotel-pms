import React from "react";
import { IReservationResponse } from "types/reservationTypes";

interface PaymentStepProps {
  reservation?: IReservationResponse | null;
}

const PaymentStep: React.FC<PaymentStepProps> = ({ reservation }) => {
  return (
    <div>
      <div>Collect Payment</div>
      <div>{reservation?.folios?.[0]?.payments?.[0]?.amount}</div>
    </div>
  );
};

export default PaymentStep;
