import React, { useEffect } from "react";
import {
  Box,
  Button,
  IconButton,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment, { Moment } from "moment";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import { useTapeChartContext } from "contexts/TapeChartContext";

interface TapeHeaderProps {
  rightButton?: React.ReactNode;
}

const TapeHeader: React.FC<TapeHeaderProps> = () => {
  const {
    onDateChange,
    dateRange,
    isPrevDisabled,
    onNextDay,
    onPrevDay,
    onNextWeek,
    onPrevWeek,
  } = useTapeChartContext();

  const currentDate = dateRange.startDate ?? new Date();
  const [selectedDate, setSelectedDate] = React.useState(moment(currentDate));

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    if (currentDate) {
      setSelectedDate(moment(currentDate));
    }
  }, [currentDate]);

  const handleUpdate = () => {
    const startDate = selectedDate.toDate();
    onDateChange?.(startDate, "start");
  };

  return (
    <Box px={2} py={1} bgcolor="#f5f5f5" borderRadius={1}>
      <Stack
        direction={isMobile ? "column" : "row"}
        spacing={2}
        alignItems={isMobile ? "stretch" : "center"}
        justifyContent="space-between"
      >
        {/* Left Section */}
        <Stack
          direction={isMobile ? "column" : "row"}
          spacing={1}
          alignItems="center"
        >
          <Box fontSize="14px" fontWeight={500}>
            Start Date:
          </Box>

          <LocalizationProvider dateAdapter={AdapterMoment}>
            <DatePicker
              value={selectedDate}
              onChange={(value: Moment | null) => {
                if (value?.isValid()) {
                  setSelectedDate(value.startOf("day"));
                }
              }}
              slotProps={{
                textField: {
                  size: "small",
                  sx: { width: isMobile ? "100%" : 180 },
                  placeholder: "Start Date",
                },
              }}
            />
          </LocalizationProvider>

          <Button
            variant="contained"
            size="small"
            sx={{
              fontWeight: "bold",
              bgcolor: "#007bff",
              color: "#fff",
              textTransform: "none",
              "&:hover": {
                bgcolor: "#0069d9",
              },
              width: isMobile ? "100%" : "auto",
            }}
            onClick={handleUpdate}
          >
            UPDATE
          </Button>
        </Stack>

        {/* Right Section */}
        <Box
          display="flex"
          justifyContent={isMobile ? "center" : "flex-end"}
          flexWrap="wrap"
        >
          <IconButton
            onClick={onPrevWeek}
            size="small"
            disabled={isPrevDisabled}
            sx={{
              border: "1px solid gray",
              borderRadius: 0,
              bgcolor: "#e0e0e0",
              mr: 1,
              mb: isMobile ? 1 : 0,
              opacity: isPrevDisabled ? 0.5 : 1,
              cursor: isPrevDisabled ? "not-allowed" : "pointer",
            }}
          >
            <KeyboardDoubleArrowLeftIcon fontSize="small" />
          </IconButton>

          <IconButton
            onClick={onPrevDay}
            size="small"
            disabled={isPrevDisabled}
            sx={{
              border: "1px solid gray",
              borderRadius: 0,
              bgcolor: "#e0e0e0",
              mr: 1,
              mb: isMobile ? 1 : 0,
              opacity: isPrevDisabled ? 0.5 : 1,
              cursor: isPrevDisabled ? "not-allowed" : "pointer",
            }}
          >
            <KeyboardArrowLeftIcon fontSize="small" />
          </IconButton>

          <IconButton
            onClick={onNextDay}
            size="small"
            sx={{
              border: "1px solid gray",
              borderRadius: 0,
              bgcolor: "#e0e0e0",
              mr: 1,
              mb: isMobile ? 1 : 0,
            }}
          >
            <KeyboardArrowRightIcon fontSize="small" />
          </IconButton>

          <IconButton
            onClick={onNextWeek}
            size="small"
            sx={{
              border: "1px solid gray",
              borderRadius: 0,
              bgcolor: "#e0e0e0",
              mb: isMobile ? 1 : 0,
            }}
          >
            <KeyboardDoubleArrowRightIcon fontSize="small" />
          </IconButton>
        </Box>
      </Stack>
    </Box>
  );
};

export default TapeHeader;
