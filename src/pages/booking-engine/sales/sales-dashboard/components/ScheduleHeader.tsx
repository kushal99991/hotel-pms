import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import moment from "moment";
import SearchInput from "components/elements/SearchInput/SearchInput";
import { useSalesDashboardContext } from "contexts/SalesDashboardContext";
import { appConfig } from "config/app.config";
import { getMoment } from "utils/helperFunctions/common";
import useAuth from "hooks/useAuth";

const ScheduleHeader: React.FC<{
  handleOpenModal: () => void;
}> = ({ handleOpenModal }) => {
  const { startDate, setStartDate } = useSalesDashboardContext();
  const { currentTimeZone } = useAuth();

  const [selectedDate, setSelectedDate] = useState<Date | null>(
    startDate ?? getMoment(null, currentTimeZone, true).toDate()
  );
  const [errorDate, setErrorDate] = useState<string>("");

  const handleDateChange = (date: Date | null) => {
    if (
      date &&
      getMoment(date, currentTimeZone, true).isBefore(
        getMoment(null, currentTimeZone, true),
        "day"
      )
    ) {
      setErrorDate("Date cannot be in the past");
    } else {
      setErrorDate("");
      setSelectedDate(date);
      if (date) setStartDate(date);
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        Group Schedule
      </Typography>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Box>
          <Box display="flex" alignItems="center">
            <SearchInput onSearch={() => {}} size="small" />
          </Box>
        </Box>

        <Box>
          <DatePicker
            label="Starts From"
            value={selectedDate}
            shouldDisableDate={(date) => moment(date).isBefore(moment(), "day")}
            onChange={handleDateChange}
            format={appConfig.datePickerDateFormat}
            slotProps={{
              textField: {
                error: !!errorDate,
                helperText: errorDate || "",
                fullWidth: true,
              },
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default ScheduleHeader;
