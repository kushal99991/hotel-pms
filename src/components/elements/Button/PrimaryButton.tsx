import React from "react";
import { Button, ButtonProps, styled, CircularProgress } from "@mui/material";

const StyledButton = styled(Button)<{
  buttonstyles?: {
    backgroundColor?: string;
    color?: string;
    fontWeight?: string;
    hoverBackgroundColor?: string;
  };
}>(({ theme, buttonstyles }) => ({
  backgroundColor: buttonstyles?.backgroundColor || theme.palette.primary.main,
  color: buttonstyles?.color || theme.palette.primary.contrastText,
  fontSize: "14px",
  fontWeight: buttonstyles?.fontWeight || "500",
  lineHeight: "1",
  textTransform: "uppercase",
  padding: "20px",
  borderRadius: "5px",
  height: "40px",
  letterSpacing: "0.5px",
  "&:hover": {
    backgroundColor:
      buttonstyles?.hoverBackgroundColor || theme.palette.button.bgHover,
  },
  "&:disabled": {
    backgroundColor: theme.palette.action.disabledBackground,
    color: theme.palette.action.disabled,
  },
  width: "auto",
  whiteSpace: "nowrap",
}));

export interface PrimaryButtonProps extends ButtonProps {
  label: string;
  isLoading?: boolean;
  loadingText?: string;
  buttonStyles?: {
    backgroundColor?: string;
    color?: string;
    fontWeight?: string;
  };
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  label,
  isLoading = false,
  loadingText = "Logging in...",
  buttonStyles,
  disabled,
  ...rest
}) => {
  return (
    <StyledButton
      {...rest}
      buttonstyles={buttonStyles}
      disabled={disabled || isLoading}
      endIcon={isLoading && <CircularProgress size={20} />}
    >
      {isLoading ? loadingText : label}
    </StyledButton>
  );
};

export default PrimaryButton;
