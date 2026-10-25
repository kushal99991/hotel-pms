import React from "react";
import Grid from "@mui/material/Grid";
import ArrivalList from "./component/ArrivalList";

const ExpectedArrivalsPage: React.FC = () => {
  return (
    <>
      <Grid container spacing={2} data-testid="expected-arrivals-container">
        <Grid item xs={12} data-testid="quick-search-container">
          <ArrivalList />
        </Grid>
      </Grid>
    </>
  );
};

export default ExpectedArrivalsPage;
