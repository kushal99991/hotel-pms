import React, { useEffect, useState } from "react";
import { Box, Typography, styled } from "@mui/material";
import moment from "moment";
import { CalendarView } from "../Calendar";

interface DaysOfWeekProps {
  currentDate: Date;
  view: "month" | "week" | "day";
}

const CalendarSubHeader: React.FC<DaysOfWeekProps> = ({
  currentDate,
  view,
}) => {
  const [numberOfDays, setNumberOfDays] = useState<moment.Moment[]>([]);

  useEffect(() => {
    const daysOfWeek = [];
    switch (view) {
      case CalendarView.DAY:
        calculateDayWiseNoOfDays();
        break;
      default:
        // Get days for the current week
        for (let i = 0; i < 7; i++) {
          const start = moment(currentDate).startOf("week");
          const day = start.add(i, "day");
          daysOfWeek.push(moment(day));
        }
        setNumberOfDays(daysOfWeek);
        break;
    }
  }, [view, currentDate]);

  const calculateDayWiseNoOfDays = () => {
    const daysOfWeek = [];
    const startOfMonth = moment(currentDate).startOf("month");
    const endOfMonth = moment(currentDate).endOf("month");
    const startDayOfWeek = startOfMonth.day();
    if (view !== CalendarView.DAY) {
      if (startDayOfWeek > 0) {
        for (let i = startDayOfWeek - 1; i >= 0; i--) {
          const day = moment(startOfMonth).subtract(i + 1, "days");
          daysOfWeek.push(day);
        }
      }
    }

    // Add current month days
    for (let i = 0; i < endOfMonth.date(); i++) {
      const day = moment(startOfMonth).add(i, "days");
      daysOfWeek.push(day);
    }

    // Fill trailing days to complete the row (if necessary)
    if (view !== CalendarView.DAY) {
      const remainingDays = 7 - (daysOfWeek.length % 7);
      if (remainingDays < 7) {
        for (let i = 0; i < remainingDays; i++) {
          const day = moment(endOfMonth).add(i + 1, "days");
          daysOfWeek.push(day);
        }
      }
    }

    setNumberOfDays(daysOfWeek);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row", // Display in a row for day view
        flexWrap: "nowrap", // Prevent wrapping (only horizontal scroll if needed)
        paddingBottom: 1,
      }}
    >
      {view === CalendarView.DAY && (
        <DayOfWeekCell key={0}>
          <Typography
            sx={{
              fontWeight: "bold",
              textAlign: "center",
              whiteSpace: "nowrap",
              width: "200px",
            }}
          >
            Rate Code
          </Typography>
        </DayOfWeekCell>
      )}
      {numberOfDays.map((day, index) => (
        <DayOfWeekCell key={index}>
          {view === CalendarView.DAY ? (
            <Box display="flex" alignItems="center" flexDirection="column">
              <Typography
                sx={{
                  fontWeight: "bold",
                  textAlign: "center",
                  whiteSpace: "nowrap",
                  width: "200px",
                }}
                fontSize="13px"
              >
                {day.format("MMM/DD")}
              </Typography>
              <Typography
                sx={{
                  fontWeight: "bold",
                  textAlign: "center",
                  whiteSpace: "nowrap",
                  width: "200px",
                }}
                fontSize="12px"
              >
                {day.format("dddd")}
              </Typography>
            </Box>
          ) : (
            <Typography
              sx={{
                fontWeight: "bold",
                textAlign: "center",
                whiteSpace: "nowrap",
                width: "200px",
              }}
              fontSize="14px"
            >
              {view === CalendarView.MONTH
                ? day.format("dddd")
                : view === CalendarView.WEEK
                  ? day.format("MMM/DD, ddd")
                  : day.format("MMM/DD, ddd")}
            </Typography>
          )}
        </DayOfWeekCell>
      ))}
    </Box>
  );
};

const DayOfWeekCell = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontWeight: "bold",
  padding: theme.spacing(1),
  minWidth: "120px",
  backgroundColor: "#f6f6f6",
  color: "black",
}));

export default CalendarSubHeader;
