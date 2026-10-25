import React, { useCallback, useEffect } from "react";
import {
  LocalizationProvider,
  TimePicker,
  DatePicker,
} from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { useForm, Controller } from "react-hook-form";
import moment from "moment";
import { reservationOver } from "utils/reservations";
import { yupResolver } from "@hookform/resolvers/yup";
import { checkInCheckoutSchema } from "utils/validations.utils";
import { Alert, Box, Button, Divider } from "@mui/material";
import {
  useUpdateReservationMutation,
  useUpdateDatesMutation,
} from "services/reservationSlice";
import {
  IReservationResponse,
  IUpdateReservationRequest,
} from "types/reservationTypes";
import { appConfig } from "config/app.config";
import { StayDatesForm } from "types/forms/reservationForms";
import { ReservationStatusEnum } from "constants/reservation";
import useAuth from "hooks/useAuth";

// Define form data interface
interface IStayDateProps {
  checkOutDateTime: Date | null;
  checkInDateTime: Date | null;
  isCheckInDisable: boolean;
  reservationId: number;
  reservation: IReservationResponse | null;
  onClose: (refresh: boolean) => void;
}

const StayDate: React.FC<IStayDateProps> = ({
  checkInDateTime,
  checkOutDateTime,
  isCheckInDisable,
  reservationId,
  reservation,
  onClose,
}) => {
  const { currentProperty } = useAuth();
  const [updateReservation, { isLoading }] = useUpdateReservationMutation();
  const startMoment = moment(reservation?.start_date);
  const endMoment = moment(reservation?.end_date);
  const [updateDates, { isLoading: datesUpdating }] = useUpdateDatesMutation();
  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    setError,
    watch,
  } = useForm<StayDatesForm>({
    resolver: yupResolver(checkInCheckoutSchema),
    defaultValues: {
      checkInTime: checkInDateTime,
      checkOutTime: checkOutDateTime,
      startDate: reservation?.start_date,
      endDate: reservation?.end_date,
    },
  });

  useEffect(() => {
    if (checkInDateTime) {
      setValue("checkInTime", checkInDateTime, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    }
    if (checkOutDateTime) {
      setValue("checkOutTime", checkOutDateTime, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    }
  }, [checkInDateTime, checkOutDateTime]);

  useEffect(() => {
    if (reservation?.start_date) {
      setValue("startDate", reservation.start_date, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    }
    if (reservation?.end_date) {
      setValue("endDate", reservation?.end_date, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    }
  }, [reservation]);

  // Handle form submission
  const onSubmit = useCallback(
    async (formData: StayDatesForm) => {
      const payload: IUpdateReservationRequest = {
        id: reservationId,
        booking_channel: reservation?.booking_channel || "",
      };
      if (formData.checkInTime) {
        payload.expected_checkin_time = moment(formData?.checkInTime).format(
          appConfig.dateApiTimeOfDayFormat
        );
      }
      if (formData?.checkOutTime) {
        payload.expected_checkout_time = moment(formData?.checkOutTime).format(
          appConfig.dateApiTimeOfDayFormat
        );
      }
      let dateError = "";
      const startFromForm = moment(formData?.startDate);
      const endFromForm = moment(formData?.endDate);
      if (
        !startFromForm.isSame(startMoment, "day") ||
        !endFromForm.isSame(endMoment, "day")
      ) {
        const dateResponse = await updateDates({
          reservation_id: reservationId,
          start_date: startFromForm.format(appConfig.dateApiFormat),
          end_date: endFromForm.format(appConfig.dateApiFormat),
        });
        if (dateResponse.error) {
          dateError = dateResponse.error as string;
        }
      }
      const response = await updateReservation(payload);
      let timeError = "";
      if (response.error) {
        timeError = response?.error as string;
      }
      if (timeError || dateError) {
        setError("root", {
          type: "manual",
          message: `${dateError ? `Error updating dates: ${dateError} \n` : ""}${timeError ? `Error updating time: ${timeError}` : ""}`,
        });
        if (timeError && dateError) {
          return false;
        }
      }
      onClose?.(true);
    },
    [reservationId, isCheckInDisable]
  );
  function editStartAvailable() {
    if (!reservation) {
      return false;
    }
    if (reservationOver(reservation)) {
      return false;
    }
    if (reservation.status === ReservationStatusEnum.IN_HOUSE) {
      return false;
    }
    return true;
  }
  function editEndAvailable() {
    if (!reservation) {
      return false;
    }
    if (reservationOver(reservation)) {
      return false;
    }
    return true;
  }
  const canChangeStart = editStartAvailable();
  const canChangeEnd = editEndAvailable();
  const todayMoment = moment();
  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <Box
        gap={3}
        pt={1}
        px={2}
        width="300px"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        flexDirection="column"
      >
        {errors?.root && <Alert severity="error">{errors.root.message}</Alert>}
        {canChangeStart && (
          <Box display="flex" flexDirection="column" width="100%">
            <Controller
              name="startDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Start Date"
                  value={moment(field.value)}
                  minDate={todayMoment}
                  onChange={(value) => {
                    const updateValue = moment(value);
                    if (updateValue?.isValid?.()) {
                      if (!updateValue?.isSame(startMoment, "day")) {
                        field.onChange(updateValue);
                        // Auto-adjust departure if it's before or same as arrival
                        const currentEnd = moment(watch("endDate"));
                        if (
                          !currentEnd.isValid() ||
                          !currentEnd.isAfter(updateValue, "day")
                        ) {
                          const nextDay = updateValue.clone().add(1, "day");
                          setValue(
                            "endDate",
                            nextDay.format(appConfig.dateApiFormat),
                            {
                              shouldDirty: true,
                              shouldTouch: true,
                              shouldValidate: true,
                            }
                          );
                        }
                      }
                    }
                  }}
                  slotProps={{
                    textField: {
                      error: !!errors.startDate,
                      helperText: errors.startDate?.message,
                    },
                  }}
                />
              )}
            />
          </Box>
        )}
        {canChangeEnd && (
          <Box display="flex" flexDirection="column" width="100%">
            <Controller
              name="endDate"
              control={control}
              render={({ field }) => {
                const start = moment(watch("startDate"));
                const maxStayDays =
                  currentProperty?.max_stay_duration_days ?? 29;
                const maxEndDate = start.clone().add(maxStayDays, "days");

                return (
                  <DatePicker
                    label="End Date"
                    value={moment(field.value)}
                    shouldDisableDate={(date) => {
                      // Disable if date is before or same as start, or beyond max stay duration
                      return (
                        !date.isAfter(start, "day") ||
                        date.isAfter(maxEndDate, "day")
                      );
                    }}
                    minDate={start.clone().add(1, "day")}
                    maxDate={maxEndDate}
                    onChange={(value) => {
                      const updateValue = moment(value);
                      if (updateValue?.isValid?.()) {
                        if (!updateValue?.isSame(endMoment, "day")) {
                          field.onChange(updateValue);
                        }
                      }
                    }}
                    slotProps={{
                      textField: {
                        error: !!errors.endDate,
                        helperText: errors.endDate?.message,
                      },
                    }}
                  />
                );
              }}
            />
          </Box>
        )}
        {(canChangeEnd || canChangeStart) && (
          <Divider
            sx={{ height: "3px", width: "100%", background: "gray.600" }}
          />
        )}
        {!isCheckInDisable && (
          <Box display="flex" flexDirection="column" width="100%">
            <Controller
              name="checkInTime"
              control={control}
              render={({ field }) => (
                <TimePicker
                  label="Expected Check-In Time"
                  value={field.value && moment(field.value)}
                  onChange={(value) => {
                    let updateValue = moment(value);
                    if (updateValue?.isValid?.()) {
                      if (!value?.isSame(reservation?.start_date, "day")) {
                        // take time from value and apply it to start_date day
                        const time = value?.format(
                          appConfig.dateApiTimeOfDayFormat
                        );
                        updateValue = moment(
                          `${reservation?.start_date} ${time}`
                        );
                      }
                      field.onChange(updateValue);
                    }
                  }}
                  ampm={false}
                  slotProps={{
                    textField: {
                      error: !!errors.checkInTime,
                      helperText: errors.checkInTime?.message,
                    },
                  }}
                />
              )}
            />
          </Box>
        )}

        <Box display="flex" flexDirection="column" width="100%" mt={2}>
          <Controller
            name="checkOutTime"
            control={control}
            render={({ field }) => (
              <TimePicker
                label="Requested Check-Out Time"
                value={field.value && moment(field.value)}
                onChange={(value) => {
                  let updateValue = value;
                  if (!value?.isSame(reservation?.end_date, "day")) {
                    // take time from value and apply it to end_date day
                    const time = value?.format(
                      appConfig.dateApiTimeOfDayFormat
                    );
                    updateValue = moment(`${reservation?.end_date} ${time}`);
                  }
                  field.onChange(updateValue);
                }}
                ampm={false}
                slotProps={{
                  textField: {
                    error: !!errors.checkOutTime,
                    helperText: errors.checkOutTime?.message,
                    fullWidth: true,
                  },
                }}
              />
            )}
          />
        </Box>

        <Box display="flex" width="100%" justifyContent="space-between" mt={3}>
          <Button
            color="primary"
            variant="outlined"
            onClick={() => onClose(false)}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            variant="contained"
            onClick={handleSubmit(onSubmit)}
            disabled={isLoading || datesUpdating}
          >
            {isLoading || datesUpdating ? "Updating..." : "Update"}
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default StayDate;
