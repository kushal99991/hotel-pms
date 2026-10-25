import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "react-router-dom";
import { Box, Grid, Typography, Alert, styled, Snackbar } from "@mui/material";
import HousekeeperBoards from "../components/HouseKeeperBoards";
import { INewRoomNumberList } from "types/roomSliceTypes";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import useDragAutoScroll from "hooks/useDragAutoScroll";
import {
  useGetHousekeepingBoardsQuery,
  useUpdateHousekeepingTaskByIdMutation,
} from "services/houseKeeperSlice";
import { Print as PrintIcon } from "@mui/icons-material";
import dayjs from "dayjs";
import useAuth from "hooks/useAuth";
import HousekeeperBoardPDF from "../../housekeeping-dashboard/_components/HousekeeperBoardPDF";
import { IBoardIndexCount, IHousekeeperBoard } from "types/houseKeeperTypes";
import { pdf } from "@react-pdf/renderer";
import { useGetRoomTypeByPropertyIdMutation } from "services/roomTypeSlice";

interface DetailRowProps {
  label: string;
  textValue?: string;
  renderValue?: () => React.ReactNode;
}

const DragAutoScroll: React.FC = () => {
  useDragAutoScroll({ edgeThreshold: 80, scrollStep: 28 });
  return null;
};

const UpdateBoard = () => {
  const { users, properties } = useAuth();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);

  const date = searchParams.get("date");
  const shift_id = searchParams.get("id");
  const includeArchived =
    (location.state)
      ?.include_archived ?? false;

  const defalutProperty = properties?.find(
    (p) => p.id === users?.defaultPropertyId
  );

  const { data: boardList, refetch: refetchBoard } =
    useGetHousekeepingBoardsQuery(
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

  const [updateTask] = useUpdateHousekeepingTaskByIdMutation();

  useEffect(() => {
    if (boardList?.[0]?.property_id) {
      getRoomTypeByPropertyId({
        propertyId: boardList[0].property_id,
      });
    }
  }, [boardList, getRoomTypeByPropertyId]);

  const handleDownloadPDF = async (value: IBoardIndexCount) => {
    const propertyName = defalutProperty?.name;

    const filteredBoardList = boardList?.filter(
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

  // Transformation logic
  const realTask = boardList?.map((board) =>
    board.tasks.map((task) => {
      const { room, service_credits: suggested_service } = task;

      return {
        id: room.id,
        roomNumber: room.room_number,
        housekeeperId: board.housekeeper.id,
        housekeeping_status: room.housekeeping_status,
        frontdesk_status: room.frontdesk_status,
        suggested_service: {
          id: Number(suggested_service?.id),
          service_type: suggested_service?.service_type || "",
          description: suggested_service?.description || "",
          credits: task.credits,
          room_type_id: room.room_type_id,
        },
        roomTypeId: room.room_type_id,
        room_type: room.room_type?.name || "QQNS",
        floor: room.floor?.toString(),
        state: "",
        status: "",
        property_id: board.property_id,
        boardId: board.id,
        taskId: task.id,
        notes: task?.notes,
        reservation: room.reservation,
      };
    })
  );

  const [sliceRoomList, setSliceRoomList] = useState<INewRoomNumberList[][]>(
    []
  );
  const [shiftId, setShiftId] = useState(1);
  const [propertyId, setPropertyId] = useState(users?.defaultPropertyId ?? 1);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  // Track selected housekeepers
  const [selectedHousekeepers, setSelectedHousekeepers] = useState<number[]>(
    []
  );

  useEffect(() => {
    setShiftId(location?.state?.shiftId);
    setPropertyId(users?.defaultPropertyId ?? 1);
  }, [location, users?.defaultPropertyId]);

  // useEffect to initialize selectedHousekeepers from board data
  useEffect(() => {
    if (boardList) {
      const initialHousekeepers = boardList.map(
        (board) => board.housekeeper?.id
      );
      setSelectedHousekeepers(initialHousekeepers);
    }
  }, [boardList]);

  const methods = useForm<any>({
    mode: "all",
    defaultValues: [
      {
        shift_id: 0,
        date: "2024-10-01",
        housekeeper_id: 0,
        rooms: [0],
      },
    ],
  });
  const {
    control,
    setError,
    setValue,
    formState: { errors },
  } = methods;

  const updateBoardRooms = (
    index: number,
    rooms: number[],
    services: Record<number, { credits: number; service_id: number }>
  ) => {
    setValue(`boards[${index}].rooms`, rooms);
    setValue(`boards[${index}].services`, services);
    setValue(`boards[${index}].date`, location?.state?.date);
    setValue(`boards[${index}].shift_id`, shiftId);
    setValue(`boards[${index}].property_id`, propertyId);
  };

  const constructRoomAndServiceData = (section: INewRoomNumberList[]) => {
    const rooms = section?.map((room) => Number(room.id)) || [];
    const services = (section || []).reduce(
      (acc, room) => {
        if (room.suggested_service) {
          acc[room.id] = {
            credits: room.suggested_service.credits || 0,
            service_id: Number(),
          };
        }
        return acc;
      },
      {} as Record<number, { credits: number; service_id: number }>
    );

    return { rooms, services };
  };

  useEffect(() => {
    realTask?.forEach((section, idx) => {
      const { rooms, services } = constructRoomAndServiceData(section);
      updateBoardRooms(idx, rooms, services);
    });

    setSliceRoomList(realTask || []);
  }, [boardList]);

  const handleBoardChange = (
    index: number,
    updatedRows: INewRoomNumberList[]
  ) => {
    const updatedSlice = [...sliceRoomList];
    updatedSlice[index] = updatedRows;
    setSliceRoomList(updatedSlice);

    const { rooms, services } = constructRoomAndServiceData(updatedRows);
    updateBoardRooms(index, rooms, services);
  };

  const handleUpdateRooms = (
    sourceBoardIndex: number,
    destinationBoardIndex: number,
    sourceRooms: INewRoomNumberList[],
    destinationRooms: INewRoomNumberList[]
  ) => {
    const updatedSliceRoomList = [...sliceRoomList];
    updatedSliceRoomList[sourceBoardIndex] = sourceRooms;
    updatedSliceRoomList[destinationBoardIndex] = sourceRooms;

    updatedSliceRoomList.forEach((boardRooms) => {
      boardRooms.sort((a, b) => Number(a.roomNumber) - Number(b.roomNumber));
    });

    updatedSliceRoomList.forEach((section, idx) => {
      const { rooms, services } = constructRoomAndServiceData(section);
      updateBoardRooms(idx, rooms, services);
    });

    setSliceRoomList(updatedSliceRoomList);
  };

  const handleMoveAcrossBoards = async (
    sourceBoardIndex: number,
    fromIndex: number,
    destinationBoardIndex: number,
    toIndex: number
  ) => {
    const sourceRooms = Array.from(sliceRoomList?.[sourceBoardIndex] || []);
    const destinationRooms = Array.from(
      sliceRoomList?.[destinationBoardIndex] || []
    );

    const [movedItem] = sourceRooms.splice(fromIndex, 1);

    if (!movedItem?.taskId || !boardList?.[destinationBoardIndex]?.id) {
      destinationRooms.splice(toIndex, 0, movedItem);
      handleUpdateRooms(
        sourceBoardIndex,
        destinationBoardIndex,
        sourceRooms,
        destinationRooms
      );
      return;
    }

    const data = {
      id: Number(movedItem.taskId),
      board_id: Number(),
    };

    const response = await updateTask(data);
    if ("error" in response && response.error) {
      setError(
        "root",
        { message: response.error as string },
        { shouldFocus: true }
      );
      setSuccessMessage(null);
      return;
    }

    refetchBoard();
    setSuccessMessage("Task moved successfully!");

    destinationRooms.splice(toIndex, 0, movedItem);
    handleUpdateRooms(
      sourceBoardIndex,
      destinationBoardIndex,
      sourceRooms,
      destinationRooms
    );
  };

  // Function to update selected housekeeper for a board
  const handleHousekeeperSelect = (
    boardIndex: number,
    housekeeperId: number
  ) => {
    setSelectedHousekeepers((prev) => {
      const newSelected = [...prev];
      newSelected[boardIndex] = housekeeperId;
      return newSelected;
    });
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
          my: 3, // padding-top and padding-bottom: 2
          mx: 0,
        }}
      >
        <Col item xs={12} sm={6} md={4} lg={2} padding={2}>
          <DetailRow label="Property" textValue={defalutProperty?.name} />
        </Col>
        <Col item xs={12} sm={6} md={4} lg={2} padding={2}>
          <DetailRow label="Date" textValue={location?.state?.date} />
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
            textValue={Number(location?.state?.totalCredits).toFixed(1)}
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
          <PrintIcon
            sx={{ cursor: "pointer" }}
            onClick={() => {
              handleDownloadPDF(location?.state);
            }}
          />
        </Grid>
      </Grid>
      <Box
        sx={{
          padding: 2,
          backgroundColor: "white",
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <Grid container spacing={2}>
          <Snackbar
            open={!!(errors?.root?.message || successMessage)} // Ensure open is a boolean
            autoHideDuration={3000}
            onClose={() => {
              setSuccessMessage(null);
              setError("root", { message: "" }, { shouldFocus: true });
            }}
          >
            <Alert
              onClose={() => {
                setSuccessMessage(null);
                setError("root", { message: "" }, { shouldFocus: true });
              }}
              severity={errors?.root?.message ? "error" : "success"} // Dynamically set severity
              sx={{ width: "100%" }}
            >
              {errors?.root?.message || successMessage}
            </Alert>
          </Snackbar>

          <DndProvider backend={HTML5Backend}>
            <DragAutoScroll />
            <Grid
              container
              direction="row"
              spacing={2}
              data-testid="house-keeper-boards"
            >
              {sliceRoomList?.map((section, index) => {
                // Get the current housekeeper for this board
                const currentHousekeeper =
                  section?.[0]?.housekeeperId ??
                  boardList?.[index]?.housekeeper?.id;

                // Create a list of housekeepers selected in other boards
                const otherBoardsHousekeepers = selectedHousekeepers.filter(
                  (id, idx) => idx !== index && id !== undefined
                );

                const isArchived = boardList?.[index]?.active === false;

                return (
                  <Grid
                    item
                    xs={6}
                    key={index}
                    sx={{
                      opacity: isArchived ? 0.7 : 1,
                      pointerEvents: isArchived ? "none" : "auto",
                    }}
                  >
                    <HousekeeperBoards
                      control={control}
                      rooms={section}
                      index={index}
                      housekeeperIdNo={currentHousekeeper}
                      onChange={handleBoardChange}
                      setSuccessMessage={setSuccessMessage}
                      setError={setError}
                      refetchBoard={refetchBoard}
                      selectedHousekeepers={otherBoardsHousekeepers}
                      onHousekeeperSelect={(housekeeperId) =>
                        handleHousekeeperSelect(index, housekeeperId)
                      }
                      onMoveAcrossBoards={handleMoveAcrossBoards}
                    />
                  </Grid>
                );
              })}
            </Grid>
          </DndProvider>
        </Grid>
      </Box>
    </>
  );
};

const Col = styled(Grid)(() => ({
  border: "1px solid #ccc",
  marginTop: "-1px",
  marginLeft: "-1px",
}));

export default UpdateBoard;
