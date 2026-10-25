import { Controller, useFormContext } from "react-hook-form";
import { Box, Divider, Grid, Typography } from "@mui/material";
import { DatePicker, LocalizationProvider, PickersDay, PickersDayProps, PickersLayoutProps } from "@mui/x-date-pickers";
import { usePickerLayout } from "@mui/x-date-pickers/PickersLayout";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment";
import React, { useState } from "react";
import { ISalesGroupDetail } from "types/salesTypes";
import { getMoment } from "utils/helperFunctions/common";
import useAuth from "hooks/useAuth";
import { LCColors } from "theme/Colors";

interface GroupDateRangeSelectProps {
  group?: ISalesGroupDetail;
}

type DateSegment = "shoulder_start" | "main" | "shoulder_end";

function getDateSegment(
  date: moment.Moment,
  group: ISalesGroupDetail,
  currentTimeZone: string
): DateSegment | null {
  // date coming from Mui is not adjusted to timezone, normalize for accurate compare
  const normalizedDate = getMoment(date.format("YYYY-MM-DD"), currentTimeZone, true);
  const groupArrival = getMoment(group.group_arrival_date, currentTimeZone, true);
  const groupDeparture = getMoment(group.group_departure_date, currentTimeZone, true);
  const shoulderArrival = group.shoulder_arrival_date
    ? getMoment(group.shoulder_arrival_date, currentTimeZone, true)
    : null;
  const shoulderDeparture = group.shoulder_departure_date
    ? getMoment(group.shoulder_departure_date, currentTimeZone, true)
    : null;

  if (shoulderArrival && normalizedDate.isBefore(groupArrival) && normalizedDate.isSameOrAfter(shoulderArrival)) {
    return "shoulder_start";
  }
  if (normalizedDate.isSameOrAfter(groupArrival) && normalizedDate.isBefore(groupDeparture)) {
    return "main";
  }
  if (shoulderDeparture && normalizedDate.isSameOrAfter(groupDeparture) && normalizedDate.isSameOrBefore(shoulderDeparture)) {
    return "shoulder_end";
  }
  return null;
}

const SHOULDER_COLOR = LCColors.brown;

function accentColorForSegment(segment: DateSegment | null): string | null {
  if (segment === "main") return LCColors.darkBlue;
  if (segment === "shoulder_start" || segment === "shoulder_end") return SHOULDER_COLOR;
  return null;
}

const ALL_LEGEND_ITEMS: { segment: DateSegment; label: string; color: string }[] = [
  { segment: "main", label: "Main Dates", color: LCColors.darkBlue },
  { segment: "shoulder_start", label: "Shoulder Dates", color: SHOULDER_COLOR },
];

// ─── CustomDay ───────────────────────────────────────────────────────────────

interface CustomDayProps extends PickersDayProps<moment.Moment> {
  group?: ISalesGroupDetail;
  currentTimeZone?: string;
}

function CustomDay({ group, currentTimeZone, day, outsideCurrentMonth, ...other }: CustomDayProps) {
  const segment =
    group && currentTimeZone && !outsideCurrentMonth
      ? getDateSegment(day, group, currentTimeZone)
      : null;
  const accentColor = accentColorForSegment(segment);

  return (
    <Box sx={{ position: "relative", display: "inline-flex" }}>
      <PickersDay day={day} outsideCurrentMonth={outsideCurrentMonth} {...other} />
      {accentColor && !outsideCurrentMonth && (
        <Box
          sx={{
            position: "absolute",
            bottom: 2,
            left: "50%",
            transform: "translateX(-50%)",
            width: "48%",
            height: 3,
            borderRadius: "2px",
            backgroundColor: accentColor,
            pointerEvents: "none",
          }}
        />
      )}
    </Box>
  );
}

// ─── CalendarLegendContent ───────────────────────────────────────────────────

interface CalendarLegendContentProps {
  group?: ISalesGroupDetail;
}

function CalendarLegendContent({ group }: CalendarLegendContentProps) {
  if (!group) return null;

  const hasShoulderDates = !!group.shoulder_arrival_date || !!group.shoulder_departure_date;
  const visibleItems = ALL_LEGEND_ITEMS.filter(({ segment }) => {
    if (segment === "shoulder_start") return hasShoulderDates;
    return true;
  });

  return (
    <Box sx={{ px: 2, pb: 1.5 }}>
      <Divider sx={{ mb: 1.5 }} />
      <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
        {visibleItems.map(({ segment, label, color }) => (
          <Box key={segment} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: color,
                flexShrink: 0,
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// ─── CustomPickerLayout ───────────────────────────────────────────────────────

interface CustomPickerLayoutProps extends PickersLayoutProps<moment.Moment | null, moment.Moment, any> {
  group?: ISalesGroupDetail;
}

function CustomPickerLayout({ group, ...props }: CustomPickerLayoutProps) {
  const { toolbar, content } = usePickerLayout(props);
  return (
    <Box>
      {toolbar}
      {content}
      <CalendarLegendContent group={group} />
    </Box>
  );
}

// ─── GroupDateRangeSelect ─────────────────────────────────────────────────────

const GroupDateRangeSelect: React.FC<GroupDateRangeSelectProps> = ({ group }) => {
  const { control, watch } = useFormContext();
  const { currentTimeZone } = useAuth();
  const checkIn = watch("startDate");
  const checkOut = watch("endDate");
  const [endOpen, setEndOpen] = useState(false);

  // Calculate min/max dates based on group shoulder dates
  const minArrivalDate = group?.shoulder_arrival_date
    ? getMoment(group.shoulder_arrival_date, currentTimeZone, true)
    : group?.group_arrival_date
      ? getMoment(group.group_arrival_date, currentTimeZone, true)
      : moment().startOf("day");

  const maxDepartureDate = group?.shoulder_departure_date
    ? getMoment(group.shoulder_departure_date, currentTimeZone, true)
    : group?.group_departure_date
      ? getMoment(group.group_departure_date, currentTimeZone, true)
      : undefined;

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

  const daySlotProps = { group, currentTimeZone } as any;
  const layoutSlotProps = { group } as any;

  return (
    <Grid container alignItems="center" spacing={2}>
      <Grid item xs={12}>
        <Typography fontWeight={700}>Arrival / Departure</Typography>
      </Grid>

      <Grid item xs={2}>
        <Controller
          name="startDate"
          control={control}
          render={({ field, fieldState }) => (
            <LocalizationProvider dateAdapter={AdapterMoment}>
              <DatePicker
                label="Check-in"
                value={field.value ? moment(field.value) : null}
                onChange={(newVal) => {
                  field.onChange(newVal ? newVal.toDate() : null);
                  // after selecting start date, open end date picker
                  setEndOpen(true);
                }}
                minDate={minArrivalDate}
                maxDate={
                  checkOut ? moment(checkOut).subtract(1, "day") : undefined
                }
                slots={{ day: CustomDay, layout: CustomPickerLayout }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                    error: !!fieldState.error,
                    helperText: fieldState.error?.message,
                  },
                  day: daySlotProps,
                  layout: layoutSlotProps,
                }}
              />
            </LocalizationProvider>
          )}
        />
      </Grid>

      <Grid item xs="auto" container justifyContent="center">
        <Typography fontWeight={700}>~</Typography>
      </Grid>

      <Grid item xs={2}>
        <Controller
          name="endDate"
          control={control}
          render={({ field, fieldState }) => (
            <LocalizationProvider dateAdapter={AdapterMoment}>
              <DatePicker
                label="Check-out"
                value={field.value ? moment(field.value) : null}
                onChange={(newVal) => {
                  field.onChange(newVal ? newVal.toDate() : null);
                  setEndOpen(false); // close after selecting
                }}
                open={endOpen}
                onOpen={() => setEndOpen(true)}
                onClose={() => setEndOpen(false)}
                minDate={
                  checkIn
                    ? moment(checkIn).add(1, "day")
                    : moment().add(1, "day")
                }
                maxDate={maxDepartureDate}
                slots={{ day: CustomDay, layout: CustomPickerLayout }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                    error: !!fieldState.error,
                    helperText: fieldState.error?.message,
                  },
                  day: daySlotProps,
                  layout: layoutSlotProps,
                }}
              />
            </LocalizationProvider>
          )}
        />
      </Grid>

      <Grid item xs={12} sx={{ "&.MuiGrid-item": { pt: 1 } }}>
        <Typography variant="body2" fontWeight="bold" mb={3}>
          Total Nights: {totalNights}
        </Typography>
      </Grid>
    </Grid>
  );
};

export default GroupDateRangeSelect;
