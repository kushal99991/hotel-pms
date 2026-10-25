import React, { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { useSalesDashboardContext } from "contexts/SalesDashboardContext";

interface DonutChartProps {
  title: string;
  type?: "SALES_DISTRIBUTION" | "MARKET_SEGMENT";
}

const DonutChart: React.FC<DonutChartProps> = ({
  title,
  type = "SALES_DISTRIBUTION",
}) => {
  const { marketSegments, salesDistribution } = useSalesDashboardContext();
  const data = useMemo(
    () => (type === "MARKET_SEGMENT" ? marketSegments : salesDistribution),
    [type, marketSegments, salesDistribution]
  );
  return (
    <Card>
      <CardContent>
        <Typography variant="subtitle1" gutterBottom align="center">
          {title}
        </Typography>
        <Box
          sx={{
            height: 250,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                innerRadius={40}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </Box>
        {data.map((d) => (
          <Box
            key={d.name}
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
  );
};

export default DonutChart;
