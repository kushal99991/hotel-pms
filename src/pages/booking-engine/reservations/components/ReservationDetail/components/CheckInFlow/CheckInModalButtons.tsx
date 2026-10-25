import React from "react";

import { Box, Button, DialogActions } from "@mui/material";

interface CheckInModalButtonsProps {
  onNext: () => void;
  onClose: () => void;
  onPrev: () => void;
  nextDisabled: boolean;
  activeStep: number;
  totalSteps: number;
}

const CheckInModalButtons: React.FC<CheckInModalButtonsProps> = ({
  onNext,
  onPrev,
  activeStep,
  totalSteps,
  nextDisabled,
}) => {
  function getNextButtonText() {
    if (activeStep === 0) {
      return "Begin";
    } else if (activeStep === totalSteps - 1) {
      return "Check-in";
    }
    return "Next";
  }
  return (
    <DialogActions sx={{ padding: "16px 24px" }}>
      <Box>
        <Button onClick={onPrev} sx={{ mr: 2 }}>
          Back
        </Button>
        <Button
          onClick={onNext}
          variant="contained"
          disabled={nextDisabled}
          color={activeStep === totalSteps - 1 ? "success" : "primary"}
        >
          {getNextButtonText()}
        </Button>
      </Box>
    </DialogActions>
  );
};

export default CheckInModalButtons;
