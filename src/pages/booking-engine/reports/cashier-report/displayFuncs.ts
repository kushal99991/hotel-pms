import { displayCardBrand, displayPaymentType } from "utils/payments";
import { IPaymentResponse } from "types/payments";
import { PaymentMethodTypesEnum } from "constants/paymentMethods";
import { CashierGroupedData } from "types/ui/reports";

export function genComplexType(payment: IPaymentResponse) {
  if (
    payment.payment_method?.payment_type === PaymentMethodTypesEnum.LC_LEVEL
  ) {
    return `${payment.direct_billing_account_name ?? "DB Account"} - ${payment.direct_billing_account_id ?? ""}`;
  } else if (
    payment.payment_method?.payment_type ===
    PaymentMethodTypesEnum.CREDIT_DEBIT_CARD
  ) {
    return `${
      payment.payment_method?.brand
        ? displayCardBrand(payment.payment_method?.brand)
        : ""
    }${payment.last_four ? ` ${payment.last_four}` : ""}`;
  }
  return "";
}

export function displayGroupName(groupData: CashierGroupedData) {
  const firstPayment = groupData.payments[0];
  if (
    firstPayment &&
    firstPayment.payment_method?.payment_type ===
      PaymentMethodTypesEnum.CREDIT_DEBIT_CARD
  ) {
    return displayCardBrand(groupData.tenderType);
  }
  return displayPaymentType(groupData.tenderType);
}
