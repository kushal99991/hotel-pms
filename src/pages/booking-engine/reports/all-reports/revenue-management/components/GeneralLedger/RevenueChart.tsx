import {
  Box,
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Slider,
  Switch,
  Typography,
} from "@mui/material";
import useGeneralLedger from "hooks/useGeneralLedger";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const RevenueChart = () => {
  const {
    chartData,
    chartView,
    topCount,
    showBars,
    showLines,
    colors,
    mockRevenueData,
    setChartView,
    setShowLines,
    setShowBars,
    setTopCount,
  } = useGeneralLedger();
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null;

    const data = payload[0]?.payload;

    // Deduplicate by dataKey
    const uniquePayload = payload.filter(
      (entry: any, index: number, self: any[]) =>
        index === self.findIndex((p) => p.dataKey === entry.dataKey)
    );

    return (
      <Paper
        elevation={4}
        sx={{
          padding: 2,
          borderRadius: 2,
          minWidth: 260,
          backgroundColor: "#fff",
        }}
      >
        <Typography
          variant="subtitle2"
          fontWeight="bold"
          sx={{ marginBottom: 1.5 }}
          color="text.primary"
        >
          {data?.fullName || label}
        </Typography>

        {uniquePayload.map((entry: any, idx: number) => (
          <Box
            key={idx}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 0.8 }}
          >
            <Box display="flex" alignItems="center">
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: entry.color,
                  marginRight: 1,
                }}
              />
              <Typography variant="body2" color="text.secondary">
                {entry.dataKey}
              </Typography>
            </Box>
            <Typography variant="body2" fontWeight={500} color="text.primary">
              ${Number(entry.value).toLocaleString()}
            </Typography>
          </Box>
        ))}
      </Paper>
    );
  };
  return (
    <Card className="mb-8 shadow-lg border-0">
      <CardContent className="p-6">
        <Box className="flex items-center justify-between mb-6">
          <Box>
            <Typography variant="h6" className="font-bold text-gray-900 mb-1">
              Revenue Analysis - {mockRevenueData.length} Posting Codes
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              Interactive view with filtering options for better visualization
            </Typography>
          </Box>
          <Box className="flex items-center space-x-4">
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Chart View</InputLabel>
              <Select
                value={chartView}
                label="Chart View"
                onChange={(e) => setChartView(e.target.value as "top" | "all")}
              >
                <MenuItem value="top">Top Performers</MenuItem>
                <MenuItem value="all">All Codes</MenuItem>
              </Select>
            </FormControl>

            <Box className="flex items-center space-x-2">
              <Typography variant="body2" className="text-gray-600">
                Show top:
              </Typography>
              <Box sx={{ width: 100 }}>
                <Slider
                  value={topCount}
                  onChange={(_, value) => setTopCount(value as number)}
                  min={5}
                  max={mockRevenueData?.length ?? 35}
                  step={5}
                  marks
                  size="small"
                  valueLabelDisplay="auto"
                />
              </Box>
            </Box>

            <Box className="flex items-center space-x-2">
              <FormControlLabel
                control={
                  <Switch
                    checked={showBars}
                    onChange={(e) => setShowBars(e.target.checked)}
                    size="small"
                  />
                }
                label="Bars"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={showLines}
                    onChange={(e) => setShowLines(e.target.checked)}
                    size="small"
                  />
                }
                label="Lines"
              />
            </Box>
          </Box>
        </Box>
        <Box
          sx={{
            height: chartView === "all" ? "600px" : "400px",
            overflowX: "auto",
          }}
        >
          <ResponsiveContainer
            width={chartView === "all" ? mockRevenueData.length * 60 : "100%"}
            height="100%"
          >
            <ComposedChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickLine={{ stroke: "#cbd5e1" }}
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis
                tick={{ fontSize: 8, fill: "#64748b" }}
                tickLine={{ stroke: "#cbd5e1" }}
                width={80}
                tickSize={40}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              {/* Bars for current period data */}
              {showBars && (
                <>
                  <Bar dataKey="Today" stackId="revenue" fill={colors.Today} />
                  <Bar
                    dataKey="Month To Date"
                    stackId="revenue"
                    fill={colors["Month To Date"]}
                  />
                  <Bar
                    dataKey="Last Year MTD"
                    stackId="revenue"
                    fill={colors["Last Year MTD"]}
                  />
                  <Bar
                    dataKey="Year To Date"
                    stackId="revenue"
                    fill={colors["Year To Date"]}
                  />
                  <Bar
                    dataKey="Last Year YTD"
                    stackId="revenue"
                    fill={colors["Last Year YTD"]}
                  />
                </>
              )}

              {/* Lines for comparison data */}
              {showLines && (
                <>
                  <Line
                    type="monotone"
                    dataKey="Today"
                    stroke={colors.Today}
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{
                      r: 6,
                      stroke: colors.Today,
                      strokeWidth: 2,
                    }}
                    name="Today"
                    legendType="none"
                  />
                  <Line
                    type="monotone"
                    dataKey="Month To Date"
                    stroke={colors["Month To Date"]}
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{
                      r: 6,
                      stroke: colors["Month To Date"],
                      strokeWidth: 2,
                    }}
                    name="Month To Date"
                    legendType="none"
                  />
                  <Line
                    type="monotone"
                    dataKey="Last Year MTD"
                    stroke={colors["Last Year MTD"]}
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{
                      r: 6,
                      stroke: colors["Last Year MTD"],
                      strokeWidth: 2,
                    }}
                    name="Last Year MTD"
                    legendType="none"
                  />
                  <Line
                    type="monotone"
                    dataKey="Year To Date"
                    stroke={colors["Year To Date"]}
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{
                      r: 6,
                      stroke: colors["Year To Date"],
                      strokeWidth: 2,
                    }}
                    name="Year To Date"
                    legendType="none"
                  />
                  <Line
                    type="monotone"
                    dataKey="Last Year YTD"
                    stroke={colors["Last Year YTD"]}
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{
                      r: 6,
                      stroke: colors["Last Year YTD"],
                      strokeWidth: 2,
                    }}
                    name="Last Year YTD"
                    legendType="none"
                  />
                </>
              )}
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align={chartView === "all" ? "left" : "center"}
                wrapperStyle={{ position: "relative", marginBottom: "16px" }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};
export default RevenueChart;
