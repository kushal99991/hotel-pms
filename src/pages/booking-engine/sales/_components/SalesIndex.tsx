import React, { useEffect, useState } from "react";
import {
  DataGrid,
  GridColDef,
  GridRowParams,
  GridToolbarContainer,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import { Box, Typography, IconButton, Tooltip, Link } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { useSalesAccountsQuery } from "services/salesSlice";
import { ISalesContract } from "types/salesTypes";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import { useNavigate } from "react-router-dom";
import { CommonPagination } from "utils/FilterComponent";
import useAuth from "hooks/useAuth";

export default function SalesIndex() {
  const navigate = useNavigate();
  const { users } = useAuth();
  const [pagination, setPagination] = useState({ page: 0, pageSize: 100 });

  const {
    isLoading,
    data: rows,
    refetch,
  } = useSalesAccountsQuery({
    property_id: users?.defaultPropertyId ?? 0,
  });

  useEffect(() => {
    refetch();
  }, [refetch]);
  const columns: GridColDef<ISalesContract>[] = [
    { field: "id", headerName: "ID", minWidth: 100 },
    {
      field: "first_name",
      headerName: "First Name",
      minWidth: 150,
    },
    {
      field: "last_name",
      headerName: "Last Name",
      minWidth: 150,
    },
    {
      field: "phone",
      headerName: "Phone",
      minWidth: 150,
      renderCell: (params) =>
        `${params.row.phone_extension ?? ""} ${params.row.phone ?? ""}`,
    },
    {
      field: "cell_phone",
      headerName: "Cell Phone",
      minWidth: 150,
    },
    {
      field: "billing_name",
      headerName: "Billing Name",
      minWidth: 200,
    },
    {
      field: "billing_email",
      headerName: "Billing Email",
      minWidth: 250,
    },
    {
      field: "billing_phone",
      headerName: "Billing Phone",
      minWidth: 180,
      renderCell: (params) =>
        `${params.row.billing_phone_ext ?? ""} ${params.row.billing_phone ?? ""}`,
    },
    {
      field: "address",
      headerName: "Billing Address",
      minWidth: 320,
      flex: 1,
      renderCell: (params) => {
        const billingFull = [
          params.row.billing_address,
          params.row.billing_city,
          params.row.billing_state,
          params.row.billing_zip,
          params.row.billing_country,
        ]
          .filter(Boolean)
          .join(", ");

        const generalFull = [params.row.address, params.row.country]
          .filter(Boolean)
          .join(", ");

        // Prefer billing address if available, fallback to general
        return billingFull || generalFull || "-";
      },
    },
    {
      field: "email",
      headerName: "Email",
      minWidth: 200,
    },
    {
      field: "role",
      headerName: "Role",
      minWidth: 120,
    },
    {
      field: "notes",
      headerName: "Notes",
      minWidth: 250,
    },
    {
      field: "actions",
      headerName: "",
      minWidth: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Link href={`/booking-engine/sales/contact/edit/${params.row.id}`}>
          <Tooltip title="Edit">
            <IconButton aria-label="edit" color="primary">
              <EditIcon />
            </IconButton>
          </Tooltip>
        </Link>
      ),
    },
  ];

  function handleRowClick(params: GridRowParams, event: React.MouseEvent) {
    if (
      event.target instanceof HTMLElement &&
      (event.target.closest("a") || event.target.closest("button"))
    ) {
      return;
    }
    navigate(`/booking-engine/sales/contact/edit/${params.row.id}`);
  }

  const CustomToolbar = () => (
    <GridToolbarContainer sx={{ p: 2 }}>
      <GridToolbarFilterButton />
      <Box sx={{ flexGrow: 1 }} />
      <PrimaryButton
        label="Create Sales Contact"
        onClick={() => navigate("/booking-engine/sales/contact/create")}
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
      <Typography variant="h4" mb={2}>
        Sales Contacts
      </Typography>
      <DataGrid
        getRowId={(row) => row.id}
        rows={rows ?? []}
        loading={isLoading}
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
        pageSizeOptions={[5, 10, 25, 50, 100]}
        autoHeight
        checkboxSelection={false}
        onRowClick={handleRowClick}
        sx={{
          "& .MuiDataGrid-cell:focus": { outline: "none" },
          "& .MuiDataGrid-cell:focus-within": { outline: "none" },
          "& .MuiDataGrid-row:hover": {
            cursor: "pointer",
          },
        }}
      />
    </Box>
  );
}
