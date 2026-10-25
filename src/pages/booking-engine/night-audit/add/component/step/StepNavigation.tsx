import React from "react";
import { Button } from "@mui/material";

interface StepNavigationProps {
  index: number;
  isLastStep: boolean;
  handleNext: () => void;
  handleBack: () => void;
}

const StepNavigation: React.FC<StepNavigationProps> = ({
  index,
  isLastStep,
  handleNext,
  handleBack,
}) => (
  <>
    <Button variant="contained" onClick={handleNext} sx={{ mt: 1, mr: 1 }}>
      {isLastStep ? "Finish" : "Continue"}
    </Button>
    <Button disabled={index === 0} onClick={handleBack} sx={{ mt: 1, mr: 1 }}>
      Back
    </Button>
  </>
);

export default StepNavigation;
