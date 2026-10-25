import React, { useEffect, useState } from "react";
import DataTable, { Column } from "components/elements/DataTable/DataTable";
import RoomStatusCode from "components/widgets/RoomStatusCode/RoomStatusCode";
import { INewRoomNumberList } from "types/roomSliceTypes";
import HousekeeperRoomStatusCode from "components/widgets/HousekeeperStatus/HousekeeperStatus";

interface HousekeeperRoomListProps {
  roomList: INewRoomNumberList[];
  isLoading: boolean;
  refetch: () => void;
}

const HousekeeperRoomList: React.FC<HousekeeperRoomListProps> = ({
  roomList,
  isLoading,
  refetch,
}) => {
  const [rooms, setRooms] = useState<INewRoomNumberList[]>([]);

  // Update local state when roomList prop changes
  useEffect(() => {
    setRooms(roomList);
  }, [roomList]);

  const columns: Column<INewRoomNumberList>[] = [
    {
      field: "roomNumber",
      label: "Room Number",
      align: "center",
    },
    {
      field: "room_type", // Adjusted to match the API response
      label: "Room Type",
      align: "center",
    },
    {
      field: "state",
      label: "Service",
      align: "center",
      renderCell: (row) =>
        row.suggested_service
          ? row.suggested_service.service_type.replace(/_/g, " ")
          : "",
    },
    {
      field: "suggested_service",
      label: "Credits",
      align: "center",
      renderCell: (row) =>
        row.suggested_service?.credits !== undefined
          ? row.suggested_service.credits?.toFixed(1)
          : "N/A",
    },
    {
      field: "frontdesk_status",
      label: "Front Desk Status",
      align: "center",
      renderCell: (row) => <RoomStatusCode status={row?.frontdesk_status} />,
    },
    {
      field: "housekeeping_status",
      label: "Housekeeping Status",
      align: "center",
      // renderCell: (row) => <RoomStatusCode status={row?.housekeeping_status} />,
      renderCell: (room) => (
        <HousekeeperRoomStatusCode
          status={room.housekeeping_status}
          rowData={room}
          statusChange={refetch}
        />
      ),
    },
    {
      field: "reservation",
      label: "Checkout Time",
      align: "center",
      renderCell: (row) =>
        row.reservation?.expected_checkout_time
          ? `${row.reservation.expected_checkout_time}`
          : "",
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={rooms ?? []}
        isLoading={isLoading}
        rowsPerPageOptions={[10, 20, 50, 100]}
        initialRowsPerPage={100}
        minWidth={350}
      />
    </>
  );
};

export default HousekeeperRoomList;
