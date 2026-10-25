import React from "react";
import { Box, useTheme, useMediaQuery, styled, Skeleton } from "@mui/material";
import CalendarHeader from "./component/CalendarHeader";
import CalendarSubHeader from "./component/CalendarSubHeader";
import CalendarDays from "./component/CalendarDays";
import CalendarWeek from "./component/CalendarWeek";
import CalendarDay from "./component/CalendarDay";
import FullScreenCalendarSkeleton from "./FullScreenCalendarSkeleton";
import { IRateCodeListResponse } from "types/roomRateTypes";
import { IRoomTypes } from "types/roomTypes";

// Enum for view types
export enum CalendarView {
  MONTH = "month",
  WEEK = "week",
  DAY = "day",
}

export interface ICalendarEvent {
  name: string;
  date: Date;
  id?: number;
  tooltip?: string;
  rate_code_id?: number;
  rateCode?: IRateCodeListResponse | null;
  type?:
    | "OWN_DYNAMIC_RATE"
    | "OWN_BASE_RATE"
    | "PARENT_DYNAMIC_RATE"
    | "PARENT_BASE_RATE";
  room_type?: IRoomTypes | null;
  parent_rate_base?: number | null;
  parent_rate?: number | null;
  parentRateCodeName?: string | null;
  rate?: number | null;
  billing_units?: {
    name: "PER_DAY" | "PER_HOUR" | "PER_HALF_HOUR";
    price: string | null;
  }[];
}

interface FullScreenCalendarProps {
  events: ICalendarEvent[];
  currentDate: Date;
  view: CalendarView;
  isLoading?: boolean;
  onDateChange: (date: Date) => void;
  onViewChange: (view: CalendarView) => void;
  onDateClick?: (date: Date, eventName?: string) => void;
  onEventClick?: (date: ICalendarEvent) => void;
  onEventDelete?: (event: ICalendarEvent) => void;
  leftButton?: React.ReactNode;
}

const FullScreenCalendar: React.FC<FullScreenCalendarProps> = ({
  events,
  currentDate,
  view,
  isLoading,
  leftButton,
  onDateChange,
  onViewChange,
  onDateClick,
  onEventClick,
  onEventDelete,
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const handlePrevWeek = () => {
    const newDate = new Date(currentDate);
    if (view === CalendarView.MONTH) {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (view === CalendarView.DAY) {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setDate(newDate.getDate() - 7);
    }
    onDateChange(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentDate);
    if (view === CalendarView.MONTH) {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (view === CalendarView.DAY) {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    onDateChange(newDate);
  };

  const handleOpenMenu = (view: CalendarView) => {
    onViewChange(view);
  };

  return (
    <CalendarContainer>
      <CalendarHeader
        currentDate={currentDate}
        isSmallScreen={isSmallScreen}
        onPrevWeek={handlePrevWeek}
        onNextWeek={handleNextWeek}
        onViewChange={handleOpenMenu}
        view={view}
        leftButton={leftButton}
        onDateChange={(newDate: Date) => {
          onDateChange(newDate);
        }}
      />
      <Box
        width="100%"
        sx={{
          overflowY: "auto",
        }}
      >
        {isLoading ? (
          <FullScreenCalendarSkeleton
            view={view}
            showHeaderPlaceholder={false}
          />
        ) : (
          <>
            <Box>
              <CalendarSubHeader currentDate={currentDate} view={view} />
            </Box>
            {view === CalendarView.MONTH && (
              <CalendarDays
                events={events}
                currentDate={currentDate}
                view={view}
                onDateClick={onDateClick}
                onEventClick={onEventClick}
              />
            )}

            {view === CalendarView.WEEK && (
              <CalendarWeek
                events={events}
                currentDate={currentDate}
                view={view}
                onDateClick={onDateClick}
                onEventClick={onEventClick}
              />
            )}

            {view === CalendarView.DAY && (
              <CalendarDay
                events={events}
                currentDate={currentDate}
                view={view}
                onDateClick={onDateClick}
                onEventClick={onEventClick}
                onEventDelete={onEventDelete}
              />
            )}
            <Box sx={{ height: "10px" }}>{/* spacer */}</Box>
          </>
        )}
      </Box>
    </CalendarContainer>
  );
};

export default FullScreenCalendar;

export const CalendarContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  backgroundColor: theme.palette.background.default,
  color: theme.palette.text.primary,
}));
