import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
} from "@mui/material";
import DataTable, { Column } from "components/elements/DataTable/DataTable";
import {
  useGetRoomListQuery,
  useUpdateRoomStatusMutation,
} from "services/roomSlice";
import { useGetRoomTypeByPropertyIdMutation } from "services/roomTypeSlice";
import { IHouseRoomNumberList } from "types/houseKeeperTypes";
import { Controller, useForm } from "react-hook-form";
import CustomDropdown from "components/widgets/CustomDropdown/CustomDropdown";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import { Box } from "@mui/system";
import HousekeeperRoomStatusCode from "components/widgets/HousekeeperStatus/HousekeeperStatus";
import RoomStatusCode from "components/widgets/RoomStatusCode/RoomStatusCode";
import Input from "components/elements/TextInput/TextInput";
import useAuth from "hooks/useAuth";
import useCustomStatus from "hooks/useCustomStatus";
import { ICustomRoomStatus } from "constants/room";
import UpdateRoomStatusCode from "components/widgets/RoomStatusCode/UpdateRoomStatusCode";
import { debounce } from "lodash";
import { convertUtcToTimezone } from "utils/helperFunctions/common";

const BoardIndex: React.FC = () => {
  const { users } = useAuth();
  const { control, handleSubmit } = useForm();

  const {
    data: roomList,
    isLoading,
    refetch,
  } = useGetRoomListQuery({
    limit: 500,
    offset: 0,
    property_id: users?.defaultPropertyId ?? 1,
  });

  const { statuses } = useCustomStatus();
  const { currentTimeZone } = useAuth();

  const [getRoomTypeByPropertyId, { data: roomTypeList }] =
    useGetRoomTypeByPropertyIdMutation();

  const [updateRoomStatus] = useUpdateRoomStatusMutation();

  const [openAssignModal, setOpenAssignModal] = useState<boolean>(false);
  const [clearSelection, setClearSelection] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRooms, setFilteredRooms] = useState<IHouseRoomNumberList[]>(
    []
  );

  const [housekeepingStatus, setHousekeepingStatus] = useState<string>("");
  const [frontdeskStatus, setFrontdeskStatus] = useState<string>("");
  const [roomType, setRoomType] = useState<string>("");
  const [floor, setFloor] = useState<string>("");
  const [selectedRoomIds, setSelectedRoomIds] = useState<number[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const debouncedSetSearchTerm = useMemo(
    () =>
      debounce((value: string) => {
        setSearchTerm(value);
      }, 300),
    []
  );

  const roomListData: IHouseRoomNumberList[] = (roomList as any)?.data || roomList || [];

  const HKOptions = roomListData
    .map((r) => r.status)
    .filter((s, i, self) => Boolean(s) && self.indexOf(s) === i)
    .map((s) => ({ label: s, value: s }));

  const frontdeskStatusOptions = roomListData
    .map((r) => r.frontdesk_status)
    .filter((s, i, self) => Boolean(s) && self.indexOf(s) === i)
    .map((s) => ({ label: s, value: s }));

  const floorOptions = roomListData
    .map((r) => r.floor)
    .filter((f, i, self) => Boolean(f) && self.indexOf(f) === i)
    .map((f) => ({ label: f.toString(), value: f.toString() }));

  const roomTypeOptions = (roomTypeList || []).map((rt: any) => ({
    label: rt.type,
    value: rt.id.toString(),
  }));

  useEffect(() => {
    let list: IHouseRoomNumberList[] = (roomList as any)?.data || roomList || [];
    if (searchTerm) {
      list = list.filter((r) =>
        r.roomNumber?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (housekeepingStatus) {
      list = list.filter((r) => r.status === housekeepingStatus);
    }
    if (frontdeskStatus) {
      list = list.filter((r) => r.frontdesk_status === frontdeskStatus);
    }
    if (roomType) {
      list = list.filter((r) => r.room_type_info?.id?.toString() === roomType);
    }
    if (floor) {
      list = list.filter((r) => r.floor?.toString() === floor);
    }
    setFilteredRooms(list);
  }, [roomList, searchTerm, housekeepingStatus, frontdeskStatus, roomType, floor]);

  const handleOpenAssignModal = () => {
    if (selectedRoomIds.length === 0) {
      setSnackbarOpen(true);
    } else {
      setOpenAssignModal(true);
      setSnackbarOpen(false);
    }
  };

  const handleCloseSnackbar = () => setSnackbarOpen(false);

  const handleCloseAssignModal = () => setOpenAssignModal(false);

  const onSubmit = async (data: any) => {
    const payload = {
      id: selectedRoomIds,
      housekeeping_status: data.housekeeper_status,
    };
    const response: any = await updateRoomStatus(payload);
    if (!response?.error) {
      refetch();
      setClearSelection(true);
      setSelectedRoomIds([]);
      setTimeout(() => {
        setClearSelection(false);
      }, 100);
    }

    handleCloseAssignModal();
  };

  const columns: Column<IHouseRoomNumberList>[] = [
    {
      field: "roomNumber",
      label: "Room",
      align: "center",
    },
    {
      field: "room_type",
      label: "Room Type",
      align: "center",
      renderCell: ({ room_type_info }) => room_type_info?.type,
    },
    {
      field: "floor",
      label: "Floor",
      align: "center",
    },
    {
      field: "frontdesk_status",
      label: "Front Desk Status",
      align: "center",
      renderCell: (room) => <RoomStatusCode status={room.frontdesk_status} />,
    },

    {
      field: "status",
      label: "Housekeeping Status",
      align: "center",

      renderCell: (room) => (
        <HousekeeperRoomStatusCode
          status={room.status}
          rowData={room}
          statusChange={refetch}
        />
      ),
    },

    {
      field: "room_status",
      label: "Room Status",
      align: "center",
      renderCell: (room) => (
        <UpdateRoomStatusCode
          status={room.room_status as ICustomRoomStatus}
          rowData={room}
          statusChange={refetch}
        />
      ),
    },
    {
      field: "updated_at",
      label: "Last Updated",
      align: "center",
      renderCell: (room) =>
        room.updated_at
    },
  ];

  return (
    <>
      {snackbarOpen && (
        <Alert onClose={handleCloseSnackbar} severity="warning">
          Please select at least one row before proceeding!
        </Alert>
      )}
      <Stack
        flexDirection="row"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        margin={3}
        width="95%"
      >
        <Grid container alignItems="center" spacing={2}>
          <Grid item xs={12} sm={6} md={2}>
            <Box sx={{ mt: 3 }}>
              <PrimaryButton
                buttonStyles={{
                  backgroundColor: "#32A1AE",
                  color: "#FFFFFF",
                  fontWeight: "bold",
                }}
                onClick={handleOpenAssignModal}
                label="Bulk Update"
                isLoading={isLoading}
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={1}></Grid>

          {/* Housekeeping Status Select */}

          <Grid sx={{ mt: 3 }} item xs={12} sm={6} md={2}>
            <Input
              isInvalid={false}
              label="Search"
              onChange={(e) => debouncedSetSearchTerm(e.target.value as string)}
              placeholder="Search"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <CustomDropdown
              label="Housekeeping Status"
              placeholder="Housekeeping Status"
              options={HKOptions}
              onChange={(event) => {
                setHousekeepingStatus(event.target.value as string);
              }}
              value={housekeepingStatus}
              isInvalid={false}
              fullWidth
              aria-label="HSKP Status"
              data-testid="room-number"
            />
          </Grid>

          {/* Occupancy Status Select */}
          <Grid item xs={12} sm={6} md={2}>
            <CustomDropdown
              label="Frontdesk Status"
              placeholder="Frontdesk Status"
              options={frontdeskStatusOptions}
              onChange={(event) => {
                setFrontdeskStatus(event.target.value as string);
              }}
              value={frontdeskStatus}
              isInvalid={false}
              fullWidth
              aria-label="HSKP Status"
              data-testid="room-number"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <CustomDropdown
              label="Room Type"
              placeholder="Room Type"
              options={roomTypeOptions || []}
              onChange={(event) => {
                setRoomType(event.target.value as string);
              }}
              value={roomType}
              isInvalid={false}
              fullWidth
              aria-label="HSKP Status"
              data-testid="room-number"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={1}>
            <CustomDropdown
              label="Floor"
              placeholder="Floor"
              options={floorOptions}
              onChange={(event) => {
                setFloor(event.target.value as string);
              }}
              value={floor}
              isInvalid={false}
              fullWidth
              aria-label="HSKP Status"
              data-testid="room-number"
            />
          </Grid>
        </Grid>
      </Stack>
      <DataTable
        columns={columns}
        data={filteredRooms ?? []}
        isLoading={isLoading}
        rowsPerPageOptions={[10, 20, 50, 100]}
        initialRowsPerPage={10}
        checkboxSelection={true}
        onSelectedRowsChange={
          (selectedRows) =>
            setSelectedRoomIds(selectedRows.map((row) => row.id)) // Track selected row IDs
        }
        clearSelection={clearSelection}
      />
      <Dialog
        fullWidth
        maxWidth="xs"
        open={openAssignModal}
        onClose={handleCloseAssignModal}
      >
        <DialogTitle>Update Status</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} direction="column">
            <Grid item>
              <Controller
                name="housekeeper_status"
                control={control}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <CustomDropdown
                    label="Housekeeping Status"
                    placeholder="Housekeeping Status"
                    options={HKOptions}
                    onChange={onChange}
                    value={value}
                    isInvalid={!!error?.message}
                    helperText={error?.message}
                    fullWidth
                    aria-label="Housekeeping Status"
                    data-testid="room-number"
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseAssignModal} color="primary">
            Cancel
          </Button>
          <PrimaryButton
            label="Update"
            isLoading={isLoading}
            loadingText="Loading...."
            onClick={handleSubmit(onSubmit)}
          />
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BoardIndex;
