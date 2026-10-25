"use client";
import React from "react";
import { Box, styled } from "@mui/material";
import LostAndFoundListing from "./components/LostAndFoundListing";

const LostAndFoundList: React.FC = () => {
  return (
    <MainWrapper>
      <LostAndFoundListing />
    </MainWrapper>
  );
};

export default LostAndFoundList;

const MainWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  padding: "15px",
  height: "100%",
  marginTop: "10px",
}));
