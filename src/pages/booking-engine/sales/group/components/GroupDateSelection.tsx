import React, { useEffect, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Alert, Box, Grid, Button, Typography, Paper } from "@mui/material";
import { useGetRateCodeByPropertyIdMutation } from "services/roomTypeSlice";
import { IRoomTypes } from "types/roomTypes";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import RoomCounter from "pages/booking-engine/front-office/new-reservation/_components/AddAvailableRooms/RoomCounter";
import { GroupReservationFormData } from "forms/schemas/salesGroup.validations";
import useAuth from "hooks/useAuth";
import FormAutocomplete from "components/forms/FormAutocomplete";
import FormDateRangePicker from "components/forms/FormDateRangePicker";
import { getMoment } from "utils/helperFunctions/common";
import { SET_VALUE_OPTIONS } from "constants/forms";
import { RoomRentalTypes } from "constants/room";
import CustomDropdown from "components/widgets/CustomDropdown/CustomDropdown";
import { appConfig } from "config/app.config";
import {
  GetGroupAvailabilityError,
  GroupAvailabilityData,
  useFetchGroupAvailability,
} from "hooks/useGetGroupAvailabiilty";
import { formatToDisplayDate } from "utils/helperFunctions/dateFormat";

interface GroupDateSelection {
  onAvailabilityChange: (availData?: GroupAvailabilityData) => void;
  onAvailabilityInputChange?: () => void;
  roomTypes?: IRoomTypes[];
}

const GroupDateSelection: React.FC<GroupDateSelection> = ({
  onAvailabilityChange,
  onAvailabilityInputChange,
  roomTypes: apiRoomTypes,
}) => {
  const { currentProperty } = useAuth();
  const {
    control,
    watch,
    trigger,
    setValue,
    formState: { errors: formErrors },
  } = useFormContext<GroupReservationFormData>();
  const [errors, setErrors] = useState<GetGroupAvailabilityError[]>([]);
  const { lazyFetchGroupAvailability, isLoading: availLoading } =
    useFetchGroupAvailability();
  const [availabiltyTypes, setAvailabilityTypes] = useState<string[]>([]);
  const [availError, setAvailError] = useState<string>("");
  const [getRateCodeByPropertyId, { data: rateCodeList }] =
    useGetRateCodeByPropertyIdMutation();

  useEffect(() => {
    const todayMoment = getMoment(null, currentProperty?.timezone);
    const startMoment = todayMoment.clone().add(8, "day");
    const endMoment = startMoment.clone().add(5, "day");
    setValue("group_arrival_date", startMoment.toDate(), SET_VALUE_OPTIONS);
    setValue("group_departure_date", endMoment.toDate(), SET_VALUE_OPTIONS);
    setValue(
      "shoulder_arrival_date",
      startMoment.clone().subtract(1, "day").toDate(),
      SET_VALUE_OPTIONS
    );
    setValue(
      "shoulder_departure_date",
      endMoment.clone().add(1, "day").toDate(),
      SET_VALUE_OPTIONS
    );
    setValue(
      "group_cutoff_date",
      startMoment.clone().subtract(2, "day").toDate(),
      SET_VALUE_OPTIONS
    );
    setValue(
      "group_release_date",
      startMoment.clone().subtract(2, "day").toDate(),
      SET_VALUE_OPTIONS
    );
    getRateCodeByPropertyId({
      propertyId: currentProperty?.id ?? -1,
    });
  }, [currentProperty]);

  function handleTypeChange(args) {
    setAvailError("");
    setAvailabilityTypes(args.target.value);
    onAvailabilityInputChange?.();
  }

  const roomTypes = apiRoomTypes?.filter(
    (rt) => rt.rentalType === RoomRentalTypes.GUEST_ROOM
  );
  const startDate = watch("group_arrival_date");
  const endDate = watch("group_departure_date");
  const shoulderStart = watch("shoulder_arrival_date");
  const shoulderEnd = watch("shoulder_departure_date");
  const rateCodeId = watch("rate_code_id");
  const mainRoomCount = watch("main_group_rooms");
  const shoulderRoomCount = watch("shoulder_rooms");

  useEffect(() => {
    onAvailabilityInputChange?.();
  }, [shoulderStart, shoulderEnd, mainRoomCount, shoulderRoomCount, rateCodeId]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleGroupDateChange(value: [Date | null, Date | null]) {
    onAvailabilityInputChange?.();
    // update shoulder dates if new start or end dates are outside of the shoulder date window
    const newStart = value[0];
    const newEnd = value[1];
    const newStartPropertyMoment = getMoment(
      newStart,
      currentProperty?.timezone
    );
    const newEndPropertyMoment = getMoment(newEnd, currentProperty?.timezone);
    if (!newStart) {
      setValue("shoulder_arrival_date", null, SET_VALUE_OPTIONS);
    } else if (!shoulderStart) {
      setValue(
        "shoulder_arrival_date",
        newStartPropertyMoment.clone().subtract(1, "days").toDate(),
        SET_VALUE_OPTIONS
      );
    } else if (shoulderStart && shoulderStart > newStart) {
      setValue(
        "shoulder_arrival_date",
        newStartPropertyMoment.clone().subtract(1, "days").toDate(),
        SET_VALUE_OPTIONS
      );
    }
    if (!newEnd) {
      setValue("shoulder_departure_date", null, SET_VALUE_OPTIONS);
    } else if (!shoulderEnd) {
      setValue(
        "shoulder_departure_date",
        newEndPropertyMoment.clone().add(1, "days").toDate(),
        SET_VALUE_OPTIONS
      );
    } else if (shoulderEnd < newEnd) {
      setValue(
        "shoulder_departure_date",
        newEndPropertyMoment.clone().add(1, "days").toDate(),
        SET_VALUE_OPTIONS
      );
    }
  }

  function handleAvailabiltyClick() {
    if (!availabiltyTypes.length) {
      setAvailError("Room Type required");
      return;
    }
    if (!rateCodeId || rateCodeId < 1) {
      trigger("rate_code_id");
      return;
    }
    trigger([
      "group_arrival_date",
      "group_departure_date",
      "main_group_rooms",
      "rate_code_id",
    ]).then(async (isValid) => {
      if (isValid) {
        setErrors([]);
        const { data, errors } = await lazyFetchGroupAvailability({
          propertyId: currentProperty?.id ?? -1,
          rateCodeId: rateCodeId ?? -1,
          roomTypeIds: availabiltyTypes.join(","),
          shoulderStartDate: shoulderStart
            ? formatToDisplayDate(shoulderStart, appConfig.dateApiFormat)
            : "",
          shoulderEndDate: shoulderEnd
            ? formatToDisplayDate(shoulderEnd, appConfig.dateApiFormat)
            : "",
          groupStartDate: startDate
            ? formatToDisplayDate(startDate, appConfig.dateApiFormat)
            : "",
          groupEndDate: endDate
            ? formatToDisplayDate(endDate, appConfig.dateApiFormat)
            : "",
          groupRoomCount: mainRoomCount,
          shoulderRoomCount: shoulderRoomCount,
        });
        if (errors.length) {
          setErrors(errors);
        } else if (data) {
          onAvailabilityChange(data);
        }
      }
    });
  }
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom mb={2}>
          New Group
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2} alignItems="start">
            <FormDateRangePicker
              startFormName="group_arrival_date"
              endFormName="group_departure_date"
              onChange={handleGroupDateChange}
              minDate={getMoment(null, currentProperty?.timezone).toDate()}
              timezone={currentProperty?.timezone}
            />
            <Grid
              item
              xs={12}
              md={3}
              sx={{
                mt: {
                  xs: 1,
                  sm: "-25px", // account for label height to align with date picker
                },
              }}
            >
              <CustomDropdown
                label="Room Type"
                placeholder="Room Type"
                onChange={handleTypeChange}
                value={availabiltyTypes}
                multiple
                error={!!availError}
                isInvalid={!!availError}
                helperText={availError}
                options={(roomTypes ?? []).map((roomType: IRoomTypes) => ({
                  label: roomType.type,
                  value: roomType.id.toString(),
                }))}
                fullWidth
                aria-label="Room Type"
                data-testid="room-type"
              />
            </Grid>
            <FormAutocomplete
              name="rate_code_id"
              label="Rate Code"
              gridProps={{
                xs: 12,
                sm: 3,
                sx: {
                  mt: {
                    xs: 1,
                    sm: "-25px", // vertically align with datepicker when in same row
                  },
                },
              }}
              options={(rateCodeList ?? []).map((rc) => ({
                label: rc.name,
                value: rc.id,
              }))}
            />
          </Grid>
          <Box mt={2}>
            <Controller
              name="main_group_rooms"
              control={control}
              render={({ field }) => (
                <RoomCounter
                  count={field.value}
                  onChange={field.onChange}
                  maxRooms={currentProperty?.room_count}
                />
              )}
            />
          </Box>
        </Box>

        {/* Shoulder Dates */}
        <Box sx={{ mb: 3, mt: 4 }}>
          <Typography variant="subtitle2" mb={1.5}>
            Shoulder Dates
          </Typography>
          <Grid container spacing={2}>
            <FormDateRangePicker
              startFormName="shoulder_arrival_date"
              endFormName="shoulder_departure_date"
              granularMinMax={{
                firstPickerMin: getMoment(
                  null,
                  currentProperty?.timezone
                ).toDate(),
                firstPickerMax: getMoment(startDate, currentProperty?.timezone)
                  .subtract(1, "day")
                  .toDate(),
                secondPickerMin: getMoment(endDate, currentProperty?.timezone)
                  .add(1, "day")
                  .toDate(),
              }}
              showNights={false}
              timezone={currentProperty?.timezone}
            />
          </Grid>
          <Box mt={2}>
            <Controller
              name="shoulder_rooms"
              control={control}
              render={({ field }) => (
                <RoomCounter
                  count={field.value}
                  onChange={field.onChange}
                  maxRooms={currentProperty?.room_count}
                />
              )}
            />
          </Box>
        </Box>
        {!!errors.length && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {`There ${errors.length > 1 ? "were issues" : "was an issue"} checking availability.`}
            <ul>
              {errors.map((e) => (
                <li>{`${e.dateRange}: ${e.message}`}</li>
              ))}
            </ul>
          </Alert>
        )}
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            onClick={handleAvailabiltyClick}
            disabled={availLoading}
          >
            {availLoading ? "Checking..." : "Check Availability"}
          </Button>
        </Box>
      </Paper>
    </LocalizationProvider>
  );
};

export default GroupDateSelection;
