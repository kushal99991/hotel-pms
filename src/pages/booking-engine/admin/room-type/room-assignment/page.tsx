import React, { useCallback, useEffect, useState } from "react";
import {
  useForm,
  FormProvider,
  useFieldArray,
  Controller,
} from "react-hook-form";
import {
  Grid,
  Typography,
  IconButton,
  Box,
  InputAdornment,
  Card,
  CardContent,
  TextField,
  Alert,
  Checkbox,
  FormControlLabel,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import RoomIcon from "@mui/icons-material/Room";
import DeleteIcon from "@mui/icons-material/Delete";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import {
  IRoomAutoGenerateNumber,
  IRoomNumberAssign,
  IRoomNumberCreateRequest,
  IRoomNumberRoom,
} from "types/roomSliceTypes";
import { yupResolver } from "@hookform/resolvers/yup";
import { addRoomNumberAssignSchema } from "utils/validations.utils";
import AutoGenerateRoom from "./component/AutoGenerateRoom";
import Modal from "components/widgets/ModalWindows/Modal";
import { useNavigate, useParams } from "react-router-dom";
import {
  useBulkRoomCreateMutation,
  useDropRoomMutation,
  useGetRoomTypeByIdMutation,
  useGetRoomTypeGetRoomByIdMutation,
} from "services/roomTypeSlice";
import ConfirmationDialog from "components/elements/ConfirmationDialog/ConfirmationDialog";
import useSnackbar from "hooks/useSnackbar";
import AddNewRoom from "./component/AddNewRoom";
import RoomSummary from "./component/RoomSummary";

interface Room {
  room_number: string;
  id?: string;
  room_id?: string;
  wing?: string | null;
  floor?: string | number | null;
  new?: boolean;
}

interface GroupedRoom {
  wing: string;
  floor: string | number;
  roomDetails: Room[];
}

type RoomError = {
  room_number?: {
    message: string;
    type: string;
    ref: {
      name: string;
    };
  };
  [key: string]: any; // For additional fields
};

const RoomErrors = ({ rooms }: { rooms: RoomError[] }) => {
  if (!rooms || rooms.length === 0) return null;

  const errors = rooms
    .filter((room) => room?.room_number?.message)
    .map((room) => ({
      message: room.room_number!.message,
      ref: room.room_number!.ref.name,
    }));

  return (
    <div>
      {errors.length > 0 && (
        <Alert severity="error">
          {errors.map((error, idx) => (
            <div key={idx}>
              <strong>{error.ref}:</strong> {error.message}
            </div>
          ))}
        </Alert>
      )}
    </div>
  );
};

const AddRoomNumberAssignment: React.FC = () => {
  const params = useParams<{ roomTypeId: string }>();
  const Navigate = useNavigate();
  const { openSnackbar } = useSnackbar();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("sm"));

  const [viewModal, setViewModal] = useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [isRoomGenerateLoading, setIsRoomGenerateLoading] =
    useState<boolean>(false);
  const [showAddNewModal, setShowAddNewModal] = useState<boolean>(false);
  const [selectedRoomId, setSelectedRoomId] = useState<{
    room_number: string;
    id?: string;
    room_id?: string;
  } | null>(null);

  const [
    getRoomTypeById,
    { data: roomTypeDetail, isLoading: isRoomTypeLoading },
  ] = useGetRoomTypeByIdMutation();
  const [getRoomTypeGetRoomById, { data: roomNumberList }] =
    useGetRoomTypeGetRoomByIdMutation();
  const [bulkRoomCreate, { isLoading }] = useBulkRoomCreateMutation();
  const [dropRoom] = useDropRoomMutation();

  const methods = useForm<IRoomNumberAssign>({
    mode: "all",
    resolver: yupResolver(addRoomNumberAssignSchema),
    defaultValues: {
      room_type_id: 0,
      inventory: 0,
      property_id: null,
      wing: "A",
      floor: 1,
      danger_drop_rooms: false,
      rooms: [],
    },
  });
  const {
    handleSubmit,
    setValue,
    setError,
    control,
    watch,
    formState: { errors },
  } = methods;
  const inventory = watch("inventory");
  const danger_drop_rooms = watch("danger_drop_rooms");

  const { fields, append, remove } = useFieldArray({
    control,
    name: "rooms",
  });

  const onRefresh = useCallback(() => {
    if (params?.roomTypeId) {
      getRoomTypeById({ id: params.roomTypeId });
      getRoomTypeGetRoomById({ id: params.roomTypeId });
    }
  }, [params?.roomTypeId]);

  useEffect(() => {
    onRefresh();
  }, [params]);

  useEffect(() => {
    if (roomTypeDetail) {
      setValue("inventory", roomTypeDetail.inventory, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("room_type_id", roomTypeDetail.id, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("property_id", roomTypeDetail.propertyId, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    }
  }, [roomTypeDetail]);

  useEffect(() => {
    const roomNumberLists = roomNumberList ?? [];
    if (roomNumberLists.length > 0) {
      const updateRoomList: IRoomNumberRoom[] = roomNumberLists.map((a) => ({
        room_number: a.room_number?.toString(),
        room_id: a.id?.toString(),
        floor: a.floor,
        wing: a.wing,
      }));
      setValue("rooms", updateRoomList, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("floor", roomNumberLists[0].floor, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("wing", roomNumberLists[0].wing, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    }
  }, [roomNumberList, setValue]);

  const onGenerateRoomNumber = useCallback(
    (data: IRoomAutoGenerateNumber) => {
      setIsRoomGenerateLoading(true);
      setValue("floor", data.floor, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("wing", data.wing, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      // const remainingInventory = inventory ?? 0;
      // const totalExistsRooms = fields?.length ?? 0;
      const [start, end] = data.room_range;
      const startRoom = start ?? 0;
      const endRoom = end ?? 0;
      let newRoomList: {
        room_number: string;
        wing?: string | null;
        floor?: string | number | null;
      }[] = Array.from({ length: endRoom - startRoom + 1 }, (_, index) => ({
        room_number: (startRoom + index).toString(),
        wing: data?.wing ?? "",
        floor: data?.floor ?? null,
      }));
      // Remove skip_numbers from newRoomList
      if (data.skip_numbers && Array.isArray(data.skip_numbers)) {
        const skipNumbersSet = new Set(data.skip_numbers.map(String));
        newRoomList = newRoomList.filter(
          (room) => !skipNumbersSet.has(room.room_number)
        );
      }
      for (let index = 0; index < newRoomList.length; index++) {
        const element = newRoomList[index];
        append({
          room_number: element.room_number,
          floor: element?.floor ?? 0,
          wing: element?.wing ?? "",
          new: true,
        });
      }
      // remainingInventory = (inventory ?? 0) - totalExistsRooms;
      // if (remainingInventory > 0) {
      //   const [start, end] = data.room_range;
      //   const startRoom = start ?? 0;
      //   const endRoom = end ?? 0;
      //   let newRoomList: {
      //     room_number: string;
      //     wing?: string | null;
      //     floor?: string | number | null;
      //   }[] = Array.from({ length: endRoom - startRoom + 1 }, (_, index) => ({
      //     room_number: (startRoom + index).toString(),
      //     wing: data?.wing ?? "",
      //     floor: data?.floor ?? null,
      //   }));
      //   // Remove skip_numbers from newRoomList
      //   if (data.skip_numbers && Array.isArray(data.skip_numbers)) {
      //     const skipNumbersSet = new Set(data.skip_numbers.map(String));
      //     newRoomList = newRoomList.filter(
      //       (room) => !skipNumbersSet.has(room.room_number)
      //     );
      //   }
      //   for (let index = 0; index < newRoomList.length; index++) {
      //     const element = newRoomList[index];
      //     append({
      //       room_number: element.room_number,
      //       floor: element?.floor ?? 0,
      //       wing: element?.wing ?? "",
      //       new: true,
      //     });
      //   }
      // } else {
      //   openSnackbar(
      //     `Please increase your room type inventory before adding more rooms.`,
      //     "error"
      //   );
      // }
      setIsRoomGenerateLoading(false);
      setViewModal(false);
    },
    [inventory, danger_drop_rooms, setValue, fields]
  );

  const handleAddNewRoom = useCallback(
    (wing?: string, floor?: number) => {
      setShowAddNewModal(false);
      // if ((fields?.length ?? 0) >= Number(inventory)) {
      //   openSnackbar(
      //     `Please increase your room type inventory before adding more rooms.`,
      //     "error"
      //   );
      //   return false;
      // }
      const nextRoomNumber = fields
        .filter((a) => a.floor === floor && a.wing === wing)
        .map((a) => Number(a.room_number))
        .sort((a, b) => a - b);
      // console.log(nextRoomNumber, "nextRoomNumber");

      const newRoomNumber =
        nextRoomNumber.length > 0
          ? nextRoomNumber[nextRoomNumber.length - 1] + 1
          : 101;
      append({
        room_number: `${newRoomNumber}`,
        wing,
        floor,
        new: true,
      });
      return true;
    },
    [inventory, fields, setError]
  );

  const onSubmit = useCallback(async (data: IRoomNumberAssign) => {
    const existingRoomNumbers = data.rooms.map(
      (room: { room_number: string }) => room.room_number
    );

    for (let i = 0; i < data.rooms.length; i++) {
      const newRoomNumber = data.rooms[i].room_number;

      if (
        existingRoomNumbers.indexOf(newRoomNumber) !== -1 &&
        existingRoomNumbers.indexOf(newRoomNumber) !== i
      ) {
        setError(`rooms.${i}.room_number`, {
          type: "manual",
          message: `Room number ${newRoomNumber} already exists.`,
        });
        return;
      }
    }

    const payload: IRoomNumberCreateRequest[] = data.rooms.map(
      (room: IRoomNumberRoom) => ({
        room_type_id: data.room_type_id,
        property_id: data?.property_id ?? 0,
        wing: room.wing,
        floor: Number(room.floor),
        room_number: room.room_number,
      })
    );
    const response = await bulkRoomCreate({
      data: payload,
      danger_drop_rooms: data.danger_drop_rooms,
    });
    if (response.error) {
      openSnackbar(`Error: ${response.error}`, "error");
      return false;
    }
    if (response?.data?.rooms?.length === 0) {
      openSnackbar(response?.data?.detail ?? ``, "error");
    } else {
      openSnackbar(
        response?.data?.detail ?? `New Room Created Successfully!`,
        "success"
      );
    }

    onRefresh();
  }, []);

  const handleDialogOpen = (field: {
    room_number: string;
    id?: string;
    room_id?: string;
  }) => {
    const checkRoomNumbers = (roomNumberList ?? []).find(
      (a) => a.id === Number(field.room_id)
    );
    if (checkRoomNumbers) {
      setSelectedRoomId(field);
      setOpenDialog(true);
      return false;
    }
    const index = (fields ?? []).findIndex(
      (a) => a.room_number === field?.room_number
    );
    if (index >= 0) {
      remove(index);
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedRoomId(null);
  };

  const handleDelete = useCallback(async () => {
    try {
      const response = await dropRoom({
        room_id: Number(selectedRoomId?.room_id),
        room_type_id: Number(params?.roomTypeId),
        force_delete: true,
      });
      if (response.error) {
        openSnackbar(
          `This room cannot be deleted because it is associated with existing reservations or other modules.`,
          "warning"
        );
        handleDialogClose();
        return;
      }
      // Remove the room from the list if successful
      const index = (fields ?? []).findIndex(
        (a) => a.id === selectedRoomId?.id
      );
      if (index >= 0) {
        remove(index);
      }
      openSnackbar(`Room Deleted Successfully!`, "success");
      onRefresh();
      // Close the dialog
      handleDialogClose();
    } catch {
      openSnackbar(`An unexpected error occurred. Please try again.`, "error");
    }
  }, [params.roomTypeId, fields, selectedRoomId, roomNumberList, remove]);

  const onBackClick = useCallback(() => {
    Navigate(
      `/booking-engine/admin/property/detail/${roomTypeDetail?.propertyId}?type=room-configuration`
    );
  }, [roomTypeDetail?.propertyId]);

  let remainingInventory = inventory ?? 0;
  const totalExistsRooms = fields?.length ?? 0;
  const remain = (inventory ?? 0) - totalExistsRooms;
  remainingInventory = remain > 0 ? remain : 0;

  const floorList = (fields ?? []).map((a) => a?.floor?.toString() ?? "1");
  const floorLists =
    Array.from(new Set(floorList)).length > 0
      ? Array.from(new Set(floorList))
      : ["1", "2", "3"];

  const wingList = (fields ?? [])
    .map((a) => {
      const wing = a?.wing?.toString().trim();
      return wing === "" ? "" : (wing ?? "Other");
    })
    .filter((a) => a !== "");

  const wingLists =
    Array.from(new Set(wingList)).length > 0
      ? Array.from(new Set(wingList))
      : ["A", "B", "Other"];

  const isRoomErrorArray = (rooms: unknown): rooms is RoomError[] => {
    return (
      Array.isArray(rooms) &&
      rooms.every(
        (room) =>
          room === null || (typeof room === "object" && "room_number" in room)
      )
    );
  };

  return (
    <FormProvider {...methods}>
      <Box sx={{ mt: 5 }}>
        {/* Title with Back Arrow */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 3,
          }}
        >
          <IconButton onClick={onBackClick} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="div">
            {roomTypeDetail?.name || "Loading..."}
          </Typography>
        </Box>
        <RoomSummary
          isLoading={isRoomTypeLoading}
          details={{
            addedRoom: fields?.length ?? 0,
            remainingRoom: remainingInventory,
            totalRoom: inventory ?? 0,
            roomType: roomTypeDetail?.name ?? "",
            totalFloor: floorList?.length > 0 ? floorLists.join(",") : "N/A",
            totalWing: wingList?.length > 0 ? wingLists.join(",") : "N/A",
          }}
        />
        {errors?.root && <Alert severity="error">{errors.root.message}</Alert>}
        {isRoomErrorArray(errors?.rooms) && (
          <RoomErrors rooms={errors.rooms!} />
        )}
        <Grid container mt={3} spacing={2}>
          <Grid item xs={12} md={6}>
            <Box
              display="flex"
              alignItems="center"
              flexWrap="wrap"
              justifyContent={isDesktop ? "flex-start" : "space-between"}
              gap={1}
              ml={1}
            >
              <RoomIcon />
              <Typography variant="h6">Rooms</Typography>
              <Controller
                name={`danger_drop_rooms`}
                control={control}
                render={({ field: { value, onChange } }) => {
                  return (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={value}
                          onChange={(e) => onChange(e.target.checked)}
                        />
                      }
                      label="Drop all rooms before creating new ones"
                    />
                  );
                }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              display="flex"
              alignItems="center"
              flexDirection="row"
              justifyContent={isDesktop ? "flex-end" : "space-between"}
              flexWrap="wrap"
              gap={2}
            >
              <PrimaryButton
                label="Auto Generate"
                buttonStyles={{
                  backgroundColor: "#32A1AE",
                  color: "#FFFFFF",
                  fontWeight: "bold",
                }}
                onClick={() => setViewModal(true)}
                isLoading={false}
                loadingText="Loading..."
                sx={!isDesktop ? { width: "100%" } : {}}
              />
              <PrimaryButton
                label="Add Room"
                color="secondary"
                onClick={() => setShowAddNewModal(true)}
                isLoading={false}
                loadingText="Loading..."
                buttonStyles={{
                  backgroundColor: "#32A1AE",
                  color: "#FFFFFF",
                  fontWeight: "bold",
                }}
                startIcon={<AddIcon />}
                sx={!isDesktop ? { width: "100%" } : {}}
              />
              <PrimaryButton
                label="Save"
                color="secondary"
                onClick={handleSubmit(onSubmit)}
                isLoading={isLoading}
                loadingText="Loading..."
                sx={!isDesktop ? { width: "100%" } : {}}
              />
            </Box>
          </Grid>
        </Grid>
        <Card>
          <CardContent>
            <Controller
              name={`rooms`}
              control={control}
              render={({
                fieldState: { invalid },
                field: { value: roomList },
              }) => {
                // Check if roomList is empty or undefined
                if (!roomList || roomList.length === 0) {
                  return (
                    <Grid
                      container
                      spacing={1}
                      gap={1}
                      my={2}
                      py={2}
                      sx={{
                        position: "relative",
                        borderWidth: 1,
                        borderStyle: "solid",
                        borderColor: invalid ? "red" : "black",
                        borderRadius: 1,
                        paddingTop: 4, // Adjust padding to make space for the label
                      }}
                    >
                      <Grid item xs={12}>
                        <Typography
                          variant="body1"
                          align="center"
                          color="textSecondary"
                          sx={{ py: 3 }}
                        >
                          No rooms added yet. Click on `Add Room` or `Auto
                          Generate` to start adding.
                        </Typography>
                      </Grid>
                    </Grid>
                  );
                }

                const roomsData = roomList.reduce<Record<string, GroupedRoom>>(
                  (acc, room) => {
                    // Determine wing and floor for grouping
                    const wing = room.wing || "N/A";
                    const floor = room.floor || "Unknown";

                    const key = `${wing}-${floor}`;
                    if (!acc[key]) {
                      acc[key] = { wing, floor, roomDetails: [] };
                    }
                    acc[key].roomDetails.push(room);

                    return acc;
                  },
                  {}
                );

                const formattedRoomsData = Object.values(roomsData);
                return (
                  <>
                    {formattedRoomsData.map((item, i) => {
                      return (
                        <Grid
                          key={i.toString()}
                          container
                          spacing={1}
                          gap={1}
                          my={2}
                          py={2}
                          sx={{
                            position: "relative",
                            borderWidth: 1,
                            borderStyle: "solid",
                            borderColor: invalid ? "red" : "black",
                            borderRadius: 1,
                            paddingTop: 4, // Adjust padding to make space for the label
                          }}
                        >
                          {/* Top-left label */}
                          <Typography
                            variant="body1"
                            sx={{
                              position: "absolute",
                              top: -12,
                              left: 10,
                              background: "white",
                              paddingX: 0.8,
                              color: invalid ? "red" : "black",
                            }}
                            fontStyle="normal"
                            fontWeight="bold"
                          >
                            {`Wing ${item.wing}, Floor ${item.floor}`}
                          </Typography>

                          {(item.roomDetails ?? []).length > 0 ? (
                            (item.roomDetails ?? []).map((field) => {
                              const index = (fields ?? []).findIndex(
                                (a) => a.room_number === field.room_number
                              );
                              return (
                                <Grid
                                  item
                                  xs={12}
                                  md={2.9}
                                  sm={3.8}
                                  py={3}
                                  key={field.id}
                                >
                                  <Controller
                                    name={`rooms.${index}.room_number`}
                                    control={control}
                                    render={({
                                      field: { onChange, value },
                                      fieldState: { invalid, error },
                                    }) => (
                                      <TextField
                                        fullWidth
                                        onChange={onChange}
                                        value={value}
                                        label="Room Number"
                                        placeholder="Enter Room Number"
                                        error={invalid}
                                        helperText={error?.message ?? ""}
                                        type="number"
                                        InputProps={{
                                          endAdornment: (
                                            <InputAdornment position="end">
                                              <IconButton
                                                edge="end"
                                                onClick={() =>
                                                  handleDialogOpen(field)
                                                }
                                              >
                                                <DeleteIcon />
                                              </IconButton>
                                            </InputAdornment>
                                          ),
                                          readOnly: !field.new,
                                          style: {
                                            backgroundColor: field.new
                                              ? "white"
                                              : "#f5f5f5",
                                          },
                                        }}
                                        InputLabelProps={
                                          !field.new
                                            ? {
                                                style: {
                                                  color: field.new
                                                    ? "black"
                                                    : "rgba(0, 0, 0, 0.38)",
                                                },
                                              }
                                            : {}
                                        }
                                        sx={
                                          !field.new
                                            ? {
                                                "& .MuiInputBase-root": {
                                                  pointerEvents: "none", // Disable all interactions for the text field
                                                },
                                                "& .MuiInputAdornment-root": {
                                                  pointerEvents: "auto", // Re-enable interactions for the delete button
                                                },
                                              }
                                            : {}
                                        }
                                      />
                                    )}
                                  />
                                </Grid>
                              );
                            })
                          ) : (
                            <Grid item xs={12}>
                              <Typography
                                variant="body1"
                                align="center"
                                color="textSecondary"
                                sx={{ py: 3 }}
                              >
                                No rooms added yet. Click on `Add Room` or `Auto
                                Generate` to start adding.
                              </Typography>
                            </Grid>
                          )}
                        </Grid>
                      );
                    })}
                  </>
                );
              }}
            />
          </CardContent>
        </Card>
      </Box>
      <Modal
        open={viewModal}
        title={"Auto Generate"}
        size="md"
        onClose={() => setViewModal(false)}
        isHideCloseButton={true}
      >
        <AutoGenerateRoom
          onSave={onGenerateRoomNumber}
          onClose={() => setViewModal(false)}
          currentFloor={watch("floor")}
          currentWing={watch("wing")}
          totalInventory={remainingInventory ?? 0}
          isLoading={isRoomGenerateLoading}
        />
      </Modal>
      <Modal
        open={showAddNewModal}
        title={"Add New Room"}
        size="sm"
        onClose={() => setShowAddNewModal(false)}
        isHideCloseButton={true}
      >
        <AddNewRoom
          onSave={(data) => handleAddNewRoom(data.wing, Number(data.floor))}
          onClose={() => setShowAddNewModal(false)}
          currentFloor={watch("floor")?.toString() ?? ""}
          currentWing={watch("wing")}
          wingList={wingLists}
          floorList={floorLists}
        />
      </Modal>
      <ConfirmationDialog
        open={openDialog}
        title="Confirm Deletion"
        description={`Are you sure you want to delete ${selectedRoomId?.room_number} Room Number?`}
        buttons={[
          { label: "Yes", onClick: handleDelete },
          { label: "No", onClick: handleDialogClose },
        ]}
        onClose={handleDialogClose}
      />
    </FormProvider>
  );
};

export default AddRoomNumberAssignment;
