import React from "react";
import { Box, Button, Typography, styled } from "@mui/material";
import { Add as AddIcon, Remove as RemoveIcon } from "@mui/icons-material";

interface RoomCounterProps {
  count: number;
  onChange: (count: number) => void;
  maxRooms?: number;
  minRooms?: number;
  label?: string;
}

const RoomCounter: React.FC<RoomCounterProps> = ({
  count,
  onChange,
  maxRooms,
  minRooms = 1,
  label,
}) => {
  const handleIncrease = () => {
    if (maxRooms && count > maxRooms) {
      return;
    }
    onChange(count + 1);
  };

  const handleDecrease = () => {
    if (count > minRooms) {
      onChange(count - 1);
    }
  };

  return (
    <Box display="flex" justifyContent="flex-start" alignItems="center">
      <Box display="flex" flexDirection="row" alignItems="center" flex={1}>
        <Label>{`${label ?? "Rooms"}:`}</Label>
        <Box display="flex" alignItems="center">
          <StyledButton onClick={handleDecrease} disabled={count <= minRooms}>
            <RemoveIcon />
          </StyledButton>
          <Typography variant="body1" marginX={2}>
            {count}
          </Typography>
          <StyledButton
            onClick={handleIncrease}
            disabled={!!(maxRooms && count >= maxRooms)}
          >
            <AddIcon />
          </StyledButton>
        </Box>
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

export default RoomCounter;
