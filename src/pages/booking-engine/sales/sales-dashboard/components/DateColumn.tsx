import { Box } from "@mui/material";
import EventDetail from "./EventDetail";
import { useDrop } from "react-dnd";
import { Event } from "types/salesTypes";
import { EventItemTypes } from "constants/eventTypes";

export const DateColumn: React.FC<{
  date: string;
  events: Event[];
  onDropEvent: (eventId: Event, newDate: string) => void;
  onClickEvent: (event: Event) => void;
}> = ({ date, events, onClickEvent, onDropEvent }) => {
  const [{ isOver }, dropRef] = useDrop(() => ({
    accept: EventItemTypes.EVENT,
    drop: (item: { event: Event }) => {
      onDropEvent(item.event, date);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <Box
      key={date}
      ref={dropRef as unknown as React.Ref<HTMLDivElement>}
      sx={{
        minWidth: 140,
        maxWidth: 140,
        height: "100%",
        border: "1px solid #e0e0e0",
        bgcolor: isOver ? "#e0f7fa" : "#f5f5f5",
        p: 1,
        display: "flex",
        flexDirection: "column",
        gap: 1.2,
        borderRadius: 1,
        mr: 1,
        flexShrink: 0,
        transition: "background-color 0.3s",
      }}
    >
      {events.map((event) => (
        <EventDetail key={event.id} event={event} onClick={onClickEvent} />
      ))}
    </Box>
  );
};
