import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import moment from "moment";
import { useSalesDashboardContext } from "contexts/SalesDashboardContext";
import EventDetailDialog from "./EventDetailDialog";
import { Event, ISalesGroupListItem } from "types/salesTypes";
import { DateColumn } from "./DateColumn";
import { groupStatusDisplayValues, GroupStatusEnum } from "constants/sales";
import {
  isGroupActiveOnDate,
  isGroupOnShoulderDate,
} from "./salesGroupDateUtils";
import useAuth from "hooks/useAuth";

interface ScheduleEventGridProps {
  salesGroups: ISalesGroupListItem[];
}

const toEvent = (group: ISalesGroupListItem): Event => {
  const status = group.group_status as GroupStatusEnum;
  const displayInfo = groupStatusDisplayValues[status];

  const allStarts = [
    group.group_arrival_date,
    group.shoulder_arrival_date,
  ].filter(Boolean) as string[];
  const allEnds = [
    group.group_departure_date,
    group.shoulder_departure_date,
  ].filter(Boolean) as string[];
  const startDate = allStarts.sort()[0] ?? "";
  const endDate = allEnds.sort().reverse()[0] ?? "";

  return {
    id: group.id.toString(),
    name: group.group_name,
    startDate,
    endDate,
    startTime: "",
    endTime: "",
    booker: [group.first_name, group.last_name].filter(Boolean).join(" "),
    organization: "",
    phone: group.phone ?? "",
    email: group.email ?? "",
    payment: "Pending",
    attendees: group.rooms_booked ?? 0,
    sittingArrangement: "",
    meetingSpace: "",
    notes: group.notes ?? "",
    color: displayInfo?.color ?? "#bdbdbd",
    contrastColor: displayInfo?.contrastColor ?? "#1A1A1A",
  };
};

const ScheduleEventGrid: React.FC<ScheduleEventGridProps> = ({
  salesGroups,
}) => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [localEvents, setLocalEvents] = useState<Event[]>([]);
  const { dateColumns, containerRef } = useSalesDashboardContext();
  const { currentTimeZone } = useAuth();

  useEffect(() => {
    setLocalEvents(salesGroups.map(toEvent));
  }, [salesGroups]);

  const handleOpenDialog = (event: Event) => setSelectedEvent(event);
  const handleCloseDialog = () => setSelectedEvent(null);

  const handleDropEvent = (draggedEvent: Event, newStartDate: string) => {
    const eventDuration = moment(draggedEvent.endDate).diff(
      moment(draggedEvent.startDate),
      "days"
    );
    const newEndDate = moment(newStartDate)
      .add(eventDuration, "days")
      .format("YYYY-MM-DD");
    const updatedEvent: Event = {
      ...draggedEvent,
      startDate: newStartDate,
      endDate: newEndDate,
    };
    setLocalEvents((prev) =>
      prev.map((e) => (e.id === draggedEvent.id ? updatedEvent : e))
    );
  };

  const getEventsForDate = (date: string): Event[] =>
    localEvents.reduce<Event[]>((acc, event) => {
      const group = salesGroups.find((g) => g.id.toString() === event.id);
      const isActive = group
        ? isGroupActiveOnDate(group, date, currentTimeZone)
        : moment(date).isSame(event.startDate, "day") ||
          (moment(date).isAfter(event.startDate, "day") &&
            moment(date).isBefore(event.endDate, "day")) ||
          moment(date).isSame(event.endDate, "day");
      if (!isActive) return acc;
      const isShoulder = group
        ? isGroupOnShoulderDate(group, date, currentTimeZone)
        : false;
      acc.push({ ...event, isShoulder });
      return acc;
    }, []);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          width: "100%",
          height: "100vh",
          overflowX: "auto",
        }}
        ref={containerRef}
      >
        {dateColumns.map((date) => (
          <DateColumn
            key={date}
            date={date}
            events={getEventsForDate(date)}
            onDropEvent={handleDropEvent}
            onClickEvent={handleOpenDialog}
          />
        ))}
      </Box>

      <EventDetailDialog
        open={!!selectedEvent}
        event={selectedEvent}
        onClose={handleCloseDialog}
      />
    </>
  );
};

export default ScheduleEventGrid;
