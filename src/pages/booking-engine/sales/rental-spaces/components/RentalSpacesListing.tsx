import React, { useEffect, useState } from "react";
import {
  Box,
  IconButton,
  Tooltip,
  Typography,
  Switch,
  Chip,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import SearchInput from "components/elements/SearchInput/SearchInput";
import { useGetRoomListQuery } from "services/roomSlice";
import { CommonPagination } from "utils/FilterComponent";
import PrimaryButton from "components/elements/Button/PrimaryButton";

const RentalSpacesListing: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading] = useState(false);
  const { data: eventSpaces } = useGetRoomListQuery(
    {
      offset: 0,
      property_id: 1,
      room_type_rental_type: "EVENT_SPACE",
    },
    { skip: false, refetchOnMountOrArgChange: true }
  );

  useEffect(() => {
    if (eventSpaces) {
      console.log("Rental spaces API data:", eventSpaces);
    }
  }, [eventSpaces]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Use API data only
  const dataSource = eventSpaces && eventSpaces.length > 0 ? eventSpaces : [];

  // Show only parent rooms from API (child rooms have a non-null parent_room_id)
  const parentOnlyData = (dataSource as any[]).filter(
    (space: any) => space?.parent_room_id == null
  );

  const filteredSpaces = parentOnlyData.filter((space: any) => {
    const haystack = `${space.name} ${space.description}`.toLowerCase();
    return haystack.includes(searchQuery);
  });

  const handleEdit = (id: number) => {
    console.log("Edit rental space:", id);
    // TODO: Navigate to edit page
  };

  const handleDelete = (id: number) => {
    console.log("Delete rental space:", id);
    // TODO: Implement delete functionality
  };

  const handleToggleStatus = (id: number, currentStatus: boolean) => {
    console.log(
      "Toggle status for rental space:",
      id,
      "Current:",
      currentStatus
    );
    // TODO: Implement status toggle
  };

  const columns: GridColDef<any>[] = [
    {
      field: "name",
      headerName: "Name",
      width: 200,
      sortable: true,
    },
    {
      field: "rates",
      headerName: "Daily Base Rate / Hourly Base Rate",
      width: 320,
      sortable: false,
      renderCell: (params) => {
        // For API data, rates are not yet available; show "-".
        const dailyRates = [
          params.row.dailyBaseRate,
          params.row.dailyRate1,
          params.row.dailyRate2,
          params.row.dailyRate3,
          params.row.dailyRate4,
        ].filter((rate: number | undefined) => rate && rate > 0);

        const dailyRateText =
          dailyRates.length > 0 ? `$${dailyRates.join(" / $")}` : "-";

        const hourlyRateText =
          typeof params.row.hourlyBaseRate === "number" &&
          params.row.hourlyBaseRate > 0
            ? `$${params.row.hourlyBaseRate}`
            : "-";

        if (dailyRateText === "-" && hourlyRateText === "-") {
          return (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
              }}
            >
              -
            </Box>
          );
        }

        return (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
              {dailyRateText}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {hourlyRateText}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: "sqft",
      headerName: "SqFt / Break out SqFt",
      width: 200,
      sortable: false,
      renderCell: (params) => {
        // Prefer API field size_area like "1000 Sqft" or child sections.
        const sizeArea = params.row.size_area as string | null | undefined;
        const sqFtText =
          sizeArea && String(sizeArea).trim() !== "" ? sizeArea : "-";
        const childAreas: string[] = (params.row.child_rooms || [])
          .map((c: any) => c?.size_area)
          .filter((s: string | null | undefined) => !!s) as string[];

        const allSqFt = [sqFtText, ...childAreas];

        if (sqFtText === "-" && childAreas.length === 0) {
          return (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
              }}
            >
              -
            </Box>
          );
        }

        return (
          <Typography
            variant="body2"
            sx={{
              whiteSpace: "normal",
              wordWrap: "break-word",
              lineHeight: 1.4,
            }}
          >
            {allSqFt.join(" / ")}
          </Typography>
        );
      },
    },
    {
      field: "description",
      headerName: "Description",
      width: 350,
      sortable: false,
      renderCell: (params) =>
        params.row.description ? (
          <Typography
            variant="body2"
            sx={{
              whiteSpace: "normal",
              wordWrap: "break-word",
              lineHeight: 1.4,
            }}
          >
            {params.row.description}
          </Typography>
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
            }}
          >
            -
          </Box>
        ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 170,
      sortable: true,
      renderCell: (params) => {
        const isAvailable = true;
        // (params.row.status ?? "").toLowerCase() === "available" ||
        // params.row.isActive === true;
        const label = isAvailable ? "Available" : "Unavailable";
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Chip
              label={label}
              size="small"
              variant="outlined"
              sx={{
                bgcolor: isAvailable ? "#E8F5E9" : "#F5F5F5",
                color: isAvailable ? "#2E7D32" : "#6b6b6b",
                borderColor: isAvailable ? "#C8E6C9" : "#E0E0E0",
                fontWeight: 600,
              }}
            />
            <Switch
              checked={isAvailable}
              onChange={() => handleToggleStatus(params.row.id, isAvailable)}
              size="small"
              color="default"
              sx={{
                "& .MuiSwitch-switchBase.Mui-checked": {
                  color: "#424242",
                },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                  backgroundColor: "#9e9e9e",
                },
              }}
            />
          </Box>
        );
      },
    },
    {
      field: "actions",
      headerName: "Action",
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => handleEdit(params.row.id)}
              color="primary"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={() => handleDelete(params.row.id)}
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ width: "100%", p: 2 }}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        gap={2}
        mb={2}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <SearchInput
            onSearch={(query) => setSearchQuery(query.toLowerCase())}
            size="small"
          />
        </Box>
        <Box>
          <PrimaryButton
            label="ADD RENTAL SPACE"
            type="button"
            onClick={() =>
              navigate("/booking-engine/sales/rental-spaces/create")
            }
          />
        </Box>
      </Box>
      <DataGrid
        getRowId={(row) => row.id}
        rows={filteredSpaces as any}
        columns={columns}
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
        }}
        autoHeight={true}
        getRowHeight={() => "auto"}
        loading={isLoading}
        pageSizeOptions={[5, 10, 25, 50]}
        checkboxSelection={false}
        slots={{
          pagination: CommonPagination,
        }}
        sx={{
          "& .MuiDataGrid-columnHeaders": {
            fontWeight: "bold",
            fontSize: 17,
            backgroundColor: "#f5f5f5",
          },
          "& .MuiDataGrid-cell": {
            padding: "8px",
            alignItems: "start",
            whiteSpace: "normal",
          },
          "& .MuiDataGrid-row": {
            minHeight: 60,
          },
        }}
      />

      <Box
        sx={{
          mt: 2,
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Typography variant="body2" color="textSecondary">
          Rows per page: 10
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Page 1 of 1 — Total Records: {filteredSpaces.length}
        </Typography>
      </Box>
    </Box>
  );
};

export default RentalSpacesListing;
