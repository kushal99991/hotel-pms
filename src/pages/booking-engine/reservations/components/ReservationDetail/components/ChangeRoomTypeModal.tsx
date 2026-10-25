import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  Button,
  Alert,
  Typography,
  Tooltip,
  useTheme,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
// import useTheme from "@mui/material/styles/useTheme";
import useAuth from "hooks/useAuth";
import moment from "moment-timezone";
import { useUpdateRoomTypeMutation } from "services/reservationSlice";
import { useGetRoomTypeAvailabilityMutation } from "services/roomTypeSlice";
import { IPricing, IRoomTypes } from "types/roomTypes";
import { IReservationResponse } from "types/reservationTypes";
import CustomDropdown from "components/widgets/CustomDropdown/CustomDropdown";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import { currencyString } from "utils/helperFunctions/numbers";
import { getMoment } from "utils/helperFunctions/common";
import { useRoomAssignOptions } from "hooks/pages/booking-engine/reservations/components/RoomAssignModal/useRoomAssignOptions";
import ConfirmationDialog from "components/elements/ConfirmationDialog/ConfirmationDialog";
import { ReservationStatusEnum } from "constants/reservation";
import { RoomRentalTypes } from "constants/room";

interface ChangeRoomTypeModalProps {
  open: boolean;
  reservation: IReservationResponse | undefined;
  onCloseModal: (refreshData: boolean) => void;
  roomTypes: IRoomTypes[];
}

const ChangeRoomTypeModal: React.FC<ChangeRoomTypeModalProps> = ({
  open,
  onCloseModal,
  reservation,
  roomTypes,
}) => {
  const theme = useTheme();
  const currentRoomTypeId = reservation?.room_type?.id.toString() ?? "-1";
  const { users: currentUser, currentTimeZone } = useAuth();
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>();
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [changeAcknowledged, setChangeAcknowledged] = useState(true);
  const [getRoomTypeAvailability, { data: roomTypeAvailability }] =
    useGetRoomTypeAvailabilityMutation();
  const [error, setError] = useState("");
  const [cancelOpen, setCancelOpen] = useState(false);
  const [roomError, setRoomError] = useState("");

  useEffect(() => {
    if (!roomTypes?.length || !reservation) {
      return;
    }
    if (open && !roomTypeAvailability) {
      const allTypeIds = roomTypes.map((rt) => rt.id);
      getRoomTypeAvailability({
        startDate: reservation?.start_date ?? "",
        endDate: reservation?.end_date ?? "",
        roomTypeIds: allTypeIds.join(","),
        numberOfGuests: reservation?.guests?.length.toString() ?? "",
        rateCode: reservation?.rate_code.id.toString() ?? "",
        property_id: currentUser?.defaultPropertyId.toString() ?? "",
      });
    }
  }, [roomTypes, reservation, open]);

  const [updateRoomType, { isLoading: updateLoading }] =
    useUpdateRoomTypeMutation();

  const {
    options: roomOptions,
    isLoading: roomsLoading,
    refetch: refetchRooms,
  } = useRoomAssignOptions({
    reservation,
    propertyId: currentUser?.defaultPropertyId,
    overrideRoomTypeId: selectedTypeId ?? undefined,
  });

  useEffect(() => {
    if (open && reservation && selectedTypeId) {
      refetchRooms();
    }
  }, [open, reservation, selectedTypeId]);

  const handleSubmit = async () => {
    // Use the property's timezone to get today's date
    const today = getMoment(null, currentTimeZone);
    const reservationStartDate = moment(reservation?.start_date);

    // Choose the later of today or the reservation start date
    const startDate = reservationStartDate.isBefore(today)
      ? today.format("YYYY-MM-DD")
      : reservationStartDate.format("YYYY-MM-DD");

    const isInHouse = reservation?.status === ReservationStatusEnum.IN_HOUSE;
    if (isInHouse && !selectedRoomId) {
      setRoomError("Room number is required for checked-in reservation.");
      return false;
    }

    const params = {
      reservation_id: reservation?.id ?? 0,
      start_date: startDate,
      room_type: selectedTypeId ?? -1,
      room_id: selectedRoomId ?? undefined,
    };
    const response = await updateRoomType(params);
    if (response.error) {
      setError(response.error as string);
      return false;
    }
    onCloseModal(true);
  };

  function handleCancelClick() {
    setCancelOpen(true);
  }

  function handleCancelConfirm() {
    setCancelOpen(false);
    setSelectedTypeId(null);
    setSelectedRoomId(null);
    setError("");
    setChangeAcknowledged(false);
    onCloseModal?.(false);
  }

  function handleCancelDismiss() {
    setCancelOpen(false);
  }

  function handleTypeChange(e: any) {
    setChangeAcknowledged(false);
    setSelectedTypeId(+e.target.value);
    setError("");
    setSelectedRoomId(null);
  }

  function handleNoClick() {
    setSelectedTypeId(null);
    setChangeAcknowledged(false);
  }

  function handleYesClick() {
    setChangeAcknowledged(true);
  }

  function priceChangeMessage() {
    if (!roomTypeAvailability) {
      return null;
    }
    const currentTypePrices = roomTypeAvailability.availability.find(
      (rta) => rta.roomTypeId.toString() === currentRoomTypeId
    )?.pricing;
    const newTypePrices = roomTypeAvailability.availability.find(
      (rta) => rta.roomTypeId === selectedTypeId
    )?.pricing;
    if (!currentTypePrices || !newTypePrices) {
      return null;
    }
    const currentTypeTotal = Object.keys(currentTypePrices).reduce(
      (total, key) => {
        const price = +currentTypePrices[key] * 100;
        return total + price;
      },
      0
    );
    const newTypeTotal = Object.keys(newTypePrices).reduce((total, key) => {
      const price = +newTypePrices[key] * 100;
      return total + price;
    }, 0);
    if (currentTypeTotal === newTypeTotal) {
      return null;
    }
    const difference = (newTypeTotal - currentTypeTotal) / 100;
    const changeString = difference > 0 ? "INCREASE" : "DECREASE";
    const newType = roomTypes.find((rt) => rt.id === selectedTypeId)?.type;
    const changeColor =
      changeString === "INCREASE" ? "error.main" : "success.main";
    return (
      <Box mt={3}>
        <Alert severity="warning">
          {`Changing room type${newType ? ` to ${newType}` : ""} will `}
          <Typography
            component="span"
            fontSize="0.875rem"
            sx={{ color: changeColor }}
          >
            {changeString}
          </Typography>
          {" the total room charge by approximately "}
          <Typography
            component="span"
            fontSize="0.875rem"
            sx={{ color: changeColor }}
          >
            {currencyString(Math.abs(difference))}
          </Typography>
          .
          <Box mt={2} fontWeight="bold">
            Are you sure you want to change room types?
          </Box>
          {!changeAcknowledged && (
            <Box mt={2} display="flex" justifyContent="center" pr="34px">
              <Button onClick={handleNoClick} variant="outlined" sx={{ mr: 2 }}>
                No
              </Button>
              <Button onClick={handleYesClick} variant="outlined">
                Yes
              </Button>
            </Box>
          )}
          {changeAcknowledged && (
            <Box mt={1} display="flex" justifyContent="center" pr="34px">
              <CheckCircleOutlineIcon fontSize="large" />
            </Box>
          )}
        </Alert>
      </Box>
    );
  }
  function disabledFromPriceChange(newTypePrices: IPricing) {
    const currentTypePrices = roomTypeAvailability!.availability.find(
      (rta) => rta.roomTypeId.toString() === currentRoomTypeId
    )?.pricing;
    if (!currentTypePrices || !newTypePrices) {
      return false;
    }
    const currentTypeTotal = Object.keys(currentTypePrices).reduce(
      (total, key) => {
        const price = +currentTypePrices[key] * 100;
        return total + price;
      },
      0
    );
    const newTypeTotal = Object.keys(newTypePrices).reduce((total, key) => {
      const price = +newTypePrices[key] * 100;
      return total + price;
    }, 0);
    if (currentTypeTotal === newTypeTotal) {
      return false;
    }
    return !changeAcknowledged;
  }
  function buttonDisabled() {
    const isInHouse = reservation?.status === ReservationStatusEnum.IN_HOUSE;
    if (!selectedTypeId) {
      return true;
    }
    if (isInHouse && !selectedRoomId) {
      return true;
    }
    if (roomTypeAvailability) {
      const newTypePrices = roomTypeAvailability.availability.find(
        (rta) => rta.roomTypeId === selectedTypeId
      )?.pricing;
      if (!newTypePrices) {
        return false;
      } else {
        return disabledFromPriceChange(newTypePrices);
      }
    }
    return false;
  }
  function tooltipTitle() {
    if (!buttonDisabled()) {
      return "";
    }
    if (!selectedTypeId) {
      return "Choose a new type to continue";
    }
    const isInHouse = reservation?.status === ReservationStatusEnum.IN_HOUSE;
    if (isInHouse && !selectedRoomId) {
      return "Select a room number to continue";
    }
    if (!changeAcknowledged) {
      return "Click yes above to accept possible change in price to continue";
    }
    return "";
  }
  const disableAction = buttonDisabled();
  const options = roomTypes
    .filter((rt) => rt.rentalType === RoomRentalTypes.GUEST_ROOM)
    .filter((rt) => rt.id.toString() !== currentRoomTypeId)
    .map((roomType: IRoomTypes) => {
      let disabled = false;
      let label = `${roomType.type} - ${roomType.name}`;
      if (roomTypeAvailability) {
        const availabilityForType = roomTypeAvailability.availability.find(
          (rta) => rta.roomTypeId === roomType.id
        );
        disabled = !availabilityForType;
        if (disabled) {
          label = `${label} (Unavailable for reservation dates)`;
        }
      }
      return {
        label,
        value: roomType.id.toString(),
        disabled,
      };
    });
  return (
    <Dialog
      open={open}
      onClose={handleCancelClick}
      PaperProps={{ sx: { width: "500px" } }}
    >
      <DialogTitle>Change Reservation Room Type</DialogTitle>
      <DialogContent>
        <Grid container direction="column">
          {/* Display error message if present */}
          {error && (
            <Alert sx={{ mb: 2 }} severity="error">
              {error}
            </Alert>
          )}

          <Typography>{`Current Room Type: ${reservation?.room_type?.type ?? ""}`}</Typography>

          <Grid item mt={3}>
            <CustomDropdown
              label="Select new room type"
              placeholder="Select new Room Type"
              onChange={handleTypeChange}
              defaultValue=""
              value={selectedTypeId ?? ""}
              helperText={error ?? ""}
              options={options}
              fullWidth
              aria-label="Room Type"
              data-testid="room-type"
            />
          </Grid>
          <Grid item mt={3}>
            <CustomDropdown
              label="Select room number"
              placeholder={
                selectedTypeId ? "Select Room Number" : "Select room type first"
              }
              onChange={(e: any) => {
                setSelectedRoomId(Number(e.target.value));
                setRoomError("");
              }}
              defaultValue=""
              value={selectedRoomId ?? ""}
              options={roomOptions}
              disabled={!selectedTypeId || roomsLoading}
              isInvalid={!!roomError}
              helperText={roomError}
              fullWidth
              aria-label="Room Number"
              data-testid="room-number"
            />
          </Grid>
          {priceChangeMessage()}
        </Grid>
      </DialogContent>

      <DialogActions
        sx={{ p: 3, display: "flex", justifyContent: "space-between" }}
      >
        <Button
          onClick={handleCancelClick}
          color="primary"
          sx={{
            fontSize: "16px",
            padding: "12px 30px",
          }}
        >
          Cancel
        </Button>
        <Tooltip
          title={tooltipTitle()}
          PopperProps={{ style: { zIndex: theme.zIndex.modal + 1 } }}
          placement="top"
        >
          <Box
            sx={{
              cursor: disableAction ? "help" : "pointer",
            }}
          >
            <PrimaryButton
              label="Update"
              disabled={disableAction}
              isLoading={updateLoading}
              loadingText="Loading...."
              onClick={handleSubmit}
            />
          </Box>
        </Tooltip>
      </DialogActions>
      <ConfirmationDialog
        open={cancelOpen}
        onClose={handleCancelDismiss}
        title="Cancel Room Type Change?"
        description={
          "Are you sure you want to cancel? This will revert the room type to the previous one."
        }
        buttons={[
          { label: "No", onClick: handleCancelDismiss, variant: "outlined" },
          {
            label: "Yes",
            onClick: handleCancelConfirm,
            color: "error",
            variant: "contained",
          },
        ]}
      />
    </Dialog>
  );
};

export default ChangeRoomTypeModal;
