import React from "react";
import { Card, Typography, Link, Chip, Box } from "@mui/material";
import { useDrag } from "react-dnd";
import { Event } from "types/salesTypes";

interface EventDetailProps {
  event: Event;
  onClick: (event: Event) => void;
}

const EventDetail: React.FC<EventDetailProps> = ({ event, onClick }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "event",
    item: { event },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <Box ref={drag as unknown as React.Ref<HTMLDivElement>}>
      <Card
        onClick={() => onClick?.(event)}
        sx={{
          opacity: isDragging ? 0.4 : 1,
          bgcolor: event.color || "#9e9e9e",
          color: event.contrastColor || "#1A1A1A",
          borderRadius: 2,
          px: 1,
          py: 1.2,
          minHeight: 72,
          display: "flex",
          flexDirection: "column",
          gap: 0.5,
          fontSize: "0.75rem",
          lineHeight: 1.2,
          boxShadow: 2,
          cursor: "grab",
          animation: "fadeInUp 0.5s ease",
          "&:hover": {
            opacity: 0.9,
          },
          "@keyframes fadeInUp": {
            from: { opacity: 0, transform: "translateY(10px)" },
            to: { opacity: 1, transform: "translateY(0)" },
          },
        }}
      >
        {(event.startTime || event.endTime) && (
          <Typography sx={{ fontWeight: 700, fontSize: "0.75rem" }}>
            {event.startTime} - {event.endTime}
          </Typography>
        )}
        <Typography sx={{ fontWeight: 600 }}>{event.name}</Typography>
        {event.meetingSpace && (
          <Typography sx={{ fontWeight: 500 }}>
            Loc: {event.meetingSpace}
          </Typography>
        )}
        {event.notes?.includes("Catering") && (
          <Link
            href="#"
            underline="hover"
            sx={{ color: "inherit", fontWeight: 600 }}
          >
            Catering
          </Link>
        )}
        {event.isShoulder && (
          <Chip
            label="Shoulder"
            size="small"
            sx={{
              alignSelf: "flex-start",
              border: `1px dashed ${event.contrastColor || "#1A1A1A"}`,
              color: event.contrastColor || "#1A1A1A",
              backgroundColor: "transparent",
              fontWeight: 400,
              fontSize: "0.58rem",
              height: 16,
              opacity: 0.55,
              letterSpacing: "0.03em",
            }}
          />
        )}
      </Card>
    </Box>
  );
};

export default EventDetail;
