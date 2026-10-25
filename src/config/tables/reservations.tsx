import React from "react";
import { Link, Chip } from "@mui/material";
import { Column } from "components/elements/DataTable/DataTable";
import { GuestByStayDate } from "types/quickSearch";
import { reservationStatusDisplayValues } from "constants/reservation";
import moment from "moment";
import { appConfig } from "config/app.config";

export interface SimpleDetailRowProps {
  label: string;
  value: string;
}

export const reservationTableColumns: Column<GuestByStayDate>[] = [
  {
    field: "FIRST_NAME",
    label: "First Name",
    align: "center",
  },
  {
    field: "LAST_NAME",
    label: "Last Name",
    align: "center",
  },
  {
    field: "RESERVATION_STATUS",
    label: "Reservation Status",
    align: "center",
    renderCell: (value: GuestByStayDate) => {
      const rawStatus = value.RESERVATION_STATUS;
      const displayInfo = reservationStatusDisplayValues[rawStatus];
      return (
        <Chip
          label={displayInfo?.label ?? rawStatus}
          size="small"
          sx={{
            backgroundColor: displayInfo?.color,
            color: displayInfo?.contrastColor,
          }}
        ></Chip>
      );
    },
  },
  {
    field: "ARRIVAL",
    label: "Arrival",
    align: "center",
    renderCell: (value: GuestByStayDate) => {
      return moment(value.ARRIVAL).format(appConfig.displayDateFormat);
    },
  },
  {
    field: "DEPARTURE",
    label: "Departure",
    align: "center",
    renderCell: (value: GuestByStayDate) => {
      return moment(value.DEPARTURE).format(appConfig.displayDateFormat);
    },
  },
  {
    field: "EXPECTED_CHECK_IN",
    label: "Expected Check-In",
    align: "center",
  },
  {
    field: "EXPECTED_CHECK_OUT",
    label: "Expected Check-Out",
    align: "center",
  },
  {
    field: "ROOM",
    label: "Room No.",
    align: "center",
  },
  {
    field: "ROOM_TYPE",
    label: "Room Type",
    align: "center",
  },
  {
    field: "RATE_CODE_NAME",
    label: "Rate",
    align: "center",
  },
  {
    field: "BALANCE",
    label: "Balance",
    align: "right",
  },
  {
    field: "RESERVATION_ID",
    label: "Folio No.",
    align: "center",
    renderCell: (value: GuestByStayDate) => (
      <Link href={`/booking-engine/reservations/${value.RESERVATION_ID}`}>
        {value.RESERVATION_ID}
      </Link>
    ),
  },
];

export const marketOptionList: SimpleDetailRowProps[] = [
  { label: "Transient", value: "TRANSIENT" },
  { label: "Group", value: "GROUP" },
  { label: "Business Traveler", value: "BUSINESS_TRAVELLER" },
  { label: "Government", value: "GOVERNMENT" },
  { label: "Comp", value: "COMP" },
];

export const bookingChannelList: SimpleDetailRowProps[] = [
  { label: "Walk-in", value: "WALK_IN" },
  { label: "Call-in", value: "CALL_IN" },
  { label: "Travel Agent", value: "TRAVEL_AGENT" },
  { label: "Online - Direct", value: "ONLINE_DIRECT" },
  { label: "Online - 3rd Party", value: "ONLINE_3RD_PARTY" },
  { label: "Online 3rd Party OTA", value: "ONLINE_3RD_PARTY_OTA" },
  { label: "Groups", value: "GROUPS" },
];
