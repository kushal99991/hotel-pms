import React, { useState } from "react";
import { Box, Chip, IconButton } from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import { useWatch, useFormContext } from "react-hook-form";
import { IGuestResponse } from "types/reservationTypes";
import useSnackbar from "hooks/useSnackbar";
import { useReservationDetails } from "contexts/ReservationDetailsContext";
import { useRemoveGuestsFromReservationIdMutation } from "services/guestSlice";
import ConfirmationDialog from "components/elements/ConfirmationDialog/ConfirmationDialog";
import DynamicIcon from "components/ui/DynamicIcon/DynamicIcon";

interface EditGuestFormNameProps {
  guestIndex: number;
  guestData?: IGuestResponse;
  reservationHolderId: number;
  onEditClick: (guestId: number) => void;
  editReservationHolder?: boolean;
}

const EditGuestFormName: React.FC<EditGuestFormNameProps> = ({
  guestIndex,
  reservationHolderId,
  guestData,
  onEditClick,
  editReservationHolder,
}) => {
  const { openSnackbar } = useSnackbar();
  const { refreshReservation, viewState } = useReservationDetails();
  const [removeGuestsFromReservationId] =
    useRemoveGuestsFromReservationIdMutation();

  const [openDeleteGuestDialog, setOpenDeleteGuestDialog] =
    useState<boolean>(false);

  const isReservationHolder = guestData?.id === reservationHolderId;
  const isPrimaryGuest =
    guestData?.id === viewState.reservation?.primary_guest_id;
  //const isNotPrimary = !isReservationHolder;
  const { control } = useFormContext();
  const formName = isReservationHolder
    ? "reservationHolder"
    : `guestList.${guestIndex}`;
  const guest = useWatch({
    control,
    name: formName,
  });

  function handleEditClick() {
    if (!guestData) {
      return;
    }
    onEditClick?.(guestData?.id ?? -1);
  }

  // function handleMakePrimaryClick() {
  //   if (!guestData) {
  //     return;
  //   }
  //   console.log(
  //     viewState.reservation?.id,
  //     "handleMakePrimaryClick===viewState.reservation?.id"
  //   );

  //   // onMakePrimaryClick?.(guestData?.id ?? -1);
  // }

  // function handleRemovePrimaryClick() {
  //   if (!guestData) {
  //     return;
  //   }
  //   console.log(
  //     viewState.reservation?.id,
  //     "handleRemovePrimaryClick===viewState.reservation?.id"
  //   );
  //   // onRemovePrimaryClick?.(guestData?.id ?? -1);
  // }

  function handleDeleteClick() {
    setOpenDeleteGuestDialog(true);
  }

  function handleCloseDeleteGuestDialog() {
    setOpenDeleteGuestDialog(false);
  }

  const deleteGuest = async () => {
    if (guestData && viewState.reservation?.id) {
      const response = await removeGuestsFromReservationId({
        reservation_id: viewState.reservation.id,
        guest_id: guestData.id,
      });
      if (response?.error) {
        openSnackbar(response.error as string, "error");
        return false;
      }
      const sources = response?.data ?? null;
      openSnackbar(sources.message as string, "success");
      handleCloseDeleteGuestDialog();
      refreshReservation?.();
    }
  };

  return (
    <Box display="flex" alignItems="center">
      {`${guest?.first_name} ${guest?.last_name}`}
      {guest?.vip && (
        <Box ml={0.5} display="flex" alignItems="center">
          <DynamicIcon name="RiVipCrown2Fill" size={14} color="black" />
        </Box>
      )}
      {isReservationHolder && !editReservationHolder && (
        <Chip
          label="Booker"
          sx={{
            ml: 0.5,
            color: "gray",
            fontSize: "0.7rem",
            borderRadius: "4px",
            height: "unset",
            "& > span": { padding: 0 },
          }}
        />
      )}
      {isPrimaryGuest && !editReservationHolder && (
        <Chip
          label="Primary"
          size="small"
          sx={{
            ml: 0.5,
            fontSize: "0.7rem",
            borderRadius: "4px",
            height: "unset",
            bgcolor: (theme) => theme.palette.secondary.main,
            color: (theme) => theme.palette.secondary.contrastText,
            "& > span": { padding: 0 },
          }}
        />
      )}
      {(!isReservationHolder || editReservationHolder) && (
        <>
          <IconButton onClick={handleEditClick}>
            <Edit sx={{ fontSize: "1.125rem" }} />
          </IconButton>
          {!isReservationHolder && (
            <IconButton onClick={handleDeleteClick}>
              <Delete sx={{ fontSize: "1.125rem", color: "red" }} />
            </IconButton>
          )}
        </>
      )}

      <ConfirmationDialog
        open={openDeleteGuestDialog}
        title="Confirm Deletion"
        description="Are you sure you want to delete this user from the reservation?"
        buttons={[
          { label: "No", onClick: handleCloseDeleteGuestDialog },
          { label: "Yes", onClick: deleteGuest },
        ]}
        onClose={handleCloseDeleteGuestDialog}
      />
    </Box>
  );
};

export default EditGuestFormName;
