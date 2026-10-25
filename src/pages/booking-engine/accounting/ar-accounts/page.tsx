import React, { useEffect, useMemo, useState } from "react";
import { Box, Typography, Switch, Paper, Button } from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import { useNavigate, useParams } from "react-router-dom";
import { useGetAccountReceivablesDetailMutation } from "services/accountingSlice";
import {
  useGetFoliosQuery,
  useLazyGetDirectBillingAccountQuery,
} from "services/paymentsSlice";
import useAuth from "hooks/useAuth";
import { useLazyGetReservationListQuery } from "services/reservationSlice";
import {
  IPaymentMethodResponse,
  IReservationResponse,
} from "types/reservationTypes";
import useFilter from "hooks/useFilter";
import { appConfig } from "config/app.config";
import dayjs from "dayjs";
import { CommonPagination } from "utils/FilterComponent";

interface IArFolioList {
  type: string;
  reservation_id: number;
  id: number;
  primary_payment_method: IPaymentMethodResponse | null;
  reservationDetail?: IReservationResponse;
}

export default function ARPage() {
  const navigate = useNavigate();
  const params = useParams();
  const { users } = useAuth();
  const { getFilterOperators } = useFilter();
  const [showZeroBalance, setShowZeroBalance] = useState(false);
  const [getAccountReceivablesDetail, { data: accountReceivablesDetail }] =
    useGetAccountReceivablesDetailMutation();
  const [getDirectBillingAccount, { data: directBillingAccountList }] =
    useLazyGetDirectBillingAccountQuery();
  const [getReservationList, { data: reservationList }] =
    useLazyGetReservationListQuery();
  const { data: folioList } = useGetFoliosQuery({});

  useEffect(() => {
    if (params?.id) {
      getDirectBillingAccount({
        property_id: users?.defaultPropertyId ?? 0,
      });
      getAccountReceivablesDetail({ account_id: Number(params.id) });
    }
  }, [params?.id, users?.defaultPropertyId]);

  useEffect(() => {
    if (accountReceivablesDetail && users?.defaultPropertyId) {
      getReservationList({
        property_id: users.defaultPropertyId,
      });
    }
  }, [accountReceivablesDetail, users?.defaultPropertyId]);

  const folioListing = useMemo(() => {
    let responseFolioList: IArFolioList[] = (folioList ?? []).map((f) => {
      const reservationDetail = reservationList?.find(
        (r) => r.id === f.reservation_id
      );
      return {
        ...f,
        reservationDetail,
      };
    });

    // Filter out folios with 0 balance if showZeroBalance is false
    if (showZeroBalance) {
      responseFolioList = responseFolioList.filter(
        (f) => (f.reservationDetail?.balance ?? 0) === 0
      );
    }

    return responseFolioList;
  }, [reservationList, folioList, showZeroBalance]);

  const directBillingAccountDetail = useMemo(() => {
    return (directBillingAccountList ?? []).find(
      (a) => a.id === accountReceivablesDetail?.direct_billing_account_id
    );
  }, [directBillingAccountList, accountReceivablesDetail]);

  const columns: GridColDef<IArFolioList>[] = useMemo(
    () => [
      { field: "id", headerName: "ID", minWidth: 70 },
      {
        field: "account_name",
        headerName: "Account",
        minWidth: 180,
        renderCell: (params) => (
          <Typography
            sx={{
              color: "primary.main",
              cursor: "pointer",
              textDecoration: "underline",
              lineHeight: "inherit !important",
            }}
            onClick={() => navigate(`/ar/account/${params.row.id}`)}
          >
            {params.value}
          </Typography>
        ),
      },
      {
        field: "type",
        headerName: "Folio #",
        minWidth: 100,
        renderCell: (params) => (
          <Typography
            sx={{
              color: "primary.main",
              cursor: "pointer",
              textDecoration: "underline",
              lineHeight: "inherit !important",
            }}
            onClick={() =>
              navigate(
                `/booking-engine/reservations/folios/${params.row.reservation_id}`
              )
            }
          >
            {params.value}
          </Typography>
        ),
      },
      {
        field: "guest_name",
        headerName: "Guest Name",
        minWidth: 180,
        renderCell: (params) =>
          `${params.row?.reservationDetail?.reservation_first_guest_info?.first_name} ${params.row?.reservationDetail?.reservation_first_guest_info?.last_name}`,
      },
      {
        field: "reservationDetail.start_date",
        headerName: "Arrival Date",
        minWidth: 110,
        flex: 1,
        filterOperators: getFilterOperators("date", "Arrival"),
        valueFormatter: (_, { reservationDetail }) =>
          reservationDetail?.start_date
            ? dayjs(reservationDetail.start_date).format(
                appConfig.displayDateFormat
              )
            : "",
      },
      {
        field: "reservationDetail.end_date",
        headerName: "Departure Date",
        minWidth: 110,
        flex: 1,
        filterOperators: getFilterOperators("date", "Departure"),
        valueFormatter: (_, { reservationDetail }) =>
          reservationDetail?.end_date
            ? dayjs(reservationDetail.end_date).format(
                appConfig.displayDateFormat
              )
            : "",
      },
      {
        field: "reservationDetail.balance",
        headerName: "Balance",
        minWidth: 100,
        renderCell: (params) =>
          `${params.row?.reservationDetail?.balance ?? 0}`,
        flex: 1,
      },
      { field: "aging", headerName: "Aging", minWidth: 80 },
      { field: "group_code", headerName: "Group Code", minWidth: 120 },
      {
        field: "booking_channel",
        headerName: "Site",
        renderCell: (params) =>
          `${params.row?.reservationDetail?.booking_channel}`,
      },
      {
        field: "invoice_number",
        headerName: "Invoice #",
        minWidth: 140,
        renderCell: (params) => (
          <Typography
            sx={{
              color: "primary.main",
              cursor: "pointer",
              textDecoration: "underline",
              lineHeight: "inherit !important",
            }}
            onClick={() =>
              navigate(
                `/booking-engine/reservations/${params.row.reservation_id}`
              )
            }
          >
            N/A
          </Typography>
        ),
      },
      {
        field: "actions",
        headerName: "Action",
        minWidth: 420,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <>
            <Button
              variant="outlined"
              size="small"
              sx={{
                fontSize: 10,
                minWidth: 0,
                padding: "4px 8px",
                margin: "0 2px",
              }}
              onClick={() =>
                navigate(
                  `/booking-engine/reservations/folios/${params.row.reservation_id}`
                )
              }
            >
              View Folio
            </Button>
            <Button
              variant="outlined"
              size="small"
              sx={{
                fontSize: 10,
                minWidth: 0,
                padding: "4px 8px",
                margin: "0 2px",
              }}
              onClick={() =>
                navigate(
                  `/booking-engine/reservations/registration-card/${params.row.reservation_id}/${users?.defaultPropertyId}`
                )
              }
            >
              View Invoice
            </Button>
            <Button
              variant="outlined"
              size="small"
              sx={{
                fontSize: 10,
                minWidth: 0,
                padding: "4px 8px",
                margin: "0 2px",
              }}
              onClick={() => {
                /** empty */
              }}
            >
              Apply Payment
            </Button>
            <Button
              variant="outlined"
              size="small"
              sx={{
                fontSize: 10,
                minWidth: 0,
                padding: "4px 8px",
                margin: "0 2px",
              }}
              onClick={() => {
                /** empty */
              }}
            >
              Unapply Payment
            </Button>
          </>
        ),
      },
    ],
    [navigate]
  );

  const actionButtons = [
    "Manual Posting",
    "Post Payment",
    "Apply Payment",
    "Unapply Payment",
    "Add Payment",
    "Create Invoice",
    "View Invoice",
  ];

  const CustomToolbar = () => (
    <GridToolbarContainer>
      <GridToolbarFilterButton />
      <Box sx={{ flexGrow: 1 }} />
      <Box display="flex" alignItems="center" gap={1}>
        {actionButtons.map((label) => (
          <Button
            key={label}
            size="small"
            variant="contained"
            sx={{
              backgroundColor: "#32A1AE",
              color: "#FFFFFF",
              fontWeight: "bold",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#2B92A0",
              },
            }}
          >
            {label}
          </Button>
        ))}
      </Box>
    </GridToolbarContainer>
  );

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Box
          width="100%"
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          gap={2}
        >
          <Typography variant="h5" fontWeight="bold">
            A/R
          </Typography>
          <Typography variant="h5">
            {directBillingAccountDetail?.billing_name ?? ""}
          </Typography>

          <Box display="flex" alignItems="center" flexWrap="wrap" gap={1}>
            <Typography>Show Zero Balance Folios</Typography>
            <Switch
              color="secondary"
              checked={showZeroBalance}
              onChange={() => setShowZeroBalance((prev) => !prev)}
            />
          </Box>
        </Box>
      </Box>

      <Paper elevation={1}>
        <DataGrid
          rows={folioListing}
          columns={columns}
          getRowId={(row) => row.id}
          autoHeight
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 100,
                page: 0,
              },
            },
          }}
          slots={{
            toolbar: CustomToolbar,
            pagination: CommonPagination,
          }}
        />
      </Paper>
    </Box>
  );
}
