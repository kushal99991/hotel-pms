import React from "react";
import { Typography, TextField, Button, Stack } from "@mui/material";

const Comments: React.FC = () => {
  return (
    <Stack spacing={2}>
      <Typography>No comments for this reservation.</Typography>
      <Stack direction="row" spacing={1}>
        <TextField placeholder="Write a comment..." size="small" fullWidth />
        <Button variant="contained" disabled>
          Send
        </Button>
      </Stack>
    </Stack>
  );
};

export default Comments;
