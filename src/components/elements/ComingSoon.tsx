import React from "react";
import { Box, Typography } from "@mui/material";

const ComingSoon: React.FC = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100%"
      padding={2}
      sx={{
        border: "1px dashed #ccc",
        borderRadius: 2,
        backgroundColor: "#f9f9f9",
      }}
    >
      <Typography variant="h6" color="textSecondary" gutterBottom>
        Coming Soon
      </Typography>
      <Typography variant="body2" color="textSecondary">
        This section is under development. Stay tuned for updates!
      </Typography>
    </Box>
  );
};

export default ComingSoon;
