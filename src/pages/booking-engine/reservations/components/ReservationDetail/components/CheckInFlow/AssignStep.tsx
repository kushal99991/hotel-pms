import React from "react";
import { IReservationResponse } from "types/reservationTypes";
import { getCurrentRoom } from "utils/reservations";

interface AssignStepProps {
  reservation?: IReservationResponse | null;
}

const AssignStep: React.FC<AssignStepProps> = ({ reservation }) => {
  const room = getCurrentRoom(reservation);
  return (
    <div>
      <div>Assign Room</div>
      <div>{room?.room_number}</div>
    </div>
  );
};

export default AssignStep;
