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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

const roomRateData = [
  {
    roomType: "Standard King",
    baseRate: 250,
    currentRate: 285,
    occupancy: 85,
    segment: "Corporate",
    bookings: 32,
    revenue: 9120,
    variance: "+14%",
  },
  {
    roomType: "Standard Queen",
    baseRate: 230,
    currentRate: 265,
    occupancy: 78,
    segment: "Leisure",
    bookings: 28,
    revenue: 7420,
    variance: "+15.2%",
  },
  {
    roomType: "Deluxe King",
    baseRate: 320,
    currentRate: 375,
    occupancy: 92,
    segment: "Corporate",
    bookings: 24,
    revenue: 9000,
    variance: "+17.2%",
  },
  {
    roomType: "Junior Suite",
    baseRate: 450,
    currentRate: 525,
    occupancy: 88,
    segment: "Group",
    bookings: 18,
    revenue: 9450,
    variance: "+16.7%",
  },
  {
    roomType: "Executive Suite",
    baseRate: 650,
    currentRate: 785,
    occupancy: 75,
    segment: "Leisure",
    bookings: 12,
    revenue: 9420,
    variance: "+20.8%",
  },
];

const rateTrend = [
  { date: "06/08", standardKing: 275, deluxeKing: 365, suite: 745 },
  { date: "06/09", standardKing: 280, deluxeKing: 370, suite: 760 },
  { date: "06/10", standardKing: 285, deluxeKing: 375, suite: 785 },
  { date: "06/11", standardKing: 290, deluxeKing: 380, suite: 795 },
  { date: "06/12", standardKing: 285, deluxeKing: 375, suite: 785 },
  { date: "06/13", standardKing: 285, deluxeKing: 375, suite: 785 },
];

const segmentRates = [
  { segment: "Corporate", avgRate: 295, bookings: 56, discount: "5%" },
  { segment: "Leisure", avgRate: 315, bookings: 40, discount: "0%" },
  { segment: "Group", avgRate: 425, bookings: 18, discount: "15%" },
  { segment: "Government", avgRate: 225, bookings: 15, discount: "25%" },
  { segment: "OTA", avgRate: 265, bookings: 35, discount: "12%" },
];

const RoomRateAuditReport: React.FC = () => {
  const totalRevenue = roomRateData.reduce(
    (sum, room) => sum + room.revenue,
    0
  );
  const totalBookings = roomRateData.reduce(
    (sum, room) => sum + room.bookings,
    0
  );
  const avgRate = totalRevenue / totalBookings;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={600} color="primary" gutterBottom>
          Room Rate Audit Report
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Comprehensive analysis of room rates by segment, type, and booking
          trends
        </Typography>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Average Room Rate
              </Typography>
              <Typography variant="h3" fontWeight={600} color="primary.main">
                ${Math.round(avgRate)}
              </Typography>
              <Typography variant="caption" color="success.main">
                +16.2% vs base rates
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Total Rate Revenue
              </Typography>
              <Typography variant="h3" fontWeight={600} color="success.main">
                ${(totalRevenue / 1000).toFixed(1)}K
              </Typography>
              <Typography variant="caption" color="success.main">
                Daily performance
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Rate Optimization
              </Typography>
              <Typography variant="h3" fontWeight={600} color="info.main">
                92%
              </Typography>
              <Typography variant="caption" color="info.main">
                Efficiency score
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Best Performer
              </Typography>
              <Typography variant="h3" fontWeight={600} color="warning.main">
                Exec.
              </Typography>
              <Typography variant="caption" color="warning.main">
                +20.8% variance
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Rate Trend Analysis */}
        <Grid item xs={12} md={8}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                6-Day Rate Trend Analysis
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={rateTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, ""]} />
                  <Line
                    type="monotone"
                    dataKey="standardKing"
                    stroke="#1976d2"
                    strokeWidth={3}
                    name="Standard King"
                  />
                  <Line
                    type="monotone"
                    dataKey="deluxeKing"
                    stroke="#2e7d32"
                    strokeWidth={3}
                    name="Deluxe King"
                  />
                  <Line
                    type="monotone"
                    dataKey="suite"
                    stroke="#f57c00"
                    strokeWidth={3}
                    name="Executive Suite"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Segment Rate Analysis */}
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Segment Rate Analysis
              </Typography>
              {segmentRates.map((segment, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={1}
                  >
                    <Typography variant="body2" fontWeight={500}>
                      {segment.segment}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" fontWeight={600}>
                        ${segment.avgRate}
                      </Typography>
                      <Chip
                        label={segment.discount}
                        size="small"
                        color={
                          segment.discount === "0%" ? "success" : "warning"
                        }
                      />
                    </Box>
                  </Box>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="caption" color="text.secondary">
                      {segment.bookings} bookings
                    </Typography>
                    <Box
                      sx={{
                        width: 60,
                        height: 4,
                        bgcolor: "#e0e0e0",
                        borderRadius: 1,
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          width: `${(segment.bookings / 56) * 100}%`,
                          height: "100%",
                          bgcolor: "#1976d2",
                          transition: "width 0.3s ease",
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Detailed Room Rate Table */}
        <Grid item xs={12}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Room Type Rate Analysis
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Room Type</TableCell>
                      <TableCell align="right">Base Rate</TableCell>
                      <TableCell align="right">Current Rate</TableCell>
                      <TableCell align="right">Occupancy</TableCell>
                      <TableCell>Primary Segment</TableCell>
                      <TableCell align="right">Bookings</TableCell>
                      <TableCell align="right">Revenue</TableCell>
                      <TableCell align="center">Rate Variance</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {roomRateData.map((room, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Typography fontWeight={600}>
                            {room.roomType}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">${room.baseRate}</TableCell>
                        <TableCell align="right">
                          <Typography fontWeight={600} color="primary.main">
                            ${room.currentRate}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            fontWeight={600}
                            color={
                              room.occupancy >= 85
                                ? "success.main"
                                : room.occupancy >= 75
                                  ? "info.main"
                                  : "warning.main"
                            }
                          >
                            {room.occupancy}%
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={room.segment}
                            size="small"
                            color={
                              room.segment === "Corporate"
                                ? "primary"
                                : room.segment === "Leisure"
                                  ? "success"
                                  : room.segment === "Group"
                                    ? "info"
                                    : "default"
                            }
                          />
                        </TableCell>
                        <TableCell align="right">{room.bookings}</TableCell>
                        <TableCell align="right">
                          <Typography fontWeight={600}>
                            ${room.revenue.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={room.variance}
                            size="small"
                            color="success"
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

export default RoomRateAuditReport;
