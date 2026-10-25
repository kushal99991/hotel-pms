"use client";
import React from "react";
import { styled, Typography } from "@mui/material";

export interface ILabelProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const Label: React.FC<ILabelProps> = ({ style, children }) => {
  return <CustomTypography style={style}>{children}</CustomTypography>;
};

export default Label;

const CustomTypography = styled(Typography)({
  fontSize: "16px",
  fontWeight: "bold",
  lineHeight: "1",
  color: "#111111",
  marginBottom: "10px",
});
