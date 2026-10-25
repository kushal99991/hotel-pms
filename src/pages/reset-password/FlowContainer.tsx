import React, { useCallback, useState } from "react";
import { styled, Typography } from "@mui/material";

import ResetPasswordSuccess, {
  ResetPasswordMessageProps,
} from "./_components/ResetPasswordSuccess";
import ResetPasswordForm from "./_components/ResetPasswordForm";

const FlowContainer: React.FC = () => {
  const [viewBy, setViewBy] = useState<"FORM" | "SUCCESS">("FORM");
  const [selectData, setSelectData] =
    useState<ResetPasswordMessageProps | null>(null);

  const handleChangeView = useCallback(
    (type: "FORM" | "SUCCESS", data: ResetPasswordMessageProps) => {
      setViewBy(type);
      setSelectData(data);
    },
    []
  );

  return (
    <>
      {viewBy === "FORM" ? (
        <>
          <Title variant="h1">Set new Password</Title>
          <SubTitle>
            <Typography variant="subtitle1" component="span" display="block">
              Must be at least 8 characters
            </Typography>
          </SubTitle>
          <ResetPasswordForm handleChangeView={handleChangeView} />
        </>
      ) : (
        <ResetPasswordSuccess selectData={selectData} />
      )}
    </>
  );
};

export default FlowContainer;

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
