import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  Grid,
  Autocomplete,
  Alert,
  Button,
  MenuItem,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { ICalendarEvent } from "components/widgets/Calendar/Calendar";
import {
  IDynamicDaywiseRequest,
  IRateCodeListResponse,
  IRoomRateRequest,
} from "types/roomRateTypes";
import { roomRateRequestSchema } from "utils/validations.utils";
import PrimaryButton from "components/elements/Button/PrimaryButton";

import { appConfig } from "config/app.config";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useAddDynamicDaywiseMutation } from "services/roomRateSlice";
import { useGetRoomTypeByPropertyIdMutation } from "services/roomTypeSlice";
import useAuth from "hooks/useAuth";
import moment from "moment";

interface IAddRatePriceProps {
  selectedEvent: ICalendarEvent | null;
  selectedDate?: Date;
  selectedRateCode?: number | null;
  selectedRoomType?: number;
  rateCodesList: IRateCodeListResponse[];
  onEventDelete?: (event: ICalendarEvent) => void;
  onRefresh?: () => void;
  onClose?: () => void;
}

const daysOfWeek = [
  { label: "Monday", value: "MONDAY" },
  { label: "Tuesday", value: "TUESDAY" },
  { label: "Wednesday", value: "WEDNESDAY" },
  { label: "Thursday", value: "THURSDAY" },
  { label: "Friday", value: "FRIDAY" },
  { label: "Saturday", value: "SATURDAY" },
  { label: "Sunday", value: "SUNDAY" },
];

const billingUnitOptions = [
  { label: "Per Day", value: "PER_DAY" },
  { label: "Per Hour", value: "PER_HOUR" },
  { label: "Per Half Hour", value: "PER_HALF_HOUR" },
];

const AddRatePrice: React.FC<IAddRatePriceProps> = ({
  selectedEvent,
  selectedDate,
  selectedRateCode,
  selectedRoomType,
  rateCodesList,
  onEventDelete,
  onRefresh,
  onClose,
}) => {
  const { users } = useAuth();
  const [isEnableRateCode, setIsEnableRateCode] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addDynamicDaywise, { isLoading }] = useAddDynamicDaywiseMutation();
  const [getRoomTypeByPropertyId, { data: roomTypeList }] =
    useGetRoomTypeByPropertyIdMutation();

  const methods = useForm<IRoomRateRequest>({
    mode: "all",
    resolver: yupResolver(roomRateRequestSchema),
    defaultValues: {
      roomType: selectedEvent?.room_type?.type ?? "",
      days: daysOfWeek.map((a) => a.value),
      rate_code_id: 0,
      rate: 100,
      billing_unit: "PER_DAY",
      dateRange: {
        startDate: undefined,
        endDate: undefined,
      },
    },
  });

  const {
    control,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
    watch,
  } = methods;
  const dateRange = watch("dateRange");
  const billing_unit = watch("billing_unit");

  useEffect(() => {
    getRoomTypeByPropertyId({
      propertyId: users?.defaultPropertyId ?? 0,
    });
  }, [users?.defaultPropertyId]);

  useEffect(() => {
    if (selectedDate) {
      setValue(
        "dateRange.startDate",
        moment(selectedDate).format("YYYY-MM-DD"),
        {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        }
      );
    }
    if (selectedRateCode) {
      setValue("rate_code_id", selectedRateCode, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    } else {
      setIsEnableRateCode(false);
    }
    if (selectedRoomType) {
      setValue("roomType", selectedRoomType.toString(), {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    }
    if (selectedEvent) {
      const selectedRate = selectedEvent?.billing_units?.find(
        (a) => a.name === billing_unit
      );
      setValue("rate", Number(selectedRate?.price ?? "0"), {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });

      setValue(
        "dateRange.endDate",
        selectedEvent?.date
          ? moment(selectedEvent.date).format("YYYY-MM-DD")
          : "",
        {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        }
      );
      setValue("billing_unit", billing_unit ?? "PER_DAY", {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    } else if (selectedDate) {
      setValue(
        "dateRange.endDate",
        selectedDate ? moment(selectedDate).format("YYYY-MM-DD") : "",
        {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        }
      );
    }
  }, [
    selectedEvent,
    selectedDate,
    selectedRateCode,
    selectedRoomType,
    billing_unit,
  ]);

  const onSubmit = async (data: IRoomRateRequest) => {
    setIsSubmitting(true);
    const { endDate, startDate } = data.dateRange;
    const request: IDynamicDaywiseRequest = {
      days: data.days,
      end_date: moment(endDate).format("YYYY-MM-DD"),
      start_date: moment(startDate).format("YYYY-MM-DD"),
      rate: data.rate,
      rate_code_id: data?.rate_code_id ?? 0,
      room_type_id: Number(data?.roomType ?? "0"),
      billing_unit: data.billing_unit,
    };
    const response = await addDynamicDaywise(request);
    if (response?.error) {
      setError(
        "root",
        { message: response.error as string },
        { shouldFocus: true }
      );
      setIsSubmitting(false);
      return false;
    }
    onRefresh?.();
    setIsSubmitting(false);
    onClose?.();
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Grid container spacing={3}>
        {/* Display Root Level Errors */}
        {errors?.root?.message && (
          <Grid item xs={12}>
            <Alert severity="error">{errors.root.message}</Alert>
          </Grid>
        )}

        {/* Start Date Picker */}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Grid item xs={12} sm={6}>
            <Controller
              name="dateRange.startDate"
              control={control}
              render={({
                field: { value, onChange },
                fieldState: { error, invalid },
              }) => (
                <Box display="flex" alignItems="center">
                  <DatePicker
                    label="Start Date"
                    value={value ? dayjs(value) : null}
                    format={appConfig.displayDateFormat}
                    onChange={(date) => onChange(date?.toDate())}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: invalid,
                        helperText: error?.message,
                      },
                    }}
                  />
                </Box>
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="dateRange.endDate"
              control={control}
              render={({
                field: { value, onChange },
                fieldState: { error, invalid },
              }) => (
                <Box display="flex" alignItems="center">
                  <DatePicker
                    label="End Date"
                    value={value ? dayjs(value) : null}
                    format={appConfig.displayDateFormat}
                    onChange={(date) => date && onChange(date.toDate())}
                    minDate={
                      dateRange.startDate
                        ? dayjs(dateRange.startDate)
                        : undefined
                    }
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: invalid,
                        helperText: error?.message,
                      },
                    }}
                  />
                </Box>
              )}
            />
          </Grid>
        </LocalizationProvider>

        <Grid item xs={12} sm={6}>
          <Controller
            name="rate"
            control={control}
            render={({ field, fieldState: { error, invalid } }) => (
              <TextField
                {...field}
                label="Room Rate"
                type="number"
                fullWidth
                value={field.value}
                margin="normal"
                error={invalid}
                helperText={error?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="billing_unit"
            control={control}
            render={({ field, fieldState: { error, invalid } }) => (
              <TextField
                {...field}
                select
                label="Billing Unit"
                fullWidth
                margin="normal"
                error={invalid}
                helperText={error?.message}
              >
                {billingUnitOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="rate_code_id"
            control={control}
            render={({ field, fieldState: { error, invalid } }) => (
              <Autocomplete
                {...field}
                options={(rateCodesList ?? [])
                  .slice()
                  .sort((a, b) => a.name.localeCompare(b.name))}
                readOnly={isEnableRateCode}
                getOptionLabel={(option) => option.name}
                value={
                  rateCodesList.find((rate) => rate.id === field.value) || null
                }
                onChange={(event, newValue) => {
                  field.onChange(newValue?.id || "");
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Rate Code"
                    fullWidth
                    margin="normal"
                    error={invalid}
                    helperText={error?.message}
                  />
                )}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="roomType"
            control={control}
            render={({ field, fieldState: { error, invalid } }) => (
              <Autocomplete
                {...field}
                options={roomTypeList ?? []}
                readOnly={true}
                getOptionLabel={(option) => `${option?.name ?? option.type}`}
                value={
                  (roomTypeList ?? []).find(
                    (room) => room.id?.toString() === field.value
                  ) || null
                }
                onChange={(event, newValue) => {
                  field.onChange(newValue?.id || "");
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Room Type"
                    fullWidth
                    margin="normal"
                    error={invalid}
                    helperText={error?.message}
                    InputProps={{
                      ...params.InputProps,
                      readOnly: true,
                    }}
                  />
                )}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" sx={{ marginBottom: 1 }}>
            Select Days:
          </Typography>
          <Grid container>
            {daysOfWeek.map((day) => (
              <Grid item xs={3} key={day.value}>
                <Controller
                  name="days"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          {...field}
                          value={day}
                          checked={field.value.includes(day.value)}
                          onChange={(e) => {
                            const newValue = [...field.value];
                            if (e.target.checked) {
                              newValue.push(day.value);
                            } else {
                              const index = newValue.indexOf(day.value);
                              newValue.splice(index, 1);
                            }
                            field.onChange(newValue);
                          }}
                        />
                      }
                      label={day.label}
                    />
                  )}
                />
              </Grid>
            ))}
          </Grid>
          {errors.days && (
            <Typography color="error" variant="body2" sx={{ marginTop: 1 }}>
              {errors.days.message}
            </Typography>
          )}
        </Grid>

        {/* Submit Button */}
        <Grid
          item
          xs={12}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
        >
          {selectedEvent?.type === "OWN_DYNAMIC_RATE" && (
            <Button
              variant="contained"
              color="error"
              onClick={() => selectedEvent && onEventDelete?.(selectedEvent)}
            >
              Delete
            </Button>
          )}
          <PrimaryButton
            isLoading={isLoading || isSubmitting}
            onClick={handleSubmit(onSubmit)}
            label="Save"
            loadingText="Loading..."
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddRatePrice;
