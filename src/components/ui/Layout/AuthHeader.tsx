import React from "react";
import { styled } from "@mui/system";
import { AppBar, Toolbar, Button } from "@mui/material";

// Import the image directly
import exampleLogo from "assets/images/logo.png";

import HeaderRightMenu from "components/ui/HeaderRightMenu/HeaderRightMenu";

const AuthHeader: React.FC = () => {
  return (
    <AuthHeaderWrap>
      <AuthHeaderToolbarWrap>
        <AuthHeaderLogoWrap href="/login/">
          <AuthHeaderLogo src={exampleLogo} alt="PMS Logo" />
        </AuthHeaderLogoWrap>
        <HeaderRightMenu label="Contact Us" url="#" />
      </AuthHeaderToolbarWrap>
    </AuthHeaderWrap>
  );
};
export default AuthHeader;

// AuthHeaderWrap
const AuthHeaderWrap = styled(AppBar)(() => ({
  padding: "10px 0",
  background: "#ffffff",
  borderBottom: "1px solid #E6E6E6",
  boxShadow: "none",
  position: "sticky",
  top: "0",
  zIndex: "999",
}));

// AuthHeaderToolbarWrap
const AuthHeaderToolbarWrap = styled(Toolbar)(() => ({
  justifyContent: "space-between",
  alignItems: "center",
  width: "100%",
  maxWidth: "1170px",
  margin: "0 auto",
  minHeight: "auto !important",
  padding: "0 12px !important",
}));

// AuthHeaderLogoWrap
const AuthHeaderLogoWrap = styled(Button)(() => ({
  padding: "0",
}));

// AuthHeaderLogo
const AuthHeaderLogo = styled("img")(() => ({
  height: "64px", // Adjust height as needed
  width: "64px", // Adjust width as needed
}));
