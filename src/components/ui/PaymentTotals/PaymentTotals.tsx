import React from "react";
import { Box } from "@mui/material";

import DetailRow from "../Layout/DetailRow";

export interface PaymentTotalsData {
  paidSubtotal?: number;
  subtotal?: number;
  discount?: number;
  fees?: number;
  paidFees?: number;
  taxes?: number;
  paidTaxes?: number;
  paidTotal?: number;
  total?: number;
  unpaidBalance?: number;
  balance: number;
}

export interface PaymentTotalsProps {
  data: PaymentTotalsData;
}

const PaymentTotals: React.FC<PaymentTotalsProps> = ({ data }) => {
  let subtotal = data.subtotal ?? 0;
  const discount = data.discount ?? 0;
  const fees = data.fees ?? 0;
  const taxes = data.taxes ?? 0;
  const total = data.total ?? 0;
  if (total > 0 && subtotal === 0) {
    const rawOtherCosts = fees * 100 + taxes * 100 - discount * 100;
    subtotal = (total * 100 - rawOtherCosts) / 100;
  }
  return (
    <Box>
      <DetailRow
        label="Subtotal"
        value={`${subtotal.toLocaleString("en-US", { style: "currency", currency: "USD" })}`}
      />
      <DetailRow
        label="Discount"
        value={`${discount.toLocaleString("en-US", { style: "currency", currency: "USD" })}`}
      />
      <DetailRow
        label="Fees"
        value={`${fees.toLocaleString("en-US", { style: "currency", currency: "USD" })}`}
      />
      <DetailRow
        label="Taxes"
        value={`${taxes.toLocaleString("en-US", { style: "currency", currency: "USD" })}`}
      />
      <DetailRow
        label="Total"
        value={`${total.toLocaleString("en-US", { style: "currency", currency: "USD" })}`}
      />
    </Box>
  );
};

export default PaymentTotals;
