import React, { useEffect } from "react";
import { Grid, IconButton, Paper, Typography } from "@mui/material";
import DataTable, { Column } from "components/elements/DataTable/DataTable";
import styled from "@emotion/styled";
import { Box } from "@mui/system";
import {
  IBoardIndexCount,
  IHousekeeperBoard,
  IHouseRoomNumberListView,
  ITask,
} from "types/houseKeeperTypes";
import { useLocation } from "react-router-dom";
import { useGetHousekeepingBoardsQuery } from "services/houseKeeperSlice";
import useAuth from "hooks/useAuth";
import { Print as PrintIcon } from "@mui/icons-material";
import { pdf } from "@react-pdf/renderer";
import HousekeeperBoardPDF from "../../housekeeping-dashboard/_components/HousekeeperBoardPDF";
import { useGetRoomTypeByPropertyIdMutation } from "services/roomTypeSlice";
import dayjs from "dayjs";
import RoomStatusCode from "components/widgets/RoomStatusCode/RoomStatusCode";
import { IRoomStatus } from "constants/room";

interface DetailRowProps {
  label: string;
  textValue?: string;
  renderValue?: () => React.ReactNode;
}

const HousekeeperBoards: React.FC = () => {
  const { users, properties, currentTimeZone } = useAuth();

  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);

  const date = searchParams.get("date");
  const shift_id = searchParams.get("id");
  const includeArchived =
    (location.state as { include_archived?: boolean } | null)
      ?.include_archived ?? false;

  const currentProperty = properties?.find(
    (p) => p.id === (boardList?.[0]?.property_id ?? users?.defaultPropertyId)
  );

  const {
    data: boardList,
    isLoading,
    refetch,
  } = useGetHousekeepingBoardsQuery(
    {
      start_date: date || "",
      end_date: date || "",
      shift_id: Number(shift_id),
      property_id: users?.defaultPropertyId ?? 1,
      ...(includeArchived ? { include_archived: true } : {}),
    },
    { refetchOnMountOrArgChange: true }
  );

  const [getRoomTypeByPropertyId, { data: roomTypeList }] =
    useGetRoomTypeByPropertyIdMutation();

  useEffect(() => {
    if (boardList?.[0]?.property_id) {
      getRoomTypeByPropertyId({
        propertyId: boardList[0].property_id,
      });
    }
  }, [boardList, getRoomTypeByPropertyId]);

  const handleDownloadPDF = async (value: IBoardIndexCount) => {
    const propertyName = currentProperty?.name;

    const filteredBoardList = boardList?.filter(
      (board: IHousekeeperBoard) =>
        board.shift.id === (value?.shiftId ?? Number(shift_id)) &&
        dayjs(board.date).format("YYYY-MM-DD") ===
          dayjs(value?.date ?? date).format("YYYY-MM-DD")
    );

    const blob = await pdf(
      <HousekeeperBoardPDF
        boardList={filteredBoardList || []}
        roomTypeList={roomTypeList || []}
        propertyName={propertyName || ""}
        userName={users?.firstName || ""}
        timezone={currentTimeZone}
      />
    ).toBlob();

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${value?.date ?? date}_${propertyName}_Shift${value?.shiftId ?? shift_id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns: Column<IHouseRoomNumberListView>[] = [
    {
      field: "room",
      label: "Room",
      align: "center",
      renderCell: (task) => task.room?.room_number || "",
    },
    {
      field: "service_credits",
      label: "Service",
      align: "center",
      renderCell: (task) => task.service_credits?.service_type || "",
    },
    {
      field: "credits",
      label: "Credits",
      align: "center",
      renderCell: (task) =>
        task.credits !== undefined ? task.credits.toFixed(1) : "",
    },
    {
      field: "room",
      label: "HK",
      align: "center",
      renderCell: (task) =>
        task.room?.housekeeping_status ? (
          <RoomStatusCode
            status={task.room.housekeeping_status as IRoomStatus}
          />
        ) : (
          ""
        ),
    },
    {
      field: "room",
      label: "FD",
      align: "center",
      renderCell: (task) => task.room?.frontdesk_status || "",
    },
    {
      field: "room",
      label: "Checkout Time",
      align: "center",
      renderCell: (task) =>
        task.room?.reservation?.expected_checkout_time
          ? `${task.room.reservation.expected_checkout_time}`
          : "",
    },
  ];

  const footerComponent = (tasks: ITask[]) => {
    return (
      <Box
        sx={{
          padding: 2,
          display: "flex",
          justifyContent: "flex-start",
          gap: 2,
        }}
      >
        <Typography variant="body2">Total Rooms: {tasks?.length ?? 0}</Typography>
        <Typography variant="body2">
          Total Credits:{" "}
          {tasks?.length > 0
            ? tasks
                ?.reduce(
                  (total: number, task: ITask) => total + (task.credits ?? 0),
                  0
                )
                .toFixed(1)
            : "0"}
        </Typography>
      </Box>
    );
  };

  const DetailRow: React.FC<DetailRowProps> = ({
    label,
    textValue,
    renderValue,
  }) => (
    <Box display="flex" flexDirection="column" width="100%" flexWrap="wrap">
      <Typography variant="body1" fontWeight="bold">
        {label}:
      </Typography>
      {textValue && <Typography variant="body2">{textValue}</Typography>}
      {renderValue?.()}
    </Box>
  );

  return (
    <>
      <Grid
        container
        spacing={2}
        marginLeft={0}
        sx={{
          backgroundColor: "#f9f9f9",
          my: 3,
          mx: 0,
        }}
      >
        <Col item xs={12} sm={6} md={4} lg={2} padding={2}>
          <DetailRow
            label="Property"
            textValue={currentProperty?.name}
          />
        </Col>
        <Col item xs={12} sm={6} md={4} lg={2} padding={2}>
          <DetailRow label="Date" textValue={location?.state?.date ?? date} />
        </Col>
        <Col item xs={12} sm={6} md={4} lg={2} padding={2}>
          <DetailRow label="Shift" textValue={location?.state?.shiftName} />
        </Col>
        <Col item xs={12} sm={6} md={4} lg={2} padding={2}>
          <DetailRow
            label="Room Count"
            textValue={location?.state?.roomCount}
          />
        </Col>
        <Col item xs={12} sm={6} md={4} lg={2} padding={2}>
          <DetailRow
            label="Credits"
            textValue={Number(location?.state?.totalCredits ?? 0).toFixed(1)}
          />
        </Col>
        <Col item xs={12} sm={6} md={4} lg={2} padding={2} borderRight={0}>
          <DetailRow
            label="Housekeeper Count"
            textValue={location?.state?.staffCount}
          />
        </Col>
      </Grid>
      <Grid container justifyContent="flex-end">
        <Grid item mb={2} mr={3} xs={12} textAlign={"right"}>
          <IconButton
            color="primary"
            onClick={() => {
              handleDownloadPDF(location?.state);
            }}
          >
            <PrintIcon />
          </IconButton>
        </Grid>
      </Grid>
      <Grid container direction="row" spacing={2}>
        {boardList?.map((board, index) => (
          <Grid item xs={6} key={index}>
            <StyledPaper elevation={3}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                gap={3}
              >
                <Typography variant="h6">Board {index + 1}</Typography>
                <Typography variant="h6" sx={{ marginRight: "4px" }}>
                  {board?.housekeeper?.first_name} {board?.housekeeper?.last_name ?? ""}
                </Typography>
              </Box>

              <DataTable
                columns={columns}
                data={board?.tasks || []}
                isLoading={isLoading}
                isPaginationAllowed={false}
                maxHeight={375}
                renderFooter={() => footerComponent(board.tasks)}
                initialRowsPerPage={board?.tasks?.length}
              />
            </StyledPaper>
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default HousekeeperBoards;

const StyledPaper = styled(Paper)(() => ({
  padding: "15px",
  border: "2px",
  borderColor: "black",
}));

const Col = styled(Grid)(() => ({
  border: "1px solid #ccc",
  marginTop: "-1px",
  marginLeft: "-1px",
}));
