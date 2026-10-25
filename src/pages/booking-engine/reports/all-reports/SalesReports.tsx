import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const salesData = [
  { month: "Jan", revenue: 125000, bookings: 85 },
  { month: "Feb", revenue: 145000, bookings: 92 },
  { month: "Mar", revenue: 165000, bookings: 108 },
  { month: "Apr", revenue: 185000, bookings: 125 },
  { month: "May", revenue: 205000, bookings: 142 },
  { month: "Jun", revenue: 195000, bookings: 135 },
];

const channelData = [
  { channel: "Direct Booking", revenue: 85000, percentage: 35 },
  { channel: "Booking.com", revenue: 58000, percentage: 24 },
  { channel: "Expedia", revenue: 42000, percentage: 17 },
  { channel: "Agoda", revenue: 35000, percentage: 14 },
  { channel: "Others", revenue: 25000, percentage: 10 },
];

const topPerformers = [
  { name: "Alice Johnson", bookings: 45, revenue: 125000, commission: 8750 },
  { name: "Bob Smith", bookings: 38, revenue: 98000, commission: 6860 },
  { name: "Carol Davis", bookings: 32, revenue: 82000, commission: 5740 },
  { name: "David Wilson", bookings: 28, revenue: 75000, commission: 5250 },
];

const SalesReports: React.FC = () => {
  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={600} color="primary" gutterBottom>
          Sales Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Revenue and Booking Performance Analytics
        </Typography>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Monthly Revenue
              </Typography>
              <Typography variant="h3" fontWeight={600} color="success.main">
                $195K
              </Typography>
              <Typography variant="caption" color="success.main">
                +5.2% vs last month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Total Bookings
              </Typography>
              <Typography variant="h3" fontWeight={600} color="primary.main">
                135
              </Typography>
              <Typography variant="caption" color="success.main">
                +8.1% vs last month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Average Booking Value
              </Typography>
              <Typography variant="h3" fontWeight={600} color="info.main">
                $1,445
              </Typography>
              <Typography variant="caption" color="error.main">
                -2.3% vs last month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Conversion Rate
              </Typography>
              <Typography variant="h3" fontWeight={600} color="warning.main">
                12.8%
              </Typography>
              <Typography variant="caption" color="success.main">
                +1.5% vs last month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Revenue Trend */}
        <Grid item xs={12} md={8}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Revenue & Bookings Trend
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="revenue" orientation="left" />
                  <YAxis yAxisId="bookings" orientation="right" />
                  <Tooltip />
                  <Line
                    yAxisId="revenue"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#1976d2"
                    strokeWidth={3}
                    name="Revenue ($)"
                  />
                  <Line
                    yAxisId="bookings"
                    type="monotone"
                    dataKey="bookings"
                    stroke="#2e7d32"
                    strokeWidth={3}
                    name="Bookings"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Channel Performance */}
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Channel Performance
              </Typography>
              {channelData.map((channel, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2" fontWeight={500}>
                      {channel.channel}
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      ${(channel.revenue / 1000).toFixed(0)}K
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box
                      sx={{
                        flex: 1,
                        height: 8,
                        bgcolor: "#e0e0e0",
                        borderRadius: 1,
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          width: `${channel.percentage}%`,
                          height: "100%",
                          bgcolor: "#1976d2",
                          transition: "width 0.3s ease",
                        }}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {channel.percentage}%
                    </Typography>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Top Performers */}
        <Grid item xs={12}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Top Sales Performers
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Sales Rep</TableCell>
                      <TableCell align="right">Bookings</TableCell>
                      <TableCell align="right">Revenue</TableCell>
                      <TableCell align="right">Commission</TableCell>
                      <TableCell align="center">Performance</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topPerformers.map((performer, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Typography fontWeight={600}>
                            {performer.name}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          {performer.bookings}
                        </TableCell>
                        <TableCell align="right">
                          ${performer.revenue.toLocaleString()}
                        </TableCell>
                        <TableCell align="right">
                          ${performer.commission.toLocaleString()}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={
                              index === 0
                                ? "Excellent"
                                : index === 1
                                  ? "Good"
                                  : "Average"
                            }
                            size="small"
                            color={
                              index === 0
                                ? "success"
                                : index === 1
                                  ? "primary"
                                  : "default"
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SalesReports;
