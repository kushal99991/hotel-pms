import React, { useEffect } from "react";
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import { Box, Grid, IconButton, Link, Tooltip, Switch } from "@mui/material";
import RuleIcon from "@mui/icons-material/Rule";
import useAuth from "hooks/useAuth";
import {
  useGetRatePlansMutation,
  useUpdateRatePlanStatusMutation,
} from "services/roomRateSlice";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import { useNavigate } from "react-router-dom";
import { IRatePlanResponse } from "types/roomRateTypes";
import { formatToDisplayDate } from "utils/helperFunctions/dateFormat";
import ConfirmationDialog from "components/elements/ConfirmationDialog/ConfirmationDialog";
import { useState } from "react";
import { CommonPagination } from "utils/FilterComponent";

const RatePlanList: React.FC = () => {
  const { users } = useAuth();
  const navigate = useNavigate();

  const [getRatePlans, { data: ratePlans = [] }] = useGetRatePlansMutation();
  const [updateRatePlanStatus] = useUpdateRatePlanStatusMutation();

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<IRatePlanResponse | null>(
    null
  );
  const [targetStatus, setTargetStatus] = useState<boolean | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    getRatePlans({ property_id: users?.defaultPropertyId ?? 1 });
  }, [users?.defaultPropertyId]);

  const columns: GridColDef<IRatePlanResponse>[] = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "description", headerName: "Description", flex: 1.2 },
    {
      field: "start_date",
      headerName: "Start Date",
      flex: 0.8,
      valueGetter: (_, raw) =>
        raw.start_date ? formatToDisplayDate(new Date(raw.start_date)) : "",
    },
    {
      field: "end_date",
      headerName: "End Date",
      flex: 0.8,
      valueGetter: (_, raw) =>
        raw.end_date ? formatToDisplayDate(new Date(raw.end_date)) : "",
    },
    {
      field: "rules",
      headerName: "Rules",
      flex: 1.7,
      sortable: false,
      renderCell: (params) => {
        const { typed_rules } = params.row;

        const formatKey = (key: string) => {
          return key
            .replace(/_/g, " ") // Remove underscores
            .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter
        };

        const formatValue = (value: any) => {
          if (typeof value === "boolean") return value ? "Yes" : "No";
          return value;
        };

        const ruleStrings = Object.entries(typed_rules || []).map(
          ([key, value]) => `${formatKey(key)}: ${formatValue(value)}`
        );

        const displayRules = ruleStrings.slice(0, 3).join(", ");
        const hasMore = ruleStrings.length > 3;
        const displayText = hasMore ? `${displayRules}, ...` : displayRules;

        return (
          <Tooltip title={ruleStrings.join(", ")} arrow>
            <span
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {displayText}
            </span>
          </Tooltip>
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      //   align: "center",
      flex: 0.5,
      display: "flex",
      renderCell: (params) => {
        const plan = params.row;
        const handleToggleClick = () => {
          setSelectedPlan(plan);
          setTargetStatus(!(plan?.active ?? false));
          setErrorMessage("");
          setOpenDialog(true);
        };

        return (
          <>
            <Tooltip title="Manage Rules">
              <Link
                href={`/booking-engine/revenue-management/rate-plan/${params.id}`}
              >
                <IconButton color="secondary" size="small">
                  <RuleIcon />
                </IconButton>
              </Link>
            </Tooltip>
            <Tooltip title={(plan?.active ? "Active" : "InActive") as string}>
              <Switch
                checked={plan?.active ?? false}
                onChange={handleToggleClick}
                color="success"
                inputProps={{ "aria-label": "status toggle" }}
                sx={{ ml: 1 }}
              />
            </Tooltip>
          </>
        );
      },
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
      <Grid container justifyContent="flex-end">
        <Grid mb={2} item>
          <PrimaryButton
            buttonStyles={{
              backgroundColor: "#32A1AE",
              color: "#FFFFFF",
              fontWeight: "bold",
            }}
            onClick={() =>
              navigate("/booking-engine/revenue-management/rate-plan/create")
            }
            label="Create Rate Plan"
          />
        </Grid>
      </Grid>
      <DataGrid
        disableRowSelectionOnClick
        getRowId={(row) => row.id}
        rows={ratePlans || []}
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
          "& .MuiDataGrid-cell:focus": {
            outline: "none",
          },

          "& .MuiDataGrid-cell:focus-within": {
            outline: "none",
          },
        }}
      />
      <ConfirmationDialog
        open={openDialog}
        title={targetStatus ? "Confirm Activation" : "Confirm Deactivation"}
        description={
          <>
            {`Are you sure you want to ${targetStatus ? "activate" : "inactivate"} this rate plan?`}
            {errorMessage ? (
              <div style={{ color: "#d32f2f", marginTop: 8 }}>
                {errorMessage}
              </div>
            ) : null}
          </>
        }
        buttons={[
          {
            label: "No",
            onClick: () => {
              setOpenDialog(false);
              setSelectedPlan(null);
              setTargetStatus(null);
              setIsUpdating(false);
              setErrorMessage("");
            },
          },
          {
            label: isUpdating ? "Loading..." : "Yes",
            variant: "contained",
            color: "secondary",
            onClick: async () => {
              if (!selectedPlan || targetStatus === null) return;
              setIsUpdating(true);
              const response: any = await updateRatePlanStatus({
                id: selectedPlan.id,
                active: targetStatus,
              });
              if (response?.error) {
                setErrorMessage(
                  response?.error?.message ||
                    "Failed to update rate plan status"
                );
                setIsUpdating(false);
                return;
              }
              try {
                await getRatePlans({
                  property_id: users?.defaultPropertyId ?? 1,
                });
              } finally {
                setIsUpdating(false);
                setOpenDialog(false);
                setSelectedPlan(null);
                setTargetStatus(null);
                setErrorMessage("");
              }
            },
          },
        ]}
        onClose={() => {
          setOpenDialog(false);
          setSelectedPlan(null);
          setTargetStatus(null);
          setIsUpdating(false);
          setErrorMessage("");
        }}
      />
    </Box>
  );
};

export default RatePlanList;
