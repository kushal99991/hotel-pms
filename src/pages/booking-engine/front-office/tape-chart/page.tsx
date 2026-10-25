import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { Box, CssBaseline, Grid } from "@mui/material";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import OccupancyChart from "./components/OccupancyChart";
import UnassignedReservations from "./components/UnassignReservation/UnassignedReservations";
import TapeHeader from "./components/TapeHeader";
import AssignmentOverview from "./components/AssignmentOverview";
import { TapeChartProvider } from "contexts/TapeChartContext";

export enum SortByEnum {
  DEPARTURE_ASC = "DEPARTURE_ASC",
  DEPARTURE_DESC = "DEPARTURE_DESC",
  FIRST_NAME = "FIRST_NAME",
  LAST_NAME = "LAST_NAME",
  LENGTH_OF_STAY = "LENGTH_OF_STAY",
}

const TapeChart: React.FC = () => {
  return (
    <TapeChartProvider>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <CssBaseline />
        <DndProvider backend={HTML5Backend}>
          <Box
            sx={{
              bgcolor: "background.default",
            }}
          >
            <AssignmentOverview />
            {/* Main Content */}
            <Grid container spacing={2}>
              <Grid item xs={12} md={9}>
                {/* Date Pickers */}
                <TapeHeader />
                <OccupancyChart />
              </Grid>
              <Grid item xs={12} md={3}>
                <UnassignedReservations />
              </Grid>
            </Grid>
          </Box>
        </DndProvider>
      </LocalizationProvider>
    </TapeChartProvider>
  );
};

export default TapeChart;
