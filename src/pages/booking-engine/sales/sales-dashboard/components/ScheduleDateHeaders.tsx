import React from "react";
import { Typography, Box } from "@mui/material";
import moment from "moment";
import { useSalesDashboardContext } from "contexts/SalesDashboardContext";

const ScheduleDateHeaders: React.FC = () => {
  const { dateColumns } = useSalesDashboardContext();

  return (
    <Box sx={{ display: "flex", width: "100%" }}>
      {dateColumns.map((date) => (
        <Box
          key={date}
          sx={{
            minWidth: 140,
            maxWidth: 140,
            textAlign: "center",
            bgcolor: "#f5f5f5",
            border: "1px solid #e0e0e0",
            borderRadius: 1,
            mr: 1,
            flexShrink: 0,
          }}
          p={1}
        >
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            {moment(date).format("ddd").toUpperCase()} -{" "}
            {moment(date).format("M/D")}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default ScheduleDateHeaders;
