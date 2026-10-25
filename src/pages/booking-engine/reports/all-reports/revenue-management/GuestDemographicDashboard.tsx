// pages/DemographicTrendReport.tsx
import React, { useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Container,
  Card,
  CardContent,
  Grid,
  Paper,
} from "@mui/material";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  Tooltip,
  LabelList,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";
import MapGlobe from "./Globe";

export interface BookingData {
  lat: number;
  lng: number;
  type: "past" | "future";
  count: number;
  location: string;
}

export const bookingData: BookingData[] = [
  // North America
  {
    lat: 40.7128,
    lng: -74.006,
    type: "past",
    count: 25,
    location: "New York, USA",
  },
  {
    lat: 34.0522,
    lng: -118.2437,
    type: "future",
    count: 18,
    location: "Los Angeles, USA",
  },
  {
    lat: 41.8781,
    lng: -87.6298,
    type: "past",
    count: 12,
    location: "Chicago, USA",
  },
  {
    lat: 43.6532,
    lng: -79.3832,
    type: "future",
    count: 8,
    location: "Toronto, Canada",
  },
  {
    lat: 25.7617,
    lng: -80.1918,
    type: "past",
    count: 15,
    location: "Miami, USA",
  },
  // Europe
  {
    lat: 51.5074,
    lng: -0.1278,
    type: "past",
    count: 35,
    location: "London, UK",
  },
  {
    lat: 48.8566,
    lng: 2.3522,
    type: "future",
    count: 28,
    location: "Paris, France",
  },
  {
    lat: 52.52,
    lng: 13.405,
    type: "past",
    count: 22,
    location: "Berlin, Germany",
  },
  {
    lat: 41.9028,
    lng: 12.4964,
    type: "future",
    count: 19,
    location: "Rome, Italy",
  },
  {
    lat: 40.4168,
    lng: -3.7038,
    type: "past",
    count: 16,
    location: "Madrid, Spain",
  },
  {
    lat: 59.9139,
    lng: 10.7522,
    type: "future",
    count: 7,
    location: "Oslo, Norway",
  },
  // Asia
  {
    lat: 35.6762,
    lng: 139.6503,
    type: "past",
    count: 42,
    location: "Tokyo, Japan",
  },
  {
    lat: 1.3521,
    lng: 103.8198,
    type: "future",
    count: 31,
    location: "Singapore",
  },
  {
    lat: 22.3193,
    lng: 114.1694,
    type: "past",
    count: 26,
    location: "Hong Kong",
  },
  {
    lat: 39.9042,
    lng: 116.4074,
    type: "future",
    count: 38,
    location: "Beijing, China",
  },
  {
    lat: 28.6139,
    lng: 77.209,
    type: "past",
    count: 33,
    location: "New Delhi, India",
  },
  {
    lat: 13.7563,
    lng: 100.5018,
    type: "future",
    count: 24,
    location: "Bangkok, Thailand",
  },
  // Australia & Oceania
  {
    lat: -33.8688,
    lng: 151.2093,
    type: "past",
    count: 21,
    location: "Sydney, Australia",
  },
  {
    lat: -37.8136,
    lng: 144.9631,
    type: "future",
    count: 14,
    location: "Melbourne, Australia",
  },
  // South America
  {
    lat: -23.5505,
    lng: -46.6333,
    type: "past",
    count: 17,
    location: "São Paulo, Brazil",
  },
  {
    lat: -34.6037,
    lng: -58.3816,
    type: "future",
    count: 11,
    location: "Buenos Aires, Argentina",
  },
  // Africa
  {
    lat: -26.2041,
    lng: 28.0473,
    type: "past",
    count: 9,
    location: "Johannesburg, South Africa",
  },
  {
    lat: 30.0444,
    lng: 31.2357,
    type: "future",
    count: 13,
    location: "Cairo, Egypt",
  },
  // Middle East
  {
    lat: 25.2048,
    lng: 55.2708,
    type: "past",
    count: 29,
    location: "Dubai, UAE",
  },
  {
    lat: 41.0082,
    lng: 28.9784,
    type: "future",
    count: 20,
    location: "Istanbul, Turkey",
  },
];

const occupancyData = [
  { day: "26 Jun", occ: 62 },
  { day: "27", occ: 77 },
  { day: "28", occ: 81 },
  { day: "29", occ: 69 },
  { day: "30", occ: 100 },
  { day: "1 Jul", occ: 82 },
  { day: "2", occ: 100 },
  { day: "3", occ: 80 },
  { day: "4", occ: 81 },
  { day: "5", occ: 64 },
];

const bookingWindowData = [
  { label: "Under 5 Days", value: 65 },
  { label: "Over 5 Days", value: 25 },
  { label: "Over 30 Days", value: 10 },
];

const StatTile = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <Paper
    elevation={1}
    sx={{
      p: 2,
      borderRadius: 2,
      height: 110,
      width: 1,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
    }}
  >
    <Typography variant="subtitle2" color="textSecondary">
      {label}
    </Typography>
    <Typography variant="h4" sx={{ fontWeight: 600, lineHeight: 1 }}>
      {value}
    </Typography>
    <Box sx={{ height: 4, bgcolor: "#00bcd4", borderRadius: 1, mt: 1 }} />
  </Paper>
);

const DemographicTrendReport: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBookingData = bookingData.filter((b) =>
    b.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={600} color="primary" gutterBottom>
          Guest Demographic Trend Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Visual of guest demographic trend
        </Typography>
      </Box>
      <Box
        sx={{
          position: "relative",
          height: "calc(100vh - 320px)",
          overflow: "hidden",
        }}
      >
        <MapGlobe searchQuery={searchQuery} bookingData={filteredBookingData} />

        {/* Search Bar */}
        <Box
          sx={{ position: "absolute", top: 0, width: "100%", zIndex: 1, p: 2 }}
        >
          <Container maxWidth="md">
            <Card sx={{ mb: 2, backdropFilter: "blur(5px)" }}>
              <CardContent>
                <TextField
                  fullWidth
                  placeholder="Search Country / State / Province / City"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </CardContent>
            </Card>
          </Container>
        </Box>

        {/* Hover Dock */}
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            zIndex: 2,
            backdropFilter: "blur(6px)",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            overflow: "hidden",
            overflowX: "hidden",
            height: 90,
            transition: "height 0.35s ease",
            "&:hover": { height: 340 },
          }}
        >
          <Box sx={{ px: 4, pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={6} md={3}>
                <Box
                  display="flex"
                  flexDirection="column"
                  gap={2}
                  alignItems="stretch"
                >
                  <StatTile label="Visitors right now" value="781" />
                  <StatTile label="YTD Revenue" value="$148,229.02" />
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box
                  display="flex"
                  flexDirection="column"
                  gap={2}
                  alignItems="stretch"
                >
                  <StatTile label="YTD Booking" value="46,268" />
                  <StatTile label="YTD Booking" value="46,268" />
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Paper
                  elevation={1}
                  sx={{ p: 2, borderRadius: 2, height: 240 }}
                >
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      10 Days Occupancy
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      (10 min)
                    </Typography>
                  </Box>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={occupancyData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="day"
                        tick={{ fontSize: 10 }}
                        axisLine={false}
                      />
                      <Tooltip />
                      <Bar dataKey="occ" fill="#90a4ae" radius={[4, 4, 0, 0]}>
                        <LabelList dataKey="occ" position="top" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              <Grid item xs={12} md={3}>
                <Paper
                  elevation={1}
                  sx={{ p: 2, borderRadius: 2, height: 240 }}
                >
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Booking Window
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Past 30 Days
                    </Typography>
                  </Box>
                  <ResponsiveContainer width="100%" height={180}>
                    <ScatterChart>
                      <XAxis type="category" dataKey="label" tick={false} />
                      <ZAxis type="number" dataKey="value" range={[60, 120]} />
                      <Scatter
                        data={bookingWindowData}
                        fill="#26c6da"
                        shape="circle"
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 12,
                      mt: -1,
                      px: 1,
                    }}
                  >
                    {bookingWindowData.map((d) => (
                      <span key={d.label}>{d.label}</span>
                    ))}
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      textAlign: "right",
                      mt: 1,
                      textDecoration: "underline",
                      cursor: "pointer",
                    }}
                  >
                    Booking Trend Report
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
            <Typography
              variant="caption"
              align="center"
              sx={{ display: "block", mt: 2, color: "gray" }}
            >
              Hover to expand – drag the globe to rotate, scroll to zoom
            </Typography>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default DemographicTrendReport;
