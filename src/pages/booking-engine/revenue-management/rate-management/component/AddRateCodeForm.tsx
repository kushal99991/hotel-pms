import React, { useEffect, useState } from "react";
import { Box, Grid, TextField, Autocomplete } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import { rateCodeValidationSchema } from "utils/validations.utils";
import { ILinkRateCodeFormRequest } from "types/roomRateTypes";
import {
  useGetRatesRateCodeMutation,
  useLinkRateCodeMutation,
} from "services/roomRateSlice";
import useAuth from "hooks/useAuth";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { appConfig } from "config/app.config";
import dayjs from "dayjs";
import useSnackbar from "hooks/useSnackbar";
import { getMoment } from "utils/helperFunctions/common";

interface IAddRateCodeFormProps {
  selectedRoomType: number;
  onClose: () => void;
  onRefresh?: () => void;
}

const AddRateCodeForm: React.FC<IAddRateCodeFormProps> = ({
  onClose,
  onRefresh,
  selectedRoomType,
}) => {
  const { users, currentTimeZone } = useAuth();
  const { openSnackbar } = useSnackbar();

  const [datePickerOpen, setDatePickerOpen] = useState<{
    startDatePicker: boolean;
    endDatePicker: boolean;
  }>({
    startDatePicker: false,
    endDatePicker: false,
  });

  const { control, handleSubmit } = useForm<ILinkRateCodeFormRequest>({
    resolver: yupResolver(rateCodeValidationSchema),
    defaultValues: {
      rate_code_id: 0,
      date: getMoment(null, currentTimeZone).format("YYYY-MM-DD"),
      rate: 0,
      room_type_id: 0,
    },
  });
  const [linkRateCode, { isLoading }] = useLinkRateCodeMutation();
  const [getRatesRateCode, { data: rateCodesList }] =
    useGetRatesRateCodeMutation();

  useEffect(() => {
    if (users?.defaultPropertyId) {
      getRatesRateCode({ property_id: users.defaultPropertyId });
    }
  }, [users?.defaultPropertyId]);

  const onSubmit = async (data: ILinkRateCodeFormRequest) => {
    data.room_type_id = selectedRoomType;
    data.date = getMoment(data.date, currentTimeZone).format("YYYY-MM-DD");
    const response = await linkRateCode(data);
    if (response.error) {
      openSnackbar(
        `This rate code has already been added for the selected date. Please choose a different date to add the rate code.`,
        "warning"
      );
      return false;
    }
    openSnackbar(`Rate code saved successfully!`, "success");
    onRefresh?.();
    onClose();
  };

  return (
    <Box>
      <Grid container>
        {/* Start Date Picker */}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Grid item xs={12}>
            <Controller
              name="date"
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
                    open={datePickerOpen.startDatePicker}
                    onOpen={() =>
                      setDatePickerOpen((prev) => ({
                        ...prev,
                        startDatePicker: true,
                      }))
                    }
                    onClose={() =>
                      setDatePickerOpen((prev) => ({
                        ...prev,
                        startDatePicker: false,
                      }))
                    }
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: invalid,
                        helperText: error?.message,
                        inputProps: {
                          readOnly: true,
                          style: {
                            cursor: "pointer",
                          },
                        },
                        onClick: () =>
                          setDatePickerOpen((prev) => ({
                            ...prev,
                            startDatePicker: true,
                          })),
                      },
                    }}
                  />
                </Box>
              )}
            />
          </Grid>
        </LocalizationProvider>

        {/* Rate Code Autocomplete */}
        <Grid item xs={12}>
          <Controller
            name="rate_code_id"
            control={control}
            render={({ field, fieldState: { error, invalid } }) => (
              <Autocomplete
                {...field}
                options={(rateCodesList ?? [])
                  .slice()
                  .sort((a, b) => a.name.localeCompare(b.name))}
                getOptionLabel={(option) => option.name}
                value={
                  (rateCodesList ?? []).find(
                    (rate) => rate.id === field.value
                  ) || null
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

        {/* Room Rate */}
        <Grid item xs={12}>
          <Controller
            name="rate"
            control={control}
            render={({ field, fieldState: { error, invalid } }) => (
              <TextField
                {...field}
                label="Room Rate"
                fullWidth
                value={field.value}
                margin="normal"
                error={invalid}
                helperText={error?.message}
              />
            )}
          />
        </Grid>

        {/* Submit Button */}
        <Grid item xs={12}>
          <PrimaryButton
            label="Save"
            isLoading={isLoading}
            onClick={handleSubmit(onSubmit)}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddRateCodeForm;
