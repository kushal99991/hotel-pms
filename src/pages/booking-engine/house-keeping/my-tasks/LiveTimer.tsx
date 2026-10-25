import { Typography } from "@mui/material";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { convertUtcToTimezone } from "utils/helperFunctions/common";

const LiveTimer: React.FC<{
  startTime: Date | null;
  endTime?: Date | null;
  timeZone: string;
}> = ({ startTime, endTime, timeZone }) => {
  const [durationText, setDurationText] = useState("");

  const calculateDuration = () => {
    const start = convertUtcToTimezone(startTime, timeZone);
    const end = convertUtcToTimezone(endTime, timeZone);

    if (!start.isValid() || (endTime && !end.isValid())) return "Invalid Date";

    const duration = moment.duration(end.diff(start));
    const hours = Math.floor(duration.asHours());
    const minutes = Math.floor(duration.minutes());
    const seconds = Math.floor(duration.seconds());

    return `${hours}h ${minutes}m ${seconds}s`;
  };

  useEffect(() => {
    setDurationText(calculateDuration());
    const interval = setInterval(() => {
      setDurationText(calculateDuration());
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, endTime, timeZone]);

  return (
    <Typography variant="body2" color="error" fontWeight="bold">
      {durationText}
    </Typography>
  );
};

export default LiveTimer;
