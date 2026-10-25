import React from "react";
import { Chip, Typography, Box } from "@mui/material";
import CircleIcon from "@mui/icons-material/Circle";
import { ICalendarEvent } from "../Calendar";

interface IEventListProps {
  eventList: ICalendarEvent[];
  isCurrentDate?: boolean;
  onEventClick?: (date: ICalendarEvent) => void;
}

const EventList: React.FC<IEventListProps> = ({
  eventList,
  isCurrentDate,
  onEventClick,
}) => {
  return (
    <Box>
      {eventList.map((event: ICalendarEvent, index: number) => (
        <Chip
          key={index.toString()}
          icon={
            <CircleIcon
              sx={{
                color: isCurrentDate ? "#fff" : "#ccc",
                fontSize: "10px",
              }}
            />
          }
          label={
            <Typography fontSize="11px">
              {event.name} ({event?.tooltip})
            </Typography>
          }
          sx={{
            backgroundColor: "transparent",
            marginBottom: "3px",
            borderRadius: "25px",
            "&:hover": {
              backgroundColor:
                event?.type === "DYNAMIC" ? "rgb(7, 170, 173)" : "#005bb5",
              color: "#fff",
              cursor: "pointer",
              "& .MuiChip-icon": {
                color: "#fff",
              },
            },
            fontWeight: "bold",
            padding: "3px 0",
            width: "100%",
            height: "auto",
            justifyContent: "left",
            color:
              isCurrentDate || event?.type === "DYNAMIC" ? "black" : "#000",
            "& .MuiChip-icon": {
              color:
                isCurrentDate || event?.type === "DYNAMIC" ? "#000" : "#616161",
            },
          }}
          onClick={(e) => {
            e.stopPropagation();
            onEventClick?.(event);
          }}
        />
      ))}
    </Box>
  );
};

export default EventList;
