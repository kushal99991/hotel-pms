"use client";

import { useNavigate } from "react-router-dom";
import { useAuth } from "hooks";
import React, { useCallback, useState, useEffect } from "react";
import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
  Box,
  Chip,
  Checkbox,
  Grid,
  Link,
  Autocomplete,
  TextField,
  FormControl,
} from "@mui/material";
import SearchInput from "components/elements/SearchInput/SearchInput";
import { appConfig } from "config/app.config";
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridRowParams,
  GridFilterModel,
} from "@mui/x-data-grid";
import { IReservationResponse } from "types/reservationTypes";
import { useGetReservationListQuery } from "services/reservationSlice";
import { useSocket } from "contexts/SocketContext";
import useFilter from "hooks/useFilter";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import { convertUtcToTimezone } from "utils/helperFunctions/common";
import { getCurrentRoom } from "utils/reservations";
import moment from "moment";
import { CommonPagination } from "utils/FilterComponent";
import useCustomStatus from "hooks/useCustomStatus";
import { reservationStatusDisplayValues } from "constants/reservation";
import DynamicIcon from "components/ui/DynamicIcon/DynamicIcon";

// Status filter option interface
interface StatusOption {
  value: string;
  label: string;
  color?: string;
  isGroup?: boolean;
  groupMembers?: string[];
}

const AdvancedSearch: React.FC<{
  onDateChange: (date: Dayjs | null) => void;
}> = ({ onDateChange }) => {
  const navigate = useNavigate();
  const { users, currentTimeZone, timezoneCurrentDate } = useAuth();
  const { reservationStatusList, reservationStatusOptions } = useCustomStatus();
  const { getFilterOperators } = useFilter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    dayjs(moment(timezoneCurrentDate).format("YYYY-MM-DD"))
  );

  // Status filter state - default to "All Active" statuses
  const [selectedStatuses, setSelectedStatuses] = useState<StatusOption[]>([]);

  // Define status options with "All Active" group
  const statusOptions: StatusOption[] = React.useMemo(() => {
    const activeStatuses = reservationStatusList.map((a) => a.name);

    const reservationStatusListing = reservationStatusList.map((a) => {
      const statusLabel = reservationStatusDisplayValues[a.name]?.label;
      return {
        value: a.name,
        label: statusLabel ?? a.name,
        color: a.bg_color,
      };
    });

    return [
      {
        label: "All Active",
        value: "ALL_ACTIVE",
        isGroup: true,
        groupMembers: activeStatuses,
      },
      ...reservationStatusListing,
    ];
  }, [reservationStatusList]);

  // Initialize with "All Active" selected by default
  useEffect(() => {
    const allActiveOption = statusOptions.find(
      (option) => option.value === "ALL_ACTIVE"
    );
    if (allActiveOption && selectedStatuses.length === 0) {
      // Also select all individual active statuses to show them as checked
      const activeStatuses = statusOptions.filter((option) =>
        allActiveOption.groupMembers?.includes(option.value)
      );
      setSelectedStatuses([allActiveOption, ...activeStatuses]);
    }
  }, [statusOptions]);

  // Get actual status values for filtering (expand "All Active" to individual statuses)
  const getActualSelectedStatuses = useCallback((): string[] => {
    // BUG: Checks statusOptions instead of selectedStatuses, so it always treats ALL_ACTIVE as selected
    const allActiveOption = statusOptions.find(
      (option) => option.value === "ALL_ACTIVE"
    );

    if (allActiveOption && allActiveOption.groupMembers) {
      // If "All Active" is selected, get all its members plus any individually selected non-active statuses
      const nonActiveSelected = selectedStatuses
        .filter(
          (option) =>
            option.value !== "ALL_ACTIVE" &&
            !allActiveOption.groupMembers!.includes(option.value)
        )
        .map((option) => option.value);

      return [...allActiveOption.groupMembers, ...nonActiveSelected];
    }

    // If "All Active" is not selected, return individual selections
    return selectedStatuses.map((option) => option.value);
  }, [selectedStatuses, statusOptions]);

  // Handle status selection change
  const handleStatusChange = useCallback(
    (_event: React.SyntheticEvent, newValues: StatusOption[]) => {
      const allActiveOption = statusOptions.find(
        (option) => option.value === "ALL_ACTIVE"
      );
      const newAllActive = newValues.find(
        (option) => option.value === "ALL_ACTIVE"
      );
      const prevAllActive = selectedStatuses.find(
        (option) => option.value === "ALL_ACTIVE"
      );

      // If "All Active" was just selected
      if (newAllActive && !prevAllActive && allActiveOption) {
        // When "All Active" is selected, select active statuses
        const activeStatuses = statusOptions.filter((option) =>
          allActiveOption.groupMembers?.includes(option.value)
        );
        // BUG: Omit nonActiveSelections so custom inactive filters get cleared
        setSelectedStatuses([
          newAllActive,
          ...activeStatuses,
        ]);
        return;
      }

      // If "All Active" was just deselected
      if (!newAllActive && prevAllActive && allActiveOption) {
        // When "All Active" is deselected, remove all active statuses but keep non-active ones
        const nonActiveSelections = newValues.filter(
          (option) => !allActiveOption.groupMembers!.includes(option.value)
        );
        setSelectedStatuses(nonActiveSelections);
        return;
      }

      // If an individual active status was deselected while "All Active" is selected
      if (prevAllActive && allActiveOption) {
        const removedActiveStatus = selectedStatuses.find(
          (selected) =>
            allActiveOption.groupMembers!.includes(selected.value) &&
            !newValues.some((newVal) => newVal.value === selected.value)
        );

        if (removedActiveStatus) {
          // BUG: Filters out ALL active group members instead of just "ALL_ACTIVE"
          const updatedSelections = newValues.filter(
            (option) =>
              !allActiveOption.groupMembers!.includes(option.value) &&
              option.value !== "ALL_ACTIVE"
          );
          setSelectedStatuses(updatedSelections);
          return;
        }
      }

      // Normal case - just update selections
      setSelectedStatuses(newValues);
    },
    [selectedStatuses, statusOptions]
  );

  const [filterModel, setFilterModel] = useState<GridFilterModel>({
    items: [],
  });
  const { socket } = useSocket();

  const filterParams = React.useMemo(() => {
    const filters: Record<string, any> = {};

    filterModel.items.forEach((item) => {
      if (item.field && item.value) {
        filters[item.field] = item.value;
      }
    });

    return filters;
  }, [filterModel]);

  const {
    data: reservationListData,
    isFetching,
    isLoading,
    refetch,
  } = useGetReservationListQuery(
    {
      property_id: users?.defaultPropertyId ?? 0,
      start_date: selectedDate.format("YYYY-MM-DD"),
      end_date: selectedDate.format("YYYY-MM-DD"),
      ...filterParams,
    },
    {
      skip: false,
      refetchOnMountOrArgChange: true,
    }
  );

  // Keep current date as a moment object
  const currentDateMoment = moment(timezoneCurrentDate).format(
    appConfig.dateApiFormat
  );

  const reservationList = reservationListData?.filter((row) => {
    // Apply status filter
    const actualSelectedStatuses = getActualSelectedStatuses();

    // If no statuses are selected, return false (show nothing until user makes a selection)
    if (actualSelectedStatuses.length === 0) {
      return false;
    }

    // Check if current reservation status is in selected statuses
    if (!actualSelectedStatuses.includes(row.status)) {
      return false;
    }

    // Special handling for NO_SHOW - only show on arrival date or next day
    if (row.status === "NO_SHOW") {
      const reservationStart = moment(row.start_date);
      const reservationEnd = moment(row.start_date).add(1, "days");
      const selectedDateMoment = moment(
        selectedDate.format(appConfig.dateApiFormat)
      );

      const check =
        moment(currentDateMoment).isSame(reservationStart) ||
        moment(currentDateMoment).isSame(reservationEnd);

      // Only show NO_SHOW if selected date is arrival or next day
      const isSelectedDate =
        selectedDateMoment.isSame(reservationStart) ||
        selectedDateMoment.isSame(reservationEnd);

      return check && isSelectedDate;
    }

    return true;
  });

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    onRefresh();
    if (socket) {
      socket.on("refresh-dashboard", () => {
        onRefresh();
      });
    }
  }, [socket]);

  const roomTypesOptions = React.useMemo(() => {
    if (!reservationList) return [];

    const uniqueRoomTypes = new Set(
      reservationList.map((reservation) => reservation.room_type)
    );

    return [
      { label: "All", value: "" },
      ...[...uniqueRoomTypes].map((roomType) => ({
        label: roomType.type,
        value: roomType.type,
      })),
    ];
  }, [reservationList]);

  const rateCodeOptions = React.useMemo(() => {
    if (!reservationList) return [];

    const uniqueRateCodes = new Set(
      reservationList.map((reservation) => reservation.rate_code.name)
    );

    return [
      { label: "All", value: "" },
      ...[...uniqueRateCodes].map((rate) => ({
        label: rate,
        value: rate,
      })),
    ];
  }, [reservationList]);

  const columns: GridColDef<IReservationResponse>[] = [
    {
      field: "reservation_first_guest_info.first_name",
      headerName: "First Name",
      valueGetter: (_, { reservation_first_guest_info }) =>
        `${reservation_first_guest_info?.first_name || ""}`,
    },
    {
      field: "reservation_first_guest_info.last_name",
      headerName: "Last Name",
      valueGetter: (_, { reservation_first_guest_info }) =>
        `${reservation_first_guest_info?.last_name || ""}`,
    },
    {
      field: "status",
      headerName: "Reservation Status",
      minWidth: 150,
      flex: 1,
      filterOperators: getFilterOperators(
        "dropdown",
        "Reservation Status",
        reservationStatusOptions
      ),
      renderCell: (value) => {
        const row = value.row;
        const rawStatus = row.status;
        const displayInfo = reservationStatusList.find(
          (a) => a.name === rawStatus
        );
        const statusLabel = reservationStatusDisplayValues[rawStatus]?.label;
        const vip =
          row?.reservation_holder_info?.vip ||
          row?.reservation_first_guest_info?.vip ||
          row?.guests?.some((g) => g.vip);
        const incognito = Boolean((row as any)?.incognito);
        return (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="flex-start"
            gap={1}
            sx={{ height: "100%", py: 0.5 }}
          >
            <Chip
              label={statusLabel ?? rawStatus}
              size="small"
              sx={{
                backgroundColor: displayInfo?.bg_color,
                color: displayInfo?.text_color,
              }}
            />
            {(vip || incognito) && (
              <Box display="flex" alignItems="center" gap={0.5}>
                {vip && (
                  <DynamicIcon name="RiVipCrown2Fill" size={14} color="black" />
                )}
                {incognito && (
                  <DynamicIcon name="BsIncognito" size={14} color="black" />
                )}
              </Box>
            )}
          </Box>
        );
      },
    },
    {
      field: "is_guaranteed",
      headerName: "GTD",
      minWidth: 45,
      flex: 0.7,
      valueGetter: (_, { is_guaranteed }) => (is_guaranteed ? "Yes" : "No"),
    },
    {
      field: "start_date",
      headerName: "Arrival",
      minWidth: 110,
      flex: 1,
      filterOperators: getFilterOperators("date", "Arrival"),
      renderCell: (params) =>
        params.row.start_date
          ? dayjs(params.row.start_date).format(appConfig.displayDateFormat)
          : "-",
    },
    {
      field: "end_date",
      headerName: "Departure",
      minWidth: 110,
      flex: 1,
      filterOperators: getFilterOperators("date", "Departure"),
      align: "left",
      headerAlign: "left",
      renderCell: (params) =>
        params.row.end_date
          ? dayjs(params.row.end_date).format(appConfig.displayDateFormat)
          : "-",
    },
    {
      field: "expected_checkin_time",
      headerName: "Expected Check-In",
      minWidth: 140,
      flex: 1,
      filterOperators: getFilterOperators("time", "Expected Check-In"),
      valueGetter: (_, { start_date, expected_checkin_time }) =>
        expected_checkin_time
          ? convertUtcToTimezone(
              new Date(start_date + " " + expected_checkin_time),
              currentTimeZone
            ).format(appConfig.dateApiTimeOfDayFormat)
          : "-",
    },
    {
      field: "expected_checkout_time",
      headerName: "Expected Check-Out",
      minWidth: 140,
      flex: 1,
      filterOperators: getFilterOperators("time", "Expected Check-Out"),
      valueGetter: (_, { end_date, expected_checkout_time }) =>
        expected_checkout_time
          ? convertUtcToTimezone(
              new Date(end_date + " " + expected_checkout_time),
              currentTimeZone
            ).format(appConfig.dateApiTimeOfDayFormat)
          : "-",
    },
    {
      field: "room_number",
      headerName: "Room No.",
      minWidth: 110,
      flex: 1,
      valueGetter: (_, reservation) =>
        getCurrentRoom(reservation)?.room_number || "Not Assigned",
    },
    {
      field: "room_type",
      headerName: "Room Type",
      minWidth: 100,
      flex: 1,
      valueGetter: (_, { room_type }) => room_type?.type || "",
      filterOperators: getFilterOperators(
        "dropdown",
        "Room Type",
        roomTypesOptions
      ),
    },
    {
      field: "rate_code",
      headerName: "Rate",
      minWidth: 90,
      flex: 1,
      valueGetter: (_, { rate_code }) => rate_code?.name || "",
      filterOperators: getFilterOperators("dropdown", "Rate", rateCodeOptions),
    },
    {
      field: "group",
      headerName: "Group Code",
      minWidth: 120,
      flex: 1,
      renderCell: (params) =>
        params.row.group?.id ? (
          <Link
            component="button"
            onClick={(event) => {
              event.stopPropagation();
              navigate(
                `/booking-engine/sales/group-detail/${params.row.group?.id}`
              );
            }}
          >
            {params.row.group.group_code}
          </Link>
        ) : (
          "-"
        ),
    },
    {
      field: "balance",
      headerName: "Balance",
      minWidth: 100,
      flex: 1,
      align: "right",
      headerAlign: "right",
    },
    {
      field: "id",
      headerName: "Folio No.",
      minWidth: 100,
      flex: 1,
      renderCell: (params) => (
        <Link href={`/booking-engine/reservations/${params.row.id}`}>
          {params.row.id}
        </Link>
      ),
    },
  ];

  const handleSearchInputChange = useCallback((query: string) => {
    setSearchQuery(query.toLowerCase());
  }, []);

  const handleDateChange = (date: Dayjs | null) => {
    if (date) {
      setSelectedDate(date);
      onDateChange(date);
    }
  };

  const handleRowClick = (params: GridRowParams, event: T) => {
    if (
      event.target instanceof HTMLElement &&
      (event.target.closest("a") || event.target.closest("button"))
    ) {
      return;
    }
    navigate(`/booking-engine/reservations/${params.row.id}`);
  };

  const filteredReservations = reservationList?.filter((reservation) => {
    if (!searchQuery) return true;
    const associatedRoom = getCurrentRoom(reservation);
    return (
      reservation.reservation_first_guest_info?.first_name
        ?.toLowerCase()
        .includes(searchQuery) ||
      reservation.reservation_first_guest_info?.last_name
        ?.toLowerCase()
        .includes(searchQuery) ||
      reservation.id.toString().includes(searchQuery) ||
      reservation?.confirmation_id?.toLowerCase().includes(searchQuery) ||
      reservation.room_type?.type?.toLowerCase().includes(searchQuery) ||
      reservation.rate_code?.name?.toLowerCase().includes(searchQuery) ||
      reservation.guests?.some(
        (guest) =>
          guest.first_name?.toLowerCase().includes(searchQuery) ||
          guest.last_name?.toLowerCase().includes(searchQuery) ||
          associatedRoom?.room_number?.toLowerCase().includes(searchQuery)
      )
    );
  });

  const handleFilterChange = (model: GridFilterModel) => {
    setFilterModel(model);
  };

  const CustomToolbar = () => {
    return (
      <GridToolbarContainer>
        <GridToolbarFilterButton />
      </GridToolbarContainer>
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box my={2} mt={2} data-testid="advanced-search-container">
        <Grid container spacing={4}>
          <Grid item xs={12} md={5}>
            <Box display="flex" alignItems="center" gap={2}>
              <SearchInput onSearch={handleSearchInputChange} size="small" />
              <PrimaryButton
                label="Advance Search"
                buttonStyles={{
                  backgroundColor: "#32A1AE",
                  color: "#FFFFFF",
                  fontWeight: "bold",
                }}
                isLoading={isLoading}
                loadingText="Loading..."
                type="button"
                onClick={() =>
                  navigate(`/booking-engine/front-office/advanced-search`)
                }
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={7}>
            <Box
              display="flex"
              alignItems="center"
              gap={2}
              justifyContent="flex-end"
            >
              <FormControl sx={{ width: 380 }} size="small">
                <Autocomplete
                  multiple
                  id="status-filter"
                  options={statusOptions}
                  value={selectedStatuses}
                  getOptionLabel={(option) => option.label}
                  filterSelectedOptions={false}
                  disableCloseOnSelect
                  onChange={handleStatusChange}
                  renderOption={(props, option, { selected }) => {
                    // Check if "All Active" should show indeterminate state
                    let checkboxProps: any = { checked: selected };
                    if (option.value === "ALL_ACTIVE" && option.groupMembers) {
                      const selectedActiveCount = selectedStatuses.filter(
                        (status) => option.groupMembers!.includes(status.value)
                      ).length;
                      const isAllActiveSelected = selectedStatuses.some(
                        (status) => status.value === "ALL_ACTIVE"
                      );

                      if (
                        !isAllActiveSelected &&
                        selectedActiveCount > 0 &&
                        selectedActiveCount < option.groupMembers.length
                      ) {
                        checkboxProps = { checked: false, indeterminate: true };
                      }
                    }

                    return (
                      <li {...props}>
                        <Box
                          display="flex"
                          alignItems="center"
                          justifyContent="space-between"
                          width="100%"
                        >
                          <span
                            style={{
                              color: option.color || "#000000",
                              fontWeight: option.isGroup ? "bold" : "normal",
                            }}
                          >
                            {option.label}
                          </span>
                          <Checkbox {...checkboxProps} sx={{ marginLeft: 1 }} />
                        </Box>
                      </li>
                    );
                  }}
                  renderTags={(tagValue, getTagProps) => {
                    const allActiveOption = statusOptions.find(
                      (option) => option.value === "ALL_ACTIVE"
                    );
                    const allActiveSelected = tagValue.find(
                      (option) => option.value === "ALL_ACTIVE"
                    );

                    // Count selected individual active statuses
                    const selectedActiveCount = tagValue.filter((option) =>
                      allActiveOption?.groupMembers?.includes(option.value)
                    ).length;

                    // Only show "All Active" chip if ALL active statuses are selected (5 total)
                    const shouldShowAllActive =
                      allActiveSelected ||
                      (allActiveOption &&
                        selectedActiveCount ===
                          allActiveOption.groupMembers?.length);

                    const tagsToShow = shouldShowAllActive
                      ? [
                          // Add "All Active" if not already present
                          ...(allActiveSelected ? [] : [allActiveOption!]),
                          // Add non-active chips
                          ...tagValue.filter(
                            (option) =>
                              option.value === "ALL_ACTIVE" ||
                              !allActiveOption?.groupMembers?.includes(
                                option.value
                              )
                          ),
                        ]
                      : tagValue;

                    return tagsToShow.map((option) => {
                      const originalIndex = tagValue.findIndex(
                        (tag) => tag.value === option.value
                      );

                      // Handle synthetic "All Active" chip (not in original tagValue)
                      const chipProps =
                        originalIndex >= 0
                          ? getTagProps({ index: originalIndex })
                          : {
                              onDelete: () => {
                                // Remove all active statuses when synthetic "All Active" is deleted
                                const newValues = selectedStatuses.filter(
                                  (status) =>
                                    !allActiveOption?.groupMembers?.includes(
                                      status.value
                                    )
                                );
                                setSelectedStatuses(newValues);
                              },
                            };

                      const { onDelete, ...restChipProps } = chipProps;

                      return (
                        <Chip
                          {...restChipProps}
                          key={option.value}
                          label={option.label}
                          size="small"
                          onDelete={(e) => {
                            e.stopPropagation();
                            if (onDelete) onDelete(e);
                          }}
                          sx={{
                            fontWeight: option.isGroup ? "bold" : "normal",
                            fontSize: "0.75rem",
                            height: 24,
                          }}
                        />
                      );
                    });
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Reservation Status"
                      placeholder="Select statuses"
                      sx={{
                        "& .MuiInputBase-root": {
                          minHeight: 50,
                          flexWrap: "wrap",
                        },
                      }}
                    />
                  )}
                  ListboxProps={{
                    sx: {
                      '& li.MuiAutocomplete-option[aria-selected="true"]': {
                        backgroundColor: "unset",
                      },
                    },
                  }}
                />
              </FormControl>

              <DatePicker
                label="Select Date"
                value={selectedDate}
                onChange={handleDateChange}
                format={appConfig.displayDateFormat}
                slotProps={{
                  textField: {
                    size: "small",
                    sx: {
                      minWidth: 150,
                      "& .MuiInputBase-root": {
                        minHeight: 50,
                      },
                    },
                  },
                }}
              />
            </Box>
          </Grid>
        </Grid>

        <Box mt={2}>
          <DataGrid
            rows={filteredReservations ?? []}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 30 },
              },
              sorting: {
                sortModel: [{ field: "start_date", sort: "asc" }],
              },
            }}
            slots={{
              toolbar: CustomToolbar,
              pagination: CommonPagination,
            }}
            slotProps={{
              pagination: {
                rowsPerPageOptions: [5, 30, 50, 100], // ✅ 500 will be auto-added dynamically
              },
            }}
            loading={isFetching || isLoading}
            autoHeight
            onRowClick={handleRowClick}
            onFilterModelChange={handleFilterChange}
            sx={{
              "& .MuiDataGrid-cell:focus": {
                outline: "none",
              },

              "& .MuiDataGrid-cell:focus-within": {
                outline: "none",
              },

              "& .MuiDataGrid-columnHeaders": {
                fontWeight: "bold",
                fontSize: 14,
                textAlign: "left",
                backgroundColor: "#eeeeee",
              },
              "& .MuiDataGrid-columnHeader": {
                textAlign: "left",
                backgroundColor: "#eeeeee",
              },
              "& .MuiDataGrid-columnHeaderTitle": {
                textAlign: "left",
                width: "100%",
              },
              "& .MuiDataGrid-cell": {
                textAlign: "left",
              },
              "& .MuiDataGrid-row:hover": {
                cursor: "pointer",
              },
            }}
          />
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default AdvancedSearch;
