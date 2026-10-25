import React from "react";
import { Box, Typography, Card, CardContent, Grid } from "@mui/material";

const RevenueManagementReports: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight={600} color="primary" gutterBottom>
        Revenue Management
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" mb={3}>
        Select a specific report from the sidebar to view detailed revenue
        analytics
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Available Reports
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Daily Revenue Report
                <br />
                • General Ledger
                <br />
                • Market Segment Report
                <br />
                • Occupancy Forecast
                <br />• Room Rate Audit Report
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RevenueManagementReports;
