import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  useTheme,
  IconButton,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridRowParams,
  GridToolbarContainer,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PermIdentityIcon from "@mui/icons-material/PermIdentity";
import { IAccountReceivables } from "types/accountTypes";
import { useLazyGetAccountReceivablesQuery } from "services/accountingSlice";
import { useNavigate } from "react-router-dom";
import { CommonPagination } from "utils/FilterComponent";

export default function ArAccounts() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [showZeroBalance, setShowZeroBalance] = useState(false);

  const [getARList, { data: arList }] = useLazyGetAccountReceivablesQuery();

  useEffect(() => {
    getARList();
  }, []);

  const handleRowClick = (params: GridRowParams) => {
    const isDirectBill = !!params.row.direct_billing_account_id;
    const isReservation = !!params.row.reservation_id;
    if (isDirectBill) {
      navigate(
        `/booking-engine/accounting/account/${params.row.direct_billing_account_id}`
      );
    } else if (isReservation) {
      navigate(`/booking-engine/reservations/${params.row.reservation_id}`);
    }
  };

  const columns: GridColDef<IAccountReceivables>[] = [
    {
      field: "id",
      headerName: "ID",
      minWidth: 70,
      renderCell: (params) => {
        const isDirectBill = !!params.row.direct_billing_account_id;
        const isReservation = !!params.row.reservation_id;
        if (isDirectBill) {
          return params.row.direct_billing_account_id;
        } else if (isReservation) {
          return params.row.reservation_id;
        }
        return params.row.id;
      },
    },
    {
      field: "direct_billing_account_id",
      headerName: "Account",
      flex: 1,
      minWidth: 100,
      renderCell: (params) => {
        const isDirectBill = !!params.row.direct_billing_account_id;
        const isReservation = !!params.row.reservation_id;
        if (isDirectBill) {
          return params.row?.direct_billing_account?.billing_name ?? "-";
        } else if (isReservation) {
          return `${params.row.reservation?.reservation_holder_info.last_name}, ${params.row.reservation?.reservation_holder_info.first_name}`;
        }
        return "";
      },
    },
    {
      field: "balance",
      headerName: "Overall Balance",
      flex: 1,
      minWidth: 100,
    },
    {
      field: "balance_30_0",
      headerName: "Current 0 - 30 Days",
      flex: 1,
      minWidth: 100,
    },
    {
      field: "balance_60_30",
      headerName: "31 - 60 Days",
      flex: 1,
      minWidth: 100,
    },
    {
      field: "balance_90_60",
      headerName: "61 - 90 Days",
      flex: 1,
      minWidth: 100,
    },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      filterable: false,
      minWidth: 120,
      flex: 1,
      renderCell: (params) => {
        const isDirectBill = !!params.row.direct_billing_account_id;
        const isReservation = !!params.row.reservation_id;
        return (
          <Box display="flex" gap={1} alignItems={"center"} height="100%">
            {isReservation && (
              <Tooltip
                title={isReservation ? "Go to Folios" : "Account Invoice"}
              >
                <IconButton
                  color="primary"
                  onClick={(evt) => {
                    evt.stopPropagation();
                    navigate(
                      `/booking-engine/reservations/folios/${params.row.reservation_id}`
                    );
                  }}
                >
                  <ReceiptIcon />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Account Info">
              <IconButton
                color="primary"
                onClick={(evt) => {
                  evt.stopPropagation();
                  if (isDirectBill) {
                    navigate(
                      `/booking-engine/accounting/account/${params.row.direct_billing_account_id}`
                    );
                  } else if (isReservation) {
                    navigate(
                      `/booking-engine/reservations/${params.row.reservation_id}`
                    );
                  }
                }}
              >
                <PermIdentityIcon />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  const CustomToolbar = () => (
    <GridToolbarContainer>
      <GridToolbarFilterButton />
      <Box sx={{ flexGrow: 1 }} />
    </GridToolbarContainer>
  );
  let rows = arList ?? [];
  if (!showZeroBalance) {
    rows = rows.filter((row) => +row.balance !== 0);
  }
  return (
    <Box>
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
      <Paper elevation={3}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row.id}
          onRowClick={handleRowClick}
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
          slotProps={{
            pagination: {
              rowsPerPageOptions: [5, 10, 25, 50, 100], // ✅ 500 will be auto-added dynamically
            },
          }}
          sx={{
            border: "none",
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: theme.palette.grey[200],
              fontWeight: "bold",
              fontSize: 13,
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: theme.palette.action.hover,
              cursor: "pointer",
            },
            "& .MuiDataGrid-cell": {
              fontSize: 13,
            },
            "& .MuiDataGrid-cell:focus": {
              outline: "none",
            },

            "& .MuiDataGrid-cell:focus-within": {
              outline: "none",
            },
          }}
        />
      </Paper>
    </Box>
  );
}
