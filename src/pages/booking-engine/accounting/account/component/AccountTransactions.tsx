import React, { useState } from "react";
import { Link } from "react-router-dom";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box, Switch, Typography } from "@mui/material";
import {
  IDirectBillingAccountResponse,
  ILCPayments,
  IPaymentResponse,
} from "types/payments";
import { IPaymentMethodResponse } from "types/reservationTypes";
import useAuth from "hooks/useAuth";
import { currencyString } from "utils/helperFunctions/numbers";

import ActionMenu, {
  ActionMenuOption,
} from "components/elements/ActionMenu/ActionMenu";
import {
  makeDBPaymentsRows,
  makeLCPaymentRows,
  makeDBChargeRows,
} from "utils/accounting";
import { AccountTransactionRow } from "types/ui/accounting";
import { ReservationPaymentStatus } from "constants/payments";
import { IChargeResponse } from "types/charges";
import { CommonPagination } from "utils/FilterComponent";

const COLUMN_HEIGHT = 52;

interface AccountTransactionsProps {
  transactions?: ILCPayments[];
  charges?: IChargeResponse[];
  payments?: IPaymentResponse[];
  paymentMethods?: IPaymentMethodResponse[];
  account?: IDirectBillingAccountResponse;
  onAccountRefresh?: () => void;
  onCancelPayment: (paymentId: number) => () => void;
  onCancelCharge: (chargeId: number) => () => void;
  onApplyPaymentFromPayment: (paymentId: number) => () => void;
  onApplyPaymentFromRes: (folioId: number) => () => void;
  onUnapplyPaymentFromPayment: (paymentId: number) => () => void;
  onUnapplyPaymentFromRes: (folioId: number) => () => void;
}

const AccountTransactions: React.FC<AccountTransactionsProps> = ({
  transactions,
  payments,
  paymentMethods,
  charges,
  onApplyPaymentFromPayment,
  onUnapplyPaymentFromPayment,
  onCancelPayment,
  onCancelCharge,
  onApplyPaymentFromRes,
  onUnapplyPaymentFromRes,
}) => {
  const { currentTimeZone } = useAuth();
  const [showZeroBalance, setShowZeroBalance] = useState(false);

  const rawReservationRows = makeLCPaymentRows(
    transactions ?? [],
    currentTimeZone
  );
  let reservationRows = rawReservationRows;
  if (!showZeroBalance) {
    reservationRows = rawReservationRows.filter((row) => row.balance !== 0);
  }
  const paymentRows = makeDBPaymentsRows(
    payments ?? [],
    paymentMethods ?? [],
    currentTimeZone
  );

  const chargeRows = makeDBChargeRows(charges ?? [], currentTimeZone);

  function getAvailableActions(
    rowData: AccountTransactionRow
  ): ActionMenuOption[] {
    if (rowData.paymentId) {
      const actions: ActionMenuOption[] = [];
      if (rowData.paymentStatus) {
        const hasBeenRefunded =
          rowData.paymentStatus === ReservationPaymentStatus.REFUNDED ||
          rowData.paymentStatus === ReservationPaymentStatus.PARTIALLY_REFUNDED;
        if (!hasBeenRefunded) {
          actions.push({
            text: "Cancel Payment",
            onClick: onCancelPayment(rowData.paymentId),
            key: `cancel-pay-${rowData.paymentId}`,
          });
        }
      }
      if (rowData.fullyApplied || rowData.partiallyApplied) {
        actions.unshift({
          text: "Unapply Payment",
          onClick: onUnapplyPaymentFromPayment(rowData.paymentId),
          key: `unapply-payment-${rowData.paymentId}`,
        });
      }
      if (!rowData.fullyApplied) {
        actions.unshift({
          text: "Apply Payment",
          onClick: onApplyPaymentFromPayment(rowData.paymentId),
          key: `apply-payment-${rowData.paymentId}`,
        });
      }
      return actions;
    } else if (rowData.folioId) {
      const actions: ActionMenuOption[] = [];
      if (rowData.balance && rowData.balance > 0) {
        actions.push({
          text: "Apply Payment",
          onClick: onApplyPaymentFromRes(rowData.folioId),
          key: `apply-payment-${rowData.folioId}`,
        });
      }

      const resTotal = rowData.reservationTotal;
      if (resTotal !== null && (rowData?.balance ?? 0) < (resTotal ?? 0)) {
        actions.push({
          text: "Unapply Payment",
          onClick: onUnapplyPaymentFromRes(rowData.folioId),
          key: `unapply-payment-${rowData.folioId}`,
        });
      }
      return actions;
    } else if (rowData.chargeId) {
      const actions: ActionMenuOption[] = [];
      actions.push({
        text: "Cancel Charge",
        onClick: onCancelCharge(rowData.chargeId),
        key: `cancel-charge-${rowData.chargeId}`,
      });
      return actions;
    }
    return [];
  }

  const tableRows = [...reservationRows, ...chargeRows, ...paymentRows];
  const columns: GridColDef<AccountTransactionRow>[] = [
    {
      field: "folioId",
      headerName: "Folio Id",
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Link
          to={`/booking-engine/reservations/folios/${params.value}`}
          style={{ textDecoration: "underline" }}
        >
          {params.value}
        </Link>
      ),
    },
    {
      field: "detail",
      headerName: "Guest Name / Detail",
      flex: 3,
      renderCell: (params) => (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            whiteSpace: "normal",
            overflow: "visible",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              whiteSpace: "normal",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {params?.row?.detail}
          </Typography>
          <Typography
            variant="caption"
            fontSize="0.75rem"
            sx={{
              whiteSpace: "normal",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {params?.row.additionalDetail}
          </Typography>
        </div>
      ),
    },
    {
      field: "arrivalDate",
      headerName: "Arrival Date",
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "departureDate",
      headerName: "Departure Date",
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "balance",
      headerName: "Balance",
      align: "right",
      headerAlign: "center",
      renderCell: (params) => {
        if (params.value == null) {
          return "$ -";
        }
        if (params.value === 0) {
          return "$0";
        }
        return currencyString(params.value);
      },
    },
    {
      field: "credit",
      headerName: "Credit",
      align: "right",
      headerAlign: "center",
      renderCell: (params) => {
        if (params.value == null) {
          return "$ -";
        }
        if (params.value === 0) {
          return "$0";
        }
        return currencyString(params.value);
      },
    },
    {
      field: "aging",
      headerName: "Aging",
      align: "center",
      headerAlign: "center",
    },
    {
      field: "site",
      headerName: "Site",
      align: "center",
      headerAlign: "center",
    },
    {
      field: "invoice",
      headerName: "Invoice #",
      align: "center",
      headerAlign: "center",
    },
    {
      field: "datePosted",
      headerName: "Date Posted",
      align: "center",
      headerAlign: "center",
      flex: 1,
    },
    {
      field: "actions",
      renderHeader: () => null,
      width: 56,
      sortable: false,
      hideable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        const actions = getAvailableActions(params.row);
        if (!actions.length) {
          return null;
        }
        return <ActionMenu options={actions} stopPropagation />;
      },
    },
  ];
  return (
    <Box>
      <Box display="flex" flexDirection="column" maxHeight={COLUMN_HEIGHT * 10}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="flex-end"
          flexWrap="wrap"
          gap={1}
          mb={1}
        >
          <Typography>Show Zero Balance Folios</Typography>
          <Switch
            color="secondary"
            checked={showZeroBalance}
            onChange={() => setShowZeroBalance((prev) => !prev)}
          />
        </Box>
        <DataGrid
          rows={tableRows}
          columns={columns}
          getRowId={(row) => row.key}
          slots={{ pagination: CommonPagination }}
          slotProps={{
            pagination: {
              rowsPerPageOptions: [5, 10, 25, 50, 100], // ✅ 500 will be auto-added dynamically
            },
          }}
          initialState={{
            sorting: {
              sortModel: [
                {
                  field: "aging",
                  sort: "desc",
                },
              ],
            },
            pagination: {
              paginationModel: {
                pageSize: 100,
                page: 0,
              },
            },
          }}
          sx={{
            "& .MuiDataGrid-main": {
              // table scroll will not work without this
              display: "flex",
              flexDirection: "column",
            },

            "& .MuiDataGrid-cell:focus": {
              outline: "none",
            },

            "& .MuiDataGrid-cell:focus-within": {
              outline: "none",
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default AccountTransactions;
