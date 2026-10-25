import { useCallback, useEffect, useMemo, useState } from "react";
import { useGetRoomListQuery } from "services/roomSlice";
import { useGetReservationListQuery } from "services/reservationSlice";
import useAuth from "hooks/useAuth";
import { appConfig } from "config/app.config";
import moment from "moment";
import {
  useGetRoomGuestReadyMutation,
  useGetRoomRevenueMutation,
  useGetRoomSoldMutation,
} from "services/dashboardSlice";
import { IRoomStatus } from "constants/room";

interface MetricResponse {
  num: number;
  date: string;
  status: string;
  customStatus: string;
}

export interface IMetricData {
  roomsSoldOutOfAvailable: string;
  occupancyPercentage: string;
  revenue: number;
  adr: number;
}

const HOUSEKEEPING_META = {
  Dirty: { label: "Dirty", color: "#d2691e" },
  Clean: { label: "Clean", color: "#1976d2" },
  Inspected: { label: "Inspected", color: "#4caf50" },
  OOO: { label: "Out of order", color: "#ffd600" },
  OOS: { label: "Out of service", color: "#c2185b" },
  OFF: { label: "Off Market", color: "#9e9e9e" },
};

export const useFrontOfficeReport = () => {
  const { users } = useAuth();
  const [selectedDate, setSelectedDate] = useState(() => moment(new Date()));
  const [matrixData, setMetricsData] = useState<IMetricData>({
    roomsSoldOutOfAvailable: `0 of 0`,
    occupancyPercentage: `0%`,
    revenue: 0,
    adr: 0,
  });
  const [uniqueRoomTypes, setUniqueRoomTypes] = useState<string[]>([]);
  const [selectedRoomTypes, setSelectedRoomTypes] = useState<string[]>([]);

  const todayApi = selectedDate.format(appConfig.dateApiFormat);

  const [getRoomGuestReady] = useGetRoomGuestReadyMutation();
  const [getRoomRevenue] = useGetRoomRevenueMutation();
  const [getRoomSold] = useGetRoomSoldMutation();

  const { data: roomList = [], isLoading: loadingRooms } = useGetRoomListQuery({
    limit: 500,
    offset: 0,
    property_id: users?.defaultPropertyId ?? 0,
  });

  const reservationArgs = useMemo(() => {
    const startOfWeek = moment(selectedDate).clone().startOf("isoWeek");
    return {
      property_id: users?.defaultPropertyId ?? 0,
      start_date: startOfWeek.format(appConfig.dateApiFormat),
      end_date: moment(startOfWeek)
        .add(7, "days")
        .format(appConfig.dateApiFormat),
    };
  }, [users?.defaultPropertyId, selectedDate]);

  const { data: reservationList = [], isLoading: loadingReservations } =
    useGetReservationListQuery(reservationArgs, {
      skip: false,
      refetchOnMountOrArgChange: true,
    });

  const todayReservations = useMemo(() => {
    return reservationList.filter((r) =>
      moment(r.start_date).isSame(selectedDate, "day")
    );
  }, [reservationList, selectedDate]);

  const getMatrixData = useCallback(async () => {
    try {
      const [guestReadyRes, revenueRes, soldRes] = await Promise.all([
        getRoomGuestReady({
          date: selectedDate.format(appConfig.dateApiFormat),
          propertyId: users?.defaultPropertyId ?? 0,
        }),
        getRoomRevenue({
          date: selectedDate.format(appConfig.dateApiFormat),
          propertyId: users?.defaultPropertyId ?? 0,
        }),
        getRoomSold({
          date: selectedDate.format(appConfig.dateApiFormat),
          propertyId: users?.defaultPropertyId ?? 0,
        }),
      ]);

      const guestReady = guestReadyRes?.data as MetricResponse | undefined;
      const revenue = revenueRes?.data as MetricResponse | undefined;
      const sold = soldRes?.data as MetricResponse | undefined;

      const roomsReady = guestReady?.num ?? 0;
      const roomsSold = sold?.num ?? 0;
      const totalRevenue = revenue?.num ?? 0;
      const adr = roomsReady ? totalRevenue / roomsReady : 0;
      const occPct = roomsReady ? (roomsSold / roomsReady) * 100 : 0;

      setMetricsData({
        roomsSoldOutOfAvailable: `${roomsSold} of ${roomsReady}`,
        occupancyPercentage: `${occPct.toFixed(1)}%`,
        revenue: totalRevenue,
        adr,
      });
    } catch {
      /** empty catch error */
    }
  }, [selectedDate, users?.defaultPropertyId]);

  useEffect(() => {
    if (users?.defaultPropertyId && selectedDate) {
      getMatrixData();
    }
  }, [selectedDate, users?.defaultPropertyId, getMatrixData]);

  useEffect(() => {
    const uniqueTypes = Array.from(
      new Set(
        reservationList
          .map((r) => r.room_type?.type)
          .filter(Boolean) as string[]
      )
    );
    setSelectedRoomTypes(uniqueTypes);
    setUniqueRoomTypes(uniqueTypes);
  }, [reservationList]);

  const { occupancyPercent, todayRevenue, weeklyChartData, housekeepingData } =
    useMemo(() => {
      const totalRooms = roomList.length;

      const todayRes = reservationList.filter(
        (r) =>
          moment(r.start_date).isSameOrBefore(selectedDate) &&
          moment(r.end_date).isAfter(selectedDate)
      );

      const occupancyPercent = totalRooms
        ? Math.round((todayRes.length / totalRooms) * 100)
        : 0;

      const hkCounts = roomList.reduce<Record<string, number>>((acc, room) => {
        const fd = room.frontdesk_status as IRoomStatus;

        if ([IRoomStatus.OOS, IRoomStatus.OOO, IRoomStatus.OFF].includes(fd)) {
          acc[fd] = (acc[fd] || 0) + 1;
        } else {
          const hk = room.housekeeping_status;

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

      const housekeepingData = Object.entries(HOUSEKEEPING_META).map(
        ([code, { label, color }]) => ({
          code,
          name: label,
          value: hkCounts[code] ?? 0,
          color,
        })
      );

      const DAYS_TO_SHOW = 8;
      const startOfWeek = selectedDate.clone().startOf("isoWeek");

      const weeklyChartData = Array.from({ length: DAYS_TO_SHOW }).map(
        (_, idx) => {
          const dayMoment = startOfWeek.clone().add(idx, "day");
          const label = dayMoment.format("ddd DD");

          const todaysRes = reservationList.filter(
            (r) =>
              moment(r.start_date).isSameOrBefore(dayMoment) &&
              moment(r.end_date).isAfter(dayMoment)
          );

          const byType: Record<string, number> = {};
          selectedRoomTypes.forEach((t) => (byType[t] = 0));

          todaysRes.forEach((r) => {
            const t = r.room_type?.type;
            if (t) byType[t] += Math.abs(Math.floor(Number(r.balance) || 0));
          });

          const occPct = totalRooms
            ? Math.round((todaysRes.length / totalRooms) * 100)
            : 0;

          return { day: label, occupancy: occPct, ...byType };
        }
      );

      const byType: Record<string, number> = {};
      todayRes.forEach((r) => {
        const t = r.room_type?.type;
        if (t) {
          const amount = Math.abs(Math.floor(Number(r.balance) || 0));
          byType[t] = (byType[t] || 0) + amount;
        }
      });

      const totalRevenue = Object.values(byType).reduce(
        (sum, value) => sum + value,
        0
      );

      return {
        occupancyPercent,
        todayRevenue: totalRevenue,
        weeklyChartData,
        housekeepingData,
      };
    }, [roomList, reservationList, selectedDate, selectedRoomTypes]);

  return {
    loading: loadingRooms || loadingReservations,
    todayApi,
    occupancyPercent,
    ADR: matrixData?.adr ?? "",
    revPAR: matrixData.revenue ?? "",
    todayRevenue,
    todayReservations,
    weeklyChartData,
    housekeepingData,
    uniqueRoomTypes,
    selectedRoomTypes,
    selectedDate: selectedDate.toDate(),
    matrixData,
    setSelectedRoomTypes,
    setSelectedDate: (date: Date) => setSelectedDate(moment(date)),
  };
};
