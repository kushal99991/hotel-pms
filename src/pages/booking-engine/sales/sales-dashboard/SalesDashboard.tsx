import { Box, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import SalesTableList from "./components/SalesTableList";
import SalesPerformanceCard from "./components/SalesPerformanceCard";
import DonutChart from "./components/DonutChart";
import CalendarSchedule from "./components/CalendarSchedule";
import { SalesDashboardProvider } from "contexts/SalesDashboardContext";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useSalesGroupListQuery } from "services/salesSlice";
import useAuth from "hooks/useAuth";

const SalesDashboardInner = () => {
  const navigate = useNavigate();
  const { users } = useAuth();
  const { data: salesGroups = [] } = useSalesGroupListQuery(
    { property_id: users?.defaultPropertyId ?? 0 },
    { skip: !users?.defaultPropertyId }
  );

  function handleRowClick(groupRowData) {
    if (groupRowData?.id) {
      navigate(`/booking-engine/sales/group-detail/${groupRowData.id}`);
    }
  }

  return (
    <Box sx={{ bgcolor: "background.default" }}>
      <SalesTableList onRowClick={handleRowClick} groups={salesGroups} />

      <Grid container spacing={2} sx={{ mt: 2, alignItems: "stretch" }}>
        <Grid item xs={12} md={4}>
          <SalesPerformanceCard />
        </Grid>
        <Grid item xs={12} md={4}>
          <DonutChart title="Sales Distribution" type="SALES_DISTRIBUTION" />
        </Grid>

        <Grid item xs={12} md={4}>
          <DonutChart title="Market Segment Breakdown" type="MARKET_SEGMENT" />
        </Grid>

        <Grid item xs={12}>
          <CalendarSchedule salesGroups={salesGroups} />
        </Grid>
      </Grid>
    </Box>
  );
};

const SalesDashboard = () => (
  <SalesDashboardProvider>
    <DndProvider backend={HTML5Backend}>
      <SalesDashboardInner />
    </DndProvider>
  </SalesDashboardProvider>
);

export default SalesDashboard;
