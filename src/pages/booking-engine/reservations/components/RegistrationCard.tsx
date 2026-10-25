import React, { useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Grid,
  Divider,
  Paper,
  IconButton,
} from "@mui/material";
import { useReactToPrint } from "react-to-print";
import { Print as PrintIcon } from "@mui/icons-material";
import { useGetReservationDetailByIdMutation } from "services/reservationSlice";
import { useParams } from "react-router-dom";
import useAuth from "hooks/useAuth";
import { IProperty } from "types/property";
import { getCurrentRoom } from "utils/reservations";

const HotelCheckinForm: React.FC = () => {
  const { users, properties } = useAuth();

  const propertyID = users?.defaultPropertyId ?? 0;
  const defalutProperty = properties?.find(
    (p: IProperty) => p.id === propertyID
  );

  const params = useParams<{ reservationId: string; propertyId: string }>();

  const [getReservationDetailById, { data: ReservationDetails }] =
    useGetReservationDetailByIdMutation();

  const reservation = ReservationDetails;

  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  useEffect(() => {
    if (params?.propertyId && params?.reservationId) {
      getReservationDetailById({
        id: parseInt(params.reservationId),
        propertyId: Number(params?.propertyId),
      });
    }
  }, [params?.propertyId, params?.reservationId]);

  const renderGridRow = (leftContent: string, rightContent: string) => (
    <>
      <Grid item xs={6}>
        <Typography fontSize={"12px"}>{leftContent}</Typography>
      </Grid>
      <Grid item xs={6}>
        <Typography fontSize={"12px"}>{rightContent}</Typography>
      </Grid>
    </>
  );

  const renderFieldWithLine = (label: string, value?: string | null) => (
    <Box display="flex" alignItems="center" mb={1}>
      <Typography fontSize={"12px"} sx={{ mr: 2, whiteSpace: "nowrap" }}>
        {label}
      </Typography>
      {value ? (
        <Typography
          fontSize={"12px"}
          sx={{ ml: 1, whiteSpace: "nowrap", display: "inline" }}
        >
          {value}
        </Typography>
      ) : (
        <Box flexGrow={1} mt={1} borderBottom="1px solid black" />
      )}
    </Box>
  );

  return (
    <Box>
      <Paper
        elevation={3}
        ref={contentRef}
        sx={{
          padding: 2,
          maxWidth: "210mm",
          margin: "auto",
          fontSize: "12px",
          overflow: "hidden",
          "@media print": {
            pageBreakAfter: "always",
            ".print-icon": {
              display: "none",
            },
          },
        }}
      >
        <Box
          mb={2}
          sx={{
            "@media print": {
              ".print-icon": {
                display: "none",
              },
            },
          }}
        >
          <Box className="print-icon" textAlign={"right"}>
            <IconButton
              onClick={() => reactToPrintFn()}
              color="primary"
              size="large"
              aria-label="Print"
            >
              <PrintIcon />
            </IconButton>
          </Box>
          <Typography textAlign="center" variant="h6" fontWeight="bold">
            {defalutProperty?.name}
          </Typography>
        </Box>

        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Typography fontSize={"14px"} fontWeight="bold">
              {reservation?.reservation_first_guest_info?.first_name +
                " " +
                reservation?.reservation_first_guest_info?.last_name}
            </Typography>
          </Grid>
          {renderGridRow(
            `Reservation ID : ${reservation?.id || ""}`,
            `Phone Number: ${reservation?.reservation_first_guest_info?.phone || ""}`
          )}
          {renderGridRow(
            `Room Number: ${getCurrentRoom(reservation)?.room_number || ""}`,
            `Adult: ${reservation?.guests?.length ?? 0}`
          )}
          {renderGridRow(
            `Arrival: ${reservation?.start_date || ""}`,
            `Child: ${reservation?.children_count ?? 0}`
          )}
          {renderGridRow(
            `Departure: ${reservation?.end_date || ""}`,
            `Vehicle Make / Model: __________`
          )}
          {renderGridRow(
            `Special Req: ${reservation?.special_requests || "_______________"}`,
            `Lic#: _______________ State: ____`
          )}
        </Grid>

        <Typography
          variant="body2"
          align="center"
          sx={{ fontWeight: "bold", mt: 2 }}
        >
          Check-In: 3:00 PM, Check-Out: 11:00 AM
        </Typography>

        <Box mt={2}>
          <Divider />
          <Typography fontSize={"14px"} fontWeight="bold" textAlign={"center"}>
            Notice to Our Guests
          </Typography>
          <Divider />
          <Typography sx={{ mt: 1, fontSize: "12px" }}>
            I understand that an authorization/hold will be placed on my credit
            card for my entire stay (room, tax, plus $50 daily for incidentals)
            and $15 facility fee, at the time of check-in. Safety Deposit boxes
            are available for deposit of valuables. The hotel cannot be
            responsible for the valuables not deposited.
          </Typography>
        </Box>

        <Box mt={2}>
          <Divider />
          <Typography fontSize={"14px"} fontWeight="bold" textAlign={"center"}>
            Pet Policy
          </Typography>
          <Divider />
          <Typography sx={{ mt: 1, fontSize: "12px" }}>
            Pets are not allowed in hotel public areas. All Pets must be leashed
            or crated when leaving the guest room. A maximum of 2 pets are
            allowed in a pet-designated room. Dogs and cats are accepted. A $25
            per day fee (not to exceed $150) will be charged.
          </Typography>
        </Box>

        <Divider sx={{ p: 1 }} />
        <Box mt={2}>
          <Typography fontSize={"12px"}>
            If any of the information above is incorrect, please note here:
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              {renderFieldWithLine("Full Name:")}
            </Grid>
            <Grid item xs={6}>
              {renderFieldWithLine("Address:")}
            </Grid>
            <Grid item xs={6}>
              {renderFieldWithLine("Email Address:")}
            </Grid>
            <Grid item xs={6}>
              {renderFieldWithLine("Phone Number:")}
            </Grid>
          </Grid>
        </Box>

        <Box mt={2}>
          <Divider />
          <Typography fontSize={"14px"} fontWeight="bold" textAlign={"center"}>
            Check-Out
          </Typography>
          <Divider />
          <Typography sx={{ mt: 1, fontSize: "12px" }}>
            I agree that my liability for this bill is not waived and agree to
            be held personally liable in the event that the indicated person,
            company or association fails to pay the full amount of these
            charges. I agree to fully depart accommodations by the 11am check
            out time.
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={4}>
              {renderFieldWithLine("Print Name:")}
            </Grid>
            <Grid item xs={4}>
              {renderFieldWithLine("Signature:")}
            </Grid>
            <Grid item xs={4}>
              {renderFieldWithLine("Date:")}
            </Grid>
          </Grid>
        </Box>

        <Box mt={2}>
          <Divider />
          <Typography fontSize={"14px"} fontWeight="bold" textAlign={"center"}>
            Additional Guest Info
          </Typography>
          <Divider />
          <Grid mt={1} container spacing={1}>
            {reservation?.guests.map((guest, index) => (
              <Grid item xs={4} key={guest.id}>
                {renderFieldWithLine(
                  `${index + 1} Guest Name: `,
                  guest?.first_name && guest?.last_name
                    ? `${guest.first_name} ${guest.last_name}`
                    : null
                )}
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box textAlign="center" sx={{ mt: 4 }}>
          <Typography fontSize={"12px"} fontWeight="bold">
            Thank you for staying with us, hope you enjoy your stay!
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default HotelCheckinForm;
