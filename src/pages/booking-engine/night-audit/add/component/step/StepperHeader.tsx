import React from "react";
import { Typography } from "@mui/material";

interface StepperHeaderProps {
  index: number;
  isLastStep: boolean;
}

const StepperHeader: React.FC<StepperHeaderProps> = ({ isLastStep }) =>
  isLastStep ? <Typography variant="caption">Last step</Typography> : null;

export default StepperHeader;
