import React, { useState } from "react";
import TextButton from "./components/TextButton";
import ConfirmationDialog from "components/elements/ConfirmationDialog/ConfirmationDialog";
import { IReservationResponse } from "types/reservationTypes";
import { useRoomUnassignReservationMutation } from "services/roomSlice";
import useSnackbar from "hooks/useSnackbar";
import { getCurrentRoom, isReservationPreCheckin } from "utils/reservations";

interface IRoomUnassignProps {
  details: IReservationResponse | null;
  onRefresh?: () => void;
}

const RoomUnassign: React.FC<IRoomUnassignProps> = ({ details, onRefresh }) => {
  const [roomUnassignReservation, { isLoading }] =
    useRoomUnassignReservationMutation();
  const { openSnackbar } = useSnackbar();
  const [roomUnAssignOpen, setRoomUnAssignOpen] = useState<boolean>(false);

  const handleRoomUnassigned = async () => {
    const response = await roomUnassignReservation({
      reservationId: details?.id ?? 0,
    });
    if (response?.error) {
      openSnackbar(`Error: ${response.error}`, "error");
      return false;
    }
    openSnackbar(
      response?.data?.message ?? "Room Unassign successfully!",
      "success"
    );
    setRoomUnAssignOpen(false);
    onRefresh?.();
  };
  const room = getCurrentRoom(details);
  const roomAssigned = !!room?.id;
  return (
    <>
      {roomAssigned && isReservationPreCheckin(details) && (
        <TextButton
          onClick={() => setRoomUnAssignOpen(true)}
          sx={{ width: "auto" }}
          data-testid="summary-unassign-room-btn"
        >
          Unassign
        </TextButton>
      )}

      <ConfirmationDialog
        open={roomUnAssignOpen}
        title="Room Unassigned"
        description="Are you sure you want to room unassigned for this reservation?"
        buttons={[
          { label: "No", onClick: () => setRoomUnAssignOpen(false) },
          {
            label: isLoading ? "Loading..." : "Yes",
            onClick: handleRoomUnassigned,
          },
        ]}
        onClose={() => setRoomUnAssignOpen(false)}
      />
    </>
  );
};
export default RoomUnassign;
