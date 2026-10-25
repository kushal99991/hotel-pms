import React from "react";
import { Box, Typography, Card, CardContent, Grid } from "@mui/material";
import { useSalesDashboardContext } from "contexts/SalesDashboardContext";

interface MetricItemProps {
  label: string;
  value: string;
  color?: string;
}

const MetricItem: React.FC<MetricItemProps> = ({
  label,
  value,
  color = "#1976d2",
}) => (
  <Box sx={{ textAlign: "center" }}>
    <Typography variant="h6" sx={{ color, fontWeight: "bold", mb: 0.5 }}>
      {value}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
  </Box>
);

const SalesPerformanceCard: React.FC = () => {
  const { metrics } = useSalesDashboardContext();
  return (
    <Grid container spacing={3} alignItems="stretch">
      {/* Card 1: Today's Sales Performance */}
      <Grid item xs={12}>
        <Card sx={{ height: "100%" }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Today's Sales Performance
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Occupancy - Average Daily Rate - RevPar
            </Typography>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={4}>
                <MetricItem
                  label="Occupancy"
                  value={metrics.occupancy}
                  color="#4caf50"
                />
              </Grid>
              <Grid item xs={4}>
                <MetricItem
                  label="Average Daily Rate"
                  value={metrics.averageRate}
                />
              </Grid>
              <Grid item xs={4}>
                <MetricItem
                  label="RevPar"
                  value={metrics.revenueToday}
                  color="#2196f3"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Card 2: Sales Revenue */}
      <Grid item xs={12}>
        <Card
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Sales Revenue
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={3}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    Today
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    $3,820
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={3}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    MTD
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    $18,109
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={3}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    YTD
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    $39,258
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={3}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    LY
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    $77,258
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default SalesPerformanceCard;
