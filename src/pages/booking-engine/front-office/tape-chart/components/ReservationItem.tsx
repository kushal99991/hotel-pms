import React from "react";
import { Box, Typography, Tooltip } from "@mui/material";
import { useDrag } from "react-dnd";
import { ReservationStatusEnum } from "constants/reservation";
import { IReservationResponse } from "types/reservationTypes";
import moment from "moment";

interface ReservationItemProps {
  reservation: IReservationResponse;
  startDate: Date;
  dayWidth: number;
  onClick: () => void;
  onMove: (
    reservationId: string,
    targetRoomNumber: string | null,
    date: Date
  ) => void;
}

const ReservationItem: React.FC<ReservationItemProps> = ({
  reservation,
  startDate,
  dayWidth,
  onClick,
}) => {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: "reservation",
      item: { id: reservation.id },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [reservation.id]
  );

  // const start = differenceInDays(new Date(reservation.start_date), startDate);
  const start = moment(reservation.start_date).diff(moment(startDate), "days");
  const duration =
    moment(reservation.end_date).diff(moment(reservation.start_date), "days") +
    1;

  return (
    <Tooltip title="Click for details or drag to reassign">
      <Box
        ref={drag as unknown as React.Ref<HTMLDivElement>}
        onClick={onClick}
        sx={{
          position: "absolute",
          left: `${start * dayWidth}px`,
          width: `${duration * dayWidth}px`,
          height: "40px",
          bgcolor:
            reservation.status === ReservationStatusEnum.ARRIVING
              ? "success.light"
              : "warning.light",
          border: 1,
          borderColor:
            reservation.status === ReservationStatusEnum.ARRIVING
              ? "success.main"
              : "warning.main",
          borderRadius: 1,
          display: "flex",
          alignItems: "center",
          px: 1,
          cursor: "grab",
          opacity: isDragging ? 0.6 : 1,
          "&:hover": {
            transform: "translateY(-2px)",
            transition: "transform 0.2s",
            boxShadow: 1,
          },
          "&:active": {
            cursor: "grabbing",
          },
        }}
        role="button"
        aria-label={`Reservation for ${reservation.reservation_first_guest_info.first_name} ${reservation.reservation_first_guest_info.last_name}`}
      >
        <Typography variant="caption" sx={{ fontWeight: "medium" }}>
          {`${reservation.reservation_first_guest_info.first_name} ${reservation.reservation_first_guest_info.last_name}`}
        </Typography>
      </Box>
    </Tooltip>
  );
};

export default ReservationItem;
