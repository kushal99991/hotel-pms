import React from "react";
import { Paper, Box, Typography, Stack } from "@mui/material";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon,
}) => {
  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography variant="subtitle2" color="text.secondary">
          {title}
        </Typography>
        <Box sx={{ color: "text.secondary" }}>{icon}</Box>
      </Box>
      <Stack spacing={1}>
        <Typography variant="h5" fontWeight="medium">
          {value}
        </Typography>
        {/* {trend && (
          <Typography
            variant="body2"
            sx={{
              color: trend.isPositive ? "success.main" : "error.main",
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
          </Typography>
        )} */}
      </Stack>
    </Paper>
  );
};
