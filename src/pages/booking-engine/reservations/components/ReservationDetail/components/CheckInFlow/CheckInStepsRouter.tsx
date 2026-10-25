import React, { Dispatch, SetStateAction } from "react";

import { Box } from "@mui/material";
import OverviewStep from "./OverviewStep";
import VerifyInformationStep from "./VerifyInformationStep";
import IncidentalsStep from "./IncidentalsStep";
import FinishStep from "./FinishStep";
import { IReservationResponse } from "types/reservationTypes";
import { CheckinState } from "types/reservationCheckIn";

interface CheckInStepsRouterProps {
  activeStepKey: string;
  reservation?: IReservationResponse | null;
  updateState: React.Dispatch<React.SetStateAction<CheckinState>>;
  checkInState: CheckinState;
  activeStepIndex: number;
  refreshReservation: () => void;
  setDisableNext: Dispatch<SetStateAction<boolean>>;
}

const CheckInStepsRouter: React.FC<CheckInStepsRouterProps> = ({
  activeStepKey,
  reservation,
  activeStepIndex,
  updateState,
  checkInState,
  refreshReservation,
  setDisableNext,
}) => {
  return (
    <Box flex={1} px={5}>
      {activeStepKey === "overview" && (
        <OverviewStep checkInState={checkInState} />
      )}
      {activeStepKey === "verify" && (
        <VerifyInformationStep
          stepIndex={activeStepIndex}
          reservation={reservation}
          updateState={updateState}
          checkInState={checkInState}
          onRefresh={refreshReservation}
          setDisableNext={setDisableNext}
        />
      )}
      {activeStepKey === "incidentals" && <IncidentalsStep />}
      {activeStepKey === "finish" && <FinishStep checkinState={checkInState} />}
    </Box>
  );
};

export default CheckInStepsRouter;
