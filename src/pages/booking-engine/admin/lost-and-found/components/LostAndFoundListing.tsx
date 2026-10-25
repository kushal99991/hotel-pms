import {
  Button,
  Box,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Alert,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Dayjs } from "dayjs";
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import ArchiveIcon from "@mui/icons-material/Archive";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import CustomDropdown from "components/widgets/CustomDropdown/CustomDropdown";
import {
  ILostAndFoundItem,
  LostAndFoundStatusEnum,
} from "types/lostAndFoundTypes";
import { formatToDisplayDate } from "utils/helperFunctions/dateFormat";
import { truncateStr } from "utils/helperFunctions/strings";
import {
  useGetLostItemsQuery,
  useUpdateLostItemMutation,
} from "services/houseKeeperSlice";
import ConfirmationDialog from "components/elements/ConfirmationDialog/ConfirmationDialog";
import useAuth from "hooks/useAuth";
import { CommonPagination } from "utils/FilterComponent";

type LocalFilters = {
  status: LostAndFoundStatusEnum | "ALL";
  searchTerm: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
};

const LostAndFoundListing: React.FC = () => {
  const Navigate = useNavigate();
  const { users } = useAuth();
  const defaultFilters: LocalFilters = {
    status: "ALL",
    searchTerm: "",
    startDate: null,
    endDate: null,
  };
  const [filters, setFilters] = useState<LocalFilters>(defaultFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<LocalFilters>(defaultFilters);

  // Fetch lost items from API
  const queryArgs = useMemo(
    () => ({
      property_id: users?.defaultPropertyId || 1,
      status:
        appliedFilters.status === "ALL" ? undefined : appliedFilters.status,
      // mapped to API optional params
      datetime_found: appliedFilters.endDate
        ? appliedFilters.endDate.format("YYYY-MM-DD")
        : undefined,
      return_date: appliedFilters.startDate
        ? appliedFilters.startDate.format("YYYY-MM-DD")
        : undefined,
      search_text: appliedFilters.searchTerm || undefined,
    }),
    [users?.defaultPropertyId, appliedFilters]
  );

  const {
    data: lostItems,
    isLoading,
    error,
    refetch,
  } = useGetLostItemsQuery(queryArgs, { refetchOnMountOrArgChange: true });

  const [archiveTargetId, setArchiveTargetId] = useState<number | null>(null);
  const [updateLostItem, { isLoading: isArchiving }] =
    useUpdateLostItemMutation();

  const statusOptions = [
    { value: "ALL", label: "All" },
    { value: LostAndFoundStatusEnum.PENDING, label: "Pending" },
    { value: LostAndFoundStatusEnum.RETURNED, label: "Returned" },
    { value: LostAndFoundStatusEnum.ARCHIVED, label: "Archived" },
  ];

  // Backend-managed search and filters; rows come directly from API

  const getStatusColor = (status: LostAndFoundStatusEnum) => {
    switch (status) {
      case LostAndFoundStatusEnum.PENDING:
        return "warning";
      case LostAndFoundStatusEnum.RETURNED:
        return "success";
      case LostAndFoundStatusEnum.ARCHIVED:
        return "default";
      default:
        return "default";
    }
  };

  const columns: GridColDef<ILostAndFoundItem>[] = [
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      headerAlign: "center",
      align: "center",
      sortable: false,
      filterable: false,

      renderCell: (params) => (
        <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() =>
                Navigate(
                  `/booking-engine/rooms/lost-and-found/edit/${params.row.id}`
                )
              }
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip
            title={
              params.row.status === LostAndFoundStatusEnum.ARCHIVED
                ? "Archived"
                : "Archive"
            }
          >
            <span>
              <IconButton
                size="small"
                disabled={params.row.status === LostAndFoundStatusEnum.ARCHIVED}
                onClick={() => {
                  if (params.row.status !== LostAndFoundStatusEnum.ARCHIVED) {
                    setArchiveTargetId(params.row.id);
                  }
                }}
              >
                <ArchiveIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.row.status}
          color={getStatusColor(params.row.status)}
          size="small"
        />
      ),
    },
    {
      field: "guest_room_number",
      headerName: "Room No",
      width: 100,
      valueGetter: (_, row) => row.guest_room_number || "N/A",
    },
    {
      field: "guest_name",
      headerName: "Guest Name",
      width: 160,
      valueGetter: (_, row) => row.guest_name || "N/A",
    },
    {
      field: "folio_no",
      headerName: "Folio No.",
      width: 130,
      valueGetter: (_, row) => row.reservation?.id?.toString() || "N/A",
    },

    {
      field: "datetime_found",
      headerName: "Date Found",
      width: 140,
      valueGetter: (_, row) =>
        row.datetime_found
          ? formatToDisplayDate(new Date(row.datetime_found))
          : "",
    },
    {
      field: "found_by_name",
      headerName: "Found By",
      width: 150,
      valueGetter: (_, row) => row.found_by_name || "N/A",
    },
    {
      field: "user",
      headerName: "Logged By",
      width: 200,
      valueGetter: (_, row) =>
        `${row.user?.first_name || ""} ${row.user?.last_name || ""}`.trim() ||
        "N/A",
    },
    {
      field: "location_found",
      headerName: "Location Found",
      width: 150,
      valueGetter: (_, row) => row.location_found,
    },
    {
      field: "item_name",
      headerName: "Item Found",
      width: 140,
      valueGetter: (_, row) => row.item_name || "N/A",
    },
    {
      field: "item_description",
      headerName: "Description",
      width: 200,
      valueGetter: (_, row) => truncateStr(row.item_description, 50),
    },
    {
      field: "item_value_over_100",
      headerName: "Est value over $100",
      width: 180,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%",
          }}
        >
          {params.row.item_value_over_100 ? (
            <CheckCircleIcon color="success" />
          ) : (
            <Box sx={{ width: 24, height: 24 }} />
          )}
        </Box>
      ),
    },
    {
      field: "returned_by_user",
      headerName: "Returned By",
      width: 200,
      valueGetter: (_, row) =>
        `${row.returned_by?.first_name || ""} ${row.returned_by?.last_name || ""}`.trim() ||
        "N/A",
    },
    {
      field: "guest_contacted",
      headerName: "Guest Contacted",
      width: 140,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%",
          }}
        >
          {params.row.guest_contacted ? (
            <CheckCircleIcon color="success" />
          ) : (
            <Box sx={{ width: 24, height: 24 }} />
          )}
        </Box>
      ),
    },
    {
      field: "return_date",
      headerName: "Released to Founder Date",
      width: 190,
      valueGetter: (_, row) =>
        row.return_date ? formatToDisplayDate(new Date(row.return_date)) : "",
    },
  ];

  return (
    <Box sx={{ width: "100%" }}>
      <ConfirmationDialog
        open={archiveTargetId !== null}
        title="Confirm Archive"
        description="Are you sure you want to archive this item?"
        onClose={() => setArchiveTargetId(null)}
        buttons={[
          { label: "No", onClick: () => setArchiveTargetId(null) },
          {
            label: isArchiving ? "Archiving..." : "Yes",
            onClick: async () => {
              if (!archiveTargetId) return;
              try {
                // Find the current item to preserve its data
                const currentItem = lostItems?.find(
                  (item) => item.id === archiveTargetId
                );
                if (!currentItem) return;

                await updateLostItem({
                  id: archiveTargetId,
                  status: LostAndFoundStatusEnum.ARCHIVED,
                } as any);
                refetch();
              } finally {
                setArchiveTargetId(null);
              }
            },
          },
        ]}
      />
      {/* Header Row 1: Add Button (right aligned) */}
      <Box display="flex" alignItems="center" justifyContent="flex-end" mb={2}>
        <PrimaryButton
          buttonStyles={{
            backgroundColor: "#32A1AE",
            color: "#FFFFFF",
            fontWeight: "bold",
          }}
          onClick={() => {
            Navigate("/booking-engine/rooms/lost-and-found/create");
          }}
          label="Add Lost & Found Item"
        />
      </Box>

      {/* Header Row 2: Search (left) and Filters (right) */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={3}
        gap={2}
      >
        {/* Left: Global Search */}
        <Box display="flex" alignItems="center">
          <TextField
            size="small"
            placeholder="Search items, guests, rooms..."
            value={filters.searchTerm}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, searchTerm: e.target.value }))
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{
              minWidth: 300,
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#f8f9fa",
              },
            }}
          />
        </Box>

        {/* Right: Filters */}
        <Box display="flex" alignItems="center" gap={2}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Found Date"
              value={filters.endDate}
              onChange={(date) =>
                setFilters((prev) => ({ ...prev, endDate: date }))
              }
              format="YYYY-MM-DD"
              slotProps={{
                textField: {
                  size: "small",
                  sx: {
                    minWidth: 130,
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#f8f9fa",
                    },
                  },
                },
              }}
            />
          </LocalizationProvider>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Return Date"
              value={filters.startDate}
              onChange={(date) =>
                setFilters((prev) => ({ ...prev, startDate: date }))
              }
              format="YYYY-MM-DD"
              slotProps={{
                textField: {
                  size: "small",
                  sx: {
                    minWidth: 130,
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#f8f9fa",
                    },
                  },
                },
              }}
            />
          </LocalizationProvider>

          <CustomDropdown
            label=""
            placeholder="Filter by Status"
            options={statusOptions}
            onChange={(event) => {
              setFilters((prev) => ({
                ...prev,
                status: event.target.value as LostAndFoundStatusEnum | "ALL",
              }));
            }}
            value={filters.status}
            isInvalid={false}
            fullWidth={false}
            aria-label="Item Status"
            size="small"
            sx={{
              minWidth: 150,
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#f8f9fa",
              },
              // Ensure consistent height with DatePicker input
              "& .MuiInputBase-root": {
                height: "40px !important",
              },
            }}
          />

          <Button
            variant="contained"
            onClick={() => {
              setAppliedFilters(filters);
            }}
          >
            Apply
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setFilters(defaultFilters);
              setAppliedFilters(defaultFilters);
            }}
          >
            Reset
          </Button>
        </Box>
      </Box>

      {error && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="error">
            Failed to load lost & found items. Please try again.
          </Alert>
        </Box>
      )}

      <DataGrid
        getRowId={(row) => row.id}
        rows={lostItems || []}
        columns={columns}
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
        }}
        slots={{ pagination: CommonPagination }}
        autoHeight={true}
        loading={isLoading}
        pageSizeOptions={[5, 10, 25, 50]}
        checkboxSelection={false}
      />
    </Box>
  );
};

export default LostAndFoundListing;
