// hooks/useAccountReport.ts
import { useCallback, useEffect, useState } from "react";
import { bookingChannelList } from "config/tables/reservations";
import { useLazyGetDirectBillingAccountQuery } from "services/paymentsSlice";
import useAuth from "./useAuth";
import { IDirectBillingAccountResponse } from "types/payments";
import moment from "moment";
import { useLazyGetReservationListQuery } from "services/reservationSlice";
import { apiAmountToNumber } from "utils/dataFormats";

/* ———————————————————— Types ———————————————————— */
export interface IAccountReceivables {
  client: string;
  amount: number;
  daysOverdue: number;
  status: string;
}
export interface IBookingChannelBreakdown {
  category: string;
  amount: number;
  color: string;
}
export interface IBookingMetric {
  key: "monthlyRevenue" | "totalExpense" | "netProfit" | "profitMargin";
  label: string;
  value: number;
  delta: number; // % vs previous month
}
export enum BookingChannelColour {
  WALK_IN = "#1e88e5",
  CALL_IN = "#43a047",
  TRAVEL_AGENT = "#fb8c00",
  ONLINE_DIRECT = "#8e24aa",
  ONLINE_3RD_PARTY = "#f4511e",
  ONLINE_3RD_PARTY_OTA = "#00acc1",
  GROUPS = "#c2185b",
}

/* ———————————————————— Helpers ———————————————————— */
const pctChange = (curr: number, prev: number): number =>
  prev === 0 ? 0 : +(((curr - prev) / prev) * 100).toFixed(1);

const getAccountAging = (acc: any): number => {
  if (typeof acc.aging === "number") return acc.aging;
  if (typeof acc.days_overdue === "number") return acc.days_overdue;
  if (Array.isArray(acc.folios) && typeof acc.folios[0]?.aging === "number")
    return acc.folios[0].aging;
  return 0;
};

/* ———————————————————— Hook ———————————————————— */
export const useAccountReport = () => {
  const { users } = useAuth();

  const [accountsReceivable, setAccountsReceivable] = useState<
    IAccountReceivables[]
  >([]);
  const [bookingChannelBreakdown, setBookingChannelBreakdown] = useState<
    IBookingChannelBreakdown[]
  >([]);
  const [bookingSegment, setBookingSegment] = useState<IBookingMetric[]>([]);

  const [getDirectBillingAccount] = useLazyGetDirectBillingAccountQuery();
  const [getReservationList] = useLazyGetReservationListQuery();

  /* ---------------- split helper ---------------- */
  const splitPaymentsByMonth = (accounts: IDirectBillingAccountResponse[]) => {
    const lcPayments = accounts.flatMap((a) => a.lc_payments || []);

    const thisMonthStart = moment().startOf("month");
    const nextMonthStart = moment(thisMonthStart).add(1, "month"); // exclusive
    const lastMonthStart = moment(thisMonthStart).subtract(1, "month");

    const currentMonthPayments = lcPayments.filter((p) =>
      moment(p.payment_date).isBetween(
        thisMonthStart,
        nextMonthStart,
        undefined,
        "[)"
      )
    );

    const lastMonthPayments = lcPayments.filter((p) =>
      moment(p.payment_date).isBetween(
        lastMonthStart,
        thisMonthStart,
        undefined,
        "[)"
      )
    );

    return { currentMonthPayments, lastMonthPayments };
  };

  /* ---------------- summariser ---------------- */
  const makeAgingMap = (accounts: IDirectBillingAccountResponse[]) =>
    Object.fromEntries(accounts.map((acc) => [acc.id, getAccountAging(acc)]));

  const summarisePayments = (
    payments: any[],
    agingMap: Record<number, number>
  ) => {
    let revenue = 0;
    let expense = 0;

    payments.forEach((p) => {
      const aging = agingMap[p.direct_billing_account_id] ?? 0;
      const amt = p.amount_needed_to_settle ?? 0;
      if (aging <= 30) revenue += amt;
      else expense += amt;
    });

    const profit = 0; // static value
    const margin = revenue ? (profit / revenue) * 100 : 0;

    return { revenue, expense, profit, margin };
  };

  /* ---------------- refresh ---------------- */
  const onRefresh = useCallback(async () => {
    if (!users?.defaultPropertyId) return;

    const { data: accounts = [] } = await getDirectBillingAccount({
      property_id: users.defaultPropertyId,
    });
    const { data: reservationList = [] } = await getReservationList({
      property_id: users.defaultPropertyId,
    });
    const reservationsWithDirectBilling = reservationList.filter(
      (reservation) =>
        reservation.payment_methods.some(
          (method) => method.direct_billing_account_id != null
        )
    );
    const channelAmountMap = reservationsWithDirectBilling.reduce<
      Record<string, number>
    >((acc, res) => {
      const key = res.booking_channel;
      const amt = Math.abs(apiAmountToNumber(res.balance));
      acc[key] = (acc[key] ?? 0) + amt;
      return acc;
    }, {});

    const { currentMonthPayments, lastMonthPayments } =
      splitPaymentsByMonth(accounts);

    const agingMap = makeAgingMap(accounts);
    const curr = summarisePayments(currentMonthPayments, agingMap);
    const prev = summarisePayments(lastMonthPayments, agingMap);

    /* ——— Detailed AR list (all payments, any date) ——— */
    const arDetails: IAccountReceivables[] = accounts.map((acc) => ({
      client: acc.billing_name,
      amount:
        acc.lc_payments?.reduce(
          (s, p) => s + apiAmountToNumber(p.amount_needed_to_settle),
          0
        ) ?? 0,
      daysOverdue: agingMap[acc.id] ?? 0,
      status:
        agingMap[acc.id] > 90
          ? "90+"
          : agingMap[acc.id] > 60
            ? "61–90"
            : agingMap[acc.id] > 30
              ? "31–60"
              : "Current",
    }));

    /* ——— State updates ——— */
    setAccountsReceivable(arDetails);

    setBookingSegment([
      {
        key: "monthlyRevenue",
        label: "Monthly Revenue",
        value: curr.revenue,
        delta: pctChange(curr.revenue, prev.revenue),
      },
      {
        key: "totalExpense",
        label: "Total Expenses",
        value: curr.expense,
        delta: pctChange(curr.expense, prev.expense),
      },
      {
        key: "netProfit",
        label: "Net Profit",
        value: curr.profit,
        delta: pctChange(curr.profit, prev.profit),
      },
      {
        key: "profitMargin",
        label: "Profit Margin",
        value: curr.margin,
        delta: pctChange(curr.margin, prev.margin),
      },
    ]);

    /* Dummy channel data until API provides real figures */
    setBookingChannelBreakdown(
      bookingChannelList.map((ch) => ({
        category: ch.label,
        amount: channelAmountMap[ch.value] ?? 0,
        color:
          BookingChannelColour[ch.value as keyof typeof BookingChannelColour],
      }))
    );
  }, [users, getDirectBillingAccount]);

  /* first load */
  useEffect(() => {
    onRefresh();
  }, [onRefresh]);

  return {
    accountsReceivable,
    bookingChannelBreakdown,
    bookingSegment,
    onRefresh,
  };
};
