import { useCallback, useEffect, useMemo, useState } from "react";
import useAuth from "./useAuth";
import { useLazyGetRoomListQuery } from "services/roomSlice";
import { IRoomNumberList } from "types/roomSliceTypes";
import { IRoomStatus } from "constants/room";
import { useLazyGetReservationListQuery } from "services/reservationSlice";
import { ReservationStatusEnum } from "constants/reservation";
import { useGetMaintenanceListMutation } from "services/maintenanceSlice";
import moment from "moment";
import { appConfig } from "config/app.config";

// This map defines the business logic for priority levels
export const SERVICE_PRIORITY_MAP: Record<
  string,
  "Critical" | "High" | "Medium" | "Low"
> = {
  HVAC: "Critical",
  FIRE_SAFETY: "Critical",
  PLUMBING: "High",
  ELECTRICAL: "High",
  APPLIANCES: "Medium",
  BATHROOM: "Medium",
  CLEANING: "Low",
  DEEP_CLEANING: "Low",
  DOORS: "Medium",
  DRYWALL: "Low",
  ELEVATOR: "High",
  FLOORING: "Medium",
  FURNITURE: "Low",
  GARAGE: "Medium",
  GENERAL_REPAIRS: "Medium",
  INSPECTION: "Low",
  KITCHEN: "Medium",
  LANDSCAPING: "Low",
  LIGHTING: "Medium",
  MAINTENANCE: "Low",
  PAINTING: "Low",
  PEST_CONTROL: "Medium",
  POOL: "Medium",
  ROOFING: "High",
  SECURITY_SYSTEM: "High",
  SPRINKLER_SYSTEM: "High",
  WATER_HEATER: "High",
  WINDOWS: "Medium",
};

interface MatricsData {
  cleanRoom: number;
  dirtyRoom: number;
  inspected: number;
  OOO: number;
  totalRooms: number;
}

export interface IRoomStatusDetail {
  room: string;
  type: string;
  status: string;
  maintenance: string;
  guest: string;
}

export interface MaintenanceRequest {
  room: string;
  issue: string;
  priority: string;
  reported: string;
  status: string;
}

export const useRoomReports = () => {
  const { users } = useAuth();
  const [matricsData, setMatricsData] = useState<MatricsData>({
    cleanRoom: 0,
    dirtyRoom: 0,
    inspected: 0,
    OOO: 0,
    totalRooms: 0,
  });
  const [roomStatusDetailList, setRoomStatusDetailList] = useState<
    IRoomStatusDetail[]
  >([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<
    MaintenanceRequest[]
  >([]);

  const reservationArgs = useMemo(() => {
    return {
      property_id: users?.defaultPropertyId ?? 0,
    };
  }, [users?.defaultPropertyId]);
  const [getRoomList, { isLoading: loadingRooms }] = useLazyGetRoomListQuery();
  const [getReservationList, { isLoading: loadingReservations }] =
    useLazyGetReservationListQuery();
  const [getMaintenanceList, { isLoading: loadingMaintaince }] =
    useGetMaintenanceListMutation();

  useEffect(() => {
    if (users?.defaultPropertyId) {
      onRefresh();
    }
  }, [users?.defaultPropertyId]);

  const onRefresh = useCallback(async () => {
    /* 1. Parallel fetches */
    const [roomListRes, reservationListRes, maintenanceListRes] =
      await Promise.all([
        getRoomList({
          limit: 500,
          offset: 0,
          property_id: users?.defaultPropertyId ?? 0,
        }),
        getReservationList(reservationArgs),
        getMaintenanceList({
          property_id: users?.defaultPropertyId ?? 0,
        }),
      ]);

    /* 2. Normalise data arrays */
    const roomList = roomListRes?.data ?? [];
    const reservationList = reservationListRes?.data ?? [];
    const maintenanceList = maintenanceListRes?.data ?? [];

    const mappedMaintenanceRequests: MaintenanceRequest[] = maintenanceList
      .filter(
        (a) => a.service_status === "OPEN" || a.service_status === "IN_PROGRESS"
      )
      .map((ticket) => {
        const serviceCode = ticket?.service_code ?? "UNKNOWN";

        return {
          room: ticket?.room?.room_number ?? "Unknown",
          issue: ticket?.service_request ?? "Unknown issue",
          priority: SERVICE_PRIORITY_MAP[serviceCode] ?? "Low", // Default to Low if not mapped
          reported: ticket?.created_at
            ? moment(ticket.created_at).format(
                `${appConfig.displayDateFormat} ${appConfig.dateApiTimeOfDayFormat}`
              )
            : "",
          status:
            ticket?.assigned_to_user !== null
              ? "Assigned"
              : (ticket?.service_status ?? "Unknown"),
        };
      });

    setMaintenanceRequests(mappedMaintenanceRequests);

    /* 3. HK counts (unchanged) */
    const hkCounts = roomList.reduce<Record<string, number>>((acc, room) => {
      const fd = room.frontdesk_status as IRoomStatus;

      if (
        [IRoomStatus.OOS, IRoomStatus.OOO, IRoomStatus.OFF].includes(fd || "")
      ) {
        acc[fd!] = (acc[fd!] || 0) + 1;
      } else {
        const hk = room.housekeeping_status;

        // Custom grouping logic
        if (hk === IRoomStatus.VC || hk === IRoomStatus.OC) {
          acc["Clean"] = (acc["Clean"] || 0) + 1;
        } else if (hk === IRoomStatus.VD || hk === IRoomStatus.OD) {
          acc["Dirty"] = (acc["Dirty"] || 0) + 1;
        } else if (hk === IRoomStatus.VCI) {
          acc["Inspected"] = (acc["Inspected"] || 0) + 1;
        } else {
          acc[hk ?? "Unknown"] = (acc[hk ?? "Unknown"] || 0) + 1;
        }
      }

      return acc;
    }, {});

    /* 4. Build room → guest map (unchanged, but no await) */
    const allowedStatuses = [
      ReservationStatusEnum.ARRIVING,
      ReservationStatusEnum.IN_HOUSE,
    ];
    const roomToGuestMap = reservationList.reduce<Record<string, string>>(
      (acc, res) => {
        const roomNum = res?.current_room_info?.room_number;
        const guestName =
          `${res?.reservation_first_guest_info?.first_name}` || "Guest";
        if (roomNum && allowedStatuses.includes(res.status)) {
          acc[roomNum] = `${guestName} – ${res.status.replace("_", " ")}`;
        }
        return acc;
      },
      {}
    );

    /* 5. NEW: build room → maintenance map from OPEN tickets */
    const roomToMaintenanceMap = await maintenanceList.reduce<
      Record<string, string>
    >((acc, ticket) => {
      const roomNum = ticket?.room?.room_number;
      if (
        roomNum &&
        (ticket.service_status === "OPEN" ||
          ticket.service_status === "IN_PROGRESS") &&
        ticket?.assigned_to_user !== null
      ) {
        acc[roomNum] =
          ticket.service_subject || ticket.service_request || "Maintenance";
      }
      return acc;
    }, {});

    /* 6. Compose the table rows */
    const roomData: IRoomStatusDetail[] = roomList.map((r: IRoomNumberList) => {
      const fd = r.frontdesk_status as IRoomStatus;
      const status = [
        IRoomStatus.OOS,
        IRoomStatus.OOO,
        IRoomStatus.OFF,
      ].includes(fd || "")
        ? (fd as string)
        : r.housekeeping_status;

      return {
        room: r.roomNumber,
        type: r.room_type_info?.type ?? "",
        status,
        guest: roomToGuestMap[r.roomNumber] ?? "N/A",
        maintenance: roomToMaintenanceMap[r.roomNumber] ?? "None",
      };
    });

    /* 7. Push to state */
    setRoomStatusDetailList(roomData);
    setMatricsData({
      cleanRoom: hkCounts?.Clean ?? 0,
      dirtyRoom: hkCounts?.Dirty ?? 0,
      inspected: hkCounts?.Inspected ?? 0,
      OOO: hkCounts.OOO ?? 0,
      totalRooms: roomList.length,
    });
  }, [users?.defaultPropertyId, reservationArgs]);

  return {
    matricsData,
    isLoading: loadingRooms || loadingReservations || loadingMaintaince,
    roomStatusDetailList,
    maintenanceRequests,
  };
};
