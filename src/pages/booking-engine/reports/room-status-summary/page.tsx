import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  CircularProgress,
} from "@mui/material";
import { Download, PrintOutlined } from "@mui/icons-material";
import { pdf } from "@react-pdf/renderer";
import useAuth from "hooks/useAuth";
import { useGetRoomSummaryQuery } from "services/metricsSlice";
import { RoomSummaryItem } from "types/metricsTypes";
import { ReservationStatusEnum } from "constants/reservation";
import { getMoment } from "utils/helperFunctions/common";
import StatusCountSection from "./StatusCountSection";
import { RoomSummaryPdfDocument } from "./RoomStatusPDF";
import RoomStatusSummaryTable from "./RoomStatusSummaryTable";

const SETS_PER_ROW = 3;

function isDeparting(room: RoomSummaryItem) {
  return room.reservation_status === ReservationStatusEnum.DEPARTING;
}

function chunkRoomsIntoSets(rooms: RoomSummaryItem[]) {
  const rowsPerSet = Math.ceil(rooms.length / SETS_PER_ROW);
  return Array.from({ length: SETS_PER_ROW }, (_, i) =>
    rooms.slice(i * rowsPerSet, (i + 1) * rowsPerSet)
  );
}

function RoomStatusReportView() {
  const { users, currentProperty, currentTimeZone } = useAuth();

  const { data, isLoading, isError } = useGetRoomSummaryQuery(
    { property_id: currentProperty?.id ?? 0 },
    { skip: !currentProperty?.id }
  );

  const generatedMoment = getMoment(null, currentTimeZone);
  const dateGenerated = generatedMoment.format("YYYY/MM/DD");
  const timeGenerated = generatedMoment.format("hh:mm:ss A");
  const generatedBy =
    `${users?.firstName ?? ""} ${users?.lastName ?? ""}`.trim();

  async function buildPdfBlob(): Promise<Blob> {
    const sets = chunkRoomsIntoSets(data!.room_summary);
    const maxRows = Math.ceil(data!.room_summary.length / SETS_PER_ROW);
    const hasDepartingRooms = data!.room_summary.some(isDeparting);

    return pdf(
      <RoomSummaryPdfDocument
        propertyName={currentProperty?.name ?? ""}
        dateGenerated={dateGenerated}
        timeGenerated={timeGenerated}
        generatedBy={generatedBy}
        sets={sets}
        maxRows={maxRows}
        roomStats={data!.room_stats}
        hasDepartingRooms={hasDepartingRooms}
      />
    ).toBlob();
  }

  async function handlePrint() {
    if (!data) return;
    const blob = await buildPdfBlob();
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  }

  async function handleDownloadPdf() {
    if (!data) return;
    const blob = await buildPdfBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `room_status_summary_report-${dateGenerated.replace(/\//g, "-")}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !data) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Failed to load room status data.</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        "@media print": { margin: 0, padding: "20px" },
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 3,
          "@media print": { boxShadow: "none" },
        }}
      >
        <Stack spacing={3}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Box>
              <Typography variant="caption" color="text.secondary">
                Generated: {dateGenerated} {timeGenerated} by {generatedBy}
              </Typography>
            </Box>

            <Stack
              direction="row"
              spacing={2}
              sx={{ "@media print": { display: "none" } }}
            >
              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={handleDownloadPdf}
                disabled={!data}
              >
                Export PDF
              </Button>
              <Button
                variant="outlined"
                startIcon={<PrintOutlined />}
                onClick={handlePrint}
              >
                Print
              </Button>
            </Stack>
          </Box>
          <StatusCountSection
            title="Front Desk Stat Count"
            stats={data.room_stats.frontdesk_stats}
            statusInfo={data.room_stats.frontdesk_info}
          />
          <StatusCountSection
            title="Housekeeping Stat Count"
            stats={data.room_stats.housekeeping_stats}
            statusInfo={data.room_stats.housekeeping_info}
          />
          <RoomStatusSummaryTable
            rooms={data.room_summary}
            roomStats={data.room_stats}
          />
        </Stack>
      </Paper>
    </Box>
  );
}

export default RoomStatusReportView;
