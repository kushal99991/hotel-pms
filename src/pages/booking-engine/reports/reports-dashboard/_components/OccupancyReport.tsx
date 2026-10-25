import React from "react";
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Skeleton,
} from "@mui/material";
import { useGetReservationListQuery } from "services/reservationSlice";
import useAuth from "hooks/useAuth";
import { ReservationStatusEnum } from "constants/reservation";
import { statusColors } from "components/widgets/RoomStatusCode/RoomStatusCode";
import { IRoomStatus } from "constants/room";

const OccupancyReportSkeleton: React.FC = () => {
  return (
    <>
      {[...Array(5)].map((_, index) => (
        <TableRow key={index}>
          <TableCell>
            <Skeleton variant="text" width="40px" />
          </TableCell>
          <TableCell>
            <Skeleton variant="text" width="40px" />
          </TableCell>
          <TableCell>
            <Skeleton variant="rectangular" width={80} height={24} />
          </TableCell>
          <TableCell>
            <Skeleton variant="text" width="80px" />
          </TableCell>
          <TableCell>
            <Skeleton variant="text" width="80px" />
          </TableCell>
          <TableCell>
            <Skeleton variant="text" width="80px" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};

export const OccupancyReport: React.FC = () => {
  const { users } = useAuth();

  const { data: reservationList, isLoading } = useGetReservationListQuery(
    {
      property_id: users?.defaultPropertyId ?? 0,
      reservation_status: ReservationStatusEnum.IN_HOUSE,
    },
    {
      skip: false,
      refetchOnMountOrArgChange: true,
    }
  );
  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>
        In-House Occupancy
      </Typography>
      <TableContainer>
        <Table size="small">
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
            {isLoading ? (
              <OccupancyReportSkeleton />
            ) : (
              (reservationList ?? []).map((room, index: number) => {
                const rawStatus = room?.current_room_info?.frontdesk_status;
                const { label, color } = statusColors[
                  rawStatus as IRoomStatus
                ] || {
                  color: "black",
                  label: rawStatus,
                };
                return (
                  <TableRow key={`${room?.id}-${index}`}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {room?.current_room_info?.room_number}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {room.room_type?.type}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        component="span"
                        style={{
                          color: color,
                          textAlign: "center",
                          fontWeight: "bold",
                        }}
                      >
                        {label}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {room.reservation_first_guest_info?.first_name ||
                        room.reservation_first_guest_info?.last_name
                          ? `${room.reservation_first_guest_info.first_name || ""} ${room.reservation_first_guest_info.last_name || ""}`.trim()
                          : "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {room.start_date || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {room.end_date || "-"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};
