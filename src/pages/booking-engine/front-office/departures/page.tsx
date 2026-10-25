import React from "react";
import { Grid } from "@mui/material";
import DepartureList from "./component/DepartureList";

const Page: React.FC = () => {
  return (
    <Grid container spacing={2} data-testid="expected-arrivals-container">
      <Grid item xs={12} data-testid="quick-search-container">
        <DepartureList />
      </Grid>
    </Grid>
  );
};

export default Page;
