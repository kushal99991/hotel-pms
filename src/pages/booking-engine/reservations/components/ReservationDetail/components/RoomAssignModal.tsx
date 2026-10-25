import React, { useEffect } from "react";
import {
  Grid,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  Button,
  Alert,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import moment from "moment";
import { useRoomAssignReservationMutation } from "services/roomSlice";
import Label from "components/elements/Label/Label";
import { IReservationResponse, IRoomAssign } from "types/reservationTypes";
import CustomDropdown from "components/widgets/CustomDropdown/CustomDropdown";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import { useRoomAssignOptions } from "hooks/pages/booking-engine/reservations/components/RoomAssignModal/useRoomAssignOptions";
import { appConfig } from "config/app.config";
import { yupResolver } from "@hookform/resolvers/yup";
import { assignRoomSchema } from "utils/validations.utils"; // Ensure validations are updated accordingly
import { IRoomAssignRequest } from "types/roomTypes";
import { getCurrentRoom } from "utils/reservations";

interface RoomAssignModalProps {
  open: boolean;
  reservation: IReservationResponse | undefined;
  onCloseModal: (refreshData: boolean) => void;
  propertyId: number;
}

const RoomAssignModal: React.FC<RoomAssignModalProps> = ({
  open,
  onCloseModal,
  reservation,
  propertyId,
}) => {
  const {
    control,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<IRoomAssign>({
    resolver: yupResolver(assignRoomSchema),
    defaultValues: {
      roomId: 0,
    },
  });

  const [assignRoom, { isLoading }] = useRoomAssignReservationMutation();
  const {
    options: dropdownOptions,
    refetch,
    isLoading: dataLoading,
  } = useRoomAssignOptions({
    reservation,
    propertyId,
  });
  useEffect(() => {
    if (reservation && open) {
      refetch();
    }
  }, [reservation, open]);

  const onSubmit = async (data: IRoomAssign) => {
    // stay details don't actually include last day
    const room = getCurrentRoom(reservation);
    const roomAssigned = room?.id;
    const assignEndDate = moment(reservation?.end_date)
      .subtract(1, "day")
      .format("YYYY-MM-DD");
    const params: IRoomAssignRequest = {
      reservationId: reservation?.id ?? 0,
      endDate: assignEndDate,
      startDate: moment(reservation?.start_date).format("YYYY-MM-DD"),
      roomId: data.roomId ?? 0,
    };
    if (roomAssigned) {
      params.old_room_id = roomAssigned;
    }
    const response = await assignRoom(params);
    if (response.error) {
      setError(
        "root",
        { message: response.error as string },
        { shouldFocus: true }
      );
      return false;
    }
    onCloseModal(true);
  };

  function handleCloseClick() {
    clearErrors("root");
    onCloseModal?.(false);
  }

  return (
    <Dialog open={open} onClose={handleCloseClick} maxWidth="sm" fullWidth>
      <DialogTitle>
        Assign Room {reservation?.room_type?.type ?? ""}
      </DialogTitle>
      <DialogContent>
        <Grid container direction="column">
          {/* Display error message if present */}
          {errors?.root && (
            <Alert sx={{ mb: 2 }} severity="error">
              {errors.root.message}
            </Alert>
          )}

          {/* Grid container to align Check-In and Check-Out dates in the same row */}
          <Grid item>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Label>Check-In Date</Label>
                {moment(reservation?.start_date).format(
                  appConfig.displayDateFormat
                )}
              </Grid>

              <Grid item xs={6}>
                <Label>Check-Out Date</Label>
                {moment(reservation?.end_date).format(
                  appConfig.displayDateFormat
                )}
              </Grid>
            </Grid>
          </Grid>

          {/* Room Number Dropdown */}
          <Grid item>
            <Controller
              name="roomId"
              control={control}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <CustomDropdown
                  label="Room Number"
                  placeholder="Room Number"
                  options={dropdownOptions}
                  disabled={dataLoading}
                  onChange={onChange}
                  value={value}
                  isInvalid={!!error?.message}
                  helperText={error?.message}
                  fullWidth
                  aria-label="Room Number"
                  data-testid="assign-room-number-dropdown"
                />
              )}
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
          label="Assign"
          isLoading={isLoading}
          loadingText="Loading...."
          onClick={handleSubmit(onSubmit)}
        />
      </DialogActions>
    </Dialog>
  );
};

export default RoomAssignModal;
