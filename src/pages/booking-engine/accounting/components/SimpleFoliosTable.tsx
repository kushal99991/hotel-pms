import React from "react";
import { DataGrid, GridColDef, GridRowSelectionModel } from "@mui/x-data-grid";
import { Box } from "@mui/material";
import { SxProps } from "@mui/material/styles";
import { currencyString } from "utils/helperFunctions/numbers";

import { ILCPayments } from "types/payments";
import { AccountTransactionRow } from "types/ui/accounting";
import { makeLCPaymentRows } from "utils/accounting";
import useAuth from "hooks/useAuth";

interface SimpleFoliosTableProps {
  lcPayments?: ILCPayments[];
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

const SimpleFoliosTable: React.FC<SimpleFoliosTableProps> = ({
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
}) => {
  const { currentTimeZone } = useAuth();
  const columns: GridColDef<AccountTransactionRow>[] = [
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
  ];
  let tableRows = makeLCPaymentRows(lcPayments ?? [], currentTimeZone);
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
        pageSizeOptions={[5, 10, 25, 50, 100]}
        rowSelectionModel={selectedIds}
        onRowSelectionModelChange={onRowSelected}
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

export default SimpleFoliosTable;
