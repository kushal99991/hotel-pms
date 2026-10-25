import React from "react";
import { Box } from "@mui/system";
import { AttachMoney, Work } from "@mui/icons-material";

const dollarHeightToOuterHeight = 22 / 42;
const dollarWidthToOuterWidth = 24 / 45;
const topPositionBuffer = 2;
const leftPositionOffset = 1;

interface BusinessAccountProps {
  height?: number;
  width?: number;
  dollarHeight?: number;
  dollarWidth?: number;
  dollarLeft?: number;
  dollarTop?: number;
  caseFill?: string;
  dollarFill?: string;
}

const BusinessAccount: React.FC<BusinessAccountProps> = ({
  height,
  width,
  dollarHeight,
  dollarWidth,
  dollarLeft,
  dollarTop,
  dollarFill,
  caseFill,
}) => {
  const outerHeight = height ?? 42;
  const calcDollarHeight = outerHeight * dollarHeightToOuterHeight;
  const outerWidth = width ?? 45;
  const calcDollarWidth = outerWidth * dollarWidthToOuterWidth;
  const positionLeft = dollarLeft ?? calcDollarWidth / 2 - leftPositionOffset;
  const positionTop = dollarTop ?? calcDollarHeight / 2 + topPositionBuffer;
  return (
    <Box position="relative">
      <Work
        sx={{
          height: outerHeight,
          width: outerWidth,
          fill: caseFill,
        }}
      />
      <AttachMoney
        sx={{
          height: dollarHeight ?? Math.floor(calcDollarHeight),
          width: dollarWidth ?? Math.floor(calcDollarWidth),
          position: "absolute",
          left: Math.floor(positionLeft),
          top: Math.floor(positionTop),
          fill: dollarFill ?? "white",
        }}
      />
    </Box>
  );
};

export default BusinessAccount;
