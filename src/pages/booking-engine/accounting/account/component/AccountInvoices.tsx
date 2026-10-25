import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { DataGrid, GridColDef, GridRowParams } from "@mui/x-data-grid";
import { Alert, Box } from "@mui/material";
import { IDirectBillingAccountResponse } from "types/payments";
import useAuth from "hooks/useAuth";
import { currencyString } from "utils/helperFunctions/numbers";
import { getMoment } from "utils/helperFunctions/common";
import { appConfig } from "config/app.config";
import { apiAmountToNumber } from "utils/dataFormats";
import { useNavigate } from "react-router-dom";

import { useLazyGetInvoiceListQuery } from "services/paymentsSlice";
import { CommonPagination } from "utils/FilterComponent";

type InvoiceRow = {
  id: number;
  status: string;
  folioCount: number;
  start?: string;
  end?: string;
  createdAt: string;
  site: string;
  balance: number;
};

const AccountInvoices: React.FC<{
  accountDetail?: IDirectBillingAccountResponse;
}> = ({ accountDetail }) => {
  const { currentTimeZone, users: currentUser, properties } = useAuth();
  const [getInvoiceList, { data: invoiceList, isLoading, error }] =
    useLazyGetInvoiceListQuery();
  const navigate = useNavigate();

  useEffect(() => {
    if (
      accountDetail?.id &&
      currentUser?.defaultPropertyId &&
      !isLoading &&
      !invoiceList
    ) {
      getInvoiceList({
        direct_billing_account_id: accountDetail?.id ?? -1,
        property_id: currentUser?.defaultPropertyId ?? -1,
      });
    }
  }, [accountDetail]);

  function handleRowClick(params: GridRowParams) {
    navigate(`/booking-engine/accounting/invoices/${params.row.id}`);
  }

  const columns: GridColDef<InvoiceRow>[] = [
    {
      field: "id",
      headerName: "Invoice No",
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Link
          to={`/booking-engine/accounting/invoices/${params.value}`}
          style={{ textDecoration: "underline" }}
        >
          {params.value}
        </Link>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      align: "center",
      headerAlign: "center",
      flex: 1,
    },
    {
      field: "folioCount",
      headerName: "Folio Count",
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "start",
      headerName: "Invoice Start Date",
      flex: 1,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        if (!params.value) {
          return "";
        }
        return getMoment(params.value, currentTimeZone).format(
          appConfig.displayDateFormat
        );
      },
    },
    {
      field: "end",
      headerName: "Invoice End Date",
      flex: 1,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        if (!params.value) {
          return "";
        }
        return getMoment(params.value, currentTimeZone).format(
          appConfig.displayDateFormat
        );
      },
    },
    {
      field: "created_at",
      headerName: "Creation Date",
      flex: 1,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        if (!params.value) {
          return "";
        }
        return getMoment(params.value, currentTimeZone).format(
          appConfig.displayDateFormat
        );
      },
    },
    {
      field: "site",
      headerName: "Site",
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "balance",
      headerName: "Balance",
      align: "center",
      headerAlign: "center",
      flex: 1,
      renderCell: (params) => {
        if (params.value == null) {
          return "";
        }
        return currencyString(params.value);
      },
    },
  ];
  const tableRows = invoiceList?.map((invoice): InvoiceRow => {
    let site = "";
    const folioPayment = invoice.folios[0].payments[0];
    if (folioPayment) {
      const property = properties.find(
        (p) => p.id === folioPayment.reservation?.property_id
      );
      site = property?.name ?? `${folioPayment.reservation?.property_id}`;
    }
    const balance = invoice.folios.reduce((total, folio) => {
      if (folio.amount_needed_to_settle != null) {
        return total + apiAmountToNumber(folio.amount_needed_to_settle);
      }
      return total;
    }, 0);
    return {
      id: invoice.id,
      status: invoice.status,
      folioCount: invoice.folios.length,
      start: invoice.start_date,
      end: invoice.end_date,
      createdAt: invoice.created_at ?? "",
      site,
      balance,
    };
  });
  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ my: 2 }}>
          There was an error retrieving invoices
          {error.message ?? error.toString()}
          Please refresh to try again.
        </Alert>
      )}
      <Box display="flex" flexDirection="column">
        <DataGrid
          loading={isLoading}
          rows={tableRows}
          columns={columns}
          getRowId={(row) => row.id}
          onRowClick={handleRowClick}
          slots={{ pagination: CommonPagination }}
          rowSelection={false}
          slotProps={{
            pagination: {
              rowsPerPageOptions: [25, 50, 100], // ✅ 500 will be auto-added dynamically
            },
          }}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 25,
                page: 0,
              },
            },
          }}
          sx={{
            "& .MuiDataGrid-row:hover": {
              cursor: "pointer",
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

export default AccountInvoices;
