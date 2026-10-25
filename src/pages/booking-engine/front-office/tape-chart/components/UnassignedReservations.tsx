import { TableCell, TableRow, Tooltip } from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { useDrag } from "react-dnd";
import { IReservationResponse } from "types/reservationTypes";
import moment from "moment";

interface UnassignedReservationRowProps {
  reservation: IReservationResponse;
}

const UnassignedReservationRow: React.FC<UnassignedReservationRowProps> = ({
  reservation,
}) => {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: "reservation",
      item: reservation,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [reservation.id]
  );

  const calculateTotalNights = (
    checkIn: Date | null,
    checkOut: Date | null
  ): number => {
    if (!checkIn || !checkOut) return 0;
    const checkInMoment = moment(checkIn);
    const checkOutMoment = moment(checkIn);
    const diffDays = checkOutMoment.diff(checkInMoment, "days");
    return diffDays > 1 ? diffDays : 1;
  };

  const nights = calculateTotalNights(
    new Date(reservation?.start_date),
    new Date(reservation.end_date)
  );

  return (
    <Tooltip title="Drag to assign to a room" placement="left">
      <TableRow
        ref={drag}
        hover
        sx={{
          opacity: isDragging ? 0.5 : 1,
          cursor: "grab",
          transition: "all 0.2s ease",
          "&:active": { cursor: "grabbing" },
        }}
      >
        <TableCell sx={{ color: "text.secondary", pr: 0 }}>
          <DragIndicatorIcon fontSize="small" />
        </TableCell>
        <TableCell>
          {`${reservation.reservation_first_guest_info.first_name} ${reservation.reservation_first_guest_info.last_name}`}
        </TableCell>
        <TableCell align="center">
          {reservation.room_type?.type ?? "-"}
        </TableCell>
        <TableCell align="center">{Math.round(nights)}</TableCell>
      </TableRow>
    </Tooltip>
  );
};

export default UnassignedReservationRow;
