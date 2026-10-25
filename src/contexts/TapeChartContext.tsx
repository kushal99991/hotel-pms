import { appConfig } from "config/app.config";
import useAuth from "hooks/useAuth";
import useSnackbar from "hooks/useSnackbar";
import moment from "moment";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLazyGetReservationListQuery } from "services/reservationSlice";
import {
  useLazyGetRoomBlocksListQuery,
  useLazyGetRoomListQuery,
  useRoomAssignReservationMutation,
  useRoomUnassignReservationMutation,
} from "services/roomSlice";
import {
  useGetRoomTypeByPropertyIdMutation,
  useGetRoomTypeInventoryMutation,
} from "services/roomTypeSlice";
import { IRoomBlockListResponse } from "types/houseKeeperTypes";
import { DateRange, IReservationResponse, Room } from "types/reservationTypes";
import { IRoomTypes } from "types/roomTypes";
import { useSocket } from "./SocketContext";

const CELL_MIN_WIDTH = 100;

type TapeChartContextType = {
  dateRange: DateRange;
  timezoneCurrentDate: string;
  dateColumns: string[];
  roomTypeList: IRoomTypes[];
  datePage: number;
  setDateRange: React.Dispatch<React.SetStateAction<DateRange>>;
  reservations: IReservationResponse[];
  isLoading: boolean;
  isApiLoading: boolean;
  isPrevDisabled: boolean;
  roomBlocksList: IRoomBlockListResponse[];
  setReservations: React.Dispatch<React.SetStateAction<IReservationResponse[]>>;
  sampleRooms: Room[];
  setSampleRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  onNextDay: () => void;
  onPrevDay: () => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onLoadingData: () => void;
  handleReservationMove: (
    reservationId: string,
    targetRoomNumber: string | null
  ) => void;
  onDateChange: (date: Date, type: "start" | "end") => void;
  onUnassign: (reservation_id: number) => Promise<boolean>;
  containerRef: React.RefObject<HTMLDivElement | null>;
};

export const TapeChartContext = createContext<TapeChartContextType | undefined>(
  undefined
);

export const useTapeChartContext = () => {
  const context = useContext(TapeChartContext);
  if (!context) {
    throw new Error(
      "useTapeChartContext must be used within a TapeChartProvider"
    );
  }
  return context;
};

export const TapeChartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { users, timezoneCurrentDate } = useAuth();
  const { openSnackbar } = useSnackbar();
  const { socket } = useSocket();

  const containerRef = useRef<HTMLDivElement>(null);

  const [visibleDays, setVisibleDays] = useState<number>(14);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: moment(timezoneCurrentDate).toDate(),
    endDate: moment(timezoneCurrentDate).add(13, "d").toDate(),
  });
  const [reservations, setReservations] = useState<IReservationResponse[]>([]);
  const [sampleRooms, setSampleRooms] = useState<Room[]>([]);
  const [dateColumns, setDateColumns] = useState<string[]>([]);
  const [datePage, setDatePage] = useState<number>(0);

  // Lazy Queries
  const [getReservationList, { isLoading: reservationLoading }] =
    useLazyGetReservationListQuery();

  const [getRoomBlockList, { data: roomBlocksList }] =
    useLazyGetRoomBlocksListQuery();

  const [getRoomList, { data: roomNumberList }] = useLazyGetRoomListQuery();

  const [getRoomTypeInventory] = useGetRoomTypeInventoryMutation();
  const [roomAssignReservation] = useRoomAssignReservationMutation();
  const [roomUnassignReservation] = useRoomUnassignReservationMutation();
  const [getRoomTypeByPropertyId, { data: roomTypeList }] =
    useGetRoomTypeByPropertyIdMutation();

  // === UI Calculation: Visible Days ===
  const updateVisibleDays = useCallback(() => {
    const containerWidth =
      containerRef.current?.offsetWidth || window.innerWidth;
    const computed = Math.floor((containerWidth - 151) / CELL_MIN_WIDTH);
    console.log(computed, "computed");
    setVisibleDays((prev) => {
      if (prev === computed) return prev;
      return computed;
    });
  }, []);

  useEffect(() => {
    const observer = new ResizeObserver(updateVisibleDays);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    updateVisibleDays();
    window.addEventListener("resize", updateVisibleDays);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateVisibleDays);
    };
  }, [updateVisibleDays]);

  // === Initial Data Load ===
  useEffect(() => {
    if (users?.defaultPropertyId) {
      onRefresh();
    }
    if (socket) {
      socket.on("refresh-dashboard", () => {
        onRefresh();
      });
    }
  }, [users?.defaultPropertyId, socket, dateRange]);

  useEffect(() => {
    setDateRange((prev) => ({
      startDate: prev.startDate,
      endDate: moment(prev.startDate)
        .add(visibleDays - 1, "days")
        .toDate(),
    }));
  }, [visibleDays]);

  // === Date Columns ===
  useEffect(() => {
    const totalDays =
      moment(dateRange.endDate).diff(moment(dateRange.startDate), "days") + 1;
    const days = Array.from({ length: totalDays }, (_, i) =>
      moment(dateRange.startDate).add(i, "days").format("YYYY-MM-DD")
    );
    setDateColumns(days);
    setDatePage(0);
  }, [dateRange]);

  // === Manual Refresh ===
  const onRefresh = useCallback(async () => {
    if (!users?.defaultPropertyId) return;
    setIsLoading(true);
    await getRoomTypeByPropertyId({ propertyId: users.defaultPropertyId });

    // Trigger lazy queries
    const reservationResp = await getReservationList({
      property_id: users.defaultPropertyId,
      start_date: moment(dateRange.startDate).format(appConfig.dateApiFormat),
      end_date: moment(dateRange.endDate).format(appConfig.dateApiFormat),
    });
    setReservations(reservationResp?.data ?? []);

    const response = await getRoomTypeInventory({
      propertyId: users?.defaultPropertyId,
      startDate: moment(dateRange.startDate).format(appConfig.dateApiFormat),
      endDate: moment(dateRange.endDate).format(appConfig.dateApiFormat),
    });
    if (response?.error) {
      openSnackbar(response.error as string, "error");
      return;
    }

    const roomList = response.data;
    const roomResponse = await getRoomList({
      offset: 0,
      limit: 5000,
      property_id: users?.defaultPropertyId,
    });
    const roomNumberList = roomResponse?.data ?? [];

    const parsedRooms: Room[] = roomNumberList.map((a) => {
      const roomAvailability = roomList.find(
        (b) => b.roomTypeId === a.roomTypeId
      );
      return {
        number: a.roomNumber,
        type: a.room_type_info?.type ?? "",
        floor: Number(a.floor),
        maxOccupancy: roomAvailability?.availableCount ?? 0,
        room_type: a.room_type_info ?? null,
        housekeeping_status: a.status,
        frontdesk_status: a?.frontdesk_status,
        id: a.id,
      };
    });

    setSampleRooms(parsedRooms);
    await getRoomBlockList({
      property_id: users?.defaultPropertyId ?? 0,
      start_date: moment(dateRange.startDate).format(appConfig.dateApiFormat),
      end_date: moment(dateRange.endDate).format(appConfig.dateApiFormat),
    });
    updateVisibleDays();
    setIsLoading(false);
  }, [dateRange, users?.defaultPropertyId]);

  // === Room Assignment ===
  const roomAssign = async (
    reservationId: string,
    date: Date,
    endDate: Date,
    roomId: number
  ) => {
    const response = await roomAssignReservation({
      reservationId: Number(reservationId),
      startDate: moment(date).format("YYYY-MM-DD"),
      endDate: moment(endDate).format("YYYY-MM-DD"),
      roomId,
    });
    if (response?.error) {
      openSnackbar(response.error as string, "error");
      return;
    }
    onRefresh();
  };
  const onUnassign = useCallback(
    async (reservation_id: number): Promise<boolean> => {
      const response = await roomUnassignReservation({
        reservationId: reservation_id,
      });
      if (response?.error) {
        openSnackbar(response.error as string, "error");
        return false;
      }
      onLoadingData();
      return true;
    },
    []
  );

  const onLoadingData = useCallback(() => {
    onRefresh();
  }, []);

  const handleReservationMove = async (
    reservationId: string,
    targetRoomNumber: string | null
  ) => {
    const reservation = reservations.find(
      (r) => r.id === Number(reservationId)
    );
    if (!reservation) return;

    const roomNumber = roomNumberList?.find(
      (r) => r.roomNumber === targetRoomNumber
    );
    if (!roomNumber) return true;

    roomAssign(
      reservationId,
      new Date(reservation.start_date),
      new Date(reservation.end_date),
      roomNumber.id
    );
  };

  // === Date Navigation ===
  const dateNav = (diff: number) => {
    setDateRange((prev) => {
      const newStart = moment(prev.startDate).add(diff, "days");
      return {
        startDate: newStart.toDate(),
        endDate: newStart
          .clone()
          .add(visibleDays - 1, "days")
          .toDate(),
      };
    });
  };

  const onDateChange = useCallback(
    (date: Date, type: "start" | "end") => {
      if (type === "start") {
        const newStart = moment(date).startOf("day");
        const newEnd = newStart.clone().add(visibleDays - 1, "days");
        setDateRange({
          startDate: newStart.toDate(),
          endDate: newEnd.toDate(),
        });
      }
    },
    [visibleDays]
  );

  const isPrevDisabled = useMemo(() => {
    return false;
  }, [dateRange.startDate, timezoneCurrentDate]);

  const contextValue = {
    dateRange,
    setDateRange,
    isLoading: reservationLoading,
    isApiLoading: isLoading,
    reservations,
    setReservations,
    sampleRooms,
    setSampleRooms,
    roomBlocksList: roomBlocksList ?? [],
    onNextDay: () => dateNav(1),
    onPrevDay: () => dateNav(-1),
    onNextWeek: () => dateNav(visibleDays),
    onPrevWeek: () => dateNav(-visibleDays),
    handleReservationMove,
    onDateChange,
    onUnassign,
    isPrevDisabled,
    dateColumns,
    datePage,
    roomTypeList: roomTypeList ?? [],
    onLoadingData: onRefresh,
    containerRef,
    timezoneCurrentDate,
  };

  return (
    <TapeChartContext.Provider value={contextValue}>
      {children}
    </TapeChartContext.Provider>
  );
};
