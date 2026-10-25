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
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const segmentData = [
  {
    segment: "Corporate",
    bookings: 45,
    revenue: 125000,
    adr: 278,
    color: "#1976d2",
  },
  {
    segment: "Leisure",
    bookings: 38,
    revenue: 98000,
    adr: 258,
    color: "#2e7d32",
  },
  {
    segment: "Group",
    bookings: 25,
    revenue: 85000,
    adr: 340,
    color: "#f57c00",
  },
  {
    segment: "Government",
    bookings: 18,
    revenue: 52000,
    adr: 289,
    color: "#9c27b0",
  },
  {
    segment: "Online Travel Agency",
    bookings: 42,
    revenue: 95000,
    adr: 226,
    color: "#f44336",
  },
  {
    segment: "Direct Booking",
    bookings: 35,
    revenue: 88000,
    adr: 251,
    color: "#795548",
  },
];

const monthlyTrend = [
  {
    month: "Jan",
    Corporate: 35,
    Leisure: 28,
    Group: 15,
    Government: 12,
    OTA: 32,
    Direct: 25,
  },
  {
    month: "Feb",
    Corporate: 42,
    Leisure: 35,
    Group: 18,
    Government: 15,
    OTA: 38,
    Direct: 28,
  },
  {
    month: "Mar",
    Corporate: 38,
    Leisure: 32,
    Group: 22,
    Government: 14,
    OTA: 35,
    Direct: 32,
  },
  {
    month: "Apr",
    Corporate: 45,
    Leisure: 38,
    Group: 25,
    Government: 18,
    OTA: 42,
    Direct: 35,
  },
  {
    month: "May",
    Corporate: 48,
    Leisure: 42,
    Group: 28,
    Government: 20,
    OTA: 45,
    Direct: 38,
  },
  {
    month: "Jun",
    Corporate: 45,
    Leisure: 38,
    Group: 25,
    Government: 18,
    OTA: 42,
    Direct: 35,
  },
];

const MarketSegmentReport: React.FC = () => {
  const totalBookings = segmentData.reduce(
    (sum, segment) => sum + segment.bookings,
    0
  );
  const totalRevenue = segmentData.reduce(
    (sum, segment) => sum + segment.revenue,
    0
  );
  const avgADR = totalRevenue / totalBookings;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={600} color="primary" gutterBottom>
          Market Segment Report
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Analysis of booking activities and performance by market segment
        </Typography>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Total Bookings
              </Typography>
              <Typography variant="h3" fontWeight={600} color="primary.main">
                {totalBookings}
              </Typography>
              <Typography variant="caption" color="success.main">
                +7.2% vs last month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Total Revenue
              </Typography>
              <Typography variant="h3" fontWeight={600} color="success.main">
                ${(totalRevenue / 1000).toFixed(0)}K
              </Typography>
              <Typography variant="caption" color="success.main">
                +12.5% vs last month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Average ADR
              </Typography>
              <Typography variant="h3" fontWeight={600} color="info.main">
                ${Math.round(avgADR)}
              </Typography>
              <Typography variant="caption" color="info.main">
                Across all segments
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Top Performer
              </Typography>
              <Typography variant="h3" fontWeight={600} color="warning.main">
                Corp.
              </Typography>
              <Typography variant="caption" color="warning.main">
                Highest revenue
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Segment Distribution */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Revenue Distribution by Segment
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                <ResponsiveContainer width={300} height={300}>
                  <PieChart>
                    <Pie
                      data={segmentData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="revenue"
                    >
                      {segmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [
                        `$${value.toLocaleString()}`,
                        "Revenue",
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Box>
                {segmentData.map((segment, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          bgcolor: segment.color,
                          borderRadius: "50%",
                        }}
                      />
                      <Typography variant="body2">{segment.segment}</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={600}>
                      ${(segment.revenue / 1000).toFixed(0)}K
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Booking Trend */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                6-Month Booking Trend
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="Corporate" fill="#1976d2" name="Corporate" />
                  <Bar dataKey="Leisure" fill="#2e7d32" name="Leisure" />
                  <Bar dataKey="Group" fill="#f57c00" name="Group" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Detailed Segment Performance */}
        <Grid item xs={12}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Segment Performance Details
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Market Segment</TableCell>
                      <TableCell align="right">Bookings</TableCell>
                      <TableCell align="right">Revenue</TableCell>
                      <TableCell align="right">ADR</TableCell>
                      <TableCell align="right">Revenue Share</TableCell>
                      <TableCell align="right">Booking Share</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {segmentData
                      .sort((a, b) => b.revenue - a.revenue)
                      .map((segment, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  bgcolor: segment.color,
                                  borderRadius: "50%",
                                }}
                              />
                              <Typography fontWeight={600}>
                                {segment.segment}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            {segment.bookings}
                          </TableCell>
                          <TableCell align="right">
                            <Typography fontWeight={600}>
                              ${segment.revenue.toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">${segment.adr}</TableCell>
                          <TableCell align="right">
                            <Typography
                              fontWeight={600}
                              color={
                                index === 0 ? "success.main" : "text.primary"
                              }
                            >
                              {((segment.revenue / totalRevenue) * 100).toFixed(
                                1
                              )}
                              %
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            {((segment.bookings / totalBookings) * 100).toFixed(
                              1
                            )}
                            %
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

export default MarketSegmentReport;
