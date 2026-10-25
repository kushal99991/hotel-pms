import { Grid, Typography, Tooltip, styled } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { PickersDay, PickersDayProps } from "@mui/x-date-pickers";
import moment, { Moment } from "moment";
import Label from "components/elements/Label/Label";
import { useState } from "react";
import useAuth from "hooks/useAuth";

export type CommonDateRangePickerProps = {
  label?: string;
  value: [Date | null, Date | null];
  onChange: (value: [Date | null, Date | null]) => void;
  minDate?: Date;
  maxDate?: Date;
  granularMinMax?: {
    firstPickerMin?: Date;
    firstPickerMax?: Date;
    secondPickerMin?: Date;
    secondPickerMax?: Date;
  };
  timezone?: string;
  error?: boolean;
  helperText?: string;
  showNights?: boolean;
  priceMap?: Record<string, number>;
};

const CommonDateRangePicker = ({
  label,
  value,
  onChange,
  minDate,
  maxDate,
  granularMinMax,
  showNights = true,
  priceMap = {},
  error = false,
  helperText = "",
  timezone,
}: CommonDateRangePickerProps) => {
  const { currentProperty } = useAuth();
  const [checkIn, checkOut] = value;
  const [datePickerOpen, setDatePickerOpen] = useState<{
    checkInOpen: boolean;
    checkOutOpen: boolean;
  }>({
    checkInOpen: false,
    checkOutOpen: false,
  });

  const handleCheckInChange = (date: Moment | null) => {
    const newCheckIn = date ? date.toDate() : null;
    const validCheckOut =
      checkOut && newCheckIn && moment(checkOut).isAfter(newCheckIn)
        ? checkOut
        : moment(newCheckIn).add(1, "day").toDate();
    onChange([newCheckIn, validCheckOut]);
  };

  const handleCheckOutChange = (date: Moment | null) => {
    const newCheckOut = date ? date.toDate() : null;
    onChange([checkIn, newCheckOut]);
  };

  const calculateTotalNights = (
    checkIn: Date | null,
    checkOut: Date | null
  ): number => {
    if (!checkIn || !checkOut) return 0;
    const checkInMoment = moment(checkIn);
    const checkOutMoment = moment(checkOut);
    const diffDays = checkOutMoment.diff(checkInMoment, "days");
    return diffDays > 1 ? diffDays : 1;
  };

  const totalNights = calculateTotalNights(checkIn, checkOut);

  const renderDayWithPrice = (pickersDayProps: PickersDayProps<Moment>) => {
    const { day, selected, outsideCurrentMonth, ...rest } = pickersDayProps;
    const dateStr = day.format("YYYY-MM-DD");
    const price = priceMap[dateStr];

    return (
      <Tooltip title={price ? `$${price}` : ""} arrow>
        <Grid item position="relative">
          <PickersDay
            {...rest}
            day={day}
            selected={selected}
            outsideCurrentMonth={outsideCurrentMonth}
          />
          {price && (
            <Typography
              variant="caption"
              sx={{
                position: "absolute",
                bottom: 2,
                left: 0,
                right: 0,
                fontSize: "0.6rem",
                textAlign: "center",
                color: "green",
                top: "25px",
                pointerEvents: "none",
              }}
            >
              ${price}
            </Typography>
          )}
        </Grid>
      </Tooltip>
    );
  };

  function calcSecondMinDate() {
    if (granularMinMax?.secondPickerMin) {
      return moment(granularMinMax.secondPickerMin);
    }
    if (checkIn) {
      return moment(checkIn).add(1, "day");
    }
    return undefined;
  }

  function calcSecondMaxDate() {
    if (granularMinMax?.secondPickerMax) {
      return moment(granularMinMax.secondPickerMax);
    }
    if (maxDate) {
      return moment(maxDate);
    }
    return moment(checkIn).add(
      currentProperty?.max_stay_duration_days ?? 29,
      "day"
    );
  }

  const firstMinDate = granularMinMax?.firstPickerMin || minDate;
  const firstMaxDate = granularMinMax?.firstPickerMax || maxDate;

  return (
    <>
      {label && <Label>{label}</Label>}
      <Grid container gap={1}>
        <Grid item xs={5}>
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <DatePicker
              label="Check-in"
              value={checkIn ? moment(checkIn) : null}
              onChange={handleCheckInChange}
              open={datePickerOpen.checkInOpen}
              onClose={() =>
                setDatePickerOpen((prev) => ({
                  ...prev,
                  checkInOpen: false,
                  checkOutOpen: true,
                }))
              }
              onOpen={() =>
                setDatePickerOpen((prev) => ({
                  ...prev,
                  checkInOpen: true,
                  checkOutOpen: false,
                }))
              }
              minDate={firstMinDate ? moment(firstMinDate) : undefined}
              maxDate={firstMaxDate ? moment(firstMaxDate) : undefined}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: error,
                  inputProps: {
                    "data-testid": "check-in-input",
                  },
                },
              }}
              slots={{ day: (props) => renderDayWithPrice(props) }}
              timezone={timezone}
            />
          </LocalizationProvider>
        </Grid>
        <Grid
          item
          xs={1}
          alignItems="center"
          justifyContent="center"
          display="flex"
        >
          <Typography fontWeight="700">~</Typography>
        </Grid>
        <Grid item xs={5}>
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <DatePicker
              label="Check-out"
              value={checkOut ? moment(checkOut) : null}
              onChange={handleCheckOutChange}
              defaultValue={checkOut ? moment(checkOut) : null}
              disablePast
              open={datePickerOpen.checkOutOpen}
              onClose={() =>
                setDatePickerOpen((prev) => ({ ...prev, checkOutOpen: false }))
              }
              onOpen={() =>
                setDatePickerOpen((prev) => ({
                  ...prev,
                  checkInOpen: false,
                  checkOutOpen: true,
                }))
              }
              minDate={calcSecondMinDate()}
              maxDate={calcSecondMaxDate()}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: error,
                  value: checkOut ? moment(checkOut) : null,
                  inputProps: {
                    "data-testid": "check-out-input",
                  },
                },
              }}
              slots={{ day: (props) => renderDayWithPrice(props) }}
              timezone={timezone}
            />
          </LocalizationProvider>
        </Grid>
        {error && helperText && (
          <Grid item>
            <ErrorText variant="caption" color="error">
              {helperText}
            </ErrorText>
          </Grid>
        )}
      </Grid>
      {showNights && (
        <Typography fontWeight="bold" mt={1}>
          Total Nights: {totalNights}
        </Typography>
      )}
    </>
  );
};

export default CommonDateRangePicker;

const ErrorText = styled(Typography)(() => ({
  // marginTop: theme.spacing(1),
}));
