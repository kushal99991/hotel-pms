import React, { useEffect } from "react";
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import { Box, Grid, IconButton, Link, Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import useAuth from "hooks/useAuth";
import { IRateCodeListResponse } from "types/roomRateTypes";
import { useGetRatesRateCodeMutation } from "services/roomRateSlice";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import { useNavigate } from "react-router-dom";
import { CommonPagination } from "utils/FilterComponent";

const RateCodes: React.FC = () => {
  const { users } = useAuth();
  const Navigate = useNavigate();

  const [getRatesRateCode, { data: roomRateCode }] =
    useGetRatesRateCodeMutation();

  useEffect(() => {
    getRatesRateCode({ property_id: users?.defaultPropertyId ?? 1 });
  }, [users?.defaultPropertyId]);

  // Static data for now

  const columns: GridColDef<IRateCodeListResponse>[] = [
    { field: "name", headerName: "Code", flex: 0.7, minWidth: 100 },
    {
      field: "description",
      headerName: "Description",
      flex: 2.4,
      minWidth: 200,
    },
    { field: "type", headerName: "Type", flex: 0.7, minWidth: 90 },
    {
      field: "rate_plan",
      headerName: "Rate Plan",
      flex: 0.7,
      minWidth: 100,
      valueGetter: (_, raw) => raw?.rate_plan?.name ?? "",
    },
    {
      field: "parent_rate_code_id",
      headerName: "Parent Rate Code",
      flex: 0.9,
      minWidth: 150,
      valueGetter: (_, raw) =>
        roomRateCode?.filter(
          (rate) => rate.id == Number(raw?.parent_rate_code_id)
        )?.[0]?.name ?? "",
    },
    {
      field: "active",
      headerName: "Active",
      flex: 0.9,
      minWidth: 150,
      valueGetter: (_, raw) => (raw.active ? "Activated" : "Deactivated"),
    },
    {
      field: "actions",
      headerName: "Action",
      flex: 0.5,
      minWidth: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <>
          <Link
            href={`/booking-engine/revenue-management/rate-code/${params.id}`}
          >
            <Tooltip title="Edit">
              <IconButton color="primary">
                <EditIcon />
              </IconButton>
            </Tooltip>
          </Link>
        </>
      ),
    },
  ];

  const CustomToolbar = () => {
    return (
      <GridToolbarContainer>
        <GridToolbarFilterButton />
      </GridToolbarContainer>
    );
  };

  return (
    <Box sx={{ height: "80vh", width: "100%", padding: 3 }}>
      <Grid container justifyContent="flex-end" alignItems="center">
        <Grid mb={2} item>
          <PrimaryButton
            buttonStyles={{
              backgroundColor: "#32A1AE",
              color: "#FFFFFF",
              fontWeight: "bold",
            }}
            onClick={() =>
              Navigate("/booking-engine/revenue-management/rate-code/create")
            }
            label="Create Rate Code"
          />
        </Grid>
      </Grid>
      <DataGrid
        getRowId={(row) => row.id}
        rows={roomRateCode}
        columns={columns}
        initialState={{
          pagination: { paginationModel: { pageSize: 100 } },
        }}
        autoHeight={true}
        pageSizeOptions={[5, 10, 25, 50, 100]}
        checkboxSelection={false}
        slots={{
          toolbar: CustomToolbar,
          pagination: CommonPagination,
        }}
        sx={{
          "& .MuiDataGrid-columnHeaders": {
            fontWeight: "bold",
            fontSize: 17,
          },
        }}
      />
    </Box>
  );
};

export default RateCodes;
