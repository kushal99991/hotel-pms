import React from "react";
import moment from "moment";
import { Button, Tooltip, Box } from "@mui/material";
import { IReservationResponse } from "types/reservationTypes";

interface CheckInButtonProps {
  reservation?: IReservationResponse;
  onClick: () => void;
}

const CheckInButton: React.FC<CheckInButtonProps> = ({
  reservation,
  onClick,
}) => {
  function isCheckInDisabled() {
    if (!reservation) {
      return true;
    }
    const momentStart = moment(reservation.start_date);
    const momentNow = moment(new Date());
    const isArrivalDay = momentStart.isSame(momentNow, "day");
    const isAfterStart = momentNow.isAfter(momentStart);
    return !isArrivalDay && !isAfterStart;
  }
  function getTooltipContent() {
    if (!reservation) {
      return "Reservation still loading";
    }
    const momentStart = moment(reservation.start_date);
    const momentNow = moment(new Date());
    let dayDiff = momentStart.diff(momentNow, "days");
    let daysPlural = "days";
    if (dayDiff < 1) {
      // when this function runs we know we are at least 1 day ahead
      dayDiff = 1;
      daysPlural = "day";
    }
    return `Arrival date for this reservation is ${dayDiff} ${daysPlural} in the future`;
  }
  const checkInDisabled = isCheckInDisabled();
  return (
    <Tooltip title={checkInDisabled ? getTooltipContent() : ""}>
      <Box
        sx={{
          cursor: checkInDisabled ? "help" : "pointer",
        }}
      >
        <Button
          color="success"
          variant="contained"
          fullWidth
          onClick={onClick}
          disabled={checkInDisabled}
        >
          Check-In
        </Button>
      </Box>
    </Tooltip>
  );
};

export default CheckInButton;
