import React, { useState } from "react";
import { Moment } from "moment";
import {
  Box,
  CircularProgress,
  Alert,
  Button,
  Typography,
} from "@mui/material";
import { Print as PrintIcon } from "@mui/icons-material";
import useAuth from "hooks/useAuth";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { IHousekeeperBoard } from "types/houseKeeperTypes";
import { useGetHousekeepingBoardsQuery } from "services/houseKeeperSlice";
import { pdf } from "@react-pdf/renderer";
import HousekeeperBoardPDF from "pages/booking-engine/house-keeping/housekeeping-dashboard/_components/HousekeeperBoardPDF";
import { getMoment } from "utils/helperFunctions/common";
import { LCColors } from "theme/Colors";
import ShiftSection from "./ShiftSection";
import { ShiftGroup, BoardWithTotals } from "types/ui/housekeepingReports";
import { appConfig } from "config/app.config";

function groupBoardsByShift(boards: IHousekeeperBoard[]): ShiftGroup[] {
  const shiftMap = new Map<number, ShiftGroup>();

  for (const board of boards) {
    const { shift } = board;

    const boardCredits = board.tasks.reduce(
      (sum, task) => sum + (task.credits ?? 0),
      0
    );
    const boardWithTotals: BoardWithTotals = {
      ...board,
      totalCredits: boardCredits,
    };

    if (!shiftMap.has(shift.id)) {
      shiftMap.set(shift.id, { shift, boards: [], totalCredits: 0 });
    }

    const group = shiftMap.get(shift.id)!;
    group.boards.push(boardWithTotals);
    group.totalCredits += boardCredits;
  }

  return Array.from(shiftMap.values());
}

export default function HousekeepingBoardsView() {
  const [selectedDate, setSelectedDate] = useState<Moment | null>(getMoment());
  const { currentProperty, users: user } = useAuth();

  const dateString = selectedDate
    ? selectedDate.format(appConfig.dateApiFormat)
    : "";

  const {
    data: boardList,
    isFetching,
    error,
  } = useGetHousekeepingBoardsQuery(
    {
      start_date: dateString,
      property_id: currentProperty?.id ?? -1,
    },
    { refetchOnMountOrArgChange: true }
  );

  const shiftGroups: ShiftGroup[] = boardList
    ? groupBoardsByShift(boardList)
    : [];

  const kpis = [
    { label: "Shifts", value: shiftGroups.length, color: LCColors.darkBlue },
    {
      label: "Boards",
      value: shiftGroups.reduce((sum, g) => sum + g.boards.length, 0),
      color: LCColors.brown,
    },
    {
      label: "Credits",
      value: shiftGroups.reduce((sum, g) => sum + g.totalCredits, 0),
      color: LCColors.green,
    },
  ];

  async function handlePrint() {
    if (!boardList) return;
    const blob = await pdf(
      <HousekeeperBoardPDF
        boardList={boardList}
        propertyName={currentProperty?.name ?? ""}
        timezone={currentProperty?.timezone}
        appName={user?.userName}
        userName={user ? `${user.firstName} ${user.lastName}` : ""}
      />
    ).toBlob();
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  }

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <Box sx={{ py: 3, mx: "auto" }}>
        <Box sx={{ mb: 4, ml: 2 }}>
          <DatePicker
            label="Date"
            timezone={currentProperty?.timezone}
            value={selectedDate}
            onChange={(val) => setSelectedDate(val)}
            slotProps={{ textField: { size: "small" } }}
          />
        </Box>

        {!isFetching && !error && shiftGroups.length > 0 && (
          <Box
            sx={{
              display: "flex",
              alignItems: "stretch",
              gap: 2,
              mx: 2,
              mb: 3,
            }}
          >
            {kpis.map(({ label, value, color }) => (
              <Box
                key={label}
                sx={{
                  flex: "0 0 auto",
                  minWidth: 110,
                  borderRadius: 2,
                  bgcolor: "background.paper",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Box sx={{ height: 3, bgcolor: color }} />
                <Box
                  sx={{
                    px: 2.5,
                    py: 1.75,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 700, lineHeight: 1, color }}
                  >
                    {value}
                  </Typography>
                  <Typography
                    variant="overline"
                    sx={{
                      color: "text.secondary",
                      letterSpacing: 1,
                      mt: 0.5,
                      lineHeight: 1,
                    }}
                  >
                    {label}
                  </Typography>
                </Box>
              </Box>
            ))}
            <Box sx={{ flex: 1 }} />
            <Button
              variant="contained"
              color="secondary"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
              sx={{ alignSelf: "flex-start" }}
            >
              Print
            </Button>
          </Box>
        )}

        {isFetching && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Failed to load housekeeping boards. Try changing the date or
            refreshing.
          </Alert>
        )}

        {!isFetching && !error && shiftGroups.length === 0 && (
          <Alert severity="info">
            No boards found for{" "}
            {selectedDate?.format("MMMM D, YYYY") ?? "the selected date"}.
          </Alert>
        )}

        {!isFetching &&
          !error &&
          shiftGroups.map((group) => (
            <ShiftSection key={group.shift.id} group={group} />
          ))}
      </Box>
    </LocalizationProvider>
  );
}
