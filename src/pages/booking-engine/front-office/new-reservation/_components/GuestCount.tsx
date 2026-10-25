import React from "react";
import { Box, Button, Typography, styled, Grid } from "@mui/material";
import { Add as AddIcon, Remove as RemoveIcon } from "@mui/icons-material";
// import { ChildCare as ChildIcon } from "@mui/icons-material";

interface GuestCountProps {
  items: {
    icon: React.ReactNode;
    label: string;
    count: number;
    key: "adult" | "child" | "infants" | "noRooms";
    maxCount?: number;
  }[];

  onChange?: (itemCounts: {
    icon: React.ReactNode;
    label: string;
    count: number;
    key: "adult" | "child" | "infants" | "noRooms";
    maxCount?: number;
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
      maxCount?: number;
    },
    action: "increase" | "decrease"
  ) => {
    let currentCount = item.count;
    const maxCount = item.maxCount || (item.key === "adult" ? 5 : 4);

    if (action === "increase") {
      if (currentCount < maxCount) {
        currentCount += 1;
      }
    } else {
      if (item.key === "adult" && currentCount > 1) {
        // Require at least 1 adult
        currentCount -= 1;
      } else if (item.key !== "adult" && currentCount > 0) {
        // Children and other categories can go down to 0
        currentCount -= 1;
      }
    }
    onChange?.({ ...item, count: currentCount, action });
  };

  return (
    <Grid container spacing={4}>
      {items.map(
        (
          item: {
            icon: React.ReactNode;
            label: string;
            count: number;
            key: "adult" | "child" | "infants" | "noRooms";
            maxCount?: number;
          },
          index: number
        ) => (
          <Grid item xs={12} sm={6} key={`${item.key}-${index.toString()}`}>
            <CounterContainer>
              <Box display="flex" alignItems="center">
                <IconWrapper>{item.icon}</IconWrapper>
                <Label>{item.label}:</Label>
              </Box>
              <CounterControls>
                <StyledButton
                  onClick={() => handleCountChange(item, "decrease")}
                  disabled={
                    item.key === "adult" ? item.count <= 1 : item.count <= 0
                  }
                >
                  <RemoveIcon />
                </StyledButton>
                <CountValue>{item.count}</CountValue>
                <StyledButton
                  onClick={() => handleCountChange(item, "increase")}
                  disabled={
                    item.count >=
                    (item.maxCount || (item.key === "adult" ? 5 : 4))
                  }
                >
                  <AddIcon />
                </StyledButton>
              </CounterControls>
            </CounterContainer>
          </Grid>
        )
      )}
    </Grid>
  );
};

const CounterContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: theme.spacing(1, 2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  marginRight: theme.spacing(1),
  display: "flex",
  alignItems: "center",
  "& .MuiSvgIcon-root": {
    fontSize: 24,
    color: theme.palette.primary.main,
  },
}));

const CounterControls = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
}));

const CountValue = styled(Typography)(({ theme }) => ({
  minWidth: "36px",
  textAlign: "center",
  fontWeight: 500,
  margin: theme.spacing(0, 1),
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: "50%",
  minWidth: 32,
  width: 32,
  height: 32,
  padding: 0,
  backgroundColor: theme.palette.action.hover,
  color: theme.palette.text.primary,
  "&:hover": {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
  },
  "&.Mui-disabled": {
    opacity: 0.5,
  },
  "& .MuiSvgIcon-root": {
    fontSize: 18,
  },
}));

const Label = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: "16px",
  color: theme.palette.text.primary,
}));

export default GuestCount;
