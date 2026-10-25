import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import moment from "moment";
import { CalendarView, ICalendarEvent } from "../Calendar";
import CalendarMonthCell from "./CalendarMonthCell";
import { getMoment } from "utils/helperFunctions/common";
import useAuth from "hooks/useAuth";

interface DaysOfWeekProps {
  currentDate: Date;
  view: CalendarView;
  events: ICalendarEvent[];
  onDateClick?: (date: Date, eventName?: string) => void;
  onEventClick?: (date: ICalendarEvent) => void;
}

const CalendarDays: React.FC<DaysOfWeekProps> = ({
  currentDate,
  view,
  events,
  onDateClick,
  onEventClick,
}) => {
  const { currentTimeZone } = useAuth();
  const [numberOfDays, setNumberOfDays] = useState<moment.Moment[]>([]);

  useEffect(() => {
    const daysOfWeek = [];

    const startOfMonth = getMoment(currentDate, currentTimeZone).startOf(
      "month"
    );
    const endOfMonth = getMoment(currentDate, currentTimeZone).endOf("month");

    // Calculate preceding days
    const startDayOfWeek = startOfMonth.day(); // 0 (Sunday) to 6 (Saturday)
    if (startDayOfWeek > 0) {
      for (let i = startDayOfWeek - 1; i >= 0; i--) {
        const day = moment(startOfMonth).subtract(i + 1, "days");
        daysOfWeek.push(day);
      }
    }

    // Add current month days
    for (let i = 0; i < endOfMonth.date(); i++) {
      const day = moment(startOfMonth).add(i, "days");
      daysOfWeek.push(day);
    }

    // Fill trailing days to complete the row (if necessary)
    const remainingDays = 7 - (daysOfWeek.length % 7);
    if (remainingDays < 7) {
      for (let i = 0; i < remainingDays; i++) {
        const day = moment(endOfMonth).add(i + 1, "days");
        daysOfWeek.push(day);
      }
    }

    setNumberOfDays(daysOfWeek);
  }, [view, currentDate]);

  const renderTableRows = () => {
    const rows: React.ReactNode[] = [];
    let cells: React.ReactNode[] = [];

    numberOfDays.forEach((day, index) => {
      const isStartOfWeek = index % 7 === 0;
      const isEndOfWeek = (index + 1) % 7 === 0;

      cells.push(
        <CalendarMonthCell
          key={index}
          day={day}
          currentDate={currentDate}
          events={events}
          isStartOfWeek={isStartOfWeek}
          isEndOfWeek={isEndOfWeek}
          onDateClick={onDateClick}
          onEventClick={onEventClick}
        />
      );

      if ((index + 1) % 7 === 0 || index === numberOfDays.length - 1) {
        rows.push(
          <Box display="flex" key={`row-${index}`} width="100%">
            {cells}
          </Box>
        );
        cells = [];
      }
    });

    return rows;
  };

  return <Box>{renderTableRows()}</Box>;
};

export default CalendarDays;
