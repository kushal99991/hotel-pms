import { PaymentTotalsData } from "components/ui/PaymentTotals/PaymentTotals";
import { ReservationStatusEnum } from "constants/reservation";
import {
  IReservationResponse,
  IPaymentMethodResponse,
} from "types/reservationTypes";
import {
  paymentCompleted,
  PaymentDescriptions,
  paymentNotProcessed,
  PostingCodeTypes,
  ReservationPaymentStatus,
} from "constants/payments";
import { IFolioResponse } from "types/folios";
import {
  ICalculatedCharge,
  IPaymentResponse,
  SimpleIntent,
} from "types/payments";
import { IChargeResponse } from "types/charges";
import { isAdjustment } from "./charges";
import { COMP_RATE_NAME } from "constants/rateCodes";
import { paymentRequiresMethod } from "./payments";
import { TotalsByFolio } from "types/ui/payments";
import { PaymentMethodTypesEnum } from "constants/paymentMethods";
import { apiAmountToNumber } from "./dataFormats";
import { convertUtcToTimezone } from "./helperFunctions/common";
import { appConfig } from "config/app.config";

export function reservationOver(reservation?: IReservationResponse) {
  if (!reservation) {
    return false;
  }
  return (
    reservation.status === ReservationStatusEnum.CANCELED ||
    reservation.status === ReservationStatusEnum.COMPLETED
  );
}

export function isCompReservation(reservation?: IReservationResponse) {
  const rateName = reservation?.rate_code.name;
  return rateName === COMP_RATE_NAME;
}

export function isReservationPreCheckin(
  reservation?: IReservationResponse | null
) {
  if (!reservation) {
    return false;
  }
  return (
    reservation.status === ReservationStatusEnum.ARRIVING ||
    reservation.status === ReservationStatusEnum.IN_PROGRESS ||
    reservation.status === ReservationStatusEnum.RESERVED ||
    reservation.status === ReservationStatusEnum.NO_SHOW
  );
}

export function isReservationPostCheckin(
  reservation?: IReservationResponse | null
) {
  if (!reservation) {
    return false;
  }
  return !isReservationPreCheckin(reservation);
}

export function getUnpaidTotalClientSecret(
  stayAmount: number,
  reservation?: IReservationResponse
): SimpleIntent | undefined {
  if (!reservation) {
    return undefined;
  }
  if (isReservationPreCheckin(reservation)) {
    const stayPayment = reservation.payments.find(
      (p) =>
        p.status === ReservationPaymentStatus.DUE &&
        apiAmountToNumber(p.amount) === stayAmount
    );
    if (paymentRequiresMethod(stayPayment)) {
      return {
        client_secret: stayPayment?.pp_response.client_secret ?? "",
        amount: stayAmount * 100,
      };
    }
    return undefined;
  }
  return undefined;
}

export function getCurrentRoom(reservation?: IReservationResponse | null) {
  if (!reservation) {
    return null;
  }
  return reservation?.current_room_info ?? reservation.planned_room;
}

export function incidentalPaymentPresent(
  reservation?: IReservationResponse | null
) {
  if (!reservation) {
    return false;
  }
  const payments = reservation.payments;
  if (payments.length < 1) {
    return false;
  }
  const incidentalPayment = payments.find((p) =>
    p.description.includes(PaymentDescriptions.INCIDENTALS)
  );
  const amountPresent = !!incidentalPayment?.amount;
  return amountPresent;
}

export function incidentalPaymentPresentNotReady(
  reservation?: IReservationResponse | null
) {
  if (!reservation) {
    return false;
  }
  const payments = reservation.payments;
  if (payments.length < 1) {
    return false;
  }
  const incidentalPayment = payments.find((p) =>
    p.description.includes(PaymentDescriptions.INCIDENTALS)
  );
  if (!incidentalPayment) {
    return false;
  }
  const amountPresent = apiAmountToNumber(incidentalPayment.amount) > 0;
  const paymentStatusPreprocessing = paymentNotProcessed(incidentalPayment);
  return amountPresent && paymentStatusPreprocessing;
}

export function incidentalPaymentReady(
  reservation?: IReservationResponse | null
) {
  if (!reservation) {
    return false;
  }
  const payments = reservation.payments;
  if (payments.length < 1) {
    return false;
  }
  const incidentalPayment = payments.find((p) =>
    p.description.includes(PaymentDescriptions.INCIDENTALS)
  );
  const amountPresent = !!incidentalPayment?.amount;
  const paymentNotPreprocessing = paymentCompleted(incidentalPayment);
  return amountPresent && paymentNotPreprocessing;
}

export function isReservationCheckedOut(
  reservation?: IReservationResponse | null
) {
  if (!reservation) {
    return false;
  }
  const statusCompleted =
    reservation.status === ReservationStatusEnum.COMPLETED;
  const checkOutDateSet = !!reservation.checkout_time?.length;
  return statusCompleted || checkOutDateSet;
}

export function getMethodDetailString(method?: IPaymentMethodResponse) {
  if (!method) {
    return "Unknown Method";
  }
  const type = method?.payment_type;
  if (type === PaymentMethodTypesEnum.CASH) {
    return "Cash";
  }
  if (type === PaymentMethodTypesEnum.CHECK) {
    return "Check";
  }
  if (
    type === PaymentMethodTypesEnum.LC_LEVEL ||
    type === PaymentMethodTypesEnum.CREDIT_DEBIT_CARD
  ) {
    return getCardDetailString(method);
  }
  return "Unknown Method";
}

export function getCardDetailString(method?: IPaymentMethodResponse) {
  if (!method) {
    return "Unknown Method";
  }
  if (method.direct_billing_account_id) {
    return `DB - ${method.direct_billing_account_name ?? "Direct Billing Account"} ${method.direct_billing_account_id}`;
  }
  return `${method?.brand?.toUpperCase()} ${method?.last4}`;
}

function calcPaymentsTotalReducer(
  totals: PaymentTotalsData,
  payment: IPaymentResponse
) {
  totals.subtotal = (totals.subtotal ?? 0) + apiAmountToNumber(payment.amount);
  return totals;
}

export function totalsFromPerNight(charges?: ICalculatedCharge) {
  const baseTotals = {
    subtotal: 0,
    taxes: 0,
    fees: 0,
    total: 0,
    balance: 0,
  } as PaymentTotalsData;
  if (!charges || Object.keys(charges?.per_night ?? {}).length < 1) {
    return baseTotals;
  }
  const finalTotals = { ...baseTotals, total: +charges.total };
  Object.keys(charges?.per_night).forEach((chargeDay: string) => {
    const chargeData = charges.per_night[chargeDay];
    if (chargeData.taxes.length) {
      const taxesTotal = chargeData.taxes.reduce(
        (total: number, tax) => total + +tax.amount,
        0
      );
      finalTotals.taxes = (finalTotals?.taxes ?? 0) + taxesTotal;
    }
    if (chargeData.fees.length) {
      const feesTotal = chargeData.fees.reduce(
        (total: number, fee) => total + +fee.amount,
        0
      );
      finalTotals.fees = (finalTotals?.fees ?? 0) + feesTotal;
    }
  });
  finalTotals.subtotal =
    finalTotals.total - (finalTotals.taxes ?? 0) - (finalTotals.fees ?? 0);
  finalTotals.balance = finalTotals.total;
  return finalTotals;
}

export function basicTotalsFromData(
  folios: IFolioResponse[] | undefined,
  payments: IPaymentResponse[] | undefined
) {
  const baseTotals = {
    subtotal: 0,
    paidSubtotal: 0,
    paidTotal: 0,
    total: 0,
    balance: 0,
  } as PaymentTotalsData;
  if (!payments?.length && !folios?.length) {
    return baseTotals;
  }
  let oustandingPayments: IPaymentResponse[] = [];
  let paidPayments: IPaymentResponse[] = [];
  if (payments?.length) {
    const paymentsDue: IPaymentResponse[] = [];
    const paymentsPaid: IPaymentResponse[] = [];
    payments.forEach((p) => {
      if (p.status === ReservationPaymentStatus.DUE) {
        paymentsDue.push(p);
      } else if (p.status === ReservationPaymentStatus.PAID) {
        paymentsPaid.push(p);
      }
    });
    oustandingPayments = paymentsDue;
    paidPayments = paymentsPaid;
  } else {
    const existingFolios = folios ?? [];
    const folioCharges = existingFolios.flatMap((f) => f.payments);
    paidPayments = folioCharges;
  }
  if (!paidPayments.length && !oustandingPayments.length) {
    return baseTotals;
  }
  const outstandingTotals = (oustandingPayments as IPaymentResponse[]).reduce(
    calcPaymentsTotalReducer,
    { ...baseTotals }
  );
  const paidTotal = (paidPayments as IPaymentResponse[]).reduce(
    calcPaymentsTotalReducer,
    { ...baseTotals }
  );
  const totalPayment =
    (outstandingTotals.subtotal ?? 0) + (paidTotal.subtotal ?? 0);
  const totals: PaymentTotalsData = {
    subtotal: outstandingTotals.subtotal, // unpaid total
    paidTotal: paidTotal.subtotal,
    total: totalPayment,
    balance: totalPayment - (paidTotal.subtotal ?? 0),
  };
  return totals;
}

export function outstandingTotalsFromChargesData(
  folios: IFolioResponse[] | undefined,
  payments: IPaymentResponse[] | undefined,
  chargesData?: ICalculatedCharge
) {
  const chargesTotal = chargesData?.total ? +chargesData.total : undefined;
  const baseTotals = {
    subtotal: 0,
    paidSubtotal: 0,
    discount: 0,
    fees: 0,
    paidFees: 0,
    taxes: 0,
    paidTaxes: 0,
    paidTotal: 0,
    total: chargesTotal ?? 0,
    balance: chargesTotal ?? 0,
  } as PaymentTotalsData;
  if (!payments?.length && !folios?.length) {
    return baseTotals;
  }
  let outstandingPayments: IPaymentResponse[] = [];
  let paidPayments: IPaymentResponse[] = [];
  if (payments?.length) {
    const due: IPaymentResponse[] = [];
    const paid: IPaymentResponse[] = [];
    payments.forEach((p) => {
      if (p.status === ReservationPaymentStatus.DUE) {
        due.push(p);
      } else if (
        p.status === ReservationPaymentStatus.PAID ||
        p.status === ReservationPaymentStatus.AUTHORIZED
      ) {
        paid.push(p);
      }
    });
    outstandingPayments = due;
    paidPayments = paid;
  } else {
    const existingFolios = folios ?? [];
    const folioPayments = existingFolios.flatMap((f) => f.payments);
    outstandingPayments = folioPayments.filter(
      (p) => p.status === ReservationPaymentStatus.DUE
    );
    paidPayments = folioPayments.filter(
      (p) =>
        p.status === ReservationPaymentStatus.PAID ||
        p.status === ReservationPaymentStatus.AUTHORIZED ||
        p.status === ReservationPaymentStatus.CREDITED
    );
  }
  if (!outstandingPayments.length && !paidPayments.length) {
    const emptyTotals = { ...baseTotals };
    if (chargesData?.total) {
      const totalsFromChargesData = totalsFromPerNight(chargesData);
      emptyTotals.total = totalsFromChargesData.total;
      emptyTotals.fees = totalsFromChargesData.fees ?? 0;
      emptyTotals.taxes = totalsFromChargesData.taxes ?? 0;
      emptyTotals.subtotal =
        (emptyTotals?.total ?? 0) - emptyTotals.fees - emptyTotals.taxes;
      emptyTotals.balance = totalsFromChargesData.total ?? 0;
    }
    return emptyTotals;
  }
  const totals = outstandingPayments.reduce(
    (totals: PaymentTotalsData, p: IPaymentResponse) => {
      totals.subtotal = (totals.subtotal ?? 0) + apiAmountToNumber(p.amount);
      return totals;
    },
    { ...baseTotals }
  );
  const paidTotal = paidPayments.reduce(
    (totals: PaymentTotalsData, p: IPaymentResponse) => {
      totals.subtotal = (totals.subtotal ?? 0) + apiAmountToNumber(p.amount);
      return totals;
    },
    { ...baseTotals }
  );
  if (chargesTotal) {
    totals.total = chargesTotal;
  } else {
    totals.total =
      totals.subtotal! + totals.fees! + totals.taxes! - totals.discount!;
  }
  totals.paidSubtotal = paidTotal.subtotal ?? 0;
  totals.paidFees = paidTotal.fees;
  totals.paidTaxes = paidTotal.taxes;
  totals.paidTotal =
    totals.paidSubtotal! +
    totals.paidFees! +
    totals.paidTaxes! +
    totals.discount!;
  totals.balance = totals.total - totals.paidSubtotal;
  return totals;
}

export function outstandingTotalsFromDataResponses(
  payments?: IPaymentResponse[],
  charges?: IChargeResponse[]
) {
  const baseTotals = {
    subtotal: 0,
    paidSubtotal: 0,
    discount: 0,
    fees: 0,
    paidFees: 0,
    taxes: 0,
    paidTaxes: 0,
    paidTotal: 0,
    total: 0,
    unpaidBalance: 0,
    balance: 0,
  } as PaymentTotalsData;
  if (!payments?.length && !charges?.length) {
    return baseTotals;
  }
  const totals = { ...baseTotals };
  let incidentalAmount = 0;
  let paidPayments: IPaymentResponse[] = [];
  const partialRefunds: IPaymentResponse[] = [];
  if (payments?.length) {
    const paid: IPaymentResponse[] = [];
    payments.forEach((p) => {
      if (
        p.status === ReservationPaymentStatus.PAID ||
        p.status === ReservationPaymentStatus.AUTHORIZED ||
        p.status === ReservationPaymentStatus.CREDITED
      ) {
        paid.push(p);
        if (p.description.includes(PaymentDescriptions.INCIDENTALS)) {
          incidentalAmount = apiAmountToNumber(p.amount);
        }
      }
      if (p.status === ReservationPaymentStatus.PARTIALLY_REFUNDED) {
        const originalAmount = p.pp_response?.amount;
        const paymentAmount = apiAmountToNumber(p.amount);
        const refundAmount = (paymentAmount * 100 - originalAmount) / 100;
        paid.push(p);
        partialRefunds.push({
          ...p,
          amount: refundAmount.toString(),
        });
      }
    });
    paidPayments = paid;
  }
  if (charges?.length) {
    charges.forEach((c) => {
      const chargeAmount = apiAmountToNumber(c.amount);
      if (isAdjustment(c, charges)) {
        totals.subtotal = totals.subtotal! - chargeAmount * 100;
      } else if (c.posting_code.type === PostingCodeTypes.TAX) {
        totals.taxes = totals.taxes! + chargeAmount * 100;
      } else if (c.posting_code.type === PostingCodeTypes.FEE) {
        totals.fees = totals.fees! + chargeAmount * 100;
      } else {
        totals.subtotal = totals.subtotal! + chargeAmount * 100;
      }
    });
  }
  const paidTotal = paidPayments.reduce(
    (totals: PaymentTotalsData, p: IPaymentResponse) => {
      totals.subtotal =
        (totals.subtotal ?? 0) + apiAmountToNumber(p.amount) * 100;
      return totals;
    },
    { ...baseTotals }
  );
  totals.total = (totals.subtotal! + totals.fees! + totals.taxes!) / 100;
  totals.subtotal = totals.subtotal! / 100;
  if (partialRefunds.length) {
    const refundTotal = partialRefunds.reduce(
      (total: number, p: IPaymentResponse) => {
        const newTotal = total + apiAmountToNumber(p.amount) * 100;
        return newTotal;
      },
      0
    );
    totals.subtotal = (totals.subtotal * 100 + refundTotal) / 100;
  }
  totals.taxes = totals.taxes! / 100;
  totals.fees = totals.fees! / 100;
  totals.paidSubtotal = (paidTotal.subtotal ?? 0) / 100;
  totals.paidFees = paidTotal.fees! / 100;
  totals.paidTaxes = paidTotal.taxes! / 100;
  totals.paidTotal =
    totals.paidSubtotal! +
    totals.paidFees! +
    totals.paidTaxes! +
    totals.discount!;
  totals.balance = totals.total - totals.paidTotal;
  totals.unpaidBalance = incidentalAmount
    ? totals.balance + incidentalAmount
    : totals.balance;
  return totals;
}

export function folioTotalsFromRes(
  reservation?: IReservationResponse
): TotalsByFolio {
  if (!reservation) {
    return {
      totalBalance: 0,
      folios: {},
    };
  }
  const foliosData = reservation?.folios.reduce(
    (data, folio) => {
      const totals = outstandingTotalsFromDataResponses(
        folio.payments,
        folio.charges
      );
      data[folio.type] = {
        folioId: folio.id,
        balance: totals.balance,
      };
      return data;
    },
    {} as {
      [folioType: string]: {
        folioId: number;
        balance: number;
      };
    }
  );
  return {
    totalBalance: +(reservation.balance ?? 0),
    folios: foliosData,
  };
}

export function allFoliosBalance(
  reservation?: IReservationResponse
): PaymentTotalsData {
  if (!reservation) {
    return {
      balance: 0,
    };
  }
  return {
    balance: 0,
  };
}

export function getCheckinTime(
  details: IReservationResponse,
  currentTimeZone: string
) {
  let label = "";
  let timeString = "";

  if (details?.checkin_time) {
    label = "Checked In at: ";
    timeString = convertUtcToTimezone(
      `${details.start_date}T${details.checkin_time}`,
      currentTimeZone
    ).format(appConfig.dateApiTimeOfDayFormat);
  } else if (details?.expected_checkin_time) {
    label = "Expected Check In: ";
    timeString = details.expected_checkin_time;
  }

  return label && timeString ? ` - ${label}${timeString}` : "";
}

export function getCheckOutTime(
  details: IReservationResponse,
  currentTimeZone: string
) {
  let label = "";
  let timeString = "";

  if (details?.checkout_time) {
    label = "Checked Out at: ";
    timeString = convertUtcToTimezone(
      `${details.start_date}T${details.checkin_time}`,
      currentTimeZone
    ).format(appConfig.dateApiTimeOfDayFormat);
  } else if (details?.expected_checkout_time) {
    label = "Expected Check Out: ";
    timeString = details.expected_checkout_time;
  }

  return label && timeString ? ` - ${label}${timeString}` : "";
}
