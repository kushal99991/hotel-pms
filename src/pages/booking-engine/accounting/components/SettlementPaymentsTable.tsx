import React from "react";
import { DataGrid, GridColDef, GridRowSelectionModel } from "@mui/x-data-grid";
import { SxProps } from "@mui/material/styles";
import { currencyString } from "utils/helperFunctions/numbers";
import { IPaymentMethodResponse } from "types/reservationTypes";
import { AccountTransactionRow } from "types/ui/accounting";
import { makeDBPaymentsRows } from "utils/accounting";
import useAuth from "hooks/useAuth";
import { IPaymentResponse } from "types/payments";
import { apiAmountToNumber } from "utils/dataFormats";

interface SettlementPaymentsTableProps {
  payments?: IPaymentResponse[];
  methods?: IPaymentMethodResponse[];
  selectedIds?: number[];
  onRowSelected?: (updatedRows: GridRowSelectionModel) => void;
  allowCheckboxSelect?: boolean;
  hideTableFooter?: boolean;
  noHeaderActions?: boolean;
  sxProps?: SxProps;
  headerHeight?: number;
  rowHeight?: number;
}

const SettlementPaymentsTable: React.FC<SettlementPaymentsTableProps> = ({
  payments,
  methods,
  selectedIds,
  allowCheckboxSelect,
  onRowSelected,
  hideTableFooter,
  noHeaderActions,
  sxProps,
  headerHeight,
  rowHeight,
}) => {
  const { currentTimeZone } = useAuth();
  const columns: GridColDef<AccountTransactionRow>[] = [
    {
      field: "paymentId",
      headerName: "Id",
      align: "center",
      headerAlign: "center",
      disableColumnMenu: noHeaderActions,
      sortable: !noHeaderActions,
    },
    {
      field: "detail",
      headerName: "Detail",
      flex: 2,
      disableColumnMenu: noHeaderActions,
      sortable: !noHeaderActions,
    },
    {
      field: "credit",
      headerName: "Credit",
      align: "right",
      headerAlign: "center",
      flex: 1,
      renderCell: (params) => {
        if (params.row.payment?.amount == null) {
          return "$ -";
        }
        return currencyString(apiAmountToNumber(params.row.payment?.amount));
      },
      disableColumnMenu: noHeaderActions,
      sortable: !noHeaderActions,
    },
    {
      field: "additionalDetail",
      headerName: "Credit Applied",
      align: "right",
      headerAlign: "center",
      flex: 1,
      renderCell: (params) => {
        if (params.row.payment?.remaining_amount == null) {
          return "$ -";
        }
        const amount =
          apiAmountToNumber(params.row.payment?.amount) -
          apiAmountToNumber(params.row.payment?.remaining_amount);
        return currencyString(amount);
      },
      disableColumnMenu: noHeaderActions,
      sortable: !noHeaderActions,
    },
    {
      field: "payment",
      headerName: "Credit Remaining",
      align: "right",
      headerAlign: "center",
      flex: 1,
      renderCell: (params) => {
        if (params.row.payment?.remaining_amount == null) {
          return "$ -";
        }
        return currencyString(
          apiAmountToNumber(params.row.payment.remaining_amount)
        );
      },
      disableColumnMenu: noHeaderActions,
      sortable: !noHeaderActions,
    },
    {
      field: "invoice",
      headerName: "Invoice #",
      align: "center",
      headerAlign: "center",
      disableColumnMenu: noHeaderActions,
      sortable: !noHeaderActions,
    },
    {
      field: "datePosted",
      headerName: "Date Posted",
      align: "center",
      headerAlign: "center",
      flex: 1,
      disableColumnMenu: noHeaderActions,
      sortable: !noHeaderActions,
    },
  ];
  const tableRows = makeDBPaymentsRows(
    payments ?? [],
    methods ?? [],
    currentTimeZone,
    true
  );
  return (
    <DataGrid
      rows={tableRows}
      columns={columns}
      rowHeight={rowHeight}
      columnHeaderHeight={headerHeight}
      getRowId={(row) => row.folioId ?? row.paymentId ?? row.detail}
      checkboxSelection={allowCheckboxSelect}
      autoHeight
      pageSizeOptions={[5, 10, 25, 50, 100]}
      rowSelectionModel={selectedIds}
      onRowSelectionModelChange={onRowSelected}
      hideFooter={hideTableFooter}
      initialState={{
        sorting: {
          sortModel: [
            {
              field: "credit",
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
        "& .MuiDataGrid-cell:focus": {
          outline: "none",
        },

        "& .MuiDataGrid-cell:focus-within": {
          outline: "none",
        },
        ...sxProps,
      }}
    />
  );
};

export default SettlementPaymentsTable;
