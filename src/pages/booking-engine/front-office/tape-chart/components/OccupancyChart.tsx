import React, { useCallback, useState } from "react";
import {
  Box,
  Modal,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import moment from "moment";
import { IReservationResponse } from "types/reservationTypes";
import OccupancyRow from "./OccupancyRow";
import ReservationDetails from "./ReservationDetails";
import { statusColors } from "components/widgets/RoomStatusCode/RoomStatusCode";
import { IRoomStatus } from "constants/room";
import { getCurrentRoom } from "utils/reservations";
import { useTapeChartContext } from "contexts/TapeChartContext";

const OccupancyChartSkeletonLoader: React.FC<{
  containerRef: React.RefObject<HTMLDivElement | null>;
}> = ({ containerRef }) => {
  const fakeRooms = Array.from({ length: 8 });
  const fakeDates = Array.from({ length: 14 });

  return (
    <TableContainer
      sx={{
        maxHeight: "calc(100vh - 160px)",
        border: "1px solid rgba(224, 224, 224, 1)",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        maxWidth: "100%",
        overflowX: "hidden",
      }}
      ref={containerRef}
    >
      <Table stickyHeader>
        <TableHead style={{ position: "sticky", zIndex: 5, top: 0 }}>
          <TableRow>
            {/* Room Label Column */}
            <TableCell
              sx={{
                position: "sticky",
                top: 0,
                left: 0,
                zIndex: 3,
                backgroundColor: "#fff",
                fontWeight: "bold",
                borderRight: "1px solid rgba(224, 224, 224, 1)",
              }}
            >
              <Skeleton variant="text" width={60} />
            </TableCell>

            {/* HK Status */}
            <TableCell
              sx={{
                position: "sticky",
                top: 0,
                left: 77,
                zIndex: 3,
                backgroundColor: "#fff",
                fontWeight: "bold",
                borderRight: "1px solid rgba(224, 224, 224, 1)",
                textAlign: "center",
                padding: 0,
              }}
            >
              <Skeleton variant="text" width={40} />
            </TableCell>

            {/* Date Columns */}
            {fakeDates.map((_, index) => (
              <TableCell
                key={index}
                sx={{
                  backgroundColor: "#fff",
                  fontWeight: "bold",
                  borderRight: "1px solid rgba(224, 224, 224, 1)",
                  textAlign: "center",
                  minWidth: 100,
                  zIndex: 2,
                  padding: 1,
                }}
              >
                <Skeleton variant="text" width="80%" />
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {fakeRooms.map((_, roomIdx) => (
            <TableRow key={roomIdx}>
              {/* Room number */}
              <TableCell
                sx={{
                  position: "sticky",
                  top: 0,
                  left: 0,
                  zIndex: 3,
                  backgroundColor: "#fff",
                  padding: 1,
                  textAlign: "center",
                }}
              >
                <Skeleton variant="text" width={60} />
                <Skeleton variant="text" width={40} />
              </TableCell>

              {/* HK status */}
              <TableCell
                sx={{
                  position: "sticky",
                  top: 0,
                  left: 77,
                  zIndex: 3,
                  backgroundColor: "#f0f0f0",
                  padding: 1,
                  textAlign: "center",
                }}
              >
                <Skeleton
                  variant="circular"
                  width={24}
                  height={24}
                  sx={{ margin: "auto" }}
                />
              </TableCell>

              {/* Date blocks for the row */}
              {fakeDates.map((_, dateIdx) => (
                <TableCell
                  key={dateIdx}
                  sx={{
                    padding: 1,
                    borderRight: "1px solid #e0e0e0",
                    borderTop: "1px solid #e0e0e0",
                    minWidth: 100,
                    height: 45,
                    backgroundColor: "#fafafa",
                  }}
                >
                  <Skeleton variant="rectangular" height={30} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const OccupancyChart: React.FC = () => {
  const {
    reservations,
    sampleRooms: rooms,
    isLoading,
    dateColumns,
    containerRef,
  } = useTapeChartContext();
  const [selectedReservation, setSelectedReservation] =
    useState<IReservationResponse | null>(null);

  const paginatedDates = dateColumns;

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

      const totalRooms = rooms.length;
      const soldCount = soldReservations.length;
      const occupancy = totalRooms > 0 ? (soldCount / totalRooms) * 100 : 0;

      return {
        sold: soldCount,
        occupancy: occupancy.toFixed(2),
      };
    },
    [reservations, rooms]
  );
  if (isLoading) {
    return <OccupancyChartSkeletonLoader containerRef={containerRef} />;
  }

  return (
    <Box>
      <TableContainer
        sx={{
          maxHeight: "calc(100vh - 160px)",
          border: "1px solid rgba(224, 224, 224, 1)",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          maxWidth: "100%",
          overflowX: "hidden",
        }}
        ref={containerRef}
      >
        <Table stickyHeader>
          <TableHead style={{ position: "sticky", zIndex: 5, top: 0 }}>
            <TableRow>
              <TableCell
                sx={{
                  position: "sticky",
                  top: 0,
                  left: 0,
                  zIndex: 3,
                  backgroundColor: "#fff",
                  fontWeight: "bold",
                  borderRight: "1px solid rgba(224, 224, 224, 1)",
                }}
              >
                Rooms
              </TableCell>
              <TableCell
                sx={{
                  position: "sticky",
                  top: 0,
                  left: 77,
                  zIndex: 3,
                  backgroundColor: "#fff",
                  fontWeight: "bold",
                  borderRight: "1px solid rgba(224, 224, 224, 1)",
                  textAlign: "center",
                  padding: 0,
                  paddingX: 2,
                }}
              >
                <Typography fontWeight="700" fontSize="14px">
                  HK
                </Typography>
                <Typography fontWeight="700" fontSize="14px">
                  Status
                </Typography>
              </TableCell>

              <Box sx={{ flex: 1, width: "100%" }}>
                {paginatedDates.map((date, index) => {
                  const { occupancy, sold } =
                    calculateRoomSoldOccupancyPer(date);
                  return (
                    <TableCell
                      key={index}
                      sx={{
                        backgroundColor: "#fff",
                        fontWeight: "bold",
                        borderRight: "1px solid rgba(224, 224, 224, 1)",
                        textAlign: "center",
                        minWidth: 100,
                        zIndex: 2,
                        padding: 0,
                      }}
                    >
                      <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
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
                    </TableCell>
                  );
                })}
              </Box>
            </TableRow>
          </TableHead>
          <TableBody>
            {rooms.map((room) => {
              const roomReservations = reservations.filter((res) => {
                const room_number = getCurrentRoom(res)?.room_number;
                return room_number ? room_number === room.number : false;
              });

              const frontdesk_status = room?.frontdesk_status;
              const isFrontdeskBlocked = ["OOO", "OOS", "OM"].includes(
                frontdesk_status ?? "VAC"
              );
              const hkStatus =
                statusColors[room.housekeeping_status as IRoomStatus];
              const backgroundImage = `repeating-linear-gradient(130deg,#e0e0e0,#e0e0e0 5px,
              #c0c0c0 0px,
              #c0c0c0 9px)`;

              return (
                <TableRow key={room.number}>
                  <TableCell
                    sx={{
                      position: "sticky",
                      top: 0,
                      left: 0,
                      zIndex: 3,
                      backgroundColor: "#fff",
                      padding: 0,
                      textAlign: "center",
                    }}
                  >
                    <Typography fontSize="14px" fontWeight="700">
                      {room.number}
                    </Typography>
                    <Typography>{room.type}</Typography>
                  </TableCell>
                  <TableCell
                    sx={{
                      position: "sticky",
                      top: 0,
                      left: 77,
                      zIndex: 3,
                      backgroundColor: isFrontdeskBlocked
                        ? "#e0e0e0"
                        : (hkStatus?.color ?? "#2c9358"),
                      backgroundImage: isFrontdeskBlocked
                        ? backgroundImage
                        : "none",
                      padding: 0,
                      textAlign: "center",
                    }}
                  >
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Typography
                        fontSize="14px"
                        fontWeight="700"
                        color={isFrontdeskBlocked ? "#000" : "#fff"}
                      >
                        {isFrontdeskBlocked
                          ? frontdesk_status
                          : room.housekeeping_status}
                      </Typography>
                    </Box>
                  </TableCell>
                  <OccupancyRow
                    room={room}
                    reservations={roomReservations}
                    dateColumns={paginatedDates}
                    onSelectReservation={setSelectedReservation}
                  />
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* <Box textAlign="center" mt={1}>
        <button
          onClick={() => setDatePage((prev) => prev + 1)}
          disabled={isLastPage}
          style={{
            padding: "6px 16px",
            backgroundColor: "#1976d2",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: isLastPage ? "not-allowed" : "pointer",
            opacity: isLastPage ? 0.5 : 1,
          }}
        >
          Show More
        </button>
      </Box> */}

      <Modal
        open={!!selectedReservation}
        onClose={() => setSelectedReservation(null)}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Box>
          {selectedReservation && (
            <ReservationDetails
              reservation={selectedReservation}
              onClose={() => setSelectedReservation(null)}
            />
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default OccupancyChart;
