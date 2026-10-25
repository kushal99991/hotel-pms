import React from "react";
import { Button, ButtonProps, styled, CircularProgress } from "@mui/material";

const StyledSecondaryButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#FFF",
  color: "#000",
  fontSize: "16px",
  fontWeight: "800",
  lineHeight: "1",
  borderRadius: "8px",
  border: "1px solid #8E8E8E",
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(2),
  paddingLeft: theme.spacing(5),
  paddingRight: theme.spacing(5),
  "&:hover": {
    backgroundColor: "#000", // Darker gray for hover effect
    color: "#FFF", // White text color for hover effect
  },
  "&:disabled": {
    backgroundColor: theme.palette.action.disabledBackground,
    color: theme.palette.action.disabled,
  },
}));

export interface SecondaryButtonProps extends ButtonProps {
  label: string;
  isLoading?: boolean;
  isDisabled?: boolean;
  loadingText?: string;
}

const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  label,
  isLoading = false,
  isDisabled = false,
  loadingText = "Loading...",
  ...rest
}) => {
  return (
    <StyledSecondaryButton
      disabled={isLoading || isDisabled}
      {...rest}
      endIcon={isLoading && <CircularProgress size={20} />}
    >
      {isLoading ? loadingText : label}
    </StyledSecondaryButton>
  );
};

export default SecondaryButton;
