import React, { useCallback } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import moment from "moment";
import { IReservationResponse, Room } from "types/reservationTypes";

interface OccupancyHeaderProps {
  dateColumns: string[];
  reservations: IReservationResponse[];
  roomGroup: Room[];
}

const OccupancyHeader: React.FC<OccupancyHeaderProps> = ({
  dateColumns,
  reservations,
  roomGroup,
}) => {
  const theme = useTheme();
  const calculateRoomSoldOccupancyPer = useCallback(
    (date: string) => {
      const formattedDate = moment(date).startOf("day");

      const soldReservations = reservations.filter((res) => {
        const start = moment(res.start_date).startOf("day");
        const end = moment(res.end_date).startOf("day");
        return (
          formattedDate.isSameOrAfter(start) && formattedDate.isBefore(end)
        );
      });

      const totalRooms = roomGroup.length;
      const soldCount = soldReservations.length;
      const occupiedRoom = totalRooms - soldCount;
      const occupancy = totalRooms > 0 ? (occupiedRoom * 100) / totalRooms : 0;

      return {
        sold: soldCount,
        occupancy: occupancy.toFixed(2),
      };
    },
    [reservations, roomGroup]
  );

  return (
    <Box
      sx={{
        display: "flex",
        position: "sticky",
        top: 0,
        bgcolor: "background.paper",
        // borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Box
        sx={{
          position: "sticky",
          left: 0,
          borderRight: `1px solid ${theme.palette.divider}`,
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: "background.paper",
          height: "40px",
          minWidth: "60px",
        }}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Typography variant="body2" fontWeight="700">
          Room
        </Typography>
      </Box>
      {dateColumns.map((date) => {
        const { occupancy, sold } = calculateRoomSoldOccupancyPer(date);
        return (
          <Box
            key={date}
            sx={{
              minWidth: 100,
              p: 1,
              textAlign: "center",
              borderRight: `1px solid ${theme.palette.divider}`,
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
            display="flex"
            flexDirection="column"
          >
            <Typography variant="caption">
              {moment(date).format("ddd")}
            </Typography>
            <Typography variant="caption" fontWeight="bold">
              {moment(date).format("MMM DD")}
            </Typography>
            <Typography variant="caption">
              {sold} - {occupancy}%
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};

export default OccupancyHeader;
