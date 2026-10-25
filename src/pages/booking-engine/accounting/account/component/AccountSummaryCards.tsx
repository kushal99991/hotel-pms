import React, { useEffect } from "react";
import { Box, Typography, Skeleton } from "@mui/material";
import { currencyString } from "utils/helperFunctions/numbers";
import { useLazyGetDirectBillingAccountAgingQuery } from "services/paymentsSlice";

import { IPaymentResponse } from "types/payments";
import { ReservationPaymentStatus } from "constants/payments";
import { IChargeResponse } from "types/charges";
import { isAdjustment } from "utils/charges";
import { apiAmountToNumber } from "utils/dataFormats";

interface AccountSummaryCardsProps {
  accountId?: number;
  creditLimit?: number;
  currentLimit?: number;
  payments?: IPaymentResponse[];
  charges?: IChargeResponse[];
  isAccountLoading?: boolean;
}

const AccountSummaryCards: React.FC<AccountSummaryCardsProps> = ({
  accountId,
  creditLimit,
  currentLimit,
  isAccountLoading,
  payments,
  charges,
}) => {
  const [getAging, { isLoading: isLoadingAging, data: agingData }] =
    useLazyGetDirectBillingAccountAgingQuery();

  useEffect(() => {
    if (accountId) {
      getAging({ account_id: accountId.toString() });
    }
  }, [accountId]);
  const allCharges = charges ?? [];
  const { chargeAgainstBalance, chargeForBalance } = allCharges.reduce(
    (agg, c) => {
      if (isAdjustment(c, allCharges)) {
        agg.chargeForBalance =
          agg.chargeForBalance - apiAmountToNumber(c.amount);
      } else {
        agg.chargeAgainstBalance =
          agg.chargeAgainstBalance + apiAmountToNumber(c.amount);
      }
      return agg;
    },
    {
      chargeAgainstBalance: 0,
      chargeForBalance: 0,
    }
  );
  const rawBalance =
    (currentLimit ?? 0) -
    (creditLimit ?? 0) -
    chargeAgainstBalance +
    chargeForBalance;
  const balance = rawBalance > 0 ? 0 : rawBalance;
  const currentLimitPresent = currentLimit != null;
  const overallLimitPresent = creditLimit != null;
  const paymentsAvailable = payments?.reduce((total, p) => {
    if (p.status === ReservationPaymentStatus.PAID && p.remaining_amount) {
      if (apiAmountToNumber(p.remaining_amount) > 0) {
        return total + apiAmountToNumber(p.remaining_amount);
      }
    }
    return total;
  }, 0);
  const summaryItems = [
    {
      label: "Aging",
      value: isLoadingAging ? (
        <Skeleton width={60} height={30} />
      ) : (
        <Typography
          variant="h6"
          color="warning.main"
          sx={{ fontSize: "1.1rem" }}
        >
          {agingData?.aging ?? "--"} Days
        </Typography>
      ),
    },
    {
      label: "Credit Limit",
      value: isAccountLoading ? (
        <Skeleton width={100} height={30} />
      ) : (
        <Typography variant="h6" sx={{ fontSize: "1.1rem" }}>
          {creditLimit ? currencyString(creditLimit ?? 0) : "--"}
        </Typography>
      ),
    },
    {
      label: "Available Credit",
      value: isAccountLoading ? (
        <Skeleton width={100} height={30} />
      ) : (
        <Typography
          variant="h6"
          color="success.main"
          sx={{ fontSize: "1.1rem" }}
        >
          {currentLimit ? currencyString(currentLimit ?? 0) : "--"}
        </Typography>
      ),
    },
    {
      label: "Unapplied Payments",
      value: isAccountLoading ? (
        <Skeleton width={100} height={30} />
      ) : (
        <Typography variant="h6" sx={{ fontSize: "1.1rem" }}>
          {paymentsAvailable ? currencyString(paymentsAvailable ?? 0) : "--"}
        </Typography>
      ),
    },
    {
      label: "Balance Due",
      value: isAccountLoading ? (
        <Skeleton width={100} height={30} />
      ) : (
        <Typography variant="h6" color="error" sx={{ fontSize: "1.1rem" }}>
          {currentLimitPresent && overallLimitPresent
            ? currencyString(balance ?? 0)
            : "--"}
        </Typography>
      ),
    },
  ];

  return (
    <Box
      mt={2}
      display="flex"
      border="1px solid #ddd"
      borderRadius={1}
      overflow="hidden"
    >
      {summaryItems.map((item, index) => (
        <Box
          key={item.label}
          flex={1}
          p={1.5}
          borderRight={
            index !== summaryItems.length - 1 ? "1px solid #ddd" : "none"
          }
          textAlign="left"
          sx={{
            backgroundColor: "#f9f9f9",
            fontSize: "1.1rem",
          }}
        >
          <Typography variant="subtitle2" fontWeight="bold">
            {item.label}:
          </Typography>
          {item.value}
        </Box>
      ))}
    </Box>
  );
};

export default AccountSummaryCards;
