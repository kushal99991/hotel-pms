import { PaymentMethodTypesEnum } from "constants/paymentMethods";
import { IPaymentMethodResponse } from "types/reservationTypes";
import { MethodLisItemDetails } from "types/ui/paymentMethods";
import { paymentMethodDisplayVals } from "./payments";

export function getCardListDetailStrings(
  method?: IPaymentMethodResponse
): MethodLisItemDetails {
  if (!method) {
    return {
      main: "Unknown Method",
    };
  }
  const type = method.payment_type;
  if (type === PaymentMethodTypesEnum.CASH) {
    return {
      main: "Cash",
    };
  }
  if (type === PaymentMethodTypesEnum.CHECK) {
    return {
      main: "Check",
    };
  }
  if (type === PaymentMethodTypesEnum.ACH_WIRE_TRANSFER) {
    return {
      main: "ACH / Wire Transfer",
    };
  }
  if (type === PaymentMethodTypesEnum.CORPORATE_CHECK) {
    return {
      main: "Corporate Check",
    };
  }
  if (type === PaymentMethodTypesEnum.PERSONAL_CHECK) {
    return {
      main: "Personal Check",
    };
  }
  if (type === PaymentMethodTypesEnum.CASHIER_CHECK) {
    return {
      main: "Cashier Check",
    };
  }
  if (type === PaymentMethodTypesEnum.TRAVELERS_CHECK) {
    return {
      main: "Travelers Check",
    };
  }
  if (type === PaymentMethodTypesEnum.CREDIT_DEBIT_CARD) {
    const { name, number } = paymentMethodDisplayVals(method);
    return {
      main: `${name} ${number}`,
      secondary: `Expires ${method.exp_month}/${method.exp_year?.toString().substring(2)}`,
    };
  }
  if (type === PaymentMethodTypesEnum.LC_LEVEL) {
    const { name, number } = paymentMethodDisplayVals(method);
    return {
      main: `${name} ${number}`,
    };
  }
  return {
    main: "Unknown Method",
  };
}

export function isCheckType(type?: PaymentMethodTypesEnum) {
  return (
    type === PaymentMethodTypesEnum.CHECK ||
    type === PaymentMethodTypesEnum.CASHIER_CHECK ||
    type === PaymentMethodTypesEnum.CORPORATE_CHECK ||
    type === PaymentMethodTypesEnum.PERSONAL_CHECK ||
    type === PaymentMethodTypesEnum.TRAVELERS_CHECK
  );
}

export function hasUserAddedMethods(
  methods?: IPaymentMethodResponse[]
): boolean {
  if (!methods || !methods?.length) {
    return false;
  }
  const nonGlobalMethods = methods.filter((m) => !m.globally_avail);
  return !!nonGlobalMethods.length;
}
