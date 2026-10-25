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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const dailyRevenueData = [
  { date: "06/08", rooms: 28500, fb: 12400, other: 3200, total: 44100 },
  { date: "06/09", rooms: 31200, fb: 13800, other: 2900, total: 47900 },
  { date: "06/10", rooms: 29800, fb: 11900, other: 3500, total: 45200 },
  { date: "06/11", rooms: 33400, fb: 14200, other: 4100, total: 51700 },
  { date: "06/12", rooms: 32100, fb: 13600, other: 3800, total: 49500 },
  { date: "06/13", rooms: 34800, fb: 15200, other: 4200, total: 54200 },
];

const revenueBreakdown = [
  { category: "Room Revenue", amount: 189800, percentage: 78.2 },
  { category: "Food & Beverage", amount: 81100, percentage: 33.4 },
  { category: "Spa Services", amount: 12400, percentage: 5.1 },
  { category: "Business Center", amount: 3200, percentage: 1.3 },
  { category: "Parking", amount: 5900, percentage: 2.4 },
  { category: "Other Services", amount: 4800, percentage: 2.0 },
];

const DailyRevenueReport: React.FC = () => {
  const totalRevenue = revenueBreakdown.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={600} color="primary" gutterBottom>
          Daily Revenue Report
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Detailed breakdown of daily revenue streams and performance
        </Typography>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Total Revenue (6 days)
              </Typography>
              <Typography variant="h3" fontWeight={600} color="primary.main">
                ${totalRevenue.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="success.main">
                +8.5% vs last period
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Average Daily Revenue
              </Typography>
              <Typography variant="h3" fontWeight={600} color="success.main">
                ${Math.round(totalRevenue / 6).toLocaleString()}
              </Typography>
              <Typography variant="caption" color="success.main">
                +12.3% vs average
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Room Revenue Share
              </Typography>
              <Typography variant="h3" fontWeight={600} color="info.main">
                78.2%
              </Typography>
              <Typography variant="caption" color="info.main">
                Primary revenue source
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Peak Day Revenue
              </Typography>
              <Typography variant="h3" fontWeight={600} color="warning.main">
                $54,200
              </Typography>
              <Typography variant="caption" color="warning.main">
                June 13th
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Daily Revenue Trend */}
        <Grid item xs={12} md={8}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                6-Day Revenue Trend
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={dailyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [`$${value.toLocaleString()}`, ""]}
                  />
                  <Bar
                    dataKey="rooms"
                    fill="#1976d2"
                    name="Rooms"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar
                    dataKey="fb"
                    fill="#2e7d32"
                    name="F&B"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar
                    dataKey="other"
                    fill="#f57c00"
                    name="Other"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Revenue Breakdown */}
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Revenue Breakdown
              </Typography>
              {revenueBreakdown.map((item, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2" fontWeight={500}>
                      {item.category}
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      ${item.amount.toLocaleString()}
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
                          width: `${(item.percentage / 78.2) * 100}%`,
                          height: "100%",
                          bgcolor:
                            index === 0
                              ? "#1976d2"
                              : index === 1
                                ? "#2e7d32"
                                : "#f57c00",
                          transition: "width 0.3s ease",
                        }}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {item.percentage}%
                    </Typography>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Detailed Daily Table */}
        <Grid item xs={12}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Daily Revenue Details
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell align="right">Room Revenue</TableCell>
                      <TableCell align="right">F&B Revenue</TableCell>
                      <TableCell align="right">Other Revenue</TableCell>
                      <TableCell align="right">Total Revenue</TableCell>
                      <TableCell align="right">vs Previous Day</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dailyRevenueData.map((day, index) => {
                      const prevDay =
                        index > 0 ? dailyRevenueData[index - 1] : null;
                      const change = prevDay
                        ? ((day.total - prevDay.total) / prevDay.total) * 100
                        : 0;

                      return (
                        <TableRow key={index}>
                          <TableCell>
                            <Typography fontWeight={600}>{day.date}</Typography>
                          </TableCell>
                          <TableCell align="right">
                            ${day.rooms.toLocaleString()}
                          </TableCell>
                          <TableCell align="right">
                            ${day.fb.toLocaleString()}
                          </TableCell>
                          <TableCell align="right">
                            ${day.other.toLocaleString()}
                          </TableCell>
                          <TableCell align="right">
                            <Typography fontWeight={600}>
                              ${day.total.toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            {prevDay && (
                              <Typography
                                variant="body2"
                                color={
                                  change >= 0 ? "success.main" : "error.main"
                                }
                                fontWeight={600}
                              >
                                {change >= 0 ? "+" : ""}
                                {change.toFixed(1)}%
                              </Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
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

export default DailyRevenueReport;
