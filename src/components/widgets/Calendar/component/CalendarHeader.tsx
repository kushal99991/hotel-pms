import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  IconButton,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import moment from "moment";
import { CalendarView } from "../Calendar";
import {
  DateCalendar,
  DateView,
  LocalizationProvider,
} from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { isBefore, startOfDay } from "date-fns";

interface CalendarHeaderProps {
  currentDate: Date;
  isSmallScreen: boolean;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onViewChange: (view: CalendarView) => void;
  onDateChange?: (date: Date) => void;
  view: CalendarView;
  leftButton?: React.ReactNode;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  isSmallScreen,
  onPrevWeek,
  onNextWeek,
  onViewChange,
  onDateChange,
  view,
  leftButton,
}) => {
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date>(currentDate);

  useEffect(() => {
    setSelectedDate(currentDate);
  }, [currentDate]);
  // Format the header based on the view
  const headerTitle = useMemo(() => {
    const startOfWeek = moment(currentDate).startOf("week");
    const endOfWeek = moment(currentDate).endOf("week");

    const startOfMonth = moment(currentDate).startOf("month");
    switch (view) {
      case CalendarView.MONTH:
        return moment(currentDate).format("MMMM YYYY");
      case CalendarView.WEEK:
        return startOfWeek.isSame(endOfWeek, "month")
          ? startOfWeek.format("MMMM, YYYY") // Same month
          : `${startOfWeek.format("MMM, YYYY")} - ${endOfWeek.format("MMM, YYYY")}`;
      case CalendarView.DAY:
        return `${startOfMonth.format("MMM, YYYY")}`;
      default:
        return moment(currentDate).format("MMMM YYYY");
    }
  }, [currentDate, view]);

  // Options for calendar views
  const viewOptions = [CalendarView.DAY, CalendarView.WEEK, CalendarView.MONTH];

  // Handle dialog open/close
  const handleDialogOpen = () => {
    setShowDatePicker(true);
  };

  const handleDialogClose = () => {
    setShowDatePicker(false);
  };

  // Determine the correct views for DateCalendar
  const selectDateCalendarViews: DateView[] = useMemo(() => {
    return ["year", "month", "day"];
  }, []);

  const handleDateChange = (newDate: Date) => {
    setSelectedDate(newDate);
  };

  const onSelectDate = () => {
    onDateChange?.(selectedDate);
    setShowDatePicker(false);
  };

  const setToday = () => {
    const today = new Date();
    setSelectedDate(today);
  };

  const shouldDisableDate = (date: Date) => {
    return isBefore(date, startOfDay(new Date()));
  };

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      flexWrap="wrap"
    >
      {leftButton ? (
        <Box marginLeft={3}>{leftButton}</Box>
      ) : (
        <IconButton onClick={() => onViewChange(view)}>
          <Typography fontSize="16px">
            {view.charAt(0).toUpperCase() + view.slice(1)}
          </Typography>
        </IconButton>
      )}

      <Box display="flex" justifyContent="space-between" alignItems="center">
        <IconButton onClick={onPrevWeek}>
          <ArrowBackIosIcon fontSize={isSmallScreen ? "small" : "medium"} />
        </IconButton>
        <Typography variant={"h5"} textAlign="center">
          {headerTitle}
        </Typography>
        <IconButton onClick={onNextWeek}>
          <ArrowForwardIosIcon fontSize={isSmallScreen ? "small" : "medium"} />
        </IconButton>
        <IconButton onClick={handleDialogOpen}>
          <CalendarTodayIcon />
        </IconButton>
      </Box>

      {/* View Selector */}
      <FormControl sx={{ mb: 2, maxWidth: 200 }}>
        <InputLabel id="view-select-label">View</InputLabel>
        <Select
          labelId="view-select-label"
          value={view}
          onChange={(event: SelectChangeEvent<CalendarView>) =>
            onViewChange(event.target.value as CalendarView)
          }
          label="View"
        >
          {viewOptions.map((viewOption) => (
            <MenuItem key={viewOption} value={viewOption}>
              {viewOption.charAt(0).toUpperCase() + viewOption.slice(1)} View
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Date Picker Dialog */}
      <Dialog open={showDatePicker} onClose={handleDialogClose}>
        <DialogContent sx={{ padding: 0, margin: 0 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateCalendar
              value={selectedDate}
              views={selectDateCalendarViews}
              shouldDisableDate={shouldDisableDate}
              onChange={handleDateChange}
            />
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          {/* "Today" button on the left */}
          <Button onClick={setToday} color="primary">
            Today
          </Button>
          <Button onClick={handleDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={onSelectDate} color="primary">
            Select
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CalendarHeader;
