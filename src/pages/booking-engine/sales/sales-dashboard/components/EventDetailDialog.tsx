import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from "@mui/material";

type Event = {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  meetingSpace: string;
  notes?: string;
  color?: string;
};

type Props = {
  open: boolean;
  event: Event | null;
  onClose: () => void;
};

const EventDetailDialog: React.FC<Props> = ({ open, event, onClose }) => {
  if (!event) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Event Details</DialogTitle>
      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={2}>
          <Typography>
            <strong>Name:</strong> {event.name}
          </Typography>
          <Typography>
            <strong>Time:</strong> {event.startTime} - {event.endTime}
          </Typography>
          <Typography>
            <strong>Meeting Space:</strong> {event.meetingSpace}
          </Typography>
          {event.notes && (
            <Typography>
              <strong>Notes:</strong> {event.notes}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EventDetailDialog;
