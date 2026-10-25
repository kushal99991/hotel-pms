import React, { useEffect, useState } from "react";
import { Box, Typography, styled } from "@mui/material";
import moment from "moment";
import { CalendarView, ICalendarEvent } from "../Calendar";
import CalendarCell from "./CalendarCell";
import { sortRateCodesByInheritance } from "utils/helperFunctions/common";
import { IRateCodeListResponse } from "types/roomRateTypes";

interface RowMeta {
  label: string;
  parentLabel: string | null;
  events: ICalendarEvent[];
}
interface DaysOfWeekProps {
  currentDate: Date;
  view: CalendarView;
  events: ICalendarEvent[];
  onDateClick?: (date: Date, eventName?: string) => void;
  onEventClick?: (date: ICalendarEvent) => void;
  onEventDelete?: (event: ICalendarEvent) => void;
}

const CalendarDays: React.FC<DaysOfWeekProps> = ({
  currentDate,
  view,
  events,
  onDateClick,
  onEventClick,
  onEventDelete,
}) => {
  const [numberOfDays, setNumberOfDays] = useState<moment.Moment[]>([]);

  useEffect(() => {
    const daysOfWeek: moment.Moment[] = [];

    // Must use getMoment for rates to work, but debug the timezone issue
    const startOfMonth = moment(currentDate).startOf("month");
    const endOfMonth = moment(currentDate).endOf("month");

    // Calculate preceding days
    if (view !== CalendarView.DAY) {
      const startDayOfWeek = startOfMonth.day(); // 0 (Sunday) to 6 (Saturday)
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
  }, [view, currentDate]);

  const renderTableRows = (
    label: string,
    rowEvents: ICalendarEvent[],
    parentLabel?: string | null
  ) => {
    const rows: React.ReactNode[] = [];
    let cells: React.ReactNode[] = [];

    numberOfDays.forEach((day, index) => {
      const isStartOfWeek = index % 7 === 0; // Check if it's the first day of the week
      const isEndOfWeek = (index + 1) % 7 === 0; // Check if it's the last day of the week

      cells.push(
        <CalendarCell
          key={index}
          day={day}
          currentIndex={index}
          currentDate={currentDate}
          events={rowEvents}
          isStartOfWeek={isStartOfWeek}
          isEndOfWeek={isEndOfWeek}
          view={view}
          onDateClick={(date: Date) =>
            onDateClick?.(
              date,
              rowEvents[0]?.rate_code_id !== undefined &&
                rowEvents[0]?.rate_code_id !== null
                ? rowEvents[0]?.rate_code_id.toString()
                : undefined
            )
          }
          onEventClick={onEventClick}
          onEventDelete={onEventDelete}
        />
      );

      // Push row once we hit the end of a week (every 7 cells) or the last row
      if (index === numberOfDays.length - 1) {
        rows.push(
          <Box
            display="flex"
            justifyContent="space-between" // Ensure spacing is equal between cells
            flexWrap="nowrap" // Prevent cells from wrapping
            key={`row-${index}`}
            sx={{
              minWidth: "120px",
            }}
          >
            <EventListColumn key={`event-${index}`}>
              <Typography
                variant="caption"
                sx={{ fontWeight: "bold", textAlign: "center" }}
              >
                {label ? (
                  parentLabel ? (
                    `${parentLabel} → ${label}`
                  ) : (
                    label
                  )
                ) : (
                  <Typography variant="caption">No Events</Typography>
                )}
              </Typography>
            </EventListColumn>
            {cells}
          </Box>
        );
        cells = [];
      }
    });

    return rows;
  };

  const buildRowMeta = (): RowMeta[] => {
    const rateCodeGroups = new Map<number, ICalendarEvent[]>();
    const fallbackGroups = new Map<string, ICalendarEvent[]>();

    events.forEach((event) => {
      const rateCodeId = event.rate_code_id;
      if (rateCodeId !== undefined && rateCodeId !== null) {
        if (!rateCodeGroups.has(rateCodeId)) {
          rateCodeGroups.set(rateCodeId, []);
        }
        rateCodeGroups.get(rateCodeId)!.push(event);
      } else {
        const key = event.tooltip ?? "No Rate Code";
        if (!fallbackGroups.has(key)) {
          fallbackGroups.set(key, []);
        }
        fallbackGroups.get(key)!.push(event);
      }
    });

    const sortedRateCodesInput: IRateCodeListResponse[] = Array.from(
      rateCodeGroups.values()
    )
      .map((group) => group[0]?.rateCode ?? null)
      .filter(
        (rateCode): rateCode is IRateCodeListResponse => rateCode !== null
      );

    const sortedRateCodes = sortRateCodesByInheritance(sortedRateCodesInput);

    const seenRateCodeIds = new Set<number>();

    const sortedRateRows: RowMeta[] = sortedRateCodes.reduce<RowMeta[]>(
      (acc, rateCode) => {
        const group = rateCodeGroups.get(rateCode.id);
        if (!group) {
          return acc;
        }
        seenRateCodeIds.add(rateCode.id);
        acc.push({
          label: rateCode.name,
          parentLabel: group[0]?.parentRateCodeName ?? null,
          events: group,
        });
        return acc;
      },
      []
    );

    const remainingRateRows: RowMeta[] = Array.from(rateCodeGroups.entries())
      .filter(([id]) => !seenRateCodeIds.has(id))
      .map(([, group]) => ({
        label: group[0]?.rateCode?.name ?? group[0]?.tooltip ?? "No Rate Code",
        parentLabel: group[0]?.parentRateCodeName ?? null,
        events: group,
      }));

    const fallbackRows: RowMeta[] = Array.from(fallbackGroups.entries()).map(
      ([label, group]) => ({
        label,
        parentLabel: group[0]?.parentRateCodeName ?? null,
        events: group,
      })
    );

    const combinedRows = [
      ...sortedRateRows,
      ...remainingRateRows,
      ...fallbackRows,
    ];

    return combinedRows.length > 0
      ? combinedRows
      : [
          {
            label: "No Rate Code",
            parentLabel: null,
            events: [],
          },
        ];
  };

  const rowMetaList = buildRowMeta();

  return (
    <Box>
      {rowMetaList.map((row, index) =>
        renderTableRows(row.label, row.events, row.parentLabel)
      )}
    </Box>
  );
};

const EventListColumn = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  minWidth: "120px",
  backgroundColor: "#f6f6f6",
  borderRight: `none`,
  borderBottom: `1px solid #eeeeee`,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  borderBottomWidth: 1,
  borderBottomStyle: "solid",
  position: "absolute",
  zIndex: 2,
  boxShadow: "2px 0 5px rgba(0, 0, 0, 0.1)",
}));

export default CalendarDays;
