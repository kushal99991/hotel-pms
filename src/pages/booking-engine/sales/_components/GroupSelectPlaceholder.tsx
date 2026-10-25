import React from "react";
import { Box, Typography } from "@mui/material";
import TouchAppIcon from "@mui/icons-material/TouchApp";

interface GroupSelectPlaceholderProps {
  message?: string;
  icon?: React.ReactNode;
}

const GroupSelectPlaceholder: React.FC<GroupSelectPlaceholderProps> = ({
  message = "Click on a group to see its details",
  icon,
}) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="200px"
      padding={3}
      sx={{
        border: "1px dashed #ccc",
        borderRadius: 2,
        backgroundColor: "#f9f9f9",
      }}
      data-testid="group-select-placeholder"
    >
      {icon ?? (
        <TouchAppIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
      )}
      <Typography variant="h6" color="textSecondary" textAlign="center">
        {message}
      </Typography>
    </Box>
  );
};

export default GroupSelectPlaceholder;
