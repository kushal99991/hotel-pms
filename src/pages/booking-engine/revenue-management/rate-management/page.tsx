import React, { useCallback, useEffect, useState } from "react";
import {
  Grid,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  SelectChangeEvent,
  Box,
  Typography,
  IconButton,
  Button,
} from "@mui/material";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import moment from "moment";
import { Upload as UploadIcon } from "@mui/icons-material";
import FullScreenCalendar, {
  ICalendarEvent,
  CalendarView,
} from "components/widgets/Calendar/Calendar";
import {
  useDeletRateCodeMutation,
  useGetRateDynamicV2Mutation,
  useGetRatesRateCodeMutation,
} from "services/roomRateSlice";
import useAuth from "hooks/useAuth";
import { useGetRoomTypeByPropertyIdMutation } from "services/roomTypeSlice";
import {
  IDynamicDaywiseDeleteRequest,
  IRateDynamicRequest,
} from "types/roomRateTypes";
import Modal from "components/widgets/ModalWindows/Modal";
import AddRatePrice from "./component/AddRatePrice";
import AddRateCodeForm from "./component/AddRateCodeForm";
import FullScreenModal from "components/widgets/ModalWindows/FullScreenModal";
import { appConfig } from "config/app.config";
import FileUploader from "components/widgets/Files/FileUploader";
import { useDeleteMediaMutation } from "services/propertyMediaSlice";
import RateCodesList from "./component/RateCodesList";
import ConfirmationDialog from "components/elements/ConfirmationDialog/ConfirmationDialog";
import { getMoment } from "utils/helperFunctions/common";
import { useNavigate } from "react-router-dom";

const expectedHeaders = [
  "Date",
  "Name",
  "Rate Code ID",
  "Rate",
  "Room Type",
  "Property ID",
];

const Page: React.FC = () => {
  const Navigate = useNavigate();
  const { users, currentTimeZone, timezoneCurrentDate } = useAuth();

  const [events, setEventList] = useState<ICalendarEvent[]>([]);
  const [selectedEvents, setSelectedEvent] = useState<ICalendarEvent | null>(
    null
  );
  const [filterEvent, setFilterEvents] = useState<{
    currentDate: Date;
    selectedRateCode: number | null;
    view: CalendarView;
    selectedRoomType: number;
    selectedRateCodeIds: number[];
  }>({
    currentDate: moment(timezoneCurrentDate).toDate(),
    selectedRateCode: null,
    selectedRateCodeIds: [],
    selectedRoomType: 0,
    view: CalendarView.DAY,
  });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewRateModal, setViewRateModal] = useState<boolean>(false);
  const [openAddRateModal, setOpenAddRateModal] = useState<boolean>(false);
  const [openFileUploadModal, setOpenFileUploadModal] =
    useState<boolean>(false);
  const [openDeletEventModal, setOpenDeletEventModal] =
    useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isLoadingRateCode, setIsLoadingRateCode] = useState<boolean>(false);

  const [getRoomTypeByPropertyId, { data: roomTypeList }] =
    useGetRoomTypeByPropertyIdMutation();

  const [getRateDynamicV2, { data: rateCodeList }] =
    useGetRateDynamicV2Mutation();

  const [deletRateCode] = useDeletRateCodeMutation();
  const [getRatesRateCode, { data: roomRateCode }] =
    useGetRatesRateCodeMutation();
  const [deleteMedia] = useDeleteMediaMutation();

  const propertyId = users?.defaultPropertyId ?? 1;

  // Selected Room and Rate Code names/objects
  const selectedRoom = (roomTypeList ?? []).find(
    (r) => r.id === filterEvent.selectedRoomType
  );

  const rateCodeName = (roomRateCode ?? []).find(
    (rc) => rc.id === filterEvent.selectedRateCode
  );

  // Select all rate codes helpers
  const activeRateCodes = (roomRateCode ?? []).filter((rc) => rc.active !== false);
  const areAllRateCodesSelected =
    activeRateCodes.length > 0 &&
    filterEvent.selectedRateCodeIds.length === activeRateCodes.length;
  const isSelectAllDisabled = activeRateCodes.length === 0;
  const selectAllButtonLabel = areAllRateCodesSelected
    ? "Deselect All"
    : "Select All";

  // Fetch Room Types when propertyId changes
  useEffect(() => {
    if (propertyId) {
      getRoomTypeByPropertyId({ propertyId });
    }
  }, [propertyId, getRoomTypeByPropertyId]);

  // Set default selected room type
  useEffect(() => {
    if (roomTypeList && roomTypeList.length > 0 && !filterEvent.selectedRoomType) {
      setFilterEvents((prev) => ({
        ...prev,
        selectedRoomType: roomTypeList[0].id,
      }));
    }
  }, [roomTypeList, filterEvent.selectedRoomType]);

  // Fetch linked rate codes for property
  useEffect(() => {
    if (propertyId) {
      getRatesRateCode({ property_id: propertyId });
    }
  }, [propertyId, getRatesRateCode]);

  // Auto select first rate code if none selected and rate codes available
  useEffect(() => {
    if (
      roomRateCode &&
      roomRateCode.length > 0 &&
      filterEvent.selectedRateCodeIds.length === 0
    ) {
      const firstActive = roomRateCode.find((r) => r.active !== false);
      if (firstActive) {
        setFilterEvents((prev) => ({
          ...prev,
          selectedRateCodeIds: [firstActive.id],
          selectedRateCode: firstActive.id,
        }));
      }
    }
  }, [roomRateCode, filterEvent.selectedRateCodeIds.length]);

  // Fetch rate dynamic events for calendar
  const fetchRateDynamic = useCallback(async () => {
    if (
      !propertyId ||
      !filterEvent.selectedRoomType ||
      filterEvent.selectedRateCodeIds.length === 0
    ) {
      setEventList([]);
      return;
    }

    const startOfMonth = moment(filterEvent.currentDate)
      .startOf("month")
      .subtract(7, "days")
      .format("YYYY-MM-DD");
    const endOfMonth = moment(filterEvent.currentDate)
      .endOf("month")
      .add(7, "days")
      .format("YYYY-MM-DD");

    setIsLoadingRateCode(true);
    try {
      const res = await getRateDynamicV2({
        property_id: propertyId,
        room_type_ids: String(filterEvent.selectedRoomType),
        rate_code_ids: filterEvent.selectedRateCodeIds.join(","),
        start_date: startOfMonth,
        end_date: endOfMonth,
      });

      if (res.data) {
        const mappedEvents: ICalendarEvent[] = res.data.map((item) => {
          const matchedRateCode = (roomRateCode ?? []).find(
            (rc) => String(rc.id) === String(item.rate_code_id)
          );
          const matchedRoomType = (roomTypeList ?? []).find(
            (rt) => String(rt.id) === String(item.room_type_id)
          );

          return {
            name: matchedRateCode?.name || `Rate #${item.rate_code_id}`,
            date: moment(item.date).toDate(),
            rate_code_id: Number(item.rate_code_id),
            rateCode: matchedRateCode,
            rate: item.rate,
            type: item.rate_source,
            room_type: matchedRoomType as any,
            parent_rate: item.parent_rate,
            parent_rate_base: item.parent_rate_base,
            tooltip: `${item.rate ?? 0}`,
          };
        });
        setEventList(mappedEvents);
      }
    } catch {
      // ignore
    } finally {
      setIsLoadingRateCode(false);
    }
  }, [
    propertyId,
    filterEvent.selectedRoomType,
    filterEvent.selectedRateCodeIds,
    filterEvent.currentDate,
    getRateDynamicV2,
    roomRateCode,
    roomTypeList,
  ]);

  useEffect(() => {
    fetchRateDynamic();
  }, [fetchRateDynamic]);

  const onRefresh = () => {
    fetchRateDynamic();
    if (propertyId) {
      getRatesRateCode({ property_id: propertyId });
    }
  };

  // Toggle select all rate codes
  const handleToggleSelectAllRateCodes = () => {
    if (areAllRateCodesSelected) {
      setFilterEvents((prev) => ({
        ...prev,
        selectedRateCodeIds: [],
        selectedRateCode: null,
      }));
    } else {
      const allIds = activeRateCodes.map((rc) => rc.id);
      setFilterEvents((prev) => ({
        ...prev,
        selectedRateCodeIds: allIds,
        selectedRateCode: allIds[0] ?? null,
      }));
    }
  };

  // Filter selection handler from left panel
  const handleFilterByRateCode = (selectedIds: number[]) => {
    setFilterEvents((prev) => ({
      ...prev,
      selectedRateCodeIds: selectedIds,
      selectedRateCode: selectedIds.length > 0 ? selectedIds[selectedIds.length - 1] : null,
    }));
  };

  // Calendar interactions
  const handleDateChange = (date: Date) => {
    setFilterEvents((prev) => ({ ...prev, currentDate: date }));
  };

  const handleViewChange = (view: CalendarView) => {
    setFilterEvents((prev) => ({ ...prev, view }));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
    setViewRateModal(true);
  };

  const handleEventClick = (event: ICalendarEvent) => {
    setSelectedEvent(event);
    setSelectedDate(event.date);
    if (event.rate_code_id) {
      setFilterEvents((prev) => ({ ...prev, selectedRateCode: event.rate_code_id ?? null }));
    }
    setViewRateModal(true);
  };

  const handleDeleteEventClick = (event: ICalendarEvent) => {
    setSelectedEvent(event);
    setSelectedDate(event.date);
    setOpenDeletEventModal(true);
  };

  const handleClose = () => {
    setViewRateModal(false);
    setSelectedEvent(null);
  };

  const handleOpenAddRateCodeModal = () => {
    setOpenAddRateModal(true);
  };

  const handleCloseAddRateCodeModal = () => {
    setOpenAddRateModal(false);
  };

  const handleCloseDeleteEvent = () => {
    setOpenDeletEventModal(false);
    setSelectedEvent(null);
  };

  const handleDelete = async () => {
    if (!selectedEvents || !selectedDate || !filterEvent.selectedRoomType) return;
    try {
      const res = await deletRateCode({
        date: moment(selectedDate).format("YYYY-MM-DD"),
        rate_code_id: selectedEvents.rate_code_id || (filterEvent.selectedRateCode ?? 0),
        room_type_id: filterEvent.selectedRoomType,
      });
      if (!res.error) {
        onRefresh();
        handleCloseDeleteEvent();
        handleClose();
      }
    } catch {
      // ignore
    }
  };

  const handleRoomTypeChange = (roomTypeId: number) => {
    setFilterEvents((prev) => ({
      ...prev,
      selectedRoomType: roomTypeId,
    }));
  };

  const onUploadRateCode = (fileData: any) => {
    setOpenFileUploadModal(false);
    onRefresh();
  };

  return (
    <Grid container spacing={2}>
      {/* Left Column: Room Types with Button and Dropdown */}
      <Grid item xs={12} md={3} mt={2}>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
          gap={4}
        >
          {/* Upload Button with Upload Icon */}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            gap={2}
          >
            <IconButton
              aria-label="upload"
              onClick={() => setOpenFileUploadModal(true)}
              color="primary"
              sx={{ border: 1, borderRadius: 2 }}
            >
              <UploadIcon /> <Typography>Upload</Typography>
            </IconButton>
            <IconButton
              aria-label="add-rate-code"
              onClick={handleOpenAddRateCodeModal}
              sx={{ border: 1, borderRadius: 2, backgroundColor: "primary" }}
              color="primary"
            >
              <Typography>Add Rate</Typography>
            </IconButton>
            <Button
              variant={areAllRateCodesSelected ? "contained" : "outlined"}
              color="primary"
              onClick={handleToggleSelectAllRateCodes}
              disabled={isSelectAllDisabled}
              sx={{ textTransform: "none", borderRadius: 2, px: 2 }}
            >
              {selectAllButtonLabel}
            </Button>
          </Box>

          <Box
            width="100%"
            sx={{
              height: {
                xs: "100%",
                sm: "100%",
                md: "calc(100vh - (2rem + 35px))",
              },
              overflow: "auto",
            }}
          >
            {(roomRateCode ?? []).length === 0 ? (
              <Typography variant="body2" color="textSecondary">
                No linked rate codes.
              </Typography>
            ) : (
              <>
                <RateCodesList
                  rateCodesList={roomRateCode ?? []}
                  selectedRateCodeIds={filterEvent.selectedRateCodeIds}
                  onRateCodeSelect={handleFilterByRateCode}
                />
              </>
            )}
          </Box>
        </Box>
      </Grid>

      {/* Right Column: Calendar */}
      <Grid item xs={12} md={9}>
        {filterEvent.selectedRateCodeIds.length === 0 ? (
          <Box
            height="100%"
            minHeight="400px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexDirection="column"
            bgcolor="#f9f9f9"
            borderRadius={2}
            border="1px dashed #ccc"
            p={4}
          >
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No Rate Code Selected
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Please select one or more rate codes from the left panel to view
              rates on the calendar.
            </Typography>
            <IconButton
              onClick={() => {
                const firstRateCode = roomRateCode?.[0];
                if (firstRateCode) {
                  setFilterEvents((prev) => ({
                    ...prev,
                    selectedRateCodeIds: [firstRateCode.id],
                  }));
                }
              }}
              color="primary"
              sx={{ border: 1, borderRadius: 2, px: 2 }}
            >
              <Typography>Select First Rate Code</Typography>
            </IconButton>
          </Box>
        ) : (
          <FullScreenCalendar
            events={events}
            currentDate={filterEvent.currentDate}
            view={filterEvent.view}
            isLoading={isLoadingRateCode}
            onDateChange={handleDateChange}
            onViewChange={handleViewChange}
            onDateClick={handleDateClick}
            onEventClick={handleEventClick}
            onEventDelete={handleDeleteEventClick}
            leftButton={
              <FormControl sx={{ mb: 2, maxWidth: 200 }}>
                <InputLabel id="room-type-select-label">Room Type</InputLabel>
                <Select
                  labelId="room-type-select-label"
                  value={filterEvent.selectedRoomType}
                  onChange={(event: SelectChangeEvent<number>) =>
                    handleRoomTypeChange(event.target.value as number)
                  }
                  label="Room Type"
                >
                  {(roomTypeList ?? []).map((room) => (
                    <MenuItem key={room.id} value={room.id}>
                      {room.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            }
          />
        )}

        <Modal
          open={viewRateModal}
          title={
            selectedEvents
              ? `Update Rate (${rateCodeName?.name ?? ""})`
              : rateCodeName
                ? `Add New Rate (${rateCodeName?.name ?? ""})`
                : `Add New Rate`
          }
          size="md"
          onClose={handleClose}
          isHideCloseButton={true}
        >
          <AddRatePrice
            selectedDate={selectedDate}
            selectedEvent={selectedEvents}
            selectedRateCode={filterEvent.selectedRateCode}
            selectedRoomType={filterEvent.selectedRoomType}
            rateCodesList={roomRateCode ?? []}
            onEventDelete={handleDeleteEventClick}
            onRefresh={onRefresh}
            onClose={handleClose}
          />
        </Modal>
        <Modal
          open={openAddRateModal}
          title={`Link Rate Code with ${selectedRoom?.name ?? ""}`}
          size="sm"
          onClose={handleCloseAddRateCodeModal}
          isHideCloseButton={true}
        >
          <AddRateCodeForm
            onRefresh={onRefresh}
            onClose={handleCloseAddRateCodeModal}
            selectedRoomType={filterEvent.selectedRoomType}
          />
        </Modal>
        {/* Modal for updating the image */}
        <FullScreenModal
          title="Import Rate Code"
          open={openFileUploadModal}
          onClose={() => setOpenAddRateModal(false)}
        >
          <FileUploader
            keyPath={appConfig.getMediaKey(
              users?.defaultPropertyId ?? "default",
              `p-${filterEvent.selectedRoomType}`,
              "imgs"
            )}
            accept=".csv"
            title=""
            onUploadComplete={onUploadRateCode}
            mode="drag-drop"
          />
          {/* Display error message if there's any */}
          {uploadError && (
            <Typography variant="body2" color="error" sx={{ mt: 2 }}>
              {uploadError}
            </Typography>
          )}
        </FullScreenModal>

        <ConfirmationDialog
          open={openDeletEventModal}
          title={`Confirm Deletion`}
          description={`Are you sure you want to delete the event "${selectedEvents?.name}" scheduled for ${selectedDate ? moment(selectedDate).format("YYYY-MM-DD") : ""}?`}
          buttons={[
            { label: "Yes", onClick: handleDelete },
            { label: "No", onClick: handleCloseDeleteEvent },
          ]}
          onClose={handleCloseDeleteEvent}
        />
      </Grid>
    </Grid>
  );
};

export default Page;
