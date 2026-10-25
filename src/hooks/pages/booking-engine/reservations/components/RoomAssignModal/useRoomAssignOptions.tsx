import { useMemo } from "react";
import moment from "moment";
import {
  useGetRoomAvailabilityListMutation,
  useLazyGetRoomListQuery,
} from "services/roomSlice";
import { useLazyGetReservationListQuery } from "services/reservationSlice";
import { useGetMaintenanceListMutation } from "services/maintenanceSlice";
import { DropdownOption } from "components/elements/Dropdown/Dropdown";
import { IReservationResponse } from "types/reservationTypes";
import {
  IRoomAvailabilityIdsResponse,
  IRoomNumberList,
} from "types/roomSliceTypes";
import { MaintenanceTicketStatus } from "constants/maintenance";
import { ReservationStatusEnum } from "constants/reservation";
import { appConfig } from "config/app.config";
import { getCurrentRoom } from "utils/reservations";

type RoomOptionsHookResult = {
  options: DropdownOption[];
  isLoading: boolean;
  hasError: boolean;
  errors: string[];
  refetch: () => void;
};

type UseRoomAssignOptionsParams = {
  reservation?: IReservationResponse;
  propertyId?: number;
  renderValue?: (opt: DropdownOption) => React.ReactNode;
  overrideRoomTypeId?: number;
};

export const useRoomAssignOptions = (
  params: UseRoomAssignOptionsParams
): RoomOptionsHookResult => {
  const { reservation, propertyId, renderValue, overrideRoomTypeId } = params;
  const [
    getAvailabilityList,
    {
      data: availability,
      isLoading: availabilityLoading,
      error: availabilityError,
    },
  ] = useGetRoomAvailabilityListMutation();
  const [
    getRoomList,
    { data: rooms, isLoading: roomsLoading, error: roomsError },
  ] = useLazyGetRoomListQuery();
  const [
    getReservations,
    {
      data: reservations,
      isLoading: reservationsLoading,
      error: reservationsError,
    },
  ] = useLazyGetReservationListQuery();
  const [
    getTickets,
    { data: tickets, isLoading: ticketsLoading, error: ticketsError },
  ] = useGetMaintenanceListMutation();

  function fetchData() {
    const effectiveRoomTypeId =
      overrideRoomTypeId ?? reservation?.room_type?.id;
    getAvailabilityList({
      startDate: reservation?.start_date ?? "",
      endDate: reservation?.end_date ?? "",
      roomTypeId: effectiveRoomTypeId?.toString() ?? "",
    });
    getRoomList({
      limit: 500,
      offset: 0,
      property_id: propertyId ?? -1,
      roomTypeId: effectiveRoomTypeId,
    });
    getReservations({
      room_type: reservation?.room_type?.type ?? "",
      property_id: propertyId ?? -1,
      start_date: reservation?.start_date ?? "",
      end_date: reservation?.end_date ?? "",
    });
    getTickets({
      property_id: propertyId,
      serviceStatus: `${MaintenanceTicketStatus.OPEN},${MaintenanceTicketStatus.IN_PROGRESS}`,
    });
  }

  const isLoading =
    availabilityLoading ||
    roomsLoading ||
    reservationsLoading ||
    ticketsLoading;
  const hasError =
    !!availabilityError ||
    !!roomsError ||
    !!reservationsError ||
    !!ticketsError;

  const errors = useMemo(() => {
    const allErrors: string[] = [];
    if (availabilityError) {
      allErrors.push(availabilityError as string);
    }
    if (roomsError) {
      allErrors.push(roomsError as string);
    }
    if (reservationsError) {
      allErrors.push(reservationsError as string);
    }
    if (ticketsError) {
      allErrors.push(ticketsError as string);
    }
    return allErrors;
  }, [availabilityError, roomsError, reservationsError, ticketsError]);

  const options = useMemo(() => {
    if (isLoading) {
      return [];
    }
    const avail = (availability ?? []) as IRoomAvailabilityIdsResponse[];
    const roomList = (rooms ?? []) as IRoomNumberList[];
    const allReservations = reservations ?? [];
    const maintenanceTickets = tickets ?? [];

    const availableRoomIds = new Set<number>();
    avail.forEach((row) => {
      (row.available_room_ids ?? []).forEach((id) => availableRoomIds.add(id));
    });

    const ticketsWithRooms = maintenanceTickets.filter((t) => t.room);
    const roomsToReservation = allReservations.reduce((agg: any, res) => {
      // Ignore reservations that shouldn't leave assignment traces
      if (
        res.status === ReservationStatusEnum.CANCELED ||
        res.status === ReservationStatusEnum.DEPARTED ||
        res.status === ReservationStatusEnum.NO_SHOW
      ) {
        return agg;
      }
      const room = getCurrentRoom(res);
      if (!room) {
        return agg;
      }
      const roomKey = room.id;
      if (!roomKey) {
        return agg;
      }
      if (!agg[roomKey]) {
        agg[roomKey] = {
          endDate: res.end_date,
          reservationId: res.id,
          inHouse: res.status === ReservationStatusEnum.IN_HOUSE,
        };
      }
      return agg;
    }, {});
    const effectiveRoomTypeId =
      overrideRoomTypeId ?? reservation?.room_type?.id;
    const roomsToTickets = ticketsWithRooms.reduce((agg: any, ticket) => {
      if (ticket.room?.room_type_id !== effectiveRoomTypeId) {
        return agg;
      }
      if (
        ticket.service_status !== MaintenanceTicketStatus.OPEN &&
        ticket.service_status !== MaintenanceTicketStatus.IN_PROGRESS
      ) {
        return agg;
      }
      const roomKey = ticket.room?.id;
      if (!roomKey) {
        return agg;
      }
      if (!agg[roomKey]) {
        agg[roomKey] = {
          createdAt: ticket.created_at,
        };
      }
      return agg;
    }, {});

    const sortedRooms = [...roomList].sort((a, b) =>
      (a.roomNumber ?? "").localeCompare(b.roomNumber ?? "", undefined, {
        numeric: true,
        sensitivity: "base",
      })
    );

    return sortedRooms.map((room, roomIndex) => {
      const roomKey = room.id;
      const isAvailable = availableRoomIds.has(roomKey);

      let label =
        `${room.roomNumber} - ${room.frontdesk_status ?? ""} - ${room.housekeeping_status ?? ""}`.trim();

      const ticketInfo = roomKey ? roomsToTickets[roomKey] : undefined;
      const resInfo = roomKey ? roomsToReservation[roomKey] : undefined;
      if (ticketInfo) {
        label = `${label} - Maintenance`;
      } else if (resInfo) {
        const roomPrefix = resInfo.inHouse ? "Res" : "Assigned to ";
        label = `${label}\u00A0 ${roomPrefix} ${resInfo.reservationId}    Dep. ${moment(resInfo.endDate).format(appConfig.displayDateFormat)}`;
      }

      return {
        label,
        renderOption: renderValue,
        value: roomKey?.toString() ?? roomIndex.toString(),
        disabled: !isAvailable || room.frontdesk_status === "Not Available",
      };
    });
  }, [availability, rooms, reservations, tickets, isLoading]);

  if (!reservation || !propertyId) {
    return {
      options: [],
      isLoading: false,
      hasError: false,
      errors: [],
      refetch: () => {},
    };
  }

  return {
    options,
    isLoading,
    hasError,
    errors,
    refetch: fetchData,
  };
};
