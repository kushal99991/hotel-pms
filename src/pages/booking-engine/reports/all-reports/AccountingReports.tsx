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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { IAccountReceivables, useAccountReport } from "hooks/useAccountReport";

const profitLossData = [
  { month: "Jan", revenue: 125000, expenses: 85000, profit: 40000 },
  { month: "Feb", revenue: 145000, expenses: 92000, profit: 53000 },
  { month: "Mar", revenue: 165000, expenses: 98000, profit: 67000 },
  { month: "Apr", revenue: 185000, expenses: 105000, profit: 80000 },
  { month: "May", revenue: 205000, expenses: 115000, profit: 90000 },
  { month: "Jun", revenue: 195000, expenses: 110000, profit: 85000 },
];

// const expenseBreakdown = [
//   { category: "Walk-in", amount: 45000, color: "#1976d2" },
//   { category: "Utilities", amount: 15000, color: "#2e7d32" },
//   { category: "Maintenance", amount: 12000, color: "#f57c00" },
//   { category: "Marketing", amount: 18000, color: "#9c27b0" },
//   { category: "Supplies", amount: 8000, color: "#f44336" },
//   { category: "Others", amount: 12000, color: "#795548" },
// ];

// const accountsReceivable = [
//   {
//     client: "Corporate Account A",
//     amount: 25000,
//     daysOverdue: 0,
//     status: "Current",
//   },
//   {
//     client: "Travel Agency B",
//     amount: 15000,
//     daysOverdue: 15,
//     status: "Overdue",
//   },
//   {
//     client: "Group Booking C",
//     amount: 35000,
//     daysOverdue: 0,
//     status: "Current",
//   },
//   {
//     client: "Wedding Party D",
//     amount: 8000,
//     daysOverdue: 30,
//     status: "Overdue",
//   },
// ];

const AccountingReports: React.FC = () => {
  const { bookingSegment, accountsReceivable, bookingChannelBreakdown } =
    useAccountReport();
  const currency = (v: number, decimals = 1): string => {
    if (v === null || v === undefined || isNaN(v)) return "-";

    const abs = Math.abs(v);

    const units = [
      { value: 1_000_000_000_000, symbol: "T" },
      { value: 1_000_000_000, symbol: "B" },
      { value: 1_000_000, symbol: "M" },
      { value: 1_000, symbol: "K" },
    ];

    for (const u of units) {
      if (abs >= u.value) {
        const formatted = (abs / u.value).toFixed(decimals);
        return `${v < 0 ? "-" : ""}$${formatted}${u.symbol}`;
      }
    }

    // < 1 000 – show full number with no suffix
    return `${v < 0 ? "-" : ""}$${abs.toFixed(0)}`;
  };

  const percent = (v: number) => `${v.toFixed(1)}%`;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={600} color="primary" gutterBottom>
          Accounting Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Financial Performance and Account Management
        </Typography>
      </Box>

      {/* Key Financial Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {bookingSegment.map((m) => (
          <Grid key={m.key} item xs={12} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Typography color="text.secondary" variant="body2">
                  {m.label}
                </Typography>

                <Typography
                  variant="h3"
                  fontWeight={600}
                  color={
                    m.key === "totalExpense"
                      ? "error.main"
                      : m.key === "profitMargin"
                        ? "info.main"
                        : m.key === "netProfit"
                          ? "primary.main"
                          : "success.main"
                  }
                >
                  {m.key === "profitMargin"
                    ? percent(m.value)
                    : currency(m.value, 2)}
                </Typography>

                <Typography
                  variant="caption"
                  color={m.delta >= 0 ? "success.main" : "error.main"}
                >
                  {m.delta >= 0 && "+"}
                  {percent(Math.abs(m.delta))} vs last month
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Profit & Loss Trend */}
        <Grid item xs={12} md={8}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Profit & Loss Trend
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={profitLossData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [`$${value.toLocaleString()}`, ""]}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="#2e7d32"
                    name="Revenue"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar
                    dataKey="expenses"
                    fill="#f44336"
                    name="Expenses"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar
                    dataKey="profit"
                    fill="#1976d2"
                    name="Profit"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Expense Breakdown */}
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Booking Channel Breakdown
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                <ResponsiveContainer width={200} height={200}>
                  <PieChart>
                    <Pie
                      data={bookingChannelBreakdown}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {bookingChannelBreakdown.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      separator=" : "
                      formatter={(value: number) =>
                        `$${value.toLocaleString()}`
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Box>
                {bookingChannelBreakdown.map((item, index) => (
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
                          bgcolor: item.color,
                          borderRadius: "50%",
                        }}
                      />
                      <Typography variant="body2">{item.category}</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={600}>
                      ${item.amount.toLocaleString()}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Accounts Receivable */}
        <Grid item xs={12}>
          <Card elevation={2}>
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h6" fontWeight={600}>
                  Accounts Receivable
                </Typography>
                <Box display="flex" gap={2}>
                  <Chip label="Total Outstanding: $83,000" color="primary" />
                  <Chip label="Overdue: $23,000" color="error" />
                </Box>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Client</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell align="center">Days Overdue</TableCell>
                      <TableCell align="center">Status</TableCell>
                      <TableCell align="center">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {accountsReceivable.map(
                      (account: IAccountReceivables, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Typography fontWeight={600}>
                              {account.client}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography fontWeight={600}>
                              {account.amount.toLocaleString("en-US", {
                                currency: "USD",
                                style: "currency",
                                maximumFractionDigits: 2,
                              })}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            {account.daysOverdue}
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={account.status}
                              size="small"
                              color={
                                account.status === "Current"
                                  ? "success"
                                  : "error"
                              }
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={
                                account.status === "Current"
                                  ? "Monitor"
                                  : "Follow Up"
                              }
                              size="small"
                              variant="outlined"
                              color={
                                account.status === "Current"
                                  ? "primary"
                                  : "warning"
                              }
                            />
                          </TableCell>
                        </TableRow>
                      )
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

export default AccountingReports;
