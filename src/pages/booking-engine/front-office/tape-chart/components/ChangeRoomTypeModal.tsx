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
import moment from "moment";
import { useUpdateRoomTypeMutation } from "services/reservationSlice";
import { useGetRoomTypeAvailabilityMutation } from "services/roomTypeSlice";
import { IPricing, IRoomTypes } from "types/roomTypes";
import { IReservationResponse } from "types/reservationTypes";
import CustomDropdown from "components/widgets/CustomDropdown/CustomDropdown";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import { currencyString } from "utils/helperFunctions/numbers";

interface ChangeRoomTypeModalProps {
  open: boolean;
  reservation: IReservationResponse | undefined;
  selectedRoomTypeId: number | null;
  onCloseModal: (refreshData: boolean) => void;
  roomTypes: IRoomTypes[];
}

const ChangeRoomTypeModal: React.FC<ChangeRoomTypeModalProps> = ({
  open,
  onCloseModal,
  reservation,
  roomTypes,
  selectedRoomTypeId,
}) => {
  const theme = useTheme();
  const currentRoomTypeId = reservation?.room_type?.id.toString() ?? "-1";
  const { users: currentUser } = useAuth();
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>();
  const [changeAcknowledged, setChangeAcknowledged] = useState(true);
  const [getRoomTypeAvailability, { data: roomTypeAvailability }] =
    useGetRoomTypeAvailabilityMutation();
  const [error, setError] = useState("");

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

  useEffect(() => {
    if (selectedRoomTypeId) {
      setSelectedTypeId(selectedRoomTypeId);
      setChangeAcknowledged(false);
      setError("");
    }
  }, [selectedRoomTypeId]);

  const [updateRoomType, { isLoading: updateLoading }] =
    useUpdateRoomTypeMutation();

  const handleSubmit = async () => {
    // stay details don't actually include last day
    const params = {
      reservation_id: reservation?.id ?? 0,
      start_date: moment(reservation?.start_date).format("YYYY-MM-DD"),
      room_type: selectedTypeId ?? -1,
    };
    const response = await updateRoomType(params);
    if (response.error) {
      setError(response.error as string);
      return false;
    }
    onCloseModal(true);
  };

  function handleCloseClick() {
    setSelectedTypeId(null);
    setError("");
    setChangeAcknowledged(false);
    onCloseModal?.(false);
  }

  function handleTypeChange(e: any) {
    setChangeAcknowledged(false);
    setSelectedTypeId(+e.target.value);
    setError("");
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
    if (!selectedTypeId) {
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
    if (!changeAcknowledged) {
      return "Click yes above to accept possible change in price to continue";
    }
    return "";
  }
  const disableAction = buttonDisabled();
  const options = roomTypes
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
      onClose={handleCloseClick}
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
          {priceChangeMessage()}
        </Grid>
      </DialogContent>

      <DialogActions
        sx={{ p: 3, display: "flex", justifyContent: "space-between" }}
      >
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
              label="Change Room Type"
              disabled={disableAction}
              isLoading={updateLoading}
              loadingText="Loading...."
              onClick={handleSubmit}
            />
          </Box>
        </Tooltip>
      </DialogActions>
    </Dialog>
  );
};

export default ChangeRoomTypeModal;
