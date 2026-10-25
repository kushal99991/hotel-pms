import React, { useCallback, useState } from "react";
import { styled, Typography } from "@mui/material";

import OtpVerifyPage from "./_components/OtpVerifyPage";
import ForgotPasswordForm from "./_components/ForgotPasswordForm";

const ForgotPasswordFlowContainer: React.FC = () => {
  const [viewBy, setViewBy] = useState<"FORM" | "SUCCESS">("FORM");

  const handleChangeView = useCallback((type: "FORM" | "SUCCESS") => {
    setViewBy(type);
  }, []);

  return (
    <>
      {viewBy === "FORM" ? (
        <>
          <Title variant="h1">Forgot Password</Title>
          <SubTitle>
            <Typography variant="subtitle1" component="span" display="block">
              No worries, Just enter your email, and we`ll assist you.
            </Typography>
          </SubTitle>
          <ForgotPasswordForm handleChangeView={handleChangeView} />
        </>
      ) : (
        <OtpVerifyPage />
      )}
    </>
  );
};

export default ForgotPasswordFlowContainer;

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
