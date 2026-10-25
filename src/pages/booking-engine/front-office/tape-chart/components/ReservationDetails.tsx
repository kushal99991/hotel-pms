import React, { useCallback, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Divider,
  Chip,
  Button,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { IReservationResponse } from "types/reservationTypes";
import { Link } from "react-router-dom";
import { getCurrentRoom } from "utils/reservations";
import { ReservationStatusEnum } from "constants/reservation";
import { statusChips } from "./AssignmentOverview";
import moment from "moment";
import { useTapeChartContext } from "contexts/TapeChartContext";

interface ReservationDetailsProps {
  reservation: IReservationResponse;
  onClose: () => void;
}

const ReservationDetails: React.FC<ReservationDetailsProps> = ({
  reservation,
  onClose,
}) => {
  const { onUnassign: handleOnUnassign } = useTapeChartContext();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const room = getCurrentRoom(reservation);
  const rawStatus = reservation.status;

  const onUnassign = useCallback(async () => {
    const response = await handleOnUnassign(Number(reservation.id));
    if (!response) return false;
    setConfirmOpen(false);
    onClose?.();
  }, [reservation]);

  const displayInfo = useMemo(() => {
    switch (rawStatus) {
      case ReservationStatusEnum.COMPLETED:
      case ReservationStatusEnum.CANCELED:
        return statusChips["Do Not Move"];
      case ReservationStatusEnum.ARRIVING:
        return { label: "Arriving", color: "#4CAF50", contrastColor: "#fff" };
      case ReservationStatusEnum.DEPARTING:
        return { label: "Departing", color: "#F44336", contrastColor: "#fff" };
      case ReservationStatusEnum.DEPARTED:
        return { label: "Departed", color: "#BDBDBD", contrastColor: "#000" };
      case ReservationStatusEnum.RESERVED:
        return statusChips["RESERVED"];
      default:
        return (
          statusChips[rawStatus] ?? {
            label: rawStatus,
            color: "#BDBDBD",
            contrastColor: "#FFFFFF",
          }
        );
    }
  }, [rawStatus]);

  const canUnassign = useMemo(() => {
    return [
      ReservationStatusEnum.RESERVED,
      ReservationStatusEnum.ARRIVING,
    ].includes(rawStatus);
  }, [rawStatus]);

  return (
    <Paper sx={{ width: 420, maxWidth: "95vw", p: 3, position: "relative" }}>
      {/* Close Icon */}
      <IconButton
        onClick={onClose}
        sx={{ position: "absolute", right: 8, top: 8 }}
      >
        <CloseIcon />
      </IconButton>

      {/* Title */}
      <Typography variant="h6" gutterBottom>
        Reservation Details
      </Typography>
      <Divider sx={{ my: 2 }} />

      {/* Folio */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Folio No
        </Typography>
        <Link
          to={`/booking-engine/reservations/${reservation.id}`}
          target="_blank"
        >
          <Typography
            variant="body1"
            color="primary"
            sx={{ textDecoration: "underline", cursor: "pointer" }}
          >
            #{reservation.id}
          </Typography>
        </Link>
      </Box>

      {/* Guest */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Guest
        </Typography>
        <Typography variant="body1">
          {reservation.reservation_first_guest_info.first_name}{" "}
          {reservation.reservation_first_guest_info.last_name}
        </Typography>
      </Box>

      {/* Dates */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Dates
        </Typography>
        <Typography variant="body1">
          {moment(reservation.start_date).format("MMMM Do, YYYY")} –{" "}
          {moment(reservation.end_date).format("MMMM Do, YYYY")}
        </Typography>
      </Box>

      {/* Room */}
      {room?.room_number && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Room
          </Typography>
          <Typography variant="body1">{room.room_number}</Typography>
        </Box>
      )}

      {/* Contact */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Contact
        </Typography>
        <Typography variant="body1">
          {reservation.reservation_first_guest_info.email}
        </Typography>
        <Typography variant="body1">
          {reservation.reservation_first_guest_info?.phone ?? ""}
        </Typography>
      </Box>

      {/* Guests */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Guests
        </Typography>
        <Typography variant="body1">
          {reservation.guests?.length ?? "0"} person(s)
        </Typography>
      </Box>

      {/* Status */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Status
        </Typography>
        <Chip
          label={displayInfo?.label ?? rawStatus}
          size="small"
          sx={{
            backgroundColor: displayInfo?.color,
            color: displayInfo?.contrastColor,
          }}
        />
      </Box>

      {/* Special Requests */}
      {reservation.special_requests && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Special Requests
          </Typography>
          <Typography variant="body1">
            {reservation.special_requests}
          </Typography>
        </Box>
      )}

      {/* Actions */}
      {canUnassign && (
        <Box sx={{ mt: 4 }}>
          <Divider sx={{ mb: 2 }} />
          <Tooltip title="Remove room assignment for this reservation" arrow>
            <Button
              fullWidth
              variant="outlined"
              color="error"
              onClick={() => setConfirmOpen(true)}
            >
              Unassign Reservation
            </Button>
          </Tooltip>
        </Box>
      )}

      {/* Confirm Dialog */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Unassign Reservation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to unassign this reservation from its room?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={onUnassign} color="error" variant="contained">
            Unassign
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ReservationDetails;
