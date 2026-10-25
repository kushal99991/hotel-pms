import React, { useMemo, useState } from "react";
import { Box, styled, TableCell, Tooltip, useTheme } from "@mui/material";
import moment from "moment";
import BlockIcon from "@mui/icons-material/Block";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import { IReservationResponse, Room } from "types/reservationTypes";
import ReservationBlock from "./ReservationBlock";
import { useDrop } from "react-dnd";
import ChangeRoomTypeModal from "./ChangeRoomTypeModal";
import { getCurrentRoom } from "utils/reservations";
import { useTapeChartContext } from "contexts/TapeChartContext";
import ConfirmationDialog from "components/elements/ConfirmationDialog/ConfirmationDialog";
import LockRoomModal from "./LockRoomModal";
import { useDeleteRoomBlockMutation } from "services/roomSlice";
import useAuth from "hooks/useAuth";
import { ICreateRoomBlockRequest } from "types/houseKeeperTypes";
import { appConfig } from "config/app.config";
import useSnackbar from "hooks/useSnackbar";

interface OccupancyRowProps {
  room: Room;
  reservations: IReservationResponse[];
  dateColumns: string[];
  onSelectReservation: (reservation: IReservationResponse) => void;
}

const OccupancyRow: React.FC<OccupancyRowProps> = ({
  room,
  reservations,
  dateColumns,
  onSelectReservation,
}) => {
  const {
    roomBlocksList,
    onNextDay,
    handleReservationMove: onReservationMove,
    roomTypeList,
    onLoadingData,
  } = useTapeChartContext();

  const theme = useTheme();
  const { users, timezoneCurrentDate } = useAuth();
  const { openSnackbar } = useSnackbar();
  const [typeChangeOpen, setTypeChangeOpen] = useState(false);
  const [reservationDetail, setReservationDetail] =
    useState<IReservationResponse | null>(null);
  // const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [lockModalOpen, setLockModalOpen] = useState(false);
  const [lockRoomDate, setLockRoomDate] = useState<string | null>(null);

  const [unlockConfirmOpen, setUnlockConfirmOpen] = useState(false);
  const [unlockRoomDate, setUnlockRoomDate] = useState<string | null>(null);

  const [deleteRoomBlock] = useDeleteRoomBlockMutation();

  const handleTypeModalClose = (status?: boolean) => {
    setTypeChangeOpen(false);
    setReservationDetail(null);
    if (status && reservationDetail) {
      onReservationMove(reservationDetail.id?.toString(), room.number);
    }
  };

  const isRoomBlockedForDate = (roomNumber: number, date: string) =>
    roomBlocksList.some(
      (block) =>
        block.room_id === roomNumber &&
        moment(block.date).startOf("day").isSame(moment(date).startOf("day"))
    );

  const isRoomBlockedForReservationRange = (
    roomNumber: number,
    startDate: string,
    endDate: string
  ) => {
    const currentDate = moment(startDate).startOf("day");
    const end = moment(endDate).subtract(1, "days").startOf("day");

    while (currentDate.isSameOrBefore(end)) {
      const checkWithBlock = isRoomBlockedForDate(
        roomNumber,
        currentDate.format("YYYY-MM-DD")
      );
      if (checkWithBlock) {
        const blockRoomInfo = roomBlocksList.find(
          (block) =>
            block.room_id === roomNumber &&
            moment(block.date)
              .startOf("day")
              .isSame(moment(currentDate.format("YYYY-MM-DD")).startOf("day"))
        );
        return (
          blockRoomInfo?.status === "OOO" || blockRoomInfo?.status === "OM"
        );
      }
      currentDate.add(1, "days");
    }
    return false;
  };

  const handleDropReservation = (item: IReservationResponse | null) => {
    if (item) {
      const blocked = isRoomBlockedForReservationRange(
        room?.id ?? 0,
        item.start_date,
        item.end_date
      );

      if (!blocked) {
        const reservationRoomTypeId = item?.room_type?.id;
        const selectedRoomTypeId = room.room_type?.id;

        if (reservationRoomTypeId === selectedRoomTypeId) {
          onReservationMove(item.id?.toString(), room.number);
        } else {
          setReservationDetail(item);
          setTypeChangeOpen(true);
        }
      } else {
        console.warn("Room is blocked for the selected reservation period.");
      }
    }
  };

  const [{ isOver, item: draggingItem }, drop] = useDrop<
    IReservationResponse,
    void,
    { isOver: boolean; item: IReservationResponse | null }
  >(
    () => ({
      accept: "reservation",
      drop: handleDropReservation,
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        item: monitor.getItem(),
      }),
    }),
    [room.number, handleDropReservation]
  );

  const getReservationForDate = (date: string) =>
    reservations.filter((res) => {
      const checkIn = moment(res.start_date);
      const checkOut = moment(res.end_date);
      const current = moment(date);
      const isBetween =
        current.isSameOrAfter(checkIn, "days") &&
        current.isSameOrBefore(checkOut, "days");
      return isBetween && res.room_type.id === room.room_type?.id;
    });

  const isConflicting = useMemo(() => {
    if (!draggingItem) return false;

    const dragStart = moment(draggingItem.start_date);
    const dragEnd = moment(draggingItem.end_date);

    return reservations.some(
      (res) =>
        res.id !== draggingItem.id &&
        moment(res.end_date).isAfter(dragStart) &&
        moment(res.start_date).isBefore(dragEnd)
    );
  }, [draggingItem, reservations]);

  const isOverItem = useMemo(() => {
    if (isConflicting) return false;
    return draggingItem?.room_type?.id === room.room_type?.id;
  }, [draggingItem, room, isConflicting]);

  const assignRoom = getCurrentRoom(draggingItem)?.room_number;

  const hoverMessage = useMemo(() => {
    if (!(isOver && draggingItem)) return null;
    const blocked = isRoomBlockedForReservationRange(
      room?.id ?? 0,
      draggingItem.start_date,
      draggingItem.end_date
    );
    if (blocked) {
      return "Room is blocked for the selected reservation period.";
    }

    if (isConflicting) {
      return `Conflict: Room ${room.number} already has a reservation in this date range`;
    }

    if (!assignRoom) {
      return `Assign to room ${room.number} (${room.room_type?.type})`;
    }

    return isOverItem
      ? `Change room number (${draggingItem?.room_type.type})`
      : `Change room type (${draggingItem?.room_type.type} → ${room.room_type?.type})`;
  }, [
    isOver,
    draggingItem,
    isConflicting,
    assignRoom,
    isOverItem,
    room.number,
    room.room_type?.type,
  ]);

  const handleBlockRoom = (roomId: number, date: string) => {
    setLockRoomDate(date);
    setLockModalOpen(true);
  };

  const handleUnblockRoom = (roomId: number, date: string) => {
    setUnlockRoomDate(date);
    setUnlockConfirmOpen(true);
  };

  const handleUnlockConfirm = async () => {
    const payload: ICreateRoomBlockRequest = {
      start_date: unlockRoomDate
        ? moment(unlockRoomDate).format(appConfig.dateApiFormat)
        : "",
      end_date: unlockRoomDate
        ? moment(unlockRoomDate).format(appConfig.dateApiFormat)
        : "",
      property_id: users?.defaultPropertyId ?? 0,
      room_id: room?.id?.toString() ?? "",
    };
    const response = await deleteRoomBlock(payload);
    if (response?.error) {
      openSnackbar(response.error as string, "error");
      return false;
    }
    openSnackbar("Room has been successfully unlocked.", "success");
    onLoadingData();
    setUnlockConfirmOpen(false);
    setUnlockRoomDate(null);
  };

  const handleCancelUnlock = () => {
    setUnlockConfirmOpen(false);
    setUnlockRoomDate(null);
  };

  const getBlockColor = (status?: string) => {
    switch (status) {
      case "OOO":
        return "#FFA500";
      case "OOS":
        return "#FF0000";
      case "OM":
        return "#000000";
      default:
        return "#c0bbbb";
    }
  };

  return (
    <>
      <Box
        ref={drop as unknown as React.Ref<HTMLDivElement>}
        sx={{
          display: "flex",
          width: "100%",
        }}
      >
        {dateColumns.map((date, index) => {
          const reservationsForDate = getReservationForDate(date).sort((a, b) =>
            moment(a.start_date).diff(moment(b.start_date))
          );
          const isPastDate = moment(date).isBefore(
            moment(timezoneCurrentDate),
            "day"
          );

          const startReservationDetail =
            reservationsForDate.length === 1 ? reservationsForDate[0] : null;

          const is_start_date = startReservationDetail?.start_date
            ? moment(startReservationDetail.start_date).isSame(date, "day")
            : false;

          const is_end_date = startReservationDetail?.end_date
            ? moment(startReservationDetail.end_date).isSame(date, "day")
            : false;
          const isDragging = index === 0;

          const blocked = isRoomBlockedForDate(room?.id ?? 0, date);
          const blockRooms = roomBlocksList.find(
            (a) => a.room_id === room?.id && moment(date).isSame(moment(a.date))
          );

          return (
            <TableCell
              key={date}
              // onMouseEnter={() => setHoveredDate(date)}
              // onMouseLeave={() => setHoveredDate(null)}
              sx={{
                padding: 0,
                borderRight: "1px solid #e0e0e0",
                borderTop: "1px solid #e0e0e0",
                verticalAlign: "top",
                minWidth: 100,
                position: "relative",
                backgroundColor: blocked
                  ? getBlockColor(blockRooms?.status)
                  : isPastDate
                    ? "#f6f6f6"
                    : "#fff",
                opacity: isPastDate ? 0.6 : 1,
                pointerEvents: "auto",
                cursor: isPastDate ? "not-allowed" : "pointer",
                height: 45,
              }}
            >
              <RowWrapper>
                <RowContainer
                  isOver={isOver}
                  isOverItem={isOverItem}
                  theme={theme}
                >
                  <ReservationContainer
                    isStart={is_start_date}
                    isEnd={is_end_date}
                  >
                    {reservationsForDate.map((res) => {
                      // Same reservation rendering logic
                      const isStartDate = moment(res.start_date).isSame(
                        date,
                        "day"
                      );
                      const isEndDate = moment(res.end_date).isSame(
                        date,
                        "day"
                      );
                      const reservationStart = moment(res.start_date);
                      const reservationEnd = moment(res.end_date);
                      const totalDays = reservationEnd.diff(
                        reservationStart,
                        "days"
                      );

                      // Skip name display if reservation is 3 nights or less
                      if (totalDays <= 3) {
                        return (
                          <ReservationBlock
                            key={res.id + date}
                            reservation={res}
                            isStartDate={isStartDate}
                            isEndDate={isEndDate}
                            fullLength={true}
                            isShowName={false}
                            isOverflowRight={false}
                            isReservationEndsOnStartDateColumn={false}
                            onNextDay={onNextDay}
                            onClick={() => onSelectReservation(res)}
                          />
                        );
                      }

                      // Determine visible reservation range (clamped to dateColumns)
                      const chartStart = moment(dateColumns[0]);
                      const chartEnd = moment(
                        dateColumns[dateColumns.length - 1]
                      );

                      const visibleStart = moment.max(
                        reservationStart,
                        chartStart
                      );
                      const visibleEnd = moment.min(reservationEnd, chartEnd);
                      const visibleSpan = visibleEnd.diff(visibleStart, "days");

                      const visibleMiddle = moment(visibleStart).add(
                        Math.floor(visibleSpan / 2),
                        "days"
                      );
                      const vDays = reservationEnd.diff(chartStart, "days");

                      const isShowName =
                        vDays > 0
                          ? moment(date).isSame(visibleMiddle, "day")
                          : false;

                      return (
                        <ReservationBlock
                          key={res.id + date}
                          reservation={res}
                          isStartDate={isStartDate}
                          isEndDate={isEndDate}
                          fullLength={true}
                          isShowName={isShowName}
                          isOverflowRight={false}
                          isReservationEndsOnStartDateColumn={false}
                          onNextDay={onNextDay}
                          onClick={() => onSelectReservation(res)}
                        />
                      );
                    })}
                  </ReservationContainer>
                </RowContainer>
                {blocked ? (
                  <Tooltip
                    title={
                      `${blockRooms?.status}-${blockRooms?.reason}` || "Blocked"
                    }
                    placement="top"
                  >
                    <HoverIconWrapper
                      onClick={() =>
                        !isPastDate && handleUnblockRoom(room?.id ?? 0, date)
                      }
                      isBlocked={blocked}
                      blockColor={getBlockColor(blockRooms?.status)}
                      sx={{
                        pointerEvents: isPastDate ? "none" : "auto",
                        opacity: isPastDate ? 0.4 : 1,
                      }}
                    >
                      <BlockIcon fontSize="small" sx={{ color: "#fff" }} />
                    </HoverIconWrapper>
                  </Tooltip>
                ) : (
                  <HoverIconWrapper
                    className="hover-icon"
                    onClick={() =>
                      !isPastDate && handleBlockRoom(room?.id ?? 0, date)
                    }
                    sx={{
                      pointerEvents: isPastDate ? "none" : "auto",
                      opacity: isPastDate ? 0.4 : 1,
                    }}
                  >
                    <LockOpenIcon fontSize="small" color="primary" />
                  </HoverIconWrapper>
                )}
                {isOver && isDragging && (
                  <HoverMessageBox isOverItem={isOverItem}>
                    {hoverMessage}
                  </HoverMessageBox>
                )}
              </RowWrapper>
            </TableCell>
          );
        })}
      </Box>

      {reservationDetail && (
        <ChangeRoomTypeModal
          onCloseModal={handleTypeModalClose}
          open={typeChangeOpen}
          reservation={reservationDetail}
          roomTypes={roomTypeList}
          selectedRoomTypeId={room.room_type?.id ?? null}
        />
      )}
      <ConfirmationDialog
        open={unlockConfirmOpen}
        title="Confirm Unlock"
        description="Are you sure you want to unlock this room?"
        buttons={[
          { label: "No", onClick: handleCancelUnlock },
          { label: "Unlock", onClick: handleUnlockConfirm },
        ]}
        onClose={handleCancelUnlock}
      />
      <LockRoomModal
        open={lockModalOpen}
        date={lockRoomDate}
        room={room}
        onClose={() => setLockModalOpen(false)}
      />
    </>
  );
};

export default OccupancyRow;

const RowWrapper = styled(Box)({
  position: "relative",
  width: "100%",
  height: "100%",
  pointerEvents: "auto",
  "&:hover .hover-icon": {
    display: "flex",
  },
});

const RowContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== "isOver" && prop !== "isOverItem",
})<{ isOverItem: boolean; isOver: boolean }>(
  ({ isOverItem, isOver, theme }) => ({
    display: "flex",
    alignItems: "flex-start",
    width: "100%",
    minHeight: 40,
    outline: isOverItem
      ? `2px dashed ${theme.palette.info.main}`
      : isOver
        ? `2px dashed ${theme.palette.error.main}`
        : "none",
  })
);

const ReservationContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== "isStart" && prop !== "isEnd",
})<{
  isStart: boolean;
  isEnd: boolean;
}>(({ isStart, isEnd }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: isStart ? "flex-end" : isEnd ? "flex-start" : "center",
  width: "100%",
}));

const HoverMessageBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== "blockColor" && prop !== "isBlocked",
})<{ isOverItem: boolean }>(({ theme, isOverItem }) => ({
  position: "absolute",
  top: -28,
  left: "50%",
  transform: "translateX(-50%)",
  backgroundColor: isOverItem
    ? theme.palette.success.main
    : theme.palette.error.main,
  color: "white",
  padding: "4px 12px",
  borderRadius: 8,
  fontSize: 12,
  boxShadow: theme.shadows[1],
  zIndex: 10,
  whiteSpace: "nowrap",
}));

const HoverIconWrapper = styled(Box, {
  shouldForwardProp: (prop) => prop !== "blockColor" && prop !== "isBlocked",
})<{
  isBlocked?: boolean;
  blockColor?: string;
}>(({ theme, isBlocked, blockColor }) => ({
  display: isBlocked ? "flex" : "none", // Hidden by default
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  cursor: "pointer",
  backgroundColor: blockColor ?? theme.palette.background.paper,
  borderRadius: "50%",
  padding: 2,
  boxShadow: theme.shadows[2],
  zIndex: 2,
  alignItems: "center",
  justifyContent: "center",
  "&:hover": {
    backgroundColor: theme.palette.grey[300],
  },
}));
