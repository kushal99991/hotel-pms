import React from "react";
import { styled, Link } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

const StyledButton = styled(Link)(() => ({
  display: "inline-flex",
  justifyContent: "center",
  alignItems: "center",
  fontSize: "16px",
  fontWeight: "600",
  lineHeight: "1",
  color: "#222222",
  textDecoration: "none",
  "&:hover": {
    textDecoration: "underline",
  },
}));

export interface BackButtonProps {
  label: string;
  href: string;
}

const BackButton: React.FC<BackButtonProps> = ({ label, ...rest }) => {
  return (
    <>
      <StyledButton {...rest}>
        <ChevronLeftIcon color="secondary" />
        {label}
      </StyledButton>
    </>
  );
};

export default BackButton;
