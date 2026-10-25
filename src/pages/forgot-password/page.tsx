"use client";
import React from "react";
import { styled } from "@mui/system";
import { Box, Link } from "@mui/material";

import ForgotPasswordFlowContainer from "./FlowContainer";

const Page: React.FC = () => {
  return (
    <MainWrapper data-testid="forgot-password-flow-container">
      <BoxWrap>
        <ForgotPasswordFlowContainer />
        <BottomLinkBox>
          <TermsLink href="#">Terms</TermsLink>
          <ContactLink href="#">Contact Us</ContactLink>
        </BottomLinkBox>
      </BoxWrap>
    </MainWrapper>
  );
};
export default Page;

const MainWrapper = styled(Box)(() => ({
  paddingTop: "50px",
  paddingBottom: "50px",
  height: "calc(100vh - 63px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  "@media (max-width: 780px)": {
    paddingTop: "50px",
    paddingBottom: "50px",
  },
}));

const BoxWrap = styled(Box)(() => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: "100%",
  height: "100%",
  maxWidth: "424px",
  padding: "0 12px",
}));

const BottomLinkBox = styled(Box)(() => ({
  textAlign: "center",
  marginTop: "auto",
}));

const TermsLink = styled(Link)(() => ({
  fontSize: "16px",
  fontWeight: "400",
  lineHeight: "1",
  color: "#32A1AE",
  textDecoration: "none",
  position: "relative",
  "&:hover": {
    textDecoration: "underline",
  },
  "&:after": {
    content: '"|"',
    fontSize: "12px",
    fontWeight: "600",
    margin: "0 12px",
  },
}));

const ContactLink = styled(Link)(() => ({
  fontSize: "16px",
  fontWeight: "400",
  lineHeight: "1",
  color: "#32A1AE",
  textDecoration: "none",
  position: "relative",
  "&:hover": {
    textDecoration: "underline",
  },
}));
