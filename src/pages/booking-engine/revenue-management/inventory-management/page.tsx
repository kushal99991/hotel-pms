import { useState, useEffect, useRef } from "react";
import moment, { Moment } from "moment";
import {
  Alert,
  Box,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  CircularProgress,
  TableCellProps,
  Snackbar,
  Typography,
  Tooltip,
  styled,
  ButtonBase,
} from "@mui/material";
import { HelpOutline } from "@mui/icons-material";
import { lighten, useTheme } from "@mui/material/styles";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import useAuth from "hooks/useAuth";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import {
  useLazyGetInventoryQuery,
  useUpdateInventoryIntervalsMutation,
} from "services/inventorySlice";
import { useGetRoomTypeInventoryMutation } from "services/roomTypeSlice";
import { useGetRatesRateCodeMutation } from "services/roomRateSlice";
import { useGetRoomTypeByPropertyIdMutation } from "services/roomTypeSlice";
import { appConfig } from "config/app.config";
import { GetInventoryParams, InventoryItem } from "types/inventoryTypes";
import { LAYOUT_VALUES } from "constants/index";
import {
  getMoment,
  pluralValue,
  sortRateCodesByInheritance,
} from "utils/helperFunctions/common";
import InventoryAllocationDialog from "./components/InventoryAllocationDialog";
import { IRateCodeListResponse } from "types/roomRateTypes";
import { IRoomTypeInventory } from "types/roomTypes";

const topSectionHeight = 72;
const KEY_SEPARATOR = "_";

interface RoomTypeToAllocation {
  [room_type_id: string]: number | null | undefined;
}

interface AvailabilityData {
  available_count: number;
  allocated_per_rate: number;
  rawAllocationValues: RoomTypeToAllocation;
}

interface InventoryByDate {
  [date: string]: {
    [room_type_id: number]: number;
  };
}

interface AvailabilityPerDate {
  [date: string]: AvailabilityData;
}

interface RoomTypeData {
  values: AvailabilityPerDate;
  name: string;
  inventory: number;
}

interface InventoryTableData {
  [room_type_id: string]: RoomTypeData;
}

interface DirtyStateValue {
  value: string;
  isEditing: boolean;
  prevValue: string;
  originalValue: string;
}

interface DirtyStateData {
  [key: string]: DirtyStateValue;
}

interface MultiEditState {
  date: string;
  roomType: number;
}

interface StyledTableCellProps extends TableCellProps {
  isFirstColumn?: boolean;
  isHeader?: boolean;
  isToday?: boolean;
  isDirty?: boolean;
}

const StyledTableCell = styled(TableCell, {
  shouldForwardProp: (prop) =>
    prop !== "isFirstColumn" &&
    prop !== "isHeader" &&
    prop !== "isToday" &&
    prop !== "isDirty",
})<StyledTableCellProps>(
  ({ theme, isFirstColumn, isHeader, isToday, isDirty }) => ({
    ...(isFirstColumn && {
      position: "sticky",
      left: 0,
      backgroundColor: theme.palette.background.paper,
      zIndex: 3, // accounts for header where other header cells are z-index 2
      boxShadow: "2px 0px 3px rgba(0,0,0,0.1)",
    }),
    ...(isHeader && {
      backgroundColor: theme.palette.grey[200],
      fontWeight: "bold",
    }),
    ...(isToday && {
      backgroundColor: lighten(theme.palette.secondary.main, 0.7),
    }),
    ...(isDirty && {
      border: `1px solid ${theme.palette.warning.dark}`,
    }),
  })
);

const TooltipCellExample = styled(Box)(({ theme }) => ({
  height: "30px",
  width: "40px",
  background: theme.palette.background.default,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
}));

const InventoryManagement = () => {
  const theme = useTheme();
  const { users: currentUser, currentTimeZone } = useAuth();
  const todayMoment = getMoment(null, currentTimeZone);
  const currentPropId = currentUser?.defaultPropertyId;
  const [startDate, setStartDate] = useState(todayMoment);
  const [endDate, setEndDate] = useState(todayMoment.clone().add(14, "days"));
  const [selectedRateIds, setSelectedRateIds] = useState<number[]>([]);
  const [tableData, setTableData] = useState<InventoryTableData>({});
  const [dirtyData, setDirtyData] = useState<DirtyStateData>({});
  const [isDirty, setIsDirty] = useState(false);
  const tableRef = useRef<HTMLTableElement>(null);
  const [showScrollToToday, setShowScrollToToday] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [multiEditState, setMultiEditState] = useState<MultiEditState | null>(
    null
  );
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const [
    getRates,
    { data: rates, isLoading: isItemsLoading, error: itemsError },
  ] = useGetRatesRateCodeMutation();
  const [getRoomTypes, { data: roomTypes, isLoading: roomTypesLoading }] =
    useGetRoomTypeByPropertyIdMutation();
  const [updateInventory, { isLoading: isUpdating }] =
    useUpdateInventoryIntervalsMutation();
  const [
    getIntervals,
    {
      data: fetchedTableData,
      isLoading: intervalsLoading,
      error: getIntervalsError,
    },
  ] = useLazyGetInventoryQuery();
  const [
    getRoomTypeInventory,
    { data: roomTypeInventory, isLoading: roomTypeInvLoading },
  ] = useGetRoomTypeInventoryMutation();

  useEffect(() => {
    if (currentPropId && !intervalsLoading && !fetchedTableData) {
      fetchIntervals(currentPropId);
    }
  }, [currentPropId, intervalsLoading, fetchedTableData]);

  useEffect(() => {
    if (currentPropId && !roomTypeInvLoading && !roomTypeInventory) {
      fetchOverallInventory(currentPropId);
    }
  }, [currentPropId, intervalsLoading, fetchedTableData]);

  useEffect(() => {
    if (currentPropId && !roomTypesLoading && !roomTypes) {
      getRoomTypes({
        propertyId: currentPropId,
      });
    }
  }, [currentPropId, roomTypesLoading, roomTypes]);

  useEffect(() => {
    if (currentPropId && !roomTypeInventory && !roomTypeInvLoading) {
      getRoomTypes({
        propertyId: currentPropId,
      });
    }
  }, [currentPropId, roomTypesLoading, roomTypes]);

  useEffect(() => {
    if (currentPropId && !isItemsLoading && !rates) {
      getRates({
        property_id: currentPropId,
      });
    }
  }, [currentPropId, rates, isItemsLoading]);

  function fetchIntervals(
    propId: number,
    start?: Moment,
    end?: Moment,
    rateCodeIds?: number[]
  ) {
    const codes = rateCodeIds ?? selectedRateIds;
    const params: GetInventoryParams = {
      start_date: (start ?? startDate).format(appConfig.dateApiFormat),
      end_date: (end ?? endDate).format(appConfig.dateApiFormat),
      property_id: propId,
    };
    if (codes?.length) {
      params.rate_code_ids = codes.join(",");
    }
    getIntervals(params);
  }

  function fetchOverallInventory(propId: number, start?: Moment, end?: Moment) {
    const params = {
      startDate: (start ?? startDate).format(appConfig.dateApiFormat),
      endDate: (end ?? endDate).format(appConfig.dateApiFormat),
      propertyId: propId,
    };
    getRoomTypeInventory(params);
  }

  // Generate dates array for table headers
  const getDatesInRange = () => {
    const dates = [];
    let currentDate = moment(startDate);
    const end = moment(endDate);

    while (currentDate.isSameOrBefore(end)) {
      dates.push(moment(currentDate));
      currentDate = moment(currentDate).add(1, "days");
    }

    return dates;
  };

  const dates = getDatesInRange();

  function makeTableRows(): InventoryTableData {
    if (!fetchedTableData?.length) {
      return {};
    }
    const rowsObject: InventoryTableData = {};
    const overallInventoryData = roomTypeInventory ?? [];
    const inventoryByDate = overallInventoryData.reduce(
      (agg, item: IRoomTypeInventory) => {
        const { date, roomTypeId, availableCount } = item;

        if (!agg[date]) {
          agg[date] = {};
        }

        agg[date][roomTypeId] = availableCount;

        return agg;
      },
      {} as InventoryByDate
    );
    fetchedTableData.forEach((item: InventoryItem) => {
      const { room_type_id, date, block_count, rate_code_id } = item;
      const stringTypeId = room_type_id.toString();
      if (!rowsObject[stringTypeId]) {
        const fullRoomType = roomTypes?.find((rt) => rt.id === room_type_id);
        rowsObject[stringTypeId] = {
          values: {},
          name: fullRoomType!.type ?? `Type Id ${stringTypeId}`,
          inventory: fullRoomType!.inventory ?? 0,
        };
      }

      if (!rowsObject[stringTypeId].values[date]) {
        const availFromOverall = inventoryByDate[date][+stringTypeId];
        rowsObject[stringTypeId].values[date] = {
          available_count: availFromOverall ?? 0,
          allocated_per_rate: 0,
          rawAllocationValues: {},
        };
      }

      // const currentAmount =
      //   rowsObject[stringTypeId].values[date].available_count;
      // const allocatedFromItem =
      //   allocated_per_rate !== null ? allocated_per_rate! : 0;
      const currentAllocated =
        rowsObject[stringTypeId].values[date].allocated_per_rate;
      // rowsObject[stringTypeId].values[date].available_count = Math.max(
      //   (available_count + reserved_count),
      //   currentAmount
      // );
      if (block_count) {
        rowsObject[stringTypeId].values[date].allocated_per_rate =
          currentAllocated + block_count;
      }
      rowsObject[stringTypeId].values[date].rawAllocationValues[rate_code_id] =
        block_count;
    });
    return rowsObject;
  }

  useEffect(() => {
    if (intervalsLoading || roomTypesLoading || roomTypeInvLoading) {
      return;
    }
    if (
      fetchedTableData &&
      fetchedTableData.length > 0 &&
      roomTypes &&
      roomTypeInventory
    ) {
      setTableData(makeTableRows());
      setDirtyData({});
      setIsDirty(false);
    }
  }, [fetchedTableData, intervalsLoading, roomTypes, roomTypesLoading]);

  useEffect(() => {
    const checkIfTodayIsVisible = () => {
      if (!tableRef.current) return;

      const tableRect = tableRef.current.getBoundingClientRect();
      const todayColumn = tableRef.current.querySelector(".today-column");

      if (todayColumn) {
        const todayRect = todayColumn.getBoundingClientRect();
        setShowScrollToToday(
          todayRect.left < tableRect.left || todayRect.right > tableRect.right
        );
      }
    };

    checkIfTodayIsVisible();
    const tableContainer = tableRef.current?.parentElement;
    if (tableContainer) {
      tableContainer.addEventListener("scroll", checkIfTodayIsVisible);
      return () =>
        tableContainer.removeEventListener("scroll", checkIfTodayIsVisible);
    }
  }, [tableData, dates]);

  function getCellKey(typeKey: string, date: Moment) {
    const key = `${typeKey}${KEY_SEPARATOR}${date.format(appConfig.dateApiFormat)}`;
    return key;
  }

  const handleDateRangeChange = (
    newStartDate?: Moment,
    newEndDate?: Moment
  ) => {
    if (
      newStartDate &&
      newEndDate &&
      newEndDate.diff(newStartDate, "days") <= 30
    ) {
      setStartDate(newStartDate);
      setEndDate(newEndDate);
      fetchIntervals(
        currentPropId ?? -1,
        newStartDate,
        newEndDate,
        selectedRateIds
      );
      fetchOverallInventory(currentPropId ?? -1, newStartDate, newEndDate);
    }
  };

  function getNumChanges(stateDate: DirtyStateData) {
    const changes = Object.values(stateDate).filter((data) => {
      const editedVal = data.value;
      if (!data.value && !data.isEditing) {
        return false;
      }
      return editedVal !== data.originalValue;
    });
    return changes.length;
  }

  function handleMultiCellClick(roomTypeId: string, day: Moment) {
    setMultiEditState({
      date: day.format(appConfig.dateApiFormat),
      roomType: +roomTypeId,
    });
    setEditDialogOpen(true);
  }

  function handleCellClick(
    itemId: string,
    date: Moment,
    cellValue: string,
    cellData: AvailabilityData
  ) {
    if (selectedRateIds.length !== 1) {
      handleMultiCellClick(itemId, date);
      return;
    }
    const key = getCellKey(itemId, date);
    const newDirtyData = { ...dirtyData };
    const noValueFromData = Object.values(cellData.rawAllocationValues).every(
      (value) => value == null
    );
    const startValue = noValueFromData
      ? ""
      : cellData.allocated_per_rate.toString();
    if (!newDirtyData[key]) {
      newDirtyData[key] = {
        value: cellValue,
        isEditing: true,
        prevValue: startValue,
        originalValue: startValue,
      };
    } else {
      newDirtyData[key] = {
        ...newDirtyData[key],
        isEditing: true,
      };
    }
    setDirtyData(newDirtyData);
  }

  const handleCellChange = (itemId: string, date: Moment, value: string) => {
    const numVal = +value;
    if (Number.isNaN(numVal)) {
      return;
    }
    const key = getCellKey(itemId, date);
    if (!dirtyData[key]) {
      return;
    }
    const newDirtyData = {
      ...dirtyData,
      [key]: {
        ...dirtyData[key],
        value: value ? numVal.toString() : "",
      },
    };
    setDirtyData(newDirtyData);
    setIsDirty(!!getNumChanges(newDirtyData));
  };

  function handleCellBlur(itemId: string, date: Moment) {
    const key = getCellKey(itemId, date);
    const editedData = { ...dirtyData[key] };
    const previousValue = editedData.prevValue;
    const valueUpdated = editedData.value !== previousValue;
    const newDirtyData = { ...dirtyData };
    if (valueUpdated) {
      if (!editedData.value) {
        if (editedData.originalValue) {
          // blurred with nothing in input, since the original
          // was not empty string, revert to last value
          newDirtyData[key].value = editedData.prevValue;
        }
      }
      newDirtyData[key] = {
        ...newDirtyData[key],
        isEditing: false,
        prevValue: editedData.value || editedData.prevValue,
      };
    } else {
      delete newDirtyData[key];
    }
    setDirtyData(newDirtyData);
    setIsDirty(!!getNumChanges(newDirtyData));
  }

  const handleSaveChanges = async () => {
    setError("");
    const updates = Object.entries(dirtyData).map(([key, stateValue]) => {
      const [typeId, dateStr] = key.split(KEY_SEPARATOR);
      return {
        start_date: dateStr,
        end_date: dateStr,
        rate_code_id: selectedRateIds.length === 1 ? selectedRateIds[0] : -1,
        room_type_id: +typeId,
        available_count: +stateValue.value,
      };
    });
    const response = await updateInventory({ intervals: updates });
    if (!response.error) {
      setDirtyData({});
      setIsDirty(false);
      setSuccessMessage("Inventory Updated");
      fetchIntervals(currentPropId ?? -1);
    } else {
      setError(response.error as string);
    }
  };

  function handleUpdateSuccess() {
    setEditDialogOpen(false);
    setMultiEditState(null);
    setDirtyData({});
    setIsDirty(false);
    setSuccessMessage("Inventory Updated");
    fetchIntervals(currentPropId ?? -1);
  }

  function handleDialogClose() {
    setEditDialogOpen(false);
    setMultiEditState(null);
  }

  function handleRateClick(id?: number) {
    return () => {
      let updatedIds = [...selectedRateIds];
      if (id) {
        const clickedIdIdx = updatedIds.indexOf(id);
        if (clickedIdIdx > -1) {
          updatedIds.splice(clickedIdIdx, 1);
        } else {
          updatedIds = [...updatedIds, id];
        }
      } else {
        updatedIds = [];
      }
      // fetch all was clicked
      setSelectedRateIds(updatedIds);
      fetchIntervals(currentPropId ?? -1, startDate, endDate, updatedIds);
    };
  }

  const scrollToToday = () => {
    const todayColumn = tableRef?.current?.querySelector(".today-column");
    if (todayColumn) {
      todayColumn.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  };

  function sortRates(): IRateCodeListResponse[] {
    if (!rates) return [];
    return sortRateCodesByInheritance(rates);
  }

  function getCellDisplayValue(
    cellData: AvailabilityData,
    roomTypeKey: string,
    stateData: DirtyStateValue
  ) {
    if (!stateData?.value) {
      const initialRatesData = {
        noRatesAllocated: true,
        allocatedTotal: 0,
      };
      const ratesAllocationsData = Object.values(
        cellData?.rawAllocationValues ?? []
      ).reduce((agg, value) => {
        // purposeful double equals for any nullish value
        if (value == null) {
          return agg;
        }
        return {
          noRatesAllocated: false,
          allocatedTotal: agg.allocatedTotal + value,
        };
      }, initialRatesData);
      if (ratesAllocationsData.noRatesAllocated) {
        if (selectedRateIds.length !== 0) {
          return "--";
        }
        return cellData.available_count;
      }
      if (selectedRateIds.length === 0) {
        return cellData.available_count;
      }
      return cellData.allocated_per_rate;
    }
    return stateData.value;
  }

  function getCellInputValue(
    cellData: AvailabilityData,
    isEditing: boolean,
    stateData: DirtyStateValue
  ) {
    if (isEditing) {
      return stateData.value;
    }
    if (cellData.allocated_per_rate === 0 && selectedRateIds.length === 1) {
      const rawValue = Object.values(cellData.rawAllocationValues)[0];
      // deliberate double equals to pick up on all nullish values
      if (rawValue == null) {
        return "";
      }
    }
    return cellData.allocated_per_rate;
  }

  const checkIsToday = (date: Moment) => {
    return date.isSame(moment(), "day");
  };
  const sortedRates = sortRates();
  const numChanges = getNumChanges(dirtyData);
  return (
    <Box
      sx={{
        flexGrow: 1,
        height: `calc(100vh - (${LAYOUT_VALUES.APP_BAR_HEIGHT}px + ${LAYOUT_VALUES.MAIN_PADDING} + ${LAYOUT_VALUES.MAIN_HEADER_HEIGHT}px + ${LAYOUT_VALUES.MAIN_HEADER_MARGIN}))`,
        overflow: "hidden",
      }}
    >
      <Grid container sx={{ height: "100%" }}>
        <Grid
          item
          xs={3}
          sx={{
            height: "100%",
            paddingRight: 2,
          }}
        >
          <Paper elevation={0} sx={{ height: "100%" }}>
            <Typography
              variant="h6"
              sx={{ p: 2, height: `${topSectionHeight}px` }}
            >
              Booking Channel
            </Typography>

            {isItemsLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                <CircularProgress />
              </Box>
            ) : itemsError ? (
              <Typography color="error" sx={{ p: 2 }}>
                Error loading items
              </Typography>
            ) : (
              <List
                sx={{
                  overflow: "auto",
                  height: `calc(100% - ${topSectionHeight}px)`,
                }}
              >
                <ListItem
                  divider
                  sx={{
                    background: !selectedRateIds.length
                      ? "#0c8ce9"
                      : "transparent",
                    color: !selectedRateIds.length ? "white" : "black",
                    borderRadius: 1,
                    border: "1px solid #00bfff",
                    height: "72px",
                  }}
                >
                  <ButtonBase
                    onClick={handleRateClick()}
                    sx={{ width: "100%", textAlign: "left" }}
                  >
                    <ListItemText primary="Overall Inventory" />
                  </ButtonBase>
                </ListItem>

                {sortedRates.map((rateCode) => {
                  const isSelected = selectedRateIds.includes(rateCode.id);
                  const isDeactivated = rateCode.active === false;

                  const parentRateName = rateCode.parent_rate_code_id
                    ? (sortedRates.find(
                        (r) => r.id === Number(rateCode.parent_rate_code_id)
                      )?.name ?? "Unknown")
                    : null;

                  return (
                    <ListItem
                      key={rateCode.id}
                      divider
                      sx={{
                        background: isDeactivated
                          ? "#f5f5f5"
                          : isSelected
                            ? "#0c8ce9"
                            : "transparent",
                        color: isDeactivated
                          ? "grey.600"
                          : isSelected
                            ? "white"
                            : "black",
                        borderRadius: 1,
                        border: "1px solid #00bfff",
                        marginTop: "6px",
                        opacity: isDeactivated ? 0.7 : 1,
                        cursor: isDeactivated ? "not-allowed" : "pointer",
                      }}
                    >
                      <ButtonBase
                        onClick={
                          isDeactivated
                            ? undefined
                            : handleRateClick(rateCode.id)
                        }
                        sx={{
                          width: "100%",
                          alignItems: "flex-start",
                          cursor: isDeactivated ? "not-allowed" : "pointer",
                        }}
                      >
                        <ListItemText
                          primary={
                            <>
                              <Typography variant="body1" fontWeight="bold">
                                {rateCode.name}{" "}
                                {isDeactivated && (
                                  <Typography
                                    component="span"
                                    variant="caption"
                                    color="error"
                                    fontWeight="bold"
                                    sx={{ ml: 1 }}
                                  >
                                    (Deactivated)
                                  </Typography>
                                )}
                              </Typography>
                              {parentRateName && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  fontStyle="italic"
                                >
                                  inherits from {parentRateName}
                                </Typography>
                              )}
                            </>
                          }
                          secondary={rateCode.description}
                          sx={{
                            textAlign: "left",
                            "& .MuiListItemText-secondary": {
                              color: isSelected
                                ? "grey.200"
                                : "rgba(0, 0, 0, 0.6)",
                            },
                          }}
                        />
                      </ButtonBase>
                    </ListItem>
                  );
                })}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Main View - Table and Controls */}
        <Grid
          item
          xs={9}
          sx={{ height: "100%", display: "flex", flexDirection: "column" }}
        >
          {/* Controls Area */}
          <Box
            sx={{
              p: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              {showScrollToToday && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={scrollToToday}
                  sx={{ mr: 2 }}
                >
                  Scroll to Today
                </Button>
              )}
            </Box>

            <LocalizationProvider dateAdapter={AdapterMoment}>
              <Box sx={{ display: "flex", gap: 2 }}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(newDate) =>
                    handleDateRangeChange(newDate ?? undefined, endDate)
                  }
                  minDate={todayMoment}
                  slotProps={{
                    textField: {
                      size: "small",
                    },
                  }}
                />
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(newDate) =>
                    handleDateRangeChange(startDate, newDate ?? undefined)
                  }
                  minDate={startDate || todayMoment}
                  slotProps={{
                    textField: {
                      size: "small",
                    },
                  }}
                />
              </Box>
            </LocalizationProvider>
          </Box>

          {/* Table Area */}
          <Box sx={{ flexGrow: 1, overflow: "auto", position: "relative" }}>
            {intervalsLoading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                <CircularProgress />
              </Box>
            ) : getIntervalsError ? (
              <Typography color="error" sx={{ p: 3 }}>
                {`Error loading table data: ${getIntervalsError.toString()}`}
              </Typography>
            ) : (
              <TableContainer sx={{ maxHeight: "100%", overflow: "auto" }}>
                <Table
                  stickyHeader
                  ref={tableRef}
                  sx={{ minWidth: 650, borderSpacing: "0 8px" }}
                  component="table"
                >
                  <TableHead>
                    <TableRow>
                      <StyledTableCell
                        isFirstColumn
                        isHeader
                        sx={{ verticalAlign: "top" }}
                      >
                        <Tooltip
                          title={
                            <Box>
                              <Box>
                                Click on a cell to allocate room amounts per
                                rate code.
                                <Box mt={2}>
                                  The value on the left is the amount of
                                  allocated rooms for the selected rates. The
                                  value on the right is the total inventory on
                                  that day for that room type.
                                  <TooltipCellExample
                                    mt={0.5}
                                    display="flex"
                                    alignItems="baseline"
                                  >
                                    <Typography
                                      component="span"
                                      fontSize="0.8rem"
                                      color="black"
                                    >
                                      10
                                    </Typography>
                                    <Typography
                                      fontSize="0.7rem"
                                      color="grey.700"
                                      component="span"
                                      sx={{ pt: "1px" }}
                                    >
                                      /5
                                    </Typography>
                                  </TooltipCellExample>
                                </Box>
                                {selectedRateIds.length !== 0 && (
                                  <Box mt={1}>
                                    When &quot;--&quot; appears on the left, no
                                    specific allocation has been made for that
                                    room type
                                  </Box>
                                )}
                                {selectedRateIds.length === 1 && (
                                  <Typography
                                    fontSize="inherit"
                                    fontWeight="inherit"
                                    sx={{ mt: 2 }}
                                    component="div"
                                  >
                                    Cells with updated but unsaved values will
                                    have a red border on them{" "}
                                    <TooltipCellExample
                                      mt={0.5}
                                      sx={{
                                        border: `1px solid ${theme.palette.error.main}`,
                                      }}
                                    />
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          }
                        >
                          <HelpOutline
                            sx={{
                              fontSize: "1rem",
                              color: theme.palette.text.disabled,
                            }}
                          />
                        </Tooltip>
                      </StyledTableCell>

                      {dates.map((date) => (
                        <StyledTableCell
                          key={date.toString()}
                          align="center"
                          isHeader
                          className={checkIsToday(date) ? "today-column" : ""}
                        >
                          <div>{date.format("MMM/DD")}</div>
                          <div>{date.format("dddd")}</div>
                        </StyledTableCell>
                      ))}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {Object.keys(tableData).map((typeKey: string) => (
                      <TableRow key={`inventory-row-type_${typeKey}`}>
                        <StyledTableCell isFirstColumn isHeader>
                          {tableData[typeKey]!.name}
                          <span style={{ fontWeight: 400, margin: "0 4px" }}>
                            inv.
                          </span>
                          {tableData[typeKey]!.inventory}
                        </StyledTableCell>

                        {dates.map((date) => {
                          const dateStr = date.format("yyyy-MM-DD");
                          const dateKey = date.format(appConfig.dateApiFormat);
                          const cellKey = getCellKey(typeKey, date);
                          const cellData = tableData[typeKey]!.values?.[
                            dateKey
                          ] || { allocated_per_rate: 0, available_count: 0 };
                          const dirtyStateForCell = dirtyData[cellKey];
                          const isEditing = dirtyStateForCell?.isEditing;
                          const inputValue = getCellInputValue(
                            cellData,
                            isEditing,
                            dirtyStateForCell
                          );
                          const displayValue = getCellDisplayValue(
                            cellData,
                            typeKey,
                            dirtyStateForCell
                          );
                          let showDirtyBorder = false;
                          if (dirtyStateForCell) {
                            if (!dirtyStateForCell.isEditing) {
                              showDirtyBorder =
                                dirtyStateForCell.value !==
                                dirtyStateForCell.originalValue;
                            }
                          }
                          return (
                            <StyledTableCell
                              key={`inventory-cell-${typeKey}-${dateStr}`}
                              align="center"
                              isToday={checkIsToday(date)}
                              className={
                                checkIsToday(date) ? "today-column" : ""
                              }
                              isDirty={showDirtyBorder}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  cursor: "pointer",
                                }}
                                onClick={() => {
                                  if (!isEditing) {
                                    handleCellClick(
                                      typeKey,
                                      date,
                                      inputValue.toString(),
                                      cellData
                                    );
                                  }
                                }}
                              >
                                {isEditing ? (
                                  <TextField
                                    variant="standard"
                                    type="number"
                                    value={inputValue}
                                    onChange={(e) =>
                                      handleCellChange(
                                        typeKey,
                                        date,
                                        e.target.value
                                      )
                                    }
                                    InputProps={{
                                      endAdornment: (
                                        <Typography
                                          fontSize="0.875rem"
                                          sx={{ color: "grey.700" }}
                                        >
                                          /{cellData.available_count}
                                        </Typography>
                                      ),
                                      sx: {
                                        width: "74px",
                                        height: "18px",
                                        "&.MuiInputBase-root.MuiInput-root::before":
                                          {
                                            borderBottom: "none",
                                          },
                                        "&.MuiInputBase-root.MuiInput-root::after":
                                          {
                                            borderBottom: "none",
                                          },
                                      },
                                      slotProps: {
                                        input: {
                                          sx: {
                                            background: lighten(
                                              theme.palette.secondary.main,
                                              0.9
                                            ),
                                            paddingLeft: "4px",
                                            paddingBottom: 0,
                                          },
                                        },
                                      },
                                    }}
                                    autoFocus
                                    onBlur={() => {
                                      handleCellBlur(typeKey, date);
                                    }}
                                    size="small"
                                  />
                                ) : (
                                  <Typography
                                    component="div"
                                    fontSize="0.875rem"
                                    sx={{ color: "grey.700" }}
                                  >
                                    <span
                                      style={{
                                        color:
                                          +displayValue >
                                          cellData.available_count
                                            ? theme.palette.error.main
                                            : "black",
                                        fontSize: "1rem",
                                      }}
                                    >
                                      {displayValue}
                                    </span>
                                    /{cellData.available_count}
                                  </Typography>
                                )}
                              </Box>
                            </StyledTableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            {error && (
              <Alert
                severity="error"
                onClose={() => {
                  setError("");
                }}
              >{`There was an error updating inventory: ${error}`}</Alert>
            )}
            {isDirty && (
              <Box
                textAlign="right"
                mt={3}
                sx={{
                  zIndex: 2,
                }}
              >
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  onClick={handleSaveChanges}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <CircularProgress size={24} />
                  ) : (
                    `Save ${numChanges > 0 ? pluralValue(numChanges, "Change", "Changes") : ""}`
                  )}
                </Button>
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>
      <Snackbar
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        open={!!successMessage}
        onClose={() => {
          setSuccessMessage("");
        }}
        autoHideDuration={5000}
      >
        <Alert severity="success">{successMessage}</Alert>
      </Snackbar>
      <InventoryAllocationDialog
        open={editDialogOpen}
        selectedDate={multiEditState?.date ?? ""}
        roomTypeId={multiEditState?.roomType ?? -1}
        inventoryData={fetchedTableData ?? []}
        onClose={handleDialogClose}
        onSuccess={handleUpdateSuccess}
        rateCodes={sortedRates}
        roomTypes={roomTypes}
        overallInventory={roomTypeInventory}
      />
    </Box>
  );
};

export default InventoryManagement;
