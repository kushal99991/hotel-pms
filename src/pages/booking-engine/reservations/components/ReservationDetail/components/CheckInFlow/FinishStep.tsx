import React from "react";
import { Box, Typography } from "@mui/material";
import { CheckinState } from "types/reservationCheckIn";
import { allStepsComplete } from "utils/reservationCheckin";

interface FinishStepProps {
  checkinState: CheckinState;
}

const FinishStep: React.FC<FinishStepProps> = ({ checkinState }) => {
  const stepsComplete = allStepsComplete(checkinState);

  function renderIncompleteList() {
    const outstandingItems = Object.values(checkinState ?? []).filter(
      (preReq) => !preReq.completed
    );
    const outstandingItemCount = outstandingItems.length;
    if (outstandingItemCount === 1) {
      return outstandingItems[0].message;
    }
    return (
      <ul>
        {outstandingItems.map((i, idx) => (
          <li key={`outstanding-item_${idx}`}>{i.message}</li>
        ))}
      </ul>
    );
  }
  return (
    <Box textAlign="center">
      <Typography fontWeight="bold" mb={2}>
        {stepsComplete
          ? "You are ready to complete check-in! Click the button below to finish"
          : "Before the guest can be checked in, you still must complete the following:"}
      </Typography>
      {renderIncompleteList()}
    </Box>
  );
};

export default FinishStep;
