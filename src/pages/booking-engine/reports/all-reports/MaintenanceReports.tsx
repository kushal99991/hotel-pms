import React, { useEffect, useMemo, useState } from "react";
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
  LinearProgress,
  Skeleton,
  useTheme,
} from "@mui/material";
import {
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Bar,
} from "recharts";
import moment from "moment";
import useAuth from "hooks/useAuth";
import { useGetMaintenanceListMutation } from "services/maintenanceSlice";

/* ---------- Priority map (static business rules) ---------- */
const SERVICE_PRIORITY_MAP: Record<
  string,
  "Critical" | "High" | "Medium" | "Low"
> = {
  HVAC: "Critical",
  FIRE_SAFETY: "Critical",
  PLUMBING: "High",
  ELECTRICAL: "High",
  APPLIANCES: "Medium",
  BATHROOM: "Medium",
  CLEANING: "Low",
  DEEP_CLEANING: "Low",
  DOORS: "Medium",
  DRYWALL: "Low",
  ELEVATOR: "High",
  FLOORING: "Medium",
  FURNITURE: "Low",
  GARAGE: "Medium",
  GENERAL_REPAIRS: "Medium",
  INSPECTION: "Low",
  KITCHEN: "Medium",
  LANDSCAPING: "Low",
  LIGHTING: "Medium",
  MAINTENANCE: "Low",
  PAINTING: "Low",
  PEST_CONTROL: "Medium",
  POOL: "Medium",
  ROOFING: "High",
  SECURITY_SYSTEM: "High",
  SPRINKLER_SYSTEM: "High",
  WATER_HEATER: "High",
  WINDOWS: "Medium",
};

interface Ticket {
  id: number | string;
  service_code: string;
  service_request: string;
  service_status: string;
  created_at: string;
  room?: { room_number: string };
  assigned_to_user?: unknown;
}

/* ---------- Component ---------- */
const MaintenanceReports: React.FC = () => {
  const { users } = useAuth();
  const theme = useTheme();
  const [getMaintenanceList, { isLoading: loadingMaintenance }] =
    useGetMaintenanceListMutation();

  const [tickets, setTickets] = useState<Ticket[]>([]);

  /* ---- fetch data once ---- */
  useEffect(() => {
    (async () => {
      try {
        const res = await getMaintenanceList({
          property_id: users?.defaultPropertyId ?? 0,
        });
        setTickets(res?.data ?? []);
      } catch {
        /** empty catch error */
      }
    })();
  }, [getMaintenanceList, users?.defaultPropertyId]);

  /* ---- helper: monthly key (e.g. "Jan") ---- */
  const monthKey = (dateStr: string) => moment(dateStr).format("MMM");

  /* ---- derived data ---- */
  const {
    workOrderTrend,
    priorityDistribution,
    recentTickets,
    openCount,
    completedThisMonth,
    inProgressCount,
    closedPct,
    closedCount,
  } = useMemo(() => {
    if (!tickets.length) {
      const allMonths = moment.monthsShort(); // ['Jan', 'Feb', …, 'Dec']
      const trendMap: Record<string, TrendRow> = {};
      allMonths.forEach((m) => {
        trendMap[m] = { open: 0, inProgress: 0, complete: 0, closed: 0 };
      });
      const workOrderTrend = allMonths.map((month) => ({
        month,
        ...trendMap[month],
      }));

      return {
        workOrderTrend: workOrderTrend,
        priorityDistribution: [
          { name: "Critical", value: 0, color: "#9c27b0" },
          { name: "High", value: 0, color: "#f44336" },
          { name: "Medium", value: 0, color: "#ff9800" },
          { name: "Low", value: 0, color: "#4caf50" },
        ],
        recentTickets: [],
        openCount: 0,
        completedThisMonth: 0,
        inProgressCount: 0,
        closedPct: 0,
      };
    }
    /* 1️⃣ Work-orders trend (Completed vs Pending by month) */
    const allMonths = moment.monthsShort(); // ['Jan', 'Feb', …, 'Dec']
    type TrendRow = {
      open: number;
      inProgress: number;
      complete: number;
      closed: number;
    };

    const trendMap: Record<string, TrendRow> = {};
    allMonths.forEach((m) => {
      trendMap[m] = { open: 0, inProgress: 0, complete: 0, closed: 0 };
    });

    tickets.forEach((t) => {
      const m = monthKey(t.created_at);
      switch (t.service_status) {
        case "OPEN":
          trendMap[m].open += 1;
          break;
        case "IN_PROGRESS":
          trendMap[m].inProgress += 1;
          break;
        case "COMPLETE":
          trendMap[m].complete += 1;
          break;
        case "CLOSED":
          trendMap[m].closed += 1;
          break;
      }
    });

    const workOrderTrend = allMonths.map((month) => ({
      month,
      ...trendMap[month],
    }));

    /* 2️⃣ Priority distribution */
    const prioMap: Record<"Low" | "Medium" | "High" | "Critical", number> = {
      Low: 0,
      Medium: 0,
      High: 0,
      Critical: 0,
    };
    tickets.forEach((t) => {
      const p =
        SERVICE_PRIORITY_MAP[t.service_code] ?? ("Low" as keyof typeof prioMap);
      prioMap[p] += 1;
    });
    const totalTickets = tickets.length || 1; // avoid div/0
    const priorityDistribution = (
      Object.keys(prioMap) as Array<keyof typeof prioMap>
    ).map((k) => ({
      name: k,
      value: Math.round((prioMap[k] / totalTickets) * 100),
      color:
        k === "Critical"
          ? "#9c27b0"
          : k === "High"
            ? "#f44336"
            : k === "Medium"
              ? "#ff9800"
              : "#4caf50",
    }));

    /* 3️⃣ Key metrics */
    const today = moment();
    const openCount = tickets.filter((t) => t.service_status === "OPEN").length;

    const completedThisMonth = tickets.filter(
      (t) =>
        t.service_status === "COMPLETE" &&
        moment(t.created_at).isSame(today, "month")
    ).length;

    const inProgressCount = tickets.filter(
      (t) =>
        t.service_status === "IN_PROGRESS" &&
        moment(t.created_at).isSame(today, "month")
    ).length;

    const closedCount =
      tickets.filter(
        (t) =>
          t.service_status === "CLOSED" &&
          moment(t.created_at).isSame(today, "month")
      )?.length ?? 0;
    const createdThisMonth = tickets.filter((t) =>
      moment(t.created_at).isSame(today, "month")
    ).length;
    const closedPct =
      createdThisMonth === 0
        ? 0
        : Math.round((closedCount / createdThisMonth) * 100);

    /* 4️⃣ Recent tickets (latest 10) */
    const recentTickets = [...tickets]
      .sort(
        (a, b) =>
          moment(b.created_at).valueOf() - moment(a.created_at).valueOf()
      )
      .slice(0, 10);

    return {
      workOrderTrend,
      priorityDistribution,
      recentTickets,
      openCount,
      completedThisMonth,
      inProgressCount,
      closedPct,
      closedCount,
    };
  }, [tickets]);

  /* ---- Loading skeleton ---- */
  if (loadingMaintenance) {
    return (
      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Maintenance Dashboard
        </Typography>
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={600} color="primary" gutterBottom>
          Maintenance Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Maintenance Analytics
        </Typography>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <MetricsCard
          title="Open"
          value={openCount}
          color="error"
          progress={(openCount / (tickets.length || 1)) * 100}
        />
        <MetricsCard
          title="Completed"
          value={completedThisMonth}
          color="success"
          progress={(completedThisMonth / (tickets.length || 1)) * 100}
        />
        <MetricsCard
          title="In Progress"
          value={inProgressCount}
          color="info"
          progress={(inProgressCount / (tickets.length || 1)) * 100}
        />
        <MetricsCard
          title="Closed"
          value={`${closedCount ?? 0}`}
          color="warning"
          progress={closedPct}
        />
      </Grid>

      <Grid container spacing={3}>
        {/* Work-order trend */}
        <Grid item xs={12} md={8}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Maintenance Trend
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={workOrderTrend} barCategoryGap={8}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />

                  {/* Four bars sitting side-by-side */}
                  <Bar
                    dataKey="open"
                    fill={theme.palette.error.main}
                    name="Open"
                    barSize={18}
                  />
                  <Bar
                    dataKey="inProgress"
                    fill={theme.palette.info.main}
                    name="In Progress"
                    barSize={18}
                  />
                  <Bar
                    dataKey="complete"
                    fill={theme.palette.success.main}
                    name="Complete"
                    barSize={18}
                  />
                  <Bar
                    dataKey="closed"
                    fill={theme.palette.warning.main}
                    name="Closed"
                    barSize={18}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Priority distribution */}
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Priority Distribution
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                <ResponsiveContainer width={200} height={200}>
                  <PieChart>
                    <Pie
                      data={priorityDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      paddingAngle={3}
                    >
                      {priorityDistribution.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              {priorityDistribution.map((item, i) => (
                <Box
                  key={i}
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
                        bgcolor: item.color,
                        borderRadius: "50%",
                      }}
                    />
                    <Typography variant="body2">{item.name}</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={600}>
                    {item.value}%
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent tickets table */}
        <Grid item xs={12}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Maintenance Tickets
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Ticket ID</TableCell>
                      <TableCell>Room</TableCell>
                      <TableCell>Issue</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentTickets.length === 0 ? (
                      /* ➜ empty-state row */
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ py: 2 }}
                          >
                            No maintenance tickets found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      <>
                        {recentTickets.map((t) => {
                          const priority =
                            SERVICE_PRIORITY_MAP[t.service_code] ?? "Low";
                          return (
                            <TableRow key={t.id}>
                              <TableCell>
                                <Typography
                                  fontWeight={600}
                                >{`${t.id}`}</Typography>
                              </TableCell>
                              <TableCell>
                                {t.room?.room_number ?? "-"}
                              </TableCell>
                              <TableCell>{t.service_request}</TableCell>
                              <TableCell>
                                <Chip
                                  label={priority}
                                  size="small"
                                  color={
                                    priority === "Critical"
                                      ? "error"
                                      : priority === "High"
                                        ? "warning"
                                        : priority === "Medium"
                                          ? "info"
                                          : "success"
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={t.service_status.replace("_", " ")}
                                  size="small"
                                  variant="outlined"
                                  color={
                                    t.service_status === "COMPLETED"
                                      ? "success"
                                      : t.service_status === "IN_PROGRESS"
                                        ? "info"
                                        : t.service_status === "OPEN"
                                          ? "error"
                                          : "default"
                                  }
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </>
                    )}
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

/* ---------- small reusable metric card ---------- */
interface MetricsCardProps {
  title: string;
  value: number | string;
  color: "error" | "success" | "info" | "warning";
  progress: number;
}
const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  color,
  progress,
}) => (
  <Grid item xs={12} md={3}>
    <Card elevation={2}>
      <CardContent>
        <Typography color="text.secondary" variant="body2">
          {title}
        </Typography>
        <Typography
          variant="h3"
          fontWeight={600}
          color={`${color}.main`}
          sx={{ lineHeight: 1.2 }}
        >
          {value}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={Math.min(progress, 100)}
          color={color}
          sx={{ mt: 1 }}
        />
      </CardContent>
    </Card>
  </Grid>
);

export default MaintenanceReports;
