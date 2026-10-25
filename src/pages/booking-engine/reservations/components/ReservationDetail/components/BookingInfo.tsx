import React from "react";
import { Box, Typography, Grid, useTheme } from "@mui/material";
// import useTheme from "@mui/material/styles/useTheme";
import { Link } from "react-router-dom";
import Label from "components/elements/Label/Label";
import { IReservationResponse } from "types/reservationTypes";
import {
  getReadableMarketOption,
  getReadableBookingChannel,
} from "utils/helperFunctions/data";

interface BookingInfoProps {
  reservation: IReservationResponse | null;
}

const BookingInfo: React.FC<BookingInfoProps> = ({ reservation }) => {
  const theme = useTheme();
  const groupReservations = reservation?.group?.reservations ?? [];
  const otherReservations = groupReservations.filter(
    (res) => res.id !== (reservation?.id ?? -1)
  );
  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Label>Confirmation:</Label>
        <Typography>#{reservation?.confirmation_id ?? ""}</Typography>
      </Box>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Label>Folio No.:</Label>
        <Typography>#{reservation?.id ?? ""}</Typography>
      </Box>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Label>Source:</Label>
        <Typography>
          {getReadableBookingChannel(reservation?.booking_channel)}
        </Typography>
      </Box>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Label>Segment:</Label>
        <Typography>
          {getReadableMarketOption(reservation?.market_segment)}
        </Typography>
      </Box>
      <Box mt={2}>
        <Label>Grouped with Reservations:</Label>
        <Box>
          {otherReservations.length === 0 && "None"}
          {otherReservations.length > 0 && (
            <Grid container>
              {otherReservations.map((r) => (
                <Grid item px={1} key={r.id}>
                  <Link
                    to={`/booking-engine/reservations/${r.id}`}
                    style={{
                      color: theme.palette.secondary.main,
                      textDecoration: "underline",
                      fontFamily: theme.typography.fontFamily,
                    }}
                  >
                    {r.confirmation_id}
                  </Link>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default BookingInfo;
