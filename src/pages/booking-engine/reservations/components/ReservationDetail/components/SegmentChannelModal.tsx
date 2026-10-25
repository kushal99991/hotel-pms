import React, { useState } from "react";
import {
  Grid,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  Button,
  Alert,
  SelectChangeEvent,
} from "@mui/material";
import { useUpdateReservationMutation } from "services/reservationSlice";
import { IReservationResponse } from "types/reservationTypes";
import {
  marketOptionList,
  bookingChannelList,
} from "config/tables/reservations";
import CustomDropdown from "components/widgets/CustomDropdown/CustomDropdown";
import PrimaryButton from "components/elements/Button/PrimaryButton";

interface SegmentChannelModalProps {
  open: boolean;
  reservation: IReservationResponse | undefined | null;
  onCloseModal: (refreshData: boolean) => void;
}

const SegmentChannelModal: React.FC<SegmentChannelModalProps> = ({
  open,
  onCloseModal,
  reservation,
}) => {
  const [errorMessage, setErrorMessage] = useState("");
  const [channel, setChannel] = useState(reservation?.booking_channel ?? "");
  const [segment, setSegment] = useState(reservation?.market_segment ?? "");
  const [updateReservation, { isLoading: reservationUpdating }] =
    useUpdateReservationMutation();

  const onSubmit = async () => {
    updateReservation({
      id: reservation?.id,
      booking_channel: channel,
      market_segment: segment,
    }).then((resp) => {
      if (!resp.error) {
        onCloseModal(true);
      } else {
        let errorMessage = "Error updating values. Please try again";
        if (resp.error.message) {
          errorMessage = resp.error.message;
        } else if (resp.error) {
          errorMessage = resp.error as string;
        }
        setErrorMessage(errorMessage);
      }
    });
  };

  function handleCloseClick() {
    setErrorMessage("");
    onCloseModal?.(false);
  }

  function handleSegmentChange(evt: SelectChangeEvent<unknown>) {
    setSegment(evt.target.value as string);
  }

  function handleChannelChange(evt: SelectChangeEvent<unknown>) {
    setChannel(evt.target.value as string);
  }

  return (
    <Dialog open={open} onClose={handleCloseClick}>
      <DialogTitle>Update Reservation</DialogTitle>
      <DialogContent>
        <Grid container direction="column">
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}
          <Grid item>
            <CustomDropdown
              label="Market Segment"
              placeholder="Market Segment"
              options={marketOptionList}
              onChange={handleSegmentChange}
              value={segment}
              fullWidth
              aria-label="Edit_Market_Segment_Dropdown"
              data-testid="eidt-market-segment-dropdown"
            />
          </Grid>
          <Grid item mt={2}>
            <CustomDropdown
              label="Booking Channel"
              placeholder="Booking Channel"
              options={bookingChannelList}
              onChange={handleChannelChange}
              value={channel}
              fullWidth
              aria-label="Edit_Booking_Channel_Dropdown"
              data-testid="eidt-booking-channel-dropdown"
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button
          onClick={handleCloseClick}
          color="primary"
          sx={{
            fontSize: "16px",
            padding: "12px 30px",
          }}
        >
          Cancel
        </Button>
        <PrimaryButton
          label="Update"
          isLoading={reservationUpdating}
          loadingText="Updating...."
          onClick={onSubmit}
        />
      </DialogActions>
    </Dialog>
  );
};

export default SegmentChannelModal;
