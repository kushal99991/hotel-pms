import React from "react";
import { styled } from "@mui/system";
import Box from "@mui/material/Box";
import { Link, Typography } from "@mui/material";

import LoginForm from "./_components/LoginForm";

const Login: React.FC = () => {
  return (
    <MainWrapper>
      <BoxWrap>
        <Title variant="h1">Welcome to PMS Portal</Title>
        <SubTitle>
          <Typography variant="subtitle1" component="span" display="block">
            Cloud property management
          </Typography>
          <Typography variant="subtitle1" component="span" display="block">
            and front-office software
          </Typography>
        </SubTitle>
        <LoginForm />
        <BottomLinkBox>
          <TermsLink href="#">Terms</TermsLink>
          <ContactLink href="#">Contact Us</ContactLink>
        </BottomLinkBox>
      </BoxWrap>
    </MainWrapper>
  );
};
export default Login;

const MainWrapper = styled(Box)(() => ({
  paddingTop: "50px",
  paddingBottom: "50px",
  minHeight: "calc(100vh - 63px)",
  boxSizing: "border-box",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  "@media (max-width: 780px)": {
    height: "100%",
    paddingTop: "50px",
    paddingBottom: "50px",
  },
}));

const BoxWrap = styled(Box)(() => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: "100%",
  minHeight: "calc(100vh - 163px)",
  maxWidth: "424px",
  padding: "0 12px",
}));

const Title = styled(Typography)(() => ({
  fontSize: "30px",
  fontWeight: "700",
  lineHeight: "41px",
  color: "#111111",
  textAlign: "center",
  marginBottom: "5px",
  width: "100%",
  "@media (max-width: 780px)": {
    fontSize: "24px",
  },
}));

const SubTitle = styled(Typography)(() => ({
  marginBottom: "30px",
  width: "100%",
  "& span": {
    fontSize: "16px",
    fontWeight: "600",
    lineHeight: "22px",
    color: "#565656",
    textAlign: "center",
  },
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
