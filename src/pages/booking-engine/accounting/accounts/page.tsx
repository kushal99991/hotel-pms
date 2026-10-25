import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DataGrid,
  GridRowParams,
  GridColDef,
  GridToolbarContainer,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import { Box, IconButton, Tooltip } from "@mui/material";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import { useNavigate } from "react-router-dom";
import { useLazyGetDirectBillingAccountQuery } from "services/paymentsSlice";
import useAuth from "hooks/useAuth";
import { IDirectBillingAccountResponse } from "types/payments";
import { CommonPagination } from "utils/FilterComponent";

export default function Account() {
  const navigate = useNavigate();
  const { users } = useAuth();
  const [pagination, setPagination] = useState({ page: 0, pageSize: 100 });

  const [getDirectBillingAccount, { isLoading, data: rows }] =
    useLazyGetDirectBillingAccountQuery();

  useEffect(() => {
    if (users?.defaultPropertyId) {
      onRefresh();
    }
  }, [users?.defaultPropertyId, pagination.pageSize, pagination.page]);

  const handleRowClick = (params: GridRowParams) => {
    navigate(`/booking-engine/accounting/account/${params.row.id}`);
  };

  const onRefresh = useCallback(() => {
    if (users?.defaultPropertyId) {
      getDirectBillingAccount({
        property_id: users.defaultPropertyId,
      });
    }
  }, [users?.defaultPropertyId]);

  const columns = useMemo(() => {
    const baseColumns: GridColDef<IDirectBillingAccountResponse>[] = [
      {
        field: "id",
        headerName: "ID",
        minWidth: 80,
        flex: 1,
      },
      {
        field: "billing_name",
        headerName: "Account Name",
        minWidth: 200,
        flex: 2,
      },
      {
        field: "billing_email",
        headerName: "Email",
        minWidth: 220,
        flex: 2,
      },
      {
        field: "billing_phone",
        headerName: "Phone",
        minWidth: 150,
        flex: 2,
      },
      {
        field: "billing_address",
        headerName: "Address",
        minWidth: 250,
        flex: 2,
      },
      {
        field: "billing_city",
        headerName: "City",
        minWidth: 120,
        flex: 1,
      },
      {
        field: "billing_state",
        headerName: "State",
        minWidth: 100,
        flex: 1,
      },
      {
        field: "credit_limit",
        headerName: "Credit Limit",
        minWidth: 140,
        flex: 1,
      },
      {
        field: "actions",
        headerName: "Actions",
        sortable: false,
        filterable: false,
        minWidth: 120,
        renderCell: (params) => (
          <Box display="flex" gap={1} height="100%" alignItems="center">
            <Tooltip title="View Details">
              <IconButton
                onClick={(evt) => {
                  evt.stopPropagation();
                  navigate(
                    `/booking-engine/accounting/account/${params.row.id}`
                  );
                }}
                sx={{ height: "fit-content" }}
              >
                <VisibilityIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit Account">
              <IconButton
                onClick={(evt) => {
                  evt.stopPropagation();
                  navigate(
                    `/booking-engine/accounting/account/${params.row.id}/edit`
                  );
                }}
                sx={{ height: "fit-content" }}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
    ];

    return baseColumns;
  }, [navigate]);

  const CustomToolbar = () => (
    <GridToolbarContainer>
      <GridToolbarFilterButton />
      <Box sx={{ flexGrow: 1 }} />
      <PrimaryButton
        label="Create Account"
        onClick={() => navigate("/booking-engine/accounting/create-account")}
        buttonStyles={{
          backgroundColor: "#32A1AE",
          color: "#FFFFFF",
          fontWeight: "bold",
        }}
      />
    </GridToolbarContainer>
  );

  return (
    <Box sx={{ height: "90vh", width: "100%" }}>
      <DataGrid
        getRowId={(row) => row.id}
        rows={rows ?? []}
        loading={isLoading}
        onRowClick={handleRowClick}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: pagination.pageSize,
              page: pagination.page,
            },
          },
        }}
        onPaginationModelChange={(model) =>
          setPagination({ page: model.page, pageSize: model.pageSize })
        }
        slots={{ toolbar: CustomToolbar, pagination: CommonPagination }}
        autoHeight
        checkboxSelection={false}
        sx={{
          "& .MuiDataGrid-cell:focus": {
            outline: "none",
          },

          "& .MuiDataGrid-cell:focus-within": {
            outline: "none",
          },

          "& .MuiDataGrid-row:hover": {
            cursor: "pointer",
          },
        }}
      />
    </Box>
  );
}
