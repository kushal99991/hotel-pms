import React, { useMemo } from "react";
import { Box, IconButton, Tooltip, Typography, styled } from "@mui/material";
import { IReservationResponse } from "types/reservationTypes";
// import { useDrag } from "react-dnd";
import {
  reservationStatusDisplayValues,
  ReservationStatusEnum,
} from "constants/reservation";
import moment from "moment";
import { useDrag } from "react-dnd";
import { getCurrentRoom } from "utils/reservations";
import { statusChips } from "./AssignmentOverview";

interface ReservationContainerProps {
  isDragging: boolean;
  isStartDate?: boolean;
  isEndDate?: boolean;
  bgcolor: string;
  fullLength?: boolean;
  roomStatus?: string;
  isOverflowRight?: boolean;
}

interface DisplayTextProps {
  overflow: string;
  textOverflow: string;
  color: string;
}

interface ReservationBlockProps {
  reservation: IReservationResponse;
  onClick: () => void;
  onNextDay?: () => void;
  isStartDate?: boolean;
  isEndDate?: boolean;
  isShowName?: boolean;
  fullLength?: boolean;
  isOverflowRight?: boolean;
  isReservationEndsOnStartDateColumn?: boolean;
}

const ReservationBlock: React.FC<ReservationBlockProps> = ({
  reservation,
  onClick,
  onNextDay,
  isStartDate,
  isEndDate,
  isShowName,
  fullLength = false,
  isOverflowRight,
  isReservationEndsOnStartDateColumn,
}) => {
  const isDraggable = useMemo(() => {
    return ![
      ReservationStatusEnum.COMPLETED,
      ReservationStatusEnum.CANCELED,
      ReservationStatusEnum.DEPARTED,
    ].includes(reservation?.status);
  }, [reservation?.status]);

  const { first_name, last_name } = reservation.reservation_first_guest_info;
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: "reservation",
      item: reservation,
      canDrag: isDraggable,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [reservation]
  );

  const rawStatus = reservation.status;
  const roomInfo = getCurrentRoom(reservation);

  const displayInfo = useMemo(() => {
    const frontdesk_status = roomInfo?.frontdesk_status;
    const isBlocked = ["OOO", "OOS", "OM"].includes(frontdesk_status ?? "");
    if (isBlocked && frontdesk_status) {
      return statusChips[frontdesk_status];
    }
    return reservationStatusDisplayValues[rawStatus];
  }, [rawStatus, roomInfo]);

  const reservationContent = () => (
    <ReservationContainer
      ref={drag as unknown as React.Ref<HTMLDivElement>}
      onClick={onClick}
      isDragging={isDragging}
      isStartDate={isStartDate}
      isEndDate={isEndDate}
      bgcolor={displayInfo?.color ?? "#2196F3"}
      fullLength={fullLength}
      roomStatus={roomInfo?.frontdesk_status}
      isOverflowRight={isOverflowRight}
      style={{ cursor: isDraggable ? "pointer" : "not-allowed" }}
    >
      <Box
        display="flex"
        alignItems="center"
        textAlign={"center"}
        width={"auto"}
      >
        {isStartDate && (
          <DisplayText
            overflow="visible"
            textOverflow="unset"
            color={displayInfo?.contrastColor ?? "#fff"}
          >
            {moment(reservation.start_date).format("MM/DD")}
          </DisplayText>
        )}

        {isShowName && (
          <DisplayText
            overflow="hidden"
            textOverflow="ellipsis"
            color={displayInfo?.contrastColor ?? "#fff"}
          >
            {first_name} {last_name}
          </DisplayText>
        )}

        {isEndDate && !isReservationEndsOnStartDateColumn && (
          <DisplayText
            overflow="visible"
            textOverflow="unset"
            color={displayInfo?.contrastColor ?? "#fff"}
          >
            {moment(reservation.end_date).format("MM/DD")}
          </DisplayText>
        )}

        {isOverflowRight && (
          <Tooltip
            title={`${first_name} ${last_name} — ${moment(reservation.start_date).format("MMM DD")} to ${moment(reservation.end_date).format("MMM DD")}`}
            arrow
          >
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onNextDay?.();
              }}
            >
              <Typography
                fontSize="12px"
                fontStyle="normal"
                color={displayInfo?.contrastColor ?? "#fff"}
                fontWeight="700"
              >
                Ongoing Stay →
              </Typography>
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </ReservationContainer>
  );

  return (
    <>
      {!isOverflowRight ? (
        <Tooltip
          title={
            isDraggable
              ? isReservationEndsOnStartDateColumn
                ? `${first_name} ${last_name} — ${moment(reservation.start_date).format("MMM DD")} to ${moment(reservation.end_date).format("MMM DD")}`
                : `${first_name} ${last_name}`
              : `Reservation can\`t be modified (Status: ${reservation.status.replace(/_/g, " ")})`
          }
        >
          {reservationContent()}
        </Tooltip>
      ) : (
        reservationContent()
      )}
    </>
  );
};

export default ReservationBlock;

const DisplayText = styled(Typography)<DisplayTextProps>(
  ({ overflow, textOverflow, color }) => ({
    fontSize: "12px",
    color,
    fontWeight: "bold",
    whiteSpace: "nowrap",
    overflow,
    textOverflow,
    display: "inline-block",
    width: "100%",
    maxWidth: "60px",
  })
);

const ReservationContainer = styled(Box)<ReservationContainerProps>(({
  isDragging,
  isStartDate,
  isEndDate,
  bgcolor,
  fullLength,
  roomStatus,
}) => {
  const isBlocked = ["OOO", "OOS", "OM"].includes(roomStatus ?? "");

  return {
    backgroundColor: isBlocked
      ? "transparent"
      : isDragging
        ? "rgba(33, 150, 243, 0.6)"
        : bgcolor,
    backgroundImage: isBlocked
      ? "repeating-linear-gradient(130deg, #e0e0e0, #e0e0e0 5px, #c0c0c0 0px, #c0c0c0 9px)"
      : "none",
    color: "#fff",
    padding: isEndDate ? "4px 0px 8px" : "4px 15px 8px",
    marginLeft: fullLength ? 0 : isStartDate ? 0 : "-4px",
    cursor: "pointer",
    fontSize: "0.75rem",
    whiteSpace: "nowrap",
    height: "30px",
    opacity: isDragging ? 0.8 : 1,
    border: isDragging ? "2px dashed #2196f3" : "none",
    boxShadow: isDragging ? "0 0 10px rgba(33, 150, 243, 0.5)" : "none",
    clipPath: isDragging
      ? "none"
      : fullLength
        ? "none"
        : isStartDate
          ? "polygon(0% 100%, 50% 0%, 100% 0%, 100% 100%)"
          : isEndDate
            ? "polygon(0 100%, 0% 0%, 100% 0%, 50% 100%)"
            : undefined,
    width: !fullLength && (isStartDate || isEndDate) ? "50%" : "100%",
    transition: "all 0.2s ease-in-out",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius:
      fullLength && isStartDate
        ? "10px 0 0 10px"
        : fullLength && isEndDate
          ? "0 10px 10px 0"
          : 0,
  };
});

// const ReservationBox = styled(Box)<{
//   isOverflowRight?: boolean;
//   color?: string;
// }>(({ color }) => ({
//   position: "relative",
//   backgroundColor: "#A5E21F",
//   color,
//   overflow: "hidden",
// }));
