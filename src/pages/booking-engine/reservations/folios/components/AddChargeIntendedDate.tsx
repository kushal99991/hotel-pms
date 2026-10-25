import React from "react";
import moment, { Moment } from "moment";
import { IReservationResponse } from "types/reservationTypes";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Tooltip,
  Typography,
} from "@mui/material";
import { Info, ExpandMore } from "@mui/icons-material";
import { appConfig } from "config/app.config";

const AddChargeIntendedDate: React.FC<{
  reservation?: IReservationResponse;
  intendedDate?: Moment;
  onDateChange?: (date: Moment, isValid: boolean) => void;
}> = ({ reservation, intendedDate, onDateChange }) => {
  const startDateMoment = moment(reservation?.start_date);
  const endDateMoment = moment(reservation?.end_date);
  const todayMoment = moment();

  const handleDateChange = (date: Moment | null) => {
    let valid = false;
    if (date) {
      valid = date.isBetween(startDateMoment, endDateMoment, "day", "[]");
    }

    if (onDateChange && date) {
      onDateChange(date, valid);
    }
  };

  function tooltipMessage(todayInRes: boolean) {
    if (!reservation) {
      return "Set the date to post the charge";
    }
    if (!todayInRes) {
      return `Today's date is outside of the reservation start date and end date. Select a date in between ${startDateMoment.format(appConfig.displayDateFormat)} and ${endDateMoment.format(appConfig.displayDateFormat)} to apply the charge to.`;
    } else {
      return "Today is within the start and end date of the reservation. You probably do not need to adjust the intended date";
    }
  }

  function currentIntendedDate() {
    if (!reservation) {
      return todayMoment;
    }
    let displayDate = intendedDate;
    if (!intendedDate) {
      if (todayMoment.isBefore(startDateMoment, "day")) {
        displayDate = startDateMoment;
      } else if (todayMoment.isAfter(endDateMoment, "day")) {
        displayDate = endDateMoment;
      } else {
        displayDate = todayMoment;
      }
    }
    return displayDate ?? todayMoment;
  }

  const currentDate = currentIntendedDate();
  const currentValid = currentDate.isBetween(
    startDateMoment,
    endDateMoment,
    "day",
    "[]"
  );
  const todayValid = todayMoment.isBetween(
    startDateMoment,
    endDateMoment,
    "day",
    "[]"
  );
  return (
    <Accordion
      defaultExpanded={!todayValid}
      sx={{
        boxShadow: "none",
        borderTop: "1px solid #e5e7eb", // input outlines grey
        borderBottom: "1px solid #e5e7eb",
        "&:before": {
          display: "none",
        },
        "&:first-of-type": {
          borderTopRightRadius: 0,
          borderTopLeftRadius: 0,
        },
        "&:last-of-type": {
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        },
      }}
    >
      <AccordionSummary
        aria-controls="intended-date-section"
        sx={{
          height: "32px",
          minHeight: "32px",
          "&.Mui-expanded": {
            height: "32px",
            minHeight: "32px",
          },
          "& .MuiAccordionSummary-content": {
            justifyContent: "flex-end",
          },
        }}
        expandIcon={<ExpandMore />}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography
            sx={{ textAlign: "right", mr: 1, color: "grey.600" }}
            variant="caption"
          >{`Intended Date: ${currentIntendedDate().format(appConfig.displayDateFormat)}`}</Typography>
          <Tooltip title={tooltipMessage(todayValid)} arrow>
            <Info sx={{ fontSize: "0.8rem", color: "grey.600" }} />
          </Tooltip>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <LocalizationProvider dateAdapter={AdapterMoment}>
          <DatePicker
            label="Intended Date"
            value={currentDate}
            onChange={handleDateChange}
            minDate={startDateMoment}
            maxDate={endDateMoment}
            format={appConfig.displayDateFormat}
            slotProps={{
              textField: {
                fullWidth: true,
                margin: "normal",
                helperText: !currentValid
                  ? `Please selecte a date between ${startDateMoment.format(appConfig.displayDateFormat)} and ${endDateMoment.format(appConfig.displayDateFormat)}`
                  : "",
                sx: {
                  marginBottom: !currentValid ? 3 : 0,
                },
              },
            }}
          />
        </LocalizationProvider>
      </AccordionDetails>
    </Accordion>
  );
};

export default AddChargeIntendedDate;
