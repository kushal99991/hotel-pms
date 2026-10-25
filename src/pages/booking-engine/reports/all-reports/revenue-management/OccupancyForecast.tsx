import React, { useState } from "react";
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
  Button,
  ButtonGroup,
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

// Define data types
type DailyForecast = {
  date: string;
  booked: number;
  available: number;
  occupancy: number;
  adr: number;
  revpar: number;
};

type MonthlyForecast = {
  month: string;
  occupancy: number;
  adr: number;
  revpar: number;
};

type ForecastItem = DailyForecast | MonthlyForecast;

type SegmentForecast = {
  segment: string;
  occupancy: number;
  growth: string;
};

const dailyForecast: DailyForecast[] = [
  {
    date: "06/14",
    booked: 85,
    available: 23,
    occupancy: 78.7,
    adr: 285,
    revpar: 224,
  },
  {
    date: "06/15",
    booked: 92,
    available: 16,
    occupancy: 85.2,
    adr: 295,
    revpar: 251,
  },
  {
    date: "06/16",
    booked: 96,
    available: 12,
    occupancy: 88.9,
    adr: 315,
    revpar: 280,
  },
  {
    date: "06/17",
    booked: 89,
    available: 19,
    occupancy: 82.4,
    adr: 275,
    revpar: 227,
  },
  {
    date: "06/18",
    booked: 94,
    available: 14,
    occupancy: 87.0,
    adr: 305,
    revpar: 265,
  },
  {
    date: "06/19",
    booked: 98,
    available: 10,
    occupancy: 90.7,
    adr: 325,
    revpar: 295,
  },
  {
    date: "06/20",
    booked: 102,
    available: 6,
    occupancy: 94.4,
    adr: 340,
    revpar: 321,
  },
];

const monthlyForecast: MonthlyForecast[] = [
  { month: "Jun", occupancy: 82.5, adr: 295, revpar: 243 },
  { month: "Jul", occupancy: 88.2, adr: 315, revpar: 278 },
  { month: "Aug", occupancy: 91.5, adr: 335, revpar: 306 },
  { month: "Sep", occupancy: 85.8, adr: 285, revpar: 244 },
  { month: "Oct", occupancy: 78.3, adr: 265, revpar: 208 },
  { month: "Nov", occupancy: 72.1, adr: 245, revpar: 177 },
];

const segmentForecast: SegmentForecast[] = [
  { segment: "Corporate", occupancy: 85.2, growth: "+5.2%" },
  { segment: "Leisure", occupancy: 78.9, growth: "+12.8%" },
  { segment: "Group", occupancy: 92.1, growth: "+8.5%" },
  { segment: "Government", occupancy: 68.5, growth: "-2.1%" },
];

const OccupancyForecast: React.FC = () => {
  const [viewPeriod, setViewPeriod] = useState<"daily" | "monthly">("daily");

  const currentData: ForecastItem[] =
    viewPeriod === "daily" ? dailyForecast : monthlyForecast;

  const avgOccupancy =
    currentData.reduce(
      (sum: number, item: ForecastItem) => sum + item.occupancy,
      0
    ) / currentData.length;

  const avgADR =
    currentData.reduce((sum: number, item: ForecastItem) => sum + item.adr, 0) /
    currentData.length;

  const avgRevPAR =
    currentData.reduce(
      (sum: number, item: ForecastItem) => sum + item.revpar,
      0
    ) / currentData.length;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={600} color="primary" gutterBottom>
          Occupancy Forecast
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Comprehensive occupancy outlook with performance predictions
        </Typography>
      </Box>

      {/* View Controls */}
      <Box sx={{ mb: 3 }}>
        <ButtonGroup variant="outlined" size="small">
          <Button
            variant={viewPeriod === "daily" ? "contained" : "outlined"}
            onClick={() => setViewPeriod("daily")}
          >
            Daily View
          </Button>
          <Button
            variant={viewPeriod === "monthly" ? "contained" : "outlined"}
            onClick={() => setViewPeriod("monthly")}
          >
            Monthly View
          </Button>
        </ButtonGroup>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Average Occupancy
              </Typography>
              <Typography variant="h3" fontWeight={600} color="primary.main">
                {avgOccupancy.toFixed(1)}%
              </Typography>
              <Typography variant="caption" color="success.main">
                {viewPeriod === "daily" ? "7-day forecast" : "6-month forecast"}
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
              <Typography variant="h3" fontWeight={600} color="success.main">
                ${Math.round(avgADR)}
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
                Average RevPAR
              </Typography>
              <Typography variant="h3" fontWeight={600} color="info.main">
                ${Math.round(avgRevPAR)}
              </Typography>
              <Typography variant="caption" color="info.main">
                +12.3% vs last period
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Peak Occupancy
              </Typography>
              <Typography variant="h3" fontWeight={600} color="warning.main">
                {Math.max(...currentData.map((d) => d.occupancy)).toFixed(1)}%
              </Typography>
              <Typography variant="caption" color="warning.main">
                {viewPeriod === "daily" ? "June 20th" : "August"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Occupancy Trend Chart */}
        <Grid item xs={12} md={8}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {viewPeriod === "daily" ? "7-Day" : "6-Month"} Occupancy
                Forecast
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={currentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={viewPeriod === "daily" ? "date" : "month"} />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="occupancy"
                    stroke="#1976d2"
                    strokeWidth={3}
                    name="Occupancy (%)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="revpar"
                    stroke="#2e7d32"
                    strokeWidth={3}
                    name="RevPAR ($)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Segment Forecast Panel */}
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Segment Occupancy Forecast
              </Typography>
              {segmentForecast.map((segment, index) => (
                <Box key={index} sx={{ mb: 3 }}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={1}
                  >
                    <Typography variant="body1" fontWeight={500}>
                      {segment.segment}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body1" fontWeight={600}>
                        {segment.occupancy}%
                      </Typography>
                      <Chip
                        label={segment.growth}
                        size="small"
                        color={
                          segment.growth.startsWith("+") ? "success" : "error"
                        }
                      />
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      width: "100%",
                      height: 8,
                      bgcolor: "#e0e0e0",
                      borderRadius: 1,
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        width: `${segment.occupancy}%`,
                        height: "100%",
                        bgcolor: segment.growth.startsWith("+")
                          ? "#2e7d32"
                          : "#f44336",
                        transition: "width 0.3s ease",
                      }}
                    />
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Forecast Table */}
        <Grid item xs={12}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Detailed Forecast Data
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        {viewPeriod === "daily" ? "Date" : "Month"}
                      </TableCell>
                      {viewPeriod === "daily" && (
                        <>
                          <TableCell align="right">Booked Rooms</TableCell>
                          <TableCell align="right">Available Rooms</TableCell>
                        </>
                      )}
                      <TableCell align="right">Occupancy %</TableCell>
                      <TableCell align="right">ADR</TableCell>
                      <TableCell align="right">RevPAR</TableCell>
                      <TableCell align="center">Performance</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Typography fontWeight={600}>
                            {"date" in item ? item.date : item.month}
                          </Typography>
                        </TableCell>
                        {"booked" in item && (
                          <>
                            <TableCell align="right">{item.booked}</TableCell>
                            <TableCell align="right">
                              {item.available}
                            </TableCell>
                          </>
                        )}
                        <TableCell align="right">
                          <Typography
                            fontWeight={600}
                            color={
                              item.occupancy >= 85
                                ? "success.main"
                                : item.occupancy >= 70
                                  ? "info.main"
                                  : "warning.main"
                            }
                          >
                            {item.occupancy.toFixed(1)}%
                          </Typography>
                        </TableCell>
                        <TableCell align="right">${item.adr}</TableCell>
                        <TableCell align="right">
                          <Typography fontWeight={600}>
                            ${item.revpar}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={
                              item.occupancy >= 90
                                ? "Excellent"
                                : item.occupancy >= 80
                                  ? "Good"
                                  : item.occupancy >= 70
                                    ? "Average"
                                    : "Below Target"
                            }
                            size="small"
                            color={
                              item.occupancy >= 90
                                ? "success"
                                : item.occupancy >= 80
                                  ? "primary"
                                  : item.occupancy >= 70
                                    ? "info"
                                    : "warning"
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

export default OccupancyForecast;
