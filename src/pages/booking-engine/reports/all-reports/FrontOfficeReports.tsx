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
  Autocomplete,
  Checkbox,
  TextField,
  Skeleton,
  useTheme,
  useMediaQuery,
  Stack,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Bar,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LabelList,
} from "recharts";
import { ReservationStatusEnum } from "constants/reservation";
import { useFrontOfficeReport } from "hooks/useFrontOfficeReport";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday";
import isoWeek from "dayjs/plugin/isoWeek";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import moment from "moment";

// DayJS extensions
dayjs.extend(weekday);
dayjs.extend(isoWeek);

// ---------- CONSTANTS ---------- //
const KPI_CARD_COUNT = 4;
const TABLE_ROW_SKELETONS = 6;
const BAR_COLORS = ["#ffc107", "#ff9800", "#e91e63", "#03a9f4", "#8bc34a"];

// ---------- SKELETON COMPONENT ---------- //
const FrontOfficeReportsSkeleton: React.FC = () => (
  <Box>
    {/* Header */}
    <Box
      sx={{ mb: 3 }}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
    >
      <Skeleton variant="rectangular" width={260} height={38} />
      <Skeleton variant="text" width={160} height={24} />
    </Box>

    {/* KPI cards */}
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {Array.from({ length: KPI_CARD_COUNT }).map((_, i) => (
        <Grid key={i} item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Skeleton variant="text" width="40%" height={18} />
              <Skeleton variant="text" width="70%" height={40} />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>

    <Grid container spacing={3}>
      {/* Pie-chart skeleton */}
      <Grid item xs={12} md={4}>
        <Card elevation={2} sx={{ height: "100%" }}>
          <CardContent>
            <Skeleton variant="text" width={140} height={24} sx={{ mb: 2 }} />
            <Skeleton
              variant="circular"
              width={200}
              height={200}
              sx={{ mx: "auto" }}
            />
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} variant="text" width="80%" height={20} />
            ))}
          </CardContent>
        </Card>
      </Grid>

      {/* Composed-chart skeleton */}
      <Grid item xs={12} md={8}>
        <Card elevation={2} sx={{ height: "100%" }}>
          <CardContent>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >
              <Skeleton variant="text" width={180} height={24} />
              <Skeleton variant="rectangular" width={260} height={36} />
            </Box>
            <Skeleton variant="rectangular" width="100%" height={300} />
          </CardContent>
        </Card>
      </Grid>

      {/* Table skeleton */}
      <Grid item xs={12}>
        <Card elevation={2}>
          <CardContent>
            <Skeleton variant="text" width={200} height={24} sx={{ mb: 2 }} />
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    {[
                      "Room",
                      "Type",
                      "Status",
                      "Guest",
                      "Check In",
                      "Check Out",
                    ].map((h) => (
                      <TableCell key={h}>
                        <Typography variant="body2" sx={{ opacity: 0.6 }}>
                          {h}
                        </Typography>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.from({ length: TABLE_ROW_SKELETONS }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 6 }).map((__, j) => (
                        <TableCell key={j}>
                          <Skeleton variant="text" width="80%" height={20} />
                        </TableCell>
                      ))}
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

// ---------- HELPER MAPS ---------- //
const HOUSEKEEPING_META: Record<string, { label: string; color: string }> = {
  OD: { label: "Dirty", color: "#d2691e" },
  OC: { label: "Clean", color: "#1976d2" },
  VCI: { label: "Inspected", color: "#4caf50" },
  OOO: { label: "Out of order", color: "#ffd600" },
  OOS: { label: "Out of service", color: "#c2185b" },
  OFF: { label: "Off Market", color: "#9e9e9e" },
};

const getRandomColor = (key: string) => {
  const hash = [...key].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return `hsl(${hash % 360}, 60%, 60%)`;
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;

  const occ = payload.find((p: any) => p.dataKey === "occupancy");
  const revenueItems = payload.filter(
    (p: any) => p.dataKey !== "occupancy" && p.dataKey !== "day"
  );
  const totalRevenue = revenueItems.reduce(
    (sum: number, item: any) => sum + item.value,
    0
  );

  return (
    <Box
      sx={{
        backgroundColor: "#1e1e2d",
        color: "#fff",
        borderRadius: 1,
        boxShadow: 3,
        px: 2,
        py: 1,
        minWidth: 200,
      }}
    >
      <Typography fontWeight={600} sx={{ mb: 1 }}>
        Total Revenue: ${totalRevenue.toLocaleString()}
      </Typography>
      {occ && (
        <Typography fontWeight={500} sx={{ mb: 1 }}>
          Occupancy: {occ.value}%
        </Typography>
      )}
      {revenueItems.map((item: any) => (
        <Box
          key={item.dataKey}
          sx={{ display: "flex", justifyContent: "space-between" }}
        >
          <Typography variant="body2" color="#f1f1f1">
            {item.name}
          </Typography>
          <Typography variant="body2" fontWeight={500}>
            ${item.value.toLocaleString()}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

const CustomTooltipHouseStatus = ({ active, payload }: T) => {
  if (!active || !payload || payload.length === 0) return null;

  const item = payload[0];
  const code = item?.payload?.code;
  const meta = HOUSEKEEPING_META[code];
  const labelText = meta?.label ?? code;

  return (
    <Box
      sx={{
        backgroundColor: "#ffffff",
        color: "#000",
        borderRadius: 1,
        boxShadow: 3,
        px: 2,
        py: 1,
        border: "1px solid #e0e0e0",
        minWidth: 140,
      }}
    >
      <Box display="flex" alignItems="center">
        <Typography variant="subtitle2" fontWeight="bold">
          {labelText}
        </Typography>
        <Typography variant="body2" sx={{ ml: "auto" }}>
          {item.value}
        </Typography>
      </Box>
    </Box>
  );
};
// ---------- MAIN COMPONENT ---------- //
const FrontOfficeReports: React.FC = () => {
  // ----- hooks ----- //
  const {
    loading,
    selectedDate,
    occupancyPercent,
    ADR,
    revPAR,
    todayRevenue,
    todayReservations,
    weeklyChartData,
    housekeepingData,
    uniqueRoomTypes,
    selectedRoomTypes,
    setSelectedRoomTypes,
    setSelectedDate,
  } = useFrontOfficeReport();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  // Calculate grid size for KPI cards
  const kpiGridSize = React.useMemo(() => {
    if (isMobile) return 12; // 1 per row
    if (isTablet) return 6; // 2 per row
    return 3; // 4 per row (desktop)
  }, [isMobile, isTablet]);

  const reservationsTitle = React.useMemo(() => {
    const today = moment().startOf("day");
    const target = moment(selectedDate).startOf("day");
    if (target.isSame(today.clone().subtract(1, "day"))) return "Yesterday’s";
    if (target.isSame(today)) return "Today’s";
    if (target.isSame(today.clone().add(1, "day"))) return "Tomorrow";
    return `${target.format("MMMM D")}`;
  }, [selectedDate]);

  const roomTypeColorMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    uniqueRoomTypes.forEach((type, index) => {
      map[type] = BAR_COLORS[index % BAR_COLORS.length] || getRandomColor(type);
    });
    return map;
  }, [uniqueRoomTypes]);

  // ----- loading skeleton ----- //
  if (loading) {
    return (
      <Box p={isMobile ? 2 : 4} textAlign="center">
        <FrontOfficeReportsSkeleton />
      </Box>
    );
  }

  // ----- main render ----- //
  return (
    <Box px={isMobile ? 2 : 0}>
      {/* Header */}
      <Stack
        direction={isMobile ? "column" : "row"}
        spacing={isMobile ? 2 : 0}
        justifyContent="space-between"
        alignItems={isMobile ? "flex-start" : "center"}
        sx={{ mb: 3 }}
      >
        <Typography
          variant={isMobile ? "h5" : "h4"}
          fontWeight={600}
          color="primary"
          gutterBottom
          sx={{ fontSize: isMobile ? 24 : isTablet ? 28 : 32 }}
        >
          Front Office Dashboard
        </Typography>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Select Date"
            value={dayjs(selectedDate)}
            onChange={(newDate) => {
              if (newDate) {
                setSelectedDate(newDate.toDate());
              }
            }}
            slotProps={{ textField: { size: "small" } }}
          />
        </LocalizationProvider>
      </Stack>

      {/* KPI cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          {
            label: `${reservationsTitle} Occupancy`,
            value: `${occupancyPercent}%`,
            color: "primary",
          },
          {
            label: `${reservationsTitle} Average Daily Rate`,
            value: `${ADR.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 })}`,
            color: "success.main",
          },
          {
            label: `${reservationsTitle} Revenue per Room`,
            value: `${revPAR.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 })}`,
            color: "warning.main",
          },
          {
            label: `${reservationsTitle} Revenue`,
            value: `$${todayRevenue.toLocaleString()}`,
            color: "primary",
          },
        ].map((m) => (
          <Grid item xs={12} sm={kpiGridSize} key={m.label}>
            <Card elevation={2} sx={{ height: "100%" }}>
              <CardContent
                sx={{
                  minHeight: 100, // Ensures uniform vertical space
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <Typography
                  color="text.secondary"
                  variant="body2"
                  sx={{ fontSize: isMobile ? 12 : isTablet ? 13 : 14 }}
                >
                  {m.label}
                </Typography>
                <Typography
                  variant={isMobile ? "h4" : "h3"}
                  fontWeight={600}
                  color={m.color}
                  sx={{ fontSize: isMobile ? 24 : isTablet ? 28 : 32 }}
                >
                  {m.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts & Table */}
      <Grid container spacing={3}>
        {/* ----- House Status Pie ----- */}
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ height: "100%" }}>
            <CardContent>
              <Typography
                variant="h6"
                fontWeight={600}
                gutterBottom
                sx={{ fontSize: isMobile ? 16 : isTablet ? 18 : 20 }}
              >
                House Status
              </Typography>

              <Box
                sx={{
                  position: "relative",
                  display: "flex",
                  justifyContent: "center",
                  mb: 2,
                }}
              >
                <ResponsiveContainer width={200} height={isMobile ? 180 : 200}>
                  <PieChart>
                    <Pie
                      data={housekeepingData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {housekeepingData.map((d) => (
                        <Cell key={d.code} fill={d.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltipHouseStatus />} />
                  </PieChart>
                </ResponsiveContainer>

                {/* Center labels */}
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  {housekeepingData
                    .filter((d) => d.value > 0)
                    .map((d) => (
                      <Typography
                        key={d.code}
                        sx={{ color: d.color, fontWeight: 600, fontSize: 14 }}
                      >
                        {d.value}
                      </Typography>
                    ))}
                </Box>
              </Box>

              {housekeepingData.map((d) => (
                <Box
                  key={d.code}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        bgcolor: d.color,
                        borderRadius: "50%",
                        mr: 1,
                      }}
                    />
                    <Typography variant="body2">{d.name}</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={600}>
                    {d.value}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* ----- House Occupancy Chart ----- */}
        <Grid item xs={12} md={8}>
          <Card elevation={2} sx={{ height: "100%" }}>
            <CardContent>
              <Stack
                direction={isMobile ? "column" : "row"}
                spacing={2}
                justifyContent="space-between"
                alignItems={isMobile ? "flex-start" : "center"}
                mb={2}
              >
                <Typography
                  variant="h6"
                  fontWeight={600}
                  sx={{ fontSize: isMobile ? 16 : isTablet ? 18 : 20 }}
                >
                  House Occupancy
                </Typography>
                <Autocomplete
                  multiple
                  options={uniqueRoomTypes}
                  value={selectedRoomTypes}
                  onChange={(_, newValue) => setSelectedRoomTypes(newValue)}
                  disableCloseOnSelect
                  renderTags={() => null}
                  getOptionLabel={(option) => option}
                  renderOption={(props, option, { selected }) => {
                    const color = roomTypeColorMap[option];
                    return (
                      <li {...props}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            bgcolor: color,
                            mr: 1,
                            flexShrink: 0,
                          }}
                        />
                        <Checkbox
                          checked={selected}
                          sx={{ mr: 1 }}
                          color="primary"
                        />
                        <Typography>{option}</Typography>
                      </li>
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      label="Room Types"
                      placeholder="Select"
                    />
                  )}
                  sx={{ minWidth: 250 }}
                />
              </Stack>

              <ResponsiveContainer width="100%" height={isMobile ? 260 : 300}>
                <ComposedChart data={weeklyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                  />
                  <YAxis
                    yAxisId="left"
                    tickFormatter={(v) => `$${(v / 1_000).toFixed(0)}k`}
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    wrapperStyle={{ fontSize: 12 }}
                  />

                  {selectedRoomTypes.map((rt, idx) => (
                    <Bar
                      key={rt}
                      yAxisId="left"
                      dataKey={rt}
                      stackId="revenue"
                      fill={
                        BAR_COLORS[idx % BAR_COLORS.length] ||
                        getRandomColor(rt)
                      }
                    />
                  ))}

                  <Line
                    yAxisId="right"
                    dataKey="occupancy"
                    stroke="#000"
                    strokeWidth={3}
                    dot={{ r: 3 }}
                  >
                    <LabelList
                      dataKey="occupancy"
                      position="top"
                      formatter={(label) => `${Number(label)}%`}
                    />
                  </Line>
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* ----- Reservations Table ----- */}
        <Grid item xs={12}>
          <Card elevation={2}>
            <CardContent>
              <Typography
                variant="h6"
                fontWeight={600}
                gutterBottom
                sx={{ fontSize: isMobile ? 16 : isTablet ? 18 : 20 }}
              >
                {`${reservationsTitle} Reservations`}
              </Typography>
              <TableContainer sx={{ overflowX: "auto" }}>
                <Table
                  size={isMobile ? "small" : "medium"}
                  sx={{ minWidth: 600 }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell>Room</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Guest</TableCell>
                      <TableCell>Check In</TableCell>
                      <TableCell>Check Out</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {todayReservations.map((r) => (
                      <TableRow key={r.id} hover>
                        <TableCell>
                          <Typography
                            fontWeight={600}
                            sx={{
                              fontSize: isMobile ? 12 : isTablet ? 13 : 14,
                            }}
                          >
                            {r.current_room_info?.room_number || "—"}
                          </Typography>
                        </TableCell>
                        <TableCell>{r.room_type?.type || "—"}</TableCell>
                        <TableCell>
                          <Chip
                            label={r.status}
                            size="small"
                            color={
                              r.status === ReservationStatusEnum.IN_HOUSE
                                ? "success"
                                : r.status === ReservationStatusEnum.ARRIVING
                                  ? "primary"
                                  : "warning"
                            }
                          />
                        </TableCell>
                        <TableCell>
                          {r.reservation_first_guest_info?.first_name}{" "}
                          {r.reservation_first_guest_info?.last_name}
                        </TableCell>
                        <TableCell>{r.start_date}</TableCell>
                        <TableCell>{r.end_date}</TableCell>
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

export default FrontOfficeReports;
