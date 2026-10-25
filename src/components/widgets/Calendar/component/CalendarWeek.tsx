import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import moment from "moment";
import { CalendarView, ICalendarEvent } from "../Calendar";
import CalendarMonthCell from "./CalendarMonthCell";
import useAuth from "hooks/useAuth";
import { getMoment } from "utils/helperFunctions/common";

interface DaysOfWeekProps {
  currentDate: Date;
  view: CalendarView;
  events: ICalendarEvent[];
  onDateClick?: (date: Date) => void;
  onEventClick?: (date: ICalendarEvent) => void;
}

const CalendarWeek: React.FC<DaysOfWeekProps> = ({
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
    const startOfCurrentWeek = getMoment(currentDate, currentTimeZone).startOf(
      "week"
    );
    for (let i = 0; i < 7; i++) {
      daysOfWeek.push(moment(startOfCurrentWeek).add(i, "days"));
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

export default CalendarWeek;
