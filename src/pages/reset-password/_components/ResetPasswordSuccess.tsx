import React from "react";
import { styled, Box, Typography, Icon } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";

import BackButton from "components/elements/Button/BackButton";

export interface ResetPasswordMessageProps {
  type: "error" | "success";
  title: string;
  message: string;
  data?: { email: string };
}

export interface MessageProps {
  selectData: ResetPasswordMessageProps | null;
}

const ResetPasswordSuccess: React.FC<MessageProps> = ({ selectData }) => {
  return (
    <BoxWrap>
      <IconButton color="secondary">
        <CheckIcon color="secondary" />
      </IconButton>
      <Title variant="h1">{selectData?.title ?? ""}</Title>
      <SubTitle variant="body1">
        {selectData?.message ?? ""} <br />{" "}
        <strong>{selectData?.data?.email ?? ""}</strong>
      </SubTitle>
      <BackButton label="Back to login" href="/login" />
    </BoxWrap>
  );
};

export default ResetPasswordSuccess;

// ForgotPasswordEmailIcon
const IconButton = styled(Icon)(() => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "46px",
  height: "46px",
  background: "#E8E8E8",
  borderRadius: "50%",
  marginBottom: "20px",
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

const Title = styled(Typography)(() => ({
  fontSize: "30px",
  fontWeight: "700",
  lineHeight: "41px",
  color: "#111111",
  textAlign: "center",
  marginBottom: "5px",
  "@media (max-width: 780px)": {
    fontSize: "24px",
  },
}));

const SubTitle = styled(Typography)(() => ({
  fontSize: "16px",
  fontWeight: "500",
  lineHeight: "22px",
  color: "#565656",
  textAlign: "center",
  marginBottom: "30px",
}));
