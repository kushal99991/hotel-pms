import React, { useState } from "react";
import {
  Box,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  styled,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import InfoIcon from "@mui/icons-material/Info";
import { IReservationResponse } from "types/reservationTypes";

import { statusColors } from "components/widgets/RoomStatusCode/RoomStatusCode";
import SegmentChannelModal from "./ReservationDetail/components/SegmentChannelModal";

import {
  getReadableMarketOption,
  getReadableBookingChannel,
} from "utils/helperFunctions/data";
import RoomUnassign from "./ReservationDetail/RoomUnassign";
import { getCurrentRoom, isReservationPreCheckin } from "utils/reservations";
import { IRoomStatus } from "constants/room";
import { ReservationStatusEnum } from "constants/reservation";

interface RoomInfoProps {
  details: IReservationResponse | null;
  onEditClick: () => void;
  onRefresh?: () => void;
}

const RoomInfo: React.FC<RoomInfoProps> = ({
  details,
  onEditClick,
  onRefresh,
}) => {
  const theme = useTheme();
  const [openSegmentModal, setOpenSegmentModal] = useState<boolean>(false);
  function getRoomTypeString(roomAssigned: boolean) {
    if (roomAssigned && details?.room_type) {
      return `${details?.room_type.name} (${details?.room_type.type})`;
    }
    return "";
  }

  function handleOnClose(refresh: boolean) {
    setOpenSegmentModal(false);
    if (refresh) {
      onRefresh?.();
    }
  }

  function handleEditSegment() {
    setOpenSegmentModal(true);
  }
  const room = getCurrentRoom(details);
  const roomAssigned = !!room?.room_number;
  const roomTypeString = getRoomTypeString(roomAssigned);
  const greyOutColor = theme.palette.text.disabled;
  const showMoreInfo =
    isReservationPreCheckin(details) &&
    room?.frontdesk_status === IRoomStatus.OCC;
  const shouldShowHK = details
    ? new Set<ReservationStatusEnum>([
        ReservationStatusEnum.RESERVED,
        ReservationStatusEnum.ARRIVING,
        ReservationStatusEnum.NO_SHOW,
        ReservationStatusEnum.IN_HOUSE,
        ReservationStatusEnum.DEPARTING,
      ]).has(details.status)
    : false;
  return (
    <Grid container sx={{ marginBottom: "-24px" }}>
      <Grid
        item
        xs={12}
        md={6}
        sm={12}
        display="flex"
        flexDirection="column"
        padding={2}
      >
        <Table aria-label="room list table">
          <TableHead>
            <TableRow>
              {roomAssigned && (
                <>
                  <StyledTableHeader>Room No.</StyledTableHeader>
                  <StyledTableHeader>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      Room Type
                      <StyledAssignButton onClick={onEditClick}>
                        Reassign
                      </StyledAssignButton>
                      <RoomUnassign details={details} onRefresh={onRefresh} />
                    </Box>
                  </StyledTableHeader>
                </>
              )}
              {!roomAssigned && (
                <>
                  <StyledTableHeader>No room assigned</StyledTableHeader>
                  <StyledTableHeader sx={{ textAlign: "right" }}>
                    <StyledAssignButton onClick={onEditClick}>
                      Assign
                    </StyledAssignButton>
                  </StyledTableHeader>
                </>
              )}
            </TableRow>
          </TableHead>
          {roomAssigned && (
            <TableBody>
              <TableRow>
                <StyledTableCell>
                  <Box display="flex" alignItems="center">
                    <Box mr={2}>{room?.room_number}</Box>
                    {shouldShowHK && room?.housekeeping_status && (
                      <Tooltip
                        title={
                          statusColors[room?.housekeeping_status as IRoomStatus]
                            ?.label || (room?.housekeeping_status as string)
                        }
                      >
                        <Typography
                          sx={{ fontWeight: "bold", ml: 1 }}
                          style={{
                            color: showMoreInfo
                              ? greyOutColor
                              : statusColors[
                                  room?.housekeeping_status as IRoomStatus
                                ]?.color || "black",
                          }}
                        >
                          {room?.housekeeping_status}
                        </Typography>
                      </Tooltip>
                    )}
                    {showMoreInfo && (
                      <Tooltip title="This room will be avaiable for the dates of this reservaton but is currently occupied by another reservation">
                        <InfoIcon
                          sx={{
                            fontSize: "1rem",
                            ml: 0.5,
                            color: theme.palette.text.disabled,
                          }}
                        />
                      </Tooltip>
                    )}
                  </Box>
                </StyledTableCell>
                <StyledTableCell>{roomTypeString}</StyledTableCell>
              </TableRow>
            </TableBody>
          )}
        </Table>
      </Grid>
      <Grid
        item
        xs={12}
        md={6}
        sm={12}
        display="flex"
        flexDirection="column"
        padding={2}
        sx={{
          borderLeft: "1px solid #D6D6D6",
        }}
      >
        <Box display="flex" flexDirection="row" alignItems="center">
          <Box display="inline-flex">
            <Typography variant="body1" fontWeight="bold">
              Market Segment:
            </Typography>
            <Typography ml={1}>
              {getReadableMarketOption(details?.market_segment)}
            </Typography>
          </Box>
          <StyledEditButton onClick={handleEditSegment}>Edit</StyledEditButton>
        </Box>
        <Box display="inline-flex">
          <Typography variant="body1" fontWeight="bold">
            Booking Channel:
          </Typography>
          <Typography ml={1}>
            {getReadableBookingChannel(details?.booking_channel)}
          </Typography>
        </Box>
      </Grid>
      <SegmentChannelModal
        open={openSegmentModal}
        onCloseModal={handleOnClose}
        reservation={details}
      />
    </Grid>
  );
};

export default RoomInfo;

const StyledAssignButton = styled(Button)({
  textTransform: "none",
  textDecoration: "underline",
  color: "#32A1AE",
});

const StyledEditButton = styled(Button)({
  textTransform: "none",
  textDecoration: "underline",
  color: "#32A1AE",
  marginLeft: "auto",
});

const StyledTableHeader = styled(TableCell)({
  paddingTop: 0,
  fontSize: "1rem",
  fontWeight: 700,
  borderBottom: "none",
  paddingBottom: 0,
});

const StyledTableCell = styled(TableCell)({
  paddingTop: 0,
  borderBottom: "none",
});
