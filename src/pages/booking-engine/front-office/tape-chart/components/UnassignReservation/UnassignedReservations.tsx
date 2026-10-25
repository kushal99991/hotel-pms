import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Skeleton,
} from "@mui/material";
import { useDrop } from "react-dnd";
import { IReservationResponse } from "types/reservationTypes";
import UnassignedReservationRow from "./UnassignedReservationRow";
import moment from "moment";
import { appConfig } from "config/app.config";
import { useTapeChartContext } from "contexts/TapeChartContext";
import useAuth from "hooks/useAuth";
import { ReservationStatusEnum } from "constants/reservation";

type SortKey = "guest" | "type" | "nights";
type SortDirection = "asc" | "desc";

const UnassignedReservationRowSkeleton: React.FC = () => (
  <TableRow>
    <TableCell>
      <Skeleton variant="circular" width={20} height={20} />
    </TableCell>
    <TableCell>
      <Skeleton width="80%" height={20} />
    </TableCell>
    <TableCell align="center">
      <Skeleton width={60} height={20} />
    </TableCell>
    <TableCell align="center">
      <Skeleton width={40} height={20} />
    </TableCell>
  </TableRow>
);

const UnassignedReservationsSkeleton: React.FC = () => {
  return (
    <Paper>
      <Typography variant="h6" sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Skeleton width={200} height={28} />
      </Typography>
      <Box
        sx={{
          p: 2,
          minHeight: 100,
          maxHeight: "calc(100vh - 160px)",
          height: "100vh",
          overflow: "auto",
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>
                <Skeleton width={120} height={20} />
              </TableCell>
              <TableCell align="center">
                <Skeleton width={80} height={20} />
              </TableCell>
              <TableCell align="center">
                <Skeleton width={60} height={20} />
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(5)].map((_, idx) => (
              <UnassignedReservationRowSkeleton key={idx} />
            ))}
          </TableBody>
        </Table>
      </Box>
    </Paper>
  );
};

const UnassignedReservations: React.FC = () => {
  const { currentTimeZone } = useAuth();
  const {
    reservations: reservationsList,
    handleReservationMove: onReservationMove,
    onUnassign,
    dateColumns,
    isLoading,
  } = useTapeChartContext();

  const [sortedReservations, setSortedReservations] = useState<
    IReservationResponse[]
  >([]);

  const [sortKey, setSortKey] = useState<SortKey>("guest");
  const [isUnassigning, setIsUnassigning] = useState<boolean>(false);
  const [blockedStatus, setBlockedStatus] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const reservations = useMemo(() => {
    if (!dateColumns?.length) return [];

    const startDate = moment.tz(dateColumns[0], currentTimeZone).startOf("day");
    const endDate = moment
      .tz(dateColumns[dateColumns.length - 1], currentTimeZone)
      .endOf("day");

    return (reservationsList ?? []).filter((r) => {
      const arrivalDate = moment.tz(r.start_date, currentTimeZone);
      return (
        r?.current_room_info === null &&
        r?.planned_room === null &&
        arrivalDate.isBetween(startDate, endDate, undefined, "[]")
      );
    });
  }, [reservationsList, dateColumns, currentTimeZone]);

  useEffect(() => {
    const sorted = [...reservations].sort((a, b) => {
      let aVal: string | number = "";
      let bVal: string | number = "";

      switch (sortKey) {
        case "guest":
          aVal =
            `${a.reservation_first_guest_info.first_name} ${a.reservation_first_guest_info.last_name}`.toLowerCase();
          bVal =
            `${b.reservation_first_guest_info.first_name} ${b.reservation_first_guest_info.last_name}`.toLowerCase();
          break;
        case "type":
          aVal = a.room_type?.type?.toLowerCase() ?? "";
          bVal = b.room_type?.type?.toLowerCase() ?? "";
          break;
        case "nights":
          aVal = calculateTotalNights(
            new Date(a.start_date),
            new Date(a.end_date)
          );
          bVal = calculateTotalNights(
            new Date(b.start_date),
            new Date(b.end_date)
          );
          break;
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    setSortedReservations(sorted);
  }, [reservations, sortKey, sortDirection]);

  const handleDrop = useCallback(
    (item: { id: string }) => {
      (async () => {
        const reservation = reservationsList?.find(
          (res) => res.id === Number(item.id)
        );

        if (!reservation) return;

        setIsUnassigning(true);
        try {
          await onUnassign(Number(item.id));
        } finally {
          setIsUnassigning(false);
        }
      })();
    },
    [reservationsList, onUnassign]
  );

  const [{ isOver, canDrop }, drop] = useDrop<
    { id: string },
    void,
    { isOver: boolean; canDrop: boolean; draggedItem: { id: string } | null }
  >(
    () => ({
      accept: "reservation",
      drop: handleDrop,
      canDrop: (item) => {
        const reservation = reservationsList?.find(
          (res) => res.id === Number(item.id)
        );
        if (!reservation) return false;

        const allowedStatuses = [
          ReservationStatusEnum.ARRIVING,
          ReservationStatusEnum.RESERVED,
        ];

        const isAllowed = allowedStatuses.includes(reservation.status);

        if (!isAllowed) {
          setBlockedStatus(reservation.status);
        } else {
          setBlockedStatus(null);
        }

        return isAllowed;
      },

      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
        draggedItem: monitor.getItem(),
      }),
    }),
    [reservationsList, onReservationMove, onUnassign]
  );

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const calculateTotalNights = (
    checkIn: Date | null,
    checkOut: Date | null
  ): number => {
    if (!checkIn || !checkOut) return 0;
    const checkInMoment = moment(checkIn);
    const checkOutMoment = moment(checkOut);
    const diffDays = checkOutMoment.diff(checkInMoment, "days");
    return diffDays > 1 ? diffDays : 1;
  };

  const reservationGroups = useMemo(() => {
    const groups: Record<string, IReservationResponse[]> = {};

    sortedReservations.forEach((res) => {
      const date = moment(res.start_date).format(appConfig.dateApiFormat);
      if (!groups[date]) groups[date] = [];
      groups[date].push(res);
    });

    return groups;
  }, [sortedReservations]);

  if (isLoading) {
    return <UnassignedReservationsSkeleton />;
  }

  return (
    <Paper>
      <Typography variant="h6" sx={{ borderBottom: 1, borderColor: "divider" }}>
        Unassigned Reservations
      </Typography>
      <Box
        ref={drop as unknown as React.Ref<HTMLDivElement>}
        sx={{
          p: 2,
          minHeight: 100,
          maxHeight: "calc(100vh - 160px)",
          height: "100vh",
          bgcolor: isOver ? "action.hover" : "inherit",
          outline: isOver
            ? canDrop
              ? "2px dashed green"
              : "2px dashed red"
            : "none",
          transition: "background-color 0.2s ease",
          overflow: "auto",
          position: "relative",
        }}
      >
        {(isOver || isUnassigning) && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              bgcolor: "rgba(255,255,255,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              zIndex: 10,
            }}
          >
            <Typography
              variant="body2"
              color={canDrop || isUnassigning ? "primary" : "error"}
              sx={{ fontWeight: "bold" }}
            >
              {isUnassigning
                ? "Processing..."
                : canDrop
                  ? "Drop here"
                  : blockedStatus
                    ? `You can’t unassign this reservation because it is in ${blockedStatus} mode`
                    : "You can’t unassign this reservation"}
            </Typography>
          </Box>
        )}

        {reservations.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "center", py: 4 }}
          >
            No unassigned reservations
          </Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>
                  <TableSortLabel
                    active={sortKey === "guest"}
                    direction={sortDirection}
                    onClick={() => handleSort("guest")}
                  >
                    Guest
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center">
                  <TableSortLabel
                    active={sortKey === "type"}
                    direction={sortDirection}
                    onClick={() => handleSort("type")}
                  >
                    Type
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center">
                  <TableSortLabel
                    active={sortKey === "nights"}
                    direction={sortDirection}
                    onClick={() => handleSort("nights")}
                  >
                    Nights
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(reservationGroups)
                .sort(([dateA], [dateB]) =>
                  moment(dateA, appConfig.dateApiFormat).diff(
                    moment(dateB, appConfig.dateApiFormat)
                  )
                )
                .map(([date, items]) => (
                  <React.Fragment key={date}>
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        sx={{ bgcolor: "grey.300", fontWeight: "bold" }}
                      >
                        Arrival Date:{" "}
                        {moment(date).format("dddd, DD MMM, YYYY")}
                      </TableCell>
                    </TableRow>
                    {items.map((reservation) => (
                      <UnassignedReservationRow
                        key={reservation.id}
                        reservation={reservation}
                      />
                    ))}
                  </React.Fragment>
                ))}
            </TableBody>
          </Table>
        )}
      </Box>
    </Paper>
  );
};

export default UnassignedReservations;
