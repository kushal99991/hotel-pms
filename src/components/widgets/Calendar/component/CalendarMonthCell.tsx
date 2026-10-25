import React from "react";
import moment from "moment";
import { Box, styled, Typography } from "@mui/material";
import { CalendarView, ICalendarEvent } from "../Calendar";
import EventList from "./EventList";

interface CalendarCellProps {
  day: moment.Moment;
  currentDate: Date;
  view?: CalendarView;
  events: ICalendarEvent[];
  isStartOfWeek: boolean;
  isEndOfWeek: boolean;
  onDateClick?: (date: Date, eventName?: string) => void;
  onEventClick?: (date: ICalendarEvent) => void;
}

const CalendarMonthCell: React.FC<CalendarCellProps> = ({
  day,
  currentDate,
  events,
  isStartOfWeek,
  isEndOfWeek,
  view,
  onDateClick,
  onEventClick,
}) => {
  const isCurrentDate = moment(day).isSame(new Date(), "day");
  const isPastDate = moment(day).isBefore(moment(), "day");

  const hasEvent = events.some(
    (event) =>
      moment(event.date).format("YYYY-MM-DD") === day.format("YYYY-MM-DD")
  );

  const targetDay = moment(day);
  const targetDayEvents = events.filter(
    (event) =>
      moment(event.date).format("YYYY-MM-DD") === targetDay.format("YYYY-MM-DD")
  );

  return (
    <Box
      display="inline-block"
      width="14.2857%"
      sx={{
        minWidth: "120px",
        position: "relative",
        pointerEvents: isPastDate ? "none" : "auto",
        opacity: isPastDate ? 0.5 : 1,
      }}
      onClick={() => !isPastDate && onDateClick?.(day.toDate())}
    >
      <DayCell
        style={{
          borderTop: "1px solid #ebebeb",
          borderBottom: "1px solid #ebebeb",
          borderLeft: isStartOfWeek ? "1px solid #ebebeb" : "none",
          borderRight: isEndOfWeek ? "1px solid #ebebeb" : "1px solid #ebebeb",
          color: isCurrentDate
            ? "black"
            : day.isSame(currentDate, "month")
              ? "inherit"
              : "gray",
          backgroundColor: isCurrentDate
            ? "#f7fff4"
            : hasEvent
              ? "#f5f5f5"
              : "initial",
          overflow: "hidden",
          padding: "5px",
          cursor: isPastDate ? "not-allowed" : "pointer",
        }}
      >
        <Typography
          sx={{
            borderRadius: isCurrentDate ? "50%" : "0",
            backgroundColor: isCurrentDate ? "#f7fff4" : "initial",
            padding: "0 5px",
            height: "30px",
          }}
        >
          {view !== CalendarView.DAY ? day.format("DD") : ""}
        </Typography>

        {hasEvent && (
          <>
            <Box height="70px" width="100%" sx={{ overflow: "auto" }}>
              <EventList
                eventList={targetDayEvents}
                isCurrentDate={isCurrentDate}
                onEventClick={onEventClick}
              />
            </Box>
          </>
        )}
      </DayCell>
    </Box>
  );
};

const DayCell = styled(Box)(() => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  height: "100px",
  cursor: "pointer",
}));

export default CalendarMonthCell;
