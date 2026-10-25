import React, { useCallback, useMemo, useState } from "react";
import moment from "moment";

import {
  Box,
  Chip,
  Grid,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { IReservationResponse } from "types/reservationTypes";
import StayDate from "./StayDate";
import AddOn from "./AddOn";

import {
  convertUtcToTimezone,
  pluralValue,
} from "utils/helperFunctions/common";
import { appConfig } from "config/app.config";
import { isReservationCheckedOut } from "utils/reservations";
import useAuth from "hooks/useAuth";

interface DetailSectionProps {
  label: string;
  children: React.ReactNode;
  rightBtn?: React.ReactNode;
}

interface StayInfoProps {
  details: IReservationResponse | null;
  onRefresh?: () => void;
  editOpen: boolean;
  setEditOpen: (newVal: boolean) => void;
}

const DetailSection: React.FC<DetailSectionProps> = ({
  label,
  children,
  rightBtn,
}) => (
  <Box>
    <Box display="flex" alignItems="center" justifyContent="space-between">
      <Typography variant="body1" fontWeight="bold">
        {label}
      </Typography>
      <Box display="flex">{rightBtn && rightBtn}</Box>
    </Box>
    <Box>{children}</Box>
  </Box>
);

const StayInfo: React.FC<StayInfoProps> = ({
  details,
  onRefresh,
  editOpen,
  setEditOpen,
}) => {
  const { currentTimeZone } = useAuth();
  const [currentSection, setCurrentSection] = useState<"stay_date" | "add_on">(
    "stay_date"
  );

  const handleOpenModal = (section: "stay_date" | "add_on") => {
    setCurrentSection(section);
    setEditOpen(true);
  };

  const handleCloseModal = () => setEditOpen(false);

  function handleOnClose(refresh: boolean) {
    handleCloseModal();
    if (refresh) {
      onRefresh?.();
    }
  }

  const checkInDateTime = useMemo(() => {
    if (details?.start_date && details?.checkin_time) {
      return new Date(details.start_date + " " + details?.checkin_time);
    }
    if (details?.start_date && details?.expected_checkin_time) {
      return new Date(details.start_date + " " + details.expected_checkin_time);
    }
    return null;
  }, [details]);

  const checkOutDateTime = useMemo(() => {
    if (details?.end_date && details?.checkout_time) {
      return new Date(details.end_date + " " + details?.checkout_time);
    }
    if (details?.end_date && details?.expected_checkout_time) {
      return new Date(details.end_date + " " + details.expected_checkout_time);
    }
    return null;
  }, [details]);

  const calculateTotalNights = useCallback(
    (checkIn: Date | null, checkOut: Date | null): number | null => {
      if (!checkIn || !checkOut) return null;
      const checkInMoment = moment(checkIn);
      const checkOutMoment = moment(checkOut);
      const diffDays = checkOutMoment.diff(checkInMoment, "days"); // Calculate difference in days
      return diffDays > 1 ? diffDays : 1;
    },
    []
  );

  const totalNights =
    details?.start_date && details?.end_date
      ? calculateTotalNights(
          new Date(details.start_date),
          new Date(details.end_date)
        )
      : 0;
  const startDateString = details?.start_date
    ? moment(details.start_date).format(appConfig.displayDateFormat)
    : "";
  const endDateString = details?.end_date
    ? moment(details.end_date).format(appConfig.displayDateFormat)
    : "";

  function getCheckinString() {
    let label = "";
    let timeString = "";
    if (details?.checkin_time) {
      label = "Checked In at: ";
      timeString = convertUtcToTimezone(
        `${details.start_date}T${details?.checkin_time}`,
        currentTimeZone
      ).format(appConfig.dateApiTimeOfDayFormat);
    } else if (details?.expected_checkin_time) {
      label = "Expected Check In: ";
      timeString = details.expected_checkin_time;
    }

    if (label && timeString) {
      return (
        <Typography
          fontStyle="italic"
          component="span"
          fontSize="0.95rem"
        >{` - ${label}${timeString}`}</Typography>
      );
    }
    return "";
  }

  function getCheckoutString() {
    let label = "";
    let timeString = "";
    if (details?.checkout_time) {
      label = "Checked Out at: ";
      timeString = convertUtcToTimezone(
        `${details.end_date}T${details?.checkout_time}`,
        currentTimeZone
      ).format(appConfig.dateApiTimeOfDayFormat);
    } else if (details?.expected_checkout_time) {
      label = "Requested Check Out: ";
      timeString = details?.expected_checkout_time;
    }
    if (label && timeString) {
      return (
        <Typography
          fontStyle="italic"
          component="span"
          fontSize="0.95rem"
        >{` - ${label}${timeString}`}</Typography>
      );
    }
    return "";
  }

  const reservationCheckedOut = isReservationCheckedOut(details);
  const isSuppressedRate =
    details?.rate_code?.rate_plan?.typed_rules?.suppressed_rates ?? false;
  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <Grid container sx={{ marginBottom: "-24px" }}>
        <Grid
          item
          xs={12}
          sm={6}
          display="flex"
          flexDirection="column"
          padding={2}
        >
          <DetailSection
            label="Stay Dates"
            rightBtn={
              !reservationCheckedOut && (
                <Button
                  variant="text"
                  sx={{
                    textTransform: "none",
                    textDecoration: "underline",
                    color: "#32A1AE",
                  }}
                  onClick={() => handleOpenModal("stay_date")}
                >
                  Edit
                </Button>
              )
            }
          >
            <Box display="flex" flexDirection="column">
              <Box display="flex" alignItems="center" gap={2}>
                <Typography fontWeight="bold" component="span">
                  Arrival
                </Typography>
                <Typography component="span">
                  {startDateString}
                  {getCheckinString()}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={2}>
                <Typography fontWeight="bold" component="span">
                  Departure
                </Typography>
                <Typography component="span">
                  {endDateString}
                  {getCheckoutString()}
                </Typography>
              </Box>
              <Typography fontWeight="bold" component="span">
                {`Length of stay ${pluralValue(totalNights ?? 0, "Night", "Nights")}`}
              </Typography>
            </Box>
          </DetailSection>
        </Grid>
        <Grid
          item
          xs={12}
          sm={6}
          display="flex"
          flexDirection="column"
          padding={2}
          paddingTop={2.5}
          sx={{
            borderLeft: "1px solid #D6D6D6",
          }}
        >
          <DetailSection label="Rate Plan">
            <Box display="flex">
              <Typography>{details?.rate_code?.name ?? "Unknown"}</Typography>
              {isSuppressedRate && (
                <Chip
                  size="small"
                  label="Suppressed"
                  sx={{ backgroundColor: "#FF004C", color: "white", ml: 1 }}
                />
              )}
            </Box>
          </DetailSection>
        </Grid>
      </Grid>
      {/* Common Dialog for viewing various details */}
      <Dialog open={editOpen} onClose={handleCloseModal} maxWidth="md">
        <DialogTitle>
          {currentSection === "stay_date" ? "Stay Info" : "Add On"}
        </DialogTitle>
        <DialogContent>
          {currentSection === "stay_date" && (
            <StayDate
              checkInDateTime={checkInDateTime}
              checkOutDateTime={checkOutDateTime}
              isCheckInDisable={Boolean(details?.checkin_time)}
              reservationId={details?.id ?? 0}
              reservation={details}
              onClose={handleOnClose}
            />
          )}
          {currentSection === "add_on" && <AddOn />}
        </DialogContent>
      </Dialog>
    </LocalizationProvider>
  );
};

export default StayInfo;
