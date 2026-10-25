import React, { useEffect, useMemo, useState } from "react";
import { Typography, Grid, Box, Alert, TextField } from "@mui/material";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import SecondaryButton from "components/elements/Button/SecondaryButton";
import useAuth from "hooks/useAuth";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import moment from "moment-timezone";
import { useGetLatestNightAuditQuery } from "services/nightAuditSlice";
import { INightAuditResponse } from "types/nightAuditTypes";

interface AuditHeaderProps {
  onStart: (audit_date: string, comments: string) => void;
  onCancel: () => void;
  nightAuditList: INightAuditResponse[];
}

const AuditHeader: React.FC<AuditHeaderProps> = ({
  onStart,
  onCancel,
  nightAuditList,
}) => {
  const { users, properties } = useAuth();
  const defaultProperty = properties.find(
    (a) => a.id === users?.defaultPropertyId
  );

  const [selectedDate, setSelectedDate] = useState<moment.Moment | null>(null);
  const { data: lastNightAudit, refetch } = useGetLatestNightAuditQuery({
    property_id: users?.defaultPropertyId ?? 1,
  });
  const [comments, setComments] = useState("");
  useEffect(() => {
    refetch();
  }, []);

  useEffect(() => {
    if (defaultProperty?.timezone) {
      if (lastNightAudit?.audit_date) {
        const selectDate = moment(lastNightAudit?.audit_date).add(1, "day");
        setSelectedDate(selectDate);
      } else {
        const currentDateInTimezone = moment().tz(defaultProperty.timezone);
        setSelectedDate(currentDateInTimezone);
      }
    }
  }, [defaultProperty?.timezone, lastNightAudit?.audit_date]);

  useEffect(() => {
    if (selectedDate) {
      const currentDateNightAudit = nightAuditList?.find(
        (a) =>
          a?.audit_date === selectedDate?.format("YYYY-MM-DD") &&
          a.status === "IN_PROGRESS"
      );
      setComments(currentDateNightAudit?.description ?? "");
    }
  }, [selectedDate]);

  const handleDateChange = (date: Date | null) => {
    if (date) {
      const convertedDate = moment(date);
      setSelectedDate(convertedDate);
    }
  };

  const handleCommentsChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setComments(event.target.value);
  };

  const minDate = useMemo(() => {
    if (defaultProperty?.timezone) {
      return moment(lastNightAudit?.audit_date)
        .tz(defaultProperty.timezone)
        .add(1, "day")
        .toDate();
    }
    return lastNightAudit?.audit_date;
  }, [lastNightAudit?.audit_date, defaultProperty?.timezone]);

  const isCompleteNightAudit = moment(minDate).isAfter(moment());

  return (
    <Box padding={3}>
      <Grid container spacing={3} justifyContent="space-between">
        {/* Property Name */}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="center" gap={1}>
            <Typography variant="body1" fontWeight="bold">
              Property Name:
            </Typography>
            <Typography variant="body1">
              {defaultProperty?.name ?? "Property Name"}
            </Typography>
          </Box>
        </Grid>

        {/* Conditional Note */}
        {isCompleteNightAudit && (
          <Grid item xs={12}>
            <Alert severity="info">
              You have already completed all night audits for today. You can
              start tomorrow`s night audit.
            </Alert>
          </Grid>
        )}

        {/* Audit Date */}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="center" gap={1}>
            <Typography variant="body1" fontWeight="bold">
              Audit Date:
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Select Date"
                value={
                  selectedDate
                    ? new Date(selectedDate.format("YYYY-MM-DD") ?? "")
                    : null
                }
                onChange={handleDateChange}
                disableFuture={true}
                minDate={minDate ? new Date(minDate) : undefined}
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    sx: (theme) => ({
                      [theme.breakpoints.only("sm")]: {
                        marginTop: "16px",
                      },
                    }),
                  },
                }}
              />
            </LocalizationProvider>
          </Box>
        </Grid>

        {/* Comments TextField */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Comments"
            multiline
            rows={4}
            value={comments}
            onChange={handleCommentsChange}
            placeholder="Enter your comments here..."
            variant="outlined"
          />
        </Grid>

        {/* Buttons */}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" gap={2}>
            <SecondaryButton
              label="Cancel"
              color="secondary"
              isLoading={false}
              onClick={onCancel}
              loadingText="Loading..."
            />
            <PrimaryButton
              label="Start"
              color="secondary"
              disabled={isCompleteNightAudit}
              onClick={() =>
                onStart(
                  selectedDate ? selectedDate.format("YYYY-MM-DD") : "",
                  comments
                )
              }
              isLoading={false}
              loadingText="Loading..."
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AuditHeader;
