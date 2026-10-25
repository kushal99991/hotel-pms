import React from "react";
import { Box, styled } from "@mui/material";
import Organization from "./_components/organization/Organization";

const Page: React.FC = () => {
  return (
    <MainWrapper>
      <Organization />
    </MainWrapper>
  );
};

export default Page;

const MainWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  padding: "15px",
  margin: "15px 10px",
}));
