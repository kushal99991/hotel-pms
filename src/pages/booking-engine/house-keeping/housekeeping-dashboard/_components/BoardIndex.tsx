import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Grid,
  Link,
  Stack,
  Typography,
  TextField,
} from "@mui/material";
import { useGetPropertiesQuery } from "services/propertySlice";
import { useGetRoomTypeByPropertyIdMutation } from "services/roomTypeSlice";
import { IBoardIndexCount } from "types/houseKeeperTypes";
import DataTable, { Column } from "components/elements/DataTable/DataTable";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import { Box } from "@mui/system";
import { IHousekeeperBoard } from "types/houseKeeperTypes";
import { pdf } from "@react-pdf/renderer";
import HousekeeperBoardPDF from "./HousekeeperBoardPDF";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import useAuth from "hooks/useAuth";
import HousekeeperView from "./HouseKeeperView";
import ConfirmationDialog from "components/elements/ConfirmationDialog/ConfirmationDialog";
import { useUpdateHousekeepingBoardMutation } from "services/houseKeeperSlice";
import useSnackbar from "hooks/useSnackbar";
import { appConfig } from "config/app.config";
import { getMoment } from "utils/helperFunctions/common";

interface BoardIndexProps {
  isLoading: boolean;
  boardList: IHousekeeperBoard[];
  refetchBoards?: () => void;
  showOnlyArchived?: boolean;
}

const BoardIndex: React.FC<BoardIndexProps> = ({
  isLoading,
  boardList,
  refetchBoards,
  showOnlyArchived = false,
}) => {
  const navigate = useNavigate();
  const { data: propertyList } = useGetPropertiesQuery();
  const [getRoomTypeByPropertyId, { data: roomTypeList }] =
    useGetRoomTypeByPropertyIdMutation();
  const { users, currentTimeZone } = useAuth();
  const { openSnackbar } = useSnackbar();
  const [updateHousekeepingBoard, { isLoading: isArchiving }] =
    useUpdateHousekeepingBoardMutation();

  const [openArchiveDialog, setOpenArchiveDialog] = useState(false);
  const [archiveNotes, setArchiveNotes] = useState("");
  const [notesTouched, setNotesTouched] = useState(false);
  const [selectedSummary, setSelectedSummary] =
    useState<IBoardIndexCount | null>(null);
  const [isActivateMode, setIsActivateMode] = useState(false);
  const [filterStatus] = useState<string>(
    showOnlyArchived ? "archived" : "active"
  );

  useEffect(() => {
    if (!roomTypeList && boardList?.length) {
      getRoomTypeByPropertyId({ propertyId: boardList[0].property_id ?? 1 });
    }
  }, [boardList, roomTypeList]);

  const calculateBoardSummary = (boards: IHousekeeperBoard[]) => {
    // Create a map to group data by shift and date
    const summaryMap: Record<
      string,
      {
        roomCount: number;
        totalCredits: number;
        staffCount: number;
        allCompleted: boolean;
        shiftName: string;
        shiftId: number;
        date: Date;
        notes: string;
      }
    > = {};

    boards.forEach((board) => {
      const shiftName = board.shift.name;
      const shiftId = board.shift.id;
      const date = board.date;
      const notes = board.notes;

      // Create a unique key for each shift + date combination
      const key = `${shiftName}_${date}`;

      // Initialize if the key does not exist in the map
      if (!summaryMap[key]) {
        summaryMap[key] = {
          roomCount: 0,
          totalCredits: 0,
          staffCount: 0,
          allCompleted: true,
          shiftName,
          shiftId,
          date,
          notes,
        };
      }

      // Update the summary for the shift + date group
      const group = summaryMap[key];
      group.staffCount += 1;
      group.roomCount += board.tasks.length;

      board.tasks.forEach((task) => {
        group.totalCredits += task.credits;

        // Check if any room's housekeeping_status is not 'VCI'
        if (task.room.housekeeping_status !== "VCI") {
          group.allCompleted = false; // Mark as not completed
        }
      });
    });

    // Convert the map back to an array of summary objects
    return Object.values(summaryMap);
  };

  const filteredBoardList = useMemo(() => {
    if (filterStatus === "active") {
      return (boardList || []).filter((b) => b?.active !== false);
    }
    if (filterStatus === "archived") {
      return (boardList || []).filter((b) => b?.active === false);
    }
    return boardList || [];
  }, [boardList, filterStatus]);

  const summary = useMemo(
    () => calculateBoardSummary(filteredBoardList || []),
    [filteredBoardList]
  );

  const getBoardsForSummary = (value: IBoardIndexCount) =>
    (filteredBoardList || []).filter(
      (board: IHousekeeperBoard) =>
        board.shift.id === value.shiftId &&
        dayjs(board.date).format("YYYY-MM-DD") ===
          dayjs(value.date).format("YYYY-MM-DD")
    );

  const isSummaryArchived = (value: IBoardIndexCount) => {
    const list = getBoardsForSummary(value);
    if (!list.length) return false;
    return list.every((b) => b?.active === false);
  };

  const getFirstBoardForSummary = (
    value: IBoardIndexCount
  ): IHousekeeperBoard | undefined => {
    const boards = getBoardsForSummary(value);
    return boards?.[0];
  };

  const formatUserName = (user?: {
    first_name?: string;
    last_name?: string;
  }) => {
    if (!user) return "-";
    const full = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();
    return full || "-";
  };

  const footerComponent = (
    <Box
      sx={{
        padding: 2,
        display: "flex",
        justifyContent: "flex-start",
        gap: 2,
      }}
    >
      <Typography variant="body2">
        Total Boards: {summary.length > 0 ? summary?.length : 0}
      </Typography>
      <Typography variant="body2">
        Total Credits:{" "}
        {summary.length > 0
          ? summary
              .reduce((total, { totalCredits }) => total + totalCredits, 0)
              ?.toFixed(1)
          : 0}
      </Typography>
    </Box>
  );

  let columns: Column<IBoardIndexCount>[] = [
    {
      field: "roomCount",
      label: "Room Count",
      align: "center",
    },
    {
      field: "totalCredits",
      label: "Credits",
      align: "center",
      renderCell: (row) =>
        row.totalCredits !== undefined
          ? `${Number(row.totalCredits).toFixed(1)}`
          : "N/A",
    },
    {
      field: "staffCount",
      label: "Staff Count",
      align: "center",
    },
    {
      field: "date",
      label: "Created",
      align: "center",
    },
    {
      field: "shiftName",
      label: "Shift",
      align: "center",
    },
  ];

  if (showOnlyArchived) {
    columns = [
      ...columns,
      {
        field: "createdBy" as any,
        label: "Created By",
        align: "center",
        renderCell: (value: IBoardIndexCount) => {
          const b: any = getFirstBoardForSummary(value);
          return formatUserName(b?.created_by_user);
        },
      },
      {
        field: "notes",
        label: "Note",
        align: "center",
      },
      {
        field: "archivedBy" as any,
        label: "Archived By",
        align: "center",
        renderCell: (value: IBoardIndexCount) => {
          const b: any = getFirstBoardForSummary(value);
          return formatUserName(b?.archived_by_user);
        },
      },
      {
        field: "archivedOn" as any,
        label: "Archived On",
        align: "center",
        renderCell: (value: IBoardIndexCount) => {
          const b: any = getFirstBoardForSummary(value);
          if (!b?.archived_at) return "-";
          return getMoment(b.archived_at, currentTimeZone).format(
            appConfig.dateApiFormat
          );
        },
      },
    ];
  }

  columns = [
    ...columns,
    {
      field: "shiftId",
      label: "Actions",
      align: "center",
      renderCell: (value: IBoardIndexCount) => {
        return (
          <>
            <Button
              size="small"
              onClick={() => {
                navigate(
                  `/booking-engine/rooms/rooms-management-reports/update?date=${value.date}&id=${value.shiftId}`,
                  {
                    state: {
                      ...value,
                      include_archived: showOnlyArchived,
                    },
                  }
                );
              }}
            >
              View
            </Button>
            <Button size="small" onClick={() => handleDownloadPDF(value)}>
              Print
            </Button>
            <Button
              size="small"
              color={isSummaryArchived(value) ? "inherit" : "primary"}
              sx={isSummaryArchived(value) ? { opacity: 0.5 } : undefined}
              onClick={() => {
                setSelectedSummary(value);
                setArchiveNotes("");
                setNotesTouched(false);
                setIsActivateMode(isSummaryArchived(value));
                setOpenArchiveDialog(true);
              }}
            >
              {isSummaryArchived(value) ? "Archived" : "Archive"}
            </Button>
          </>
        );
      },
    },
  ];

  const handleDownloadPDF = async (value: IBoardIndexCount) => {
    const propertyName = propertyList?.data?.find(
      (p) => p?.id === boardList?.[0]?.property_id
    )?.name;

    const filteredBoardList = boardList.filter(
      (board: IHousekeeperBoard) =>
        board.shift.id === value.shiftId &&
        dayjs(board.date).format("YYYY-MM-DD") ===
          dayjs(value.date).format("YYYY-MM-DD")
    );

    const blob = await pdf(
      <HousekeeperBoardPDF
        boardList={filteredBoardList || []}
        roomTypeList={roomTypeList || []}
        propertyName={propertyName || ""}
        userName={users?.firstName || ""}
      />
    ).toBlob();

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${value.date}_${propertyName}_Shift${value?.shiftId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return (
    <>
      {!showOnlyArchived && (
        <Stack
          flexDirection="row"
          display="flex"
          alignItems="center"
          gap={2}
          pb={3}
        >
          <Link href="/booking-engine/rooms/rooms-management-reports">
            <PrimaryButton
              buttonStyles={{
                backgroundColor: "#32A1AE",
                color: "#FFFFFF",
                fontWeight: "bold",
              }}
              label="Create Board(s)"
            />
          </Link>
          <Link href="/booking-engine/rooms/maintenance/create">
            <PrimaryButton
              buttonStyles={{
                backgroundColor: "#32A1AE",
                color: "#FFFFFF",
                fontWeight: "bold",
              }}
              label="Create Ticket"
            />
          </Link>
          {/* <Box sx={{ flexGrow: 0.4 }} />
          might be future needed so keeping it here!
        {!showOnlyArchived && (
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="board-filter-label">Filter Boards</InputLabel>
            <Select
              labelId="board-filter-label"
              value={filterStatus}
              label="Filter Boards"
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="archived">Archived</MenuItem>
            </Select>
          </FormControl>
        )} */}
        </Stack>
      )}
      <Grid container spacing={2}>
        <Grid item xs={showOnlyArchived ? 12 : 8}>
          <DataTable
            columns={columns}
            data={boardList?.length ? summary : []}
            isLoading={isLoading}
            rowsPerPageOptions={[5, 10, 20, 50, 100]}
            initialRowsPerPage={5}
            renderFooter={() => footerComponent}
            rowHeight={"74px"}
          />
        </Grid>
        {!showOnlyArchived && (
          <Grid item xs={4} data-testid="housekeeper-view">
            <HousekeeperView
              boardList={boardList || []}
              isLoading={isLoading}
            />
          </Grid>
        )}
      </Grid>

      {/* <HousekeeperBoardPDF boardList={boardList} /> */}

      <ConfirmationDialog
        open={openArchiveDialog}
        title={isActivateMode ? "Activate Board(s)" : "Archive Board(s)"}
        description={
          <>
            <Typography variant="body1" mb={2}>
              {isActivateMode
                ? "Are you sure you want to activate this Board(s) again?"
                : "Are you sure you want to archive this Board(s)?"}
            </Typography>
            <TextField
              label="Reason"
              fullWidth
              multiline
              minRows={2}
              value={archiveNotes}
              onChange={(e) => setArchiveNotes(e.target.value)}
              onBlur={() => setNotesTouched(true)}
              error={!isActivateMode && notesTouched && !archiveNotes.trim()}
              helperText={
                !isActivateMode && notesTouched && !archiveNotes.trim()
                  ? "Reason is required!"
                  : ""
              }
            />
          </>
        }
        buttons={[
          {
            label: "Cancel",
            onClick: () => setOpenArchiveDialog(false),
            color: "inherit",
          },
          {
            label: isArchiving
              ? isActivateMode
                ? "Activating..."
                : "Archiving..."
              : "Yes",
            onClick: async () => {
              setNotesTouched(true);
              if (!selectedSummary) return;
              if (!isActivateMode && !archiveNotes.trim()) return;

              const filteredBoardList = getBoardsForSummary(selectedSummary);

              if (!filteredBoardList.length) {
                openSnackbar("No boards found to process.", "warning");
                return;
              }

              const results = await Promise.all(
                filteredBoardList.map((board) =>
                  updateHousekeepingBoard({
                    id: board.id,
                    housekeeper_id: board.housekeeper.id,
                    property_id: board.property_id,
                    active: isActivateMode ? true : false,
                    notes: isActivateMode ? undefined : archiveNotes.trim(),
                  })
                )
              );

              const hasError = results.some((r: any) => r?.error);
              if (hasError) {
                openSnackbar(
                  isActivateMode
                    ? "Failed to activate one or more boards."
                    : "Failed to archive one or more boards.",
                  "error"
                );
              } else {
                openSnackbar(
                  isActivateMode
                    ? "Board(s) activated successfully."
                    : "Board(s) archived successfully.",
                  "success"
                );
                setOpenArchiveDialog(false);
                refetchBoards?.();
              }
            },
            color: "primary",
          },
        ]}
        onClose={() => setOpenArchiveDialog(false)}
      />
    </>
  );
};

export default BoardIndex;
