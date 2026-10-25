import React from "react";
import { Box, Button, Typography, styled } from "@mui/material";
import { Add as AddIcon, Remove as RemoveIcon } from "@mui/icons-material";

interface GuestCountProps {
  items: {
    icon: React.ReactNode;
    label: string;
    count: number;
    key: "adult" | "child" | "infants" | "noRooms";
  }[];

  onChange?: (itemCounts: {
    icon: React.ReactNode;
    label: string;
    count: number;
    key: "adult" | "child" | "infants" | "noRooms";
    action?: "increase" | "decrease";
  }) => void;
}

const GuestCount: React.FC<GuestCountProps> = ({ items, onChange }) => {
  const handleCountChange = (
    item: {
      icon: React.ReactNode;
      label: string;
      count: number;
      key: "adult" | "child" | "infants" | "noRooms";
    },
    action: "increase" | "decrease"
  ) => {
    let currentCount = item.count;
    if (action === "increase") {
      if (item.key === "adult" && currentCount < 5) {
        currentCount += 1;
      }
      if (item.key === "noRooms" && currentCount < 3) {
        currentCount += 1;
      } else if (item.key !== "noRooms" && item.key !== "adult") {
        currentCount += 1;
      }
    } else {
      if (
        (item.key === "child" ||
          item.key === "infants" ||
          item.key === "noRooms") &&
        currentCount > 0
      ) {
        currentCount -= 1;
      } else if (currentCount > 1) {
        currentCount -= 1;
      }
    }
    onChange?.({ ...item, count: currentCount, action });
  };

  return (
    <Box>
      <Box display="flex" justifyContent="flex-start" flexWrap="wrap">
        {items.map(
          (
            item: {
              icon: React.ReactNode;
              label: string;
              count: number;
              key: "adult" | "child" | "infants" | "noRooms";
            },
            index: number
          ) => (
            <Box
              display="flex"
              flexDirection="row"
              alignItems="center"
              flex={1}
              key={`${item.key}-${index.toString()}`}
            >
              <Label>{item.label}:</Label>
              <Box display="flex" alignItems="center">
                <StyledButton
                  onClick={() => handleCountChange(item, "decrease")}
                  disabled={item.count <= 0}
                >
                  <RemoveIcon />
                </StyledButton>
                <Typography variant="body1" marginX={2}>
                  {item.count}
                </Typography>
                <StyledButton
                  onClick={() => handleCountChange(item, "increase")}
                >
                  <AddIcon />
                </StyledButton>
              </Box>
            </Box>
          )
        )}
      </Box>
    </Box>
  );
};

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: "50%",
  minWidth: 25,
  minHeight: 25,
  padding: 0,
  margin: 0,
  backgroundColor: theme.palette.action.hover,
  "& .MuiSvgIcon-root": {
    fontSize: 20,
  },
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

const Label = styled(Typography)(() => ({
  color: "#111111",
  fontWeight: "700",
  fontSize: "16px",
  marginRight: "5px",
  lineHeight: "1",
}));

export default GuestCount;
