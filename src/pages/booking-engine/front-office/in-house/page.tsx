import React from "react";
import { Grid } from "@mui/material";
import InHouseList from "./component/InHouseList";

const Page: React.FC = () => {
  return (
    <Grid container spacing={2} data-testid="expected-arrivals-container">
      <Grid item xs={12} data-testid="quick-search-container">
        <InHouseList />
      </Grid>
    </Grid>
  );
};

export default Page;
