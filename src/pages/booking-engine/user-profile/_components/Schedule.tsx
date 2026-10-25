import React from "react";
import { Paper, Typography, Grid } from "@mui/material";

const Schedule: React.FC = () => {
  return (
    <Paper sx={{ padding: 2, marginBottom: 2 }}>
      <Typography variant="h6" gutterBottom>
        Schedule
      </Typography>
      <Grid container spacing={1}>
        {[
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ].map((day) => (
          <Grid item xs={12} sm={1.71} key={day}>
            <Paper sx={{ padding: 1, textAlign: "center" }}>{day}</Paper>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default Schedule;
