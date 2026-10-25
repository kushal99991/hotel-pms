import moment from "moment";
import { getMoment } from "./helperFunctions/common";
import { getMethodDetailString } from "./reservations";
import { appConfig } from "config/app.config";
import { ILCPayments, IPaymentResponse } from "types/payments";
import {
  TransactionsByReservation,
  AccountTransactionRow,
  SettlementTransactionRow,
} from "types/ui/accounting";
import { IPaymentMethodResponse } from "types/reservationTypes";
import { ReservationPaymentStatus } from "constants/payments";
import { IChargeResponse } from "types/charges";
import { isAdjustment } from "./charges";
import { paymentCreatedTime } from "./payments";
import { currencyString } from "./helperFunctions/numbers";
import { apiAmountToNumber } from "./dataFormats";

export function makeLCPaymentRows(
  lcPayments: ILCPayments[],
  currentTimeZone: string
): AccountTransactionRow[] {
  if (!lcPayments.length) {
    return [];
  }
  const transactionsPerReservation = lcPayments?.reduce((agg, t) => {
    if (!t.reservation_id) {
      return agg;
    }
    const paymentDate = moment(t.payment_date);
    const today = moment();
    const aging = today.diff(paymentDate, "days");
    const existingData = agg[t.reservation_id];
    if (existingData) {
      const newAging = Math.max(aging, existingData.aging);
      const newBalance =
        existingData.balance + apiAmountToNumber(t.amount_needed_to_settle);
      const resTotal =
        (existingData?.reservationTotal ?? 0) + apiAmountToNumber(t.amount);
      agg[t.reservation_id] = {
        ...existingData,
        aging: newAging,
        balance: newBalance,
        reservationTotal: resTotal,
      };
    } else {
      const start = t.reservation?.start_date
        ? getMoment(t.reservation.start_date, currentTimeZone).format(
            appConfig.displayDateFormat
          )
        : "";
      const end = t.reservation?.end_date
        ? getMoment(t.reservation.end_date, currentTimeZone).format(
            appConfig.displayDateFormat
          )
        : "";
      agg[t.reservation_id] = {
        reservationId: t.reservation_id,
        guestName: `${t.reservation?.guest?.last_name}, ${t.reservation?.guest?.first_name} `,
        arrivalDate: start,
        departureDate: end,
        balance: apiAmountToNumber(t.amount_needed_to_settle),
        reservationTotal: apiAmountToNumber(t.amount),
        aging,
        site: t.reservation?.property_id,
      };
    }
    return agg;
  }, {} as TransactionsByReservation);
  const reservationRows: AccountTransactionRow[] = Object.keys(
    transactionsPerReservation ?? {}
  ).map((reservationKey) => {
    const data = transactionsPerReservation![+reservationKey];
    return {
      key: `reservationrow_${data.reservationId}`,
      folioId: data.reservationId,
      detail: data.guestName,
      arrivalDate: data.arrivalDate,
      departureDate: data.departureDate,
      balance: data.balance,
      reservationTotal: data.reservationTotal,
      aging: data.aging,
      site: data.site,
    };
  });

  return reservationRows;
}

export function makeLCSettlementRows(
  lcPayments: ILCPayments[],
  currentTimeZone: string,
  dbPaymentId?: number
): SettlementTransactionRow[] {
  if (!lcPayments.length) {
    return [];
  }
  const transactionsPerReservation = lcPayments?.reduce((agg, t) => {
    if (!t.reservation_id) {
      return agg;
    }
    const paymentDate = getMoment(
      paymentCreatedTime(t as IPaymentResponse),
      currentTimeZone
    );
    const today = getMoment(null, currentTimeZone);
    const aging = today.diff(paymentDate, "days");
    const existingData = agg[t.reservation_id];
    if (existingData) {
      const newAging = Math.max(aging, existingData.aging);
      const newBalance =
        existingData.balance + apiAmountToNumber(t.amount_needed_to_settle);
      const resTotal =
        (existingData?.reservationTotal ?? 0) + apiAmountToNumber(t.amount);
      const settledTotal = resTotal - newBalance;
      agg[t.reservation_id] = {
        ...existingData,
        aging: newAging,
        balance: newBalance,
        reservationTotal: resTotal,
        settledAmount: settledTotal,
      };
      if (t.settlements) {
        const settlementTotal = t.settlements.reduce((total, s) => {
          if (s.payment_id === dbPaymentId) {
            return total + s.amount_settled;
          }
          return total;
        }, 0);
        const currentAmount = agg[t.reservation_id].settledByPaymentAmount ?? 0;
        agg[t.reservation_id].settledByPaymentAmount =
          currentAmount + settlementTotal;
      }
    } else {
      const start = t.reservation?.start_date
        ? getMoment(
            `${t.reservation.start_date}T00:00`,
            currentTimeZone,
            true
          ).format(appConfig.displayDateFormat)
        : "";
      const end = t.reservation?.end_date
        ? getMoment(
            `${t.reservation.end_date}T23:59`,
            currentTimeZone,
            true
          ).format(appConfig.displayDateFormat)
        : "";
      let settledByPaymentTotal = 0;
      if (t.settlements) {
        const settlementTotal = t.settlements.reduce((total, s) => {
          if (s.payment_id === dbPaymentId) {
            return total + s.amount_settled;
          }
          return total;
        }, 0);
        settledByPaymentTotal = settlementTotal;
      }
      agg[t.reservation_id] = {
        reservationId: t.reservation_id,
        guestName: `${t.reservation?.guest?.last_name}, ${t.reservation?.guest?.first_name} `,
        arrivalDate: start,
        departureDate: end,
        balance: apiAmountToNumber(t.amount_needed_to_settle),
        aging,
        site: t.reservation?.property_id,
        reservationTotal: apiAmountToNumber(t.amount),
        settledAmount:
          apiAmountToNumber(t.amount) -
          apiAmountToNumber(t.amount_needed_to_settle),
        settledByPaymentAmount: settledByPaymentTotal,
      };
    }
    return agg;
  }, {} as TransactionsByReservation);
  const reservationRows: SettlementTransactionRow[] = Object.keys(
    transactionsPerReservation ?? {}
  ).map((reservationKey) => {
    const data = transactionsPerReservation![+reservationKey];
    return {
      key: `reservationrow_${data.reservationId}`,
      folioId: data.reservationId,
      detail: data.guestName,
      arrivalDate: data.arrivalDate,
      departureDate: data.departureDate,
      balance: data.balance,
      aging: data.aging,
      site: data.site,
      reservationTotal: data.reservationTotal ?? 0,
      settledAmount: data.settledAmount ?? 0,
      settledByPaymentAmount: data.settledByPaymentAmount ?? 0,
    };
  });
  let finalRows = reservationRows.filter((row) => row.settledAmount !== 0);
  if (dbPaymentId) {
    finalRows = finalRows.filter(
      (row) => (row.settledByPaymentAmount ?? 0) > 0
    );
  }
  return finalRows;
}

export function makeDBPaymentsRows(
  payments: IPaymentResponse[],
  paymentMethods: IPaymentMethodResponse[],
  currentTimeZone: string,
  includePayment?: boolean
): AccountTransactionRow[] {
  if (!payments.length) {
    return [];
  }
  const rows = (payments ?? []).map((p) => {
    const paymentMethod = (paymentMethods ?? []).find(
      (pm) => pm.id === p.payment_method_id
    );
    let postfix =
      apiAmountToNumber(p.remaining_amount) === 0 ||
      (p.remaining_amount ? +p.remaining_amount : 1) < 0
        ? `FULLY APPLIED ${currencyString(apiAmountToNumber(p.amount))}`
        : "";
    if (
      (p.remaining_amount ? +p.remaining_amount : 1) > 0 &&
      p.remaining_amount !== p.amount
    ) {
      postfix = `PARTIALLY APPLIED ${currencyString(apiAmountToNumber(p.amount))}`;
    }
    if (
      p.status === ReservationPaymentStatus.REFUNDED ||
      p.status === ReservationPaymentStatus.PARTIALLY_REFUNDED
    ) {
      postfix = "CANCELLED";
    }
    let amountToDisplay = apiAmountToNumber(p.remaining_amount);
    if (amountToDisplay && amountToDisplay < 0) {
      amountToDisplay = 0;
    }
    return {
      key: `paymentrow_${p.id}`,
      paymentId: p.id,
      detail: `Payment - ${getMethodDetailString(paymentMethod)}${postfix ? ` - ${postfix}` : ""}`,
      additionalDetail: p.description,
      credit: amountToDisplay,
      fullyApplied: (p.remaining_amount ? +p.remaining_amount : 1) <= 0,
      partiallyApplied:
        p.remaining_amount != null && p.remaining_amount !== p.amount,
      paymentStatus: p.status,
      datePosted: getMoment(p.payment_date, currentTimeZone).format(
        appConfig.displayDateFormat
      ),
      payment: includePayment ? p : undefined,
    };
  });
  return rows;
}

export function makeDBChargeRows(
  charges: IChargeResponse[],
  currentTimeZone: string
): AccountTransactionRow[] {
  if (!charges.length) {
    return [];
  }
  const rows = (charges ?? []).map((c) => {
    const chargeIsAdjustment = isAdjustment(c, charges);
    const label = chargeIsAdjustment ? "ADJ" : "";
    return {
      key: `chargerow_${c.id}`,
      chargeId: c.id,
      detail: `${label ? `${label} ` : ""}${c.posting_code.name.toLocaleUpperCase()} - ${c.posting_code.code}`,
      additionalDetail: c.description,
      credit: chargeIsAdjustment ? apiAmountToNumber(c.amount) : undefined,
      balance: chargeIsAdjustment ? undefined : apiAmountToNumber(c.amount),
      datePosted: getMoment(`${c.created_at}Z`, currentTimeZone).format(
        appConfig.displayDateFormat
      ),
    };
  });
  return rows;
}
