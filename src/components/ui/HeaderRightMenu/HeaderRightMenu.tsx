import React from "react";
import { Button, styled } from "@mui/material";

interface HeaderRightMenuProps {
  label: string;
  url: string;
}

const HeaderRightMenu: React.FC<HeaderRightMenuProps> = ({ label, url }) => {
  return (
    <CustomButton disableRipple href={url}>
      {label}
    </CustomButton>
  );
};
export default HeaderRightMenu;

// AuthHeaderButton
const CustomButton = styled(Button)(() => ({
  fontSize: "16px",
  fontWeight: "800",
  lineHeight: "1",
  color: "#ffffff",
  textTransform: "uppercase",
  padding: "10px 20px",
  height: "42px",
  minWidth: "134px",
  background: "#32A1AE",
  border: "1px solid #32A1AE",
  borderRadius: "5px",
  boxShadow: "none",
  "&:hover": {
    background: "#222222",
    border: "1px solid #222222",
  },
  "@media (max-width: 480px)": {
    fontSize: "14px",
  },
}));
