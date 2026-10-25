import React, { useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { useGetHistoryByIdMutation } from "services/historySlice";
import useAuth from "hooks/useAuth";
import { convertUtcToTimezone } from "utils/helperFunctions/common";

interface HistoryProps {
  reservationId: number | null;
}

const History: React.FC<HistoryProps> = ({ reservationId }) => {
  const { users, currentTimeZone } = useAuth();

  const [getHistoryByid, { data: historyDetail }] = useGetHistoryByIdMutation();

  useEffect(() => {
    if (reservationId) {
      getHistoryByid({
        property_id: users?.defaultPropertyId ?? 1,
        table_id: reservationId,
        category: "RESERVATION",
      });
    }
  }, [reservationId, users?.defaultPropertyId, getHistoryByid]);

  return (
    <Box display="flex" flexDirection="column">
      <Box sx={{ maxHeight: "320px", overflowY: "auto" }}>
        <Box p={2}>
          {historyDetail?.map((history) => (
            <Box
              key={history.id}
              display="flex"
              flexDirection="column"
              marginBottom={2}
              borderBottom="1px solid #e0e0e0"
              paddingBottom={2}
            >
              <Typography variant="body1" fontWeight="bold">
                {history.category}
              </Typography>
              <Typography variant="body2" marginY={1}>
                {history.details}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {convertUtcToTimezone(
                  history.created_at,
                  currentTimeZone
                ).format("MMM DD, YYYY hh:mm A")}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default History;
