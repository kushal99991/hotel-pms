import { PaymentProccessorsEnum } from "constants/paymentProcessors";
import { ProcessorResponse } from "types/payments";

export function needsPaymentMethod(ppResponse?: ProcessorResponse): boolean {
  if (!ppResponse?.PAYMENT_PROCESSOR) {
    return false;
  }
  if (ppResponse?.PAYMENT_PROCESSOR === PaymentProccessorsEnum.STRIPE) {
    return ppResponse.status === "requires_payment_method";
  }
  return false;
}
