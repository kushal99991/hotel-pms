import React from "react";
import { DataGrid, GridColDef, GridRowSelectionModel } from "@mui/x-data-grid";
import { Box } from "@mui/material";
import { SxProps } from "@mui/material/styles";
import { currencyString } from "utils/helperFunctions/numbers";

import { ILCPayments, IPaymentResponse } from "types/payments";
import {
  AccountTransactionRow,
  SettlementTransactionRow,
} from "types/ui/accounting";
import { makeLCSettlementRows } from "utils/accounting";
import useAuth from "hooks/useAuth";
import { CommonPagination } from "utils/FilterComponent";

interface FolioSettlementsTableProps {
  lcPayments?: ILCPayments[];
  selectedPayment?: IPaymentResponse;
  selectedIds?: GridRowSelectionModel;
  allowCheckboxSelect?: boolean;
  onRowSelected?: (updatedRows: GridRowSelectionModel) => void;
  hideTableFooter?: boolean;
  sxProps?: SxProps;
  rowFilter?: (row: AccountTransactionRow) => boolean;
  rowHeight?: number;
  maxHeight?: number;
  headerHeight?: number;
}

const FolioSettlementsTable: React.FC<FolioSettlementsTableProps> = ({
  lcPayments,
  selectedIds,
  allowCheckboxSelect,
  onRowSelected,
  hideTableFooter,
  sxProps,
  rowFilter,
  rowHeight,
  maxHeight,
  headerHeight,
  selectedPayment,
}) => {
  const { currentTimeZone } = useAuth();
  const columns: GridColDef<SettlementTransactionRow>[] = [
    {
      field: "folioId",
      headerName: "Folio Id",
      align: "center",
      headerAlign: "center",
    },
    {
      field: "detail",
      headerName: "Guest Name",
      flex: 2,
    },
    {
      field: "aging",
      headerName: "Aging",
      align: "center",
      headerAlign: "center",
    },
    {
      field: "reservationTotal",
      headerName: "Balance",
      align: "right",
      headerAlign: "center",
      renderCell: (params) => {
        if (!params.value) {
          return "$ -";
        }
        if (params.value === 0) {
          return "$ -";
        }
        return currencyString(params.value);
      },
    },
    {
      field: "balance",
      headerName: "Balance Due",
      align: "right",
      headerAlign: "center",
      renderCell: (params) => {
        if (params.value == null) {
          return "$ -";
        }
        return currencyString(params.value);
      },
    },
    {
      field: "settledAmount",
      headerName: "Amt Settled",
      align: "right",
      headerAlign: "center",
      renderCell: (params) => {
        if (!params.value) {
          return "$ -";
        }
        if (params.value === 0) {
          return "$ -";
        }
        return currencyString(params.value);
      },
    },
    {
      field: "site",
      headerName: "Site",
      align: "center",
      headerAlign: "center",
    },
  ];
  if (selectedPayment) {
    columns.splice(6, 0, {
      field: "settledByPaymentAmount",
      headerName: "Amt Settled By Payment",
      align: "right",
      headerAlign: "center",
      flex: 2,
      renderCell: (params) => {
        if (!params.value) {
          return "$ -";
        }
        return currencyString(params.value);
      },
    });
  }
  let tableRows = makeLCSettlementRows(
    lcPayments ?? [],
    currentTimeZone,
    selectedPayment?.id
  );
  if (rowFilter) {
    tableRows = tableRows.filter(rowFilter);
  }
  const hideFooter = hideTableFooter ?? tableRows.length < 2;
  return (
    <Box display="flex" flexDirection="column" maxHeight={maxHeight}>
      <DataGrid
        rows={tableRows}
        rowHeight={rowHeight}
        columnHeaderHeight={headerHeight}
        columns={columns}
        checkboxSelection={allowCheckboxSelect}
        getRowId={(row) => row.folioId ?? row.paymentId ?? row.detail}
        hideFooter={hideFooter}
        rowSelectionModel={selectedIds}
        onRowSelectionModelChange={onRowSelected}
        slots={{
          pagination: CommonPagination,
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
            // table scroll when max height set
            display: maxHeight ? "flex" : null,
            flexDirection: maxHeight ? "column" : null,
          },
          "& .MuiDataGrid-cell:focus": {
            outline: "none",
          },

          "& .MuiDataGrid-cell:focus-within": {
            outline: "none",
          },
          ...sxProps,
        }}
      />
    </Box>
  );
};

export default FolioSettlementsTable;
