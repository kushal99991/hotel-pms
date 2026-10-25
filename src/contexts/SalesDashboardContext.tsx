import useAuth from "hooks/useAuth";
import moment from "moment";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useParams } from "react-router-dom";
import { useGetRateCodeByPropertyIdMutation } from "services/roomTypeSlice";
import { DateRange } from "types/reservationTypes";
import {
  ChartItem,
  Event,
  GroupData,
  ISalesGroupDetail,
  MetricData,
} from "types/salesTypes";
import { getMoment } from "utils/helperFunctions/common";

interface SalesDashboardContextType {
  groupList: GroupData[];
  groupDetail: GroupData | null;
  metrics: MetricData;
  salesDistribution: ChartItem[];
  marketSegments: ChartItem[];
  events: Event[];
  dateColumns: string[]; // use formatted string: 'YYYY-MM-DD'
  visibleDays: number;
  startDate: Date | null;
  setStartDate: (value: Date) => void;
  addEvent: (event: Event) => void;
  setAllEvents: (events: Event[]) => void;
  onRefresh: () => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  selectedGroup: ISalesGroupDetail | null;
  setSelectedGroup: (group: ISalesGroupDetail | null) => void;
  rateCodeName: string | null;
}

const salesDistributionData = [
  { name: "Wedding Blocks", value: 33, color: "#ff9800" },
  { name: "GOH", value: 19, color: "#ef5350" },
  { name: "SMERF", value: 22, color: "#4caf50" },
  { name: "Corporate", value: 8, color: "#2196f3" },
  { name: "Banquet and Catering", value: 18, color: "#9c27b0" },
];

const marketSegmentData = [
  { name: "Transient", value: 41, color: "#607d8b" },
  { name: "Group", value: 39, color: "#795548" },
  { name: "BT", value: 14, color: "#009688" },
  { name: "Contract", value: 3, color: "#3f51b5" },
  { name: "Other", value: 3, color: "#ff5722" },
];

const CELL_MIN_WIDTH = 140;

const SalesDashboardContext = createContext<SalesDashboardContextType | null>(
  null
);

export const useSalesDashboardContext = () => {
  const context = useContext(SalesDashboardContext);
  if (!context) throw new Error("Context must be used within Provider");
  return context;
};

export const SalesDashboardProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const params = useParams();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { currentTimeZone } = useAuth();
  const timezoneCurrentDate = useMemo(() => {
    const utcTimezoneDate = getMoment(null, currentTimeZone).format();
    return utcTimezoneDate;
  }, [currentTimeZone]);
  const [groupList, setGroupList] = useState<GroupData[]>([]);
  const [groupDetail, setGroupDetail] = useState<GroupData | null>(null);
  const [selectedGroup, setSelectedGroup] =
    useState<ISalesGroupDetail | null>(null);

  // Fetch rate codes once for the context
  const [getRateCodeByPropertyId, { data: rateCodeList }] =
    useGetRateCodeByPropertyIdMutation();

  const { users } = useAuth();

  useEffect(() => {
    if (users?.defaultPropertyId) {
      getRateCodeByPropertyId({ propertyId: users.defaultPropertyId });
    }
  }, [users?.defaultPropertyId, getRateCodeByPropertyId]);

  // Compute rate code name from selectedGroup.rate_code_id
  const rateCodeName = useMemo(() => {
    if (!selectedGroup?.rate_code_id || !rateCodeList) return null;
    const rateCode = rateCodeList.find(
      (r) => r.id === selectedGroup.rate_code_id
    );
    return rateCode?.name ?? null;
  }, [rateCodeList, selectedGroup?.rate_code_id]);
  const [metrics, setMetrics] = useState<MetricData>({
    occupancy: "0%",
    averageRate: "$0.00",
    revPar: "$0.00",
    revenueToday: "$0",
    revenueMTD: "$0",
    revenueYTD: "$0",
    revenueLY: "$0",
  });
  const [salesDistribution, setSalesDistribution] = useState<ChartItem[]>([]);
  const [marketSegments, setMarketSegments] = useState<ChartItem[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  const [visibleDays, setVisibleDays] = useState(7);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(timezoneCurrentDate),
    endDate: new Date(
      moment(new Date(timezoneCurrentDate)).add(13, "d").format()
    ),
  });
  const [dateColumns, setDateColumns] = useState<string[]>([]);

  useEffect(() => {
    // Simulate async API calls here
    setMetrics({
      occupancy: "4.7%",
      averageRate: "$3.46",
      revPar: "$221.42",
      revenueToday: "$3,820",
      revenueMTD: "$18,109",
      revenueYTD: "$39,258",
      revenueLY: "$77,258",
    });
    setSalesDistribution(salesDistributionData);
    setMarketSegments(marketSegmentData);
  }, []);

  useEffect(() => {
    if (params?.id) {
      const groupId = Number(params.id);
      const group = groupList.find((g) => g.id === groupId);
      setGroupDetail(group ?? null);
    }
  }, [params?.id, groupList]);

  const updateVisibleDays = useCallback(() => {
    const containerWidth =
      containerRef.current?.offsetWidth || window.innerWidth;

    const computed = Math.floor((containerWidth - 10) / CELL_MIN_WIDTH);
    const next = computed;

    setVisibleDays((prev) => (prev !== next ? next : prev));
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

  useEffect(() => {
    setDateRange((prev) => ({
      startDate: prev.startDate,
      endDate: moment(prev.startDate)
        .add(visibleDays - 1, "days")
        .toDate(),
    }));
  }, [visibleDays]);

  useEffect(() => {
    const totalDays =
      moment(dateRange.endDate).diff(moment(dateRange.startDate), "days") + 1;
    const days = Array.from({ length: totalDays }, (_, i) =>
      moment(dateRange.startDate).add(i, "days").format("YYYY-MM-DD")
    );
    setDateColumns(days);
  }, [dateRange]);

  const handleAddEvent = useCallback((event: Event) => {
    setEvents((prev) => [...prev, event]);
  }, []);

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

  const onRefresh = useCallback(() => {
    if (params?.id) {
      const groupId = Number(params.id);
      const group = groupList.find((g) => g.id === groupId);
      setGroupDetail(group ?? null);
    }
  }, [params?.id, groupList]);

  const setAllEvents = useCallback((newEvents: Event[]) => {
    setEvents(newEvents);
  }, []);

  return (
    <SalesDashboardContext.Provider
      value={{
        containerRef,
        groupList,
        metrics,
        salesDistribution,
        marketSegments,
        events,
        dateColumns,
        visibleDays,
        groupDetail,
        startDate: dateRange.startDate,
        setStartDate: (value) => onDateChange(value, "start"),
        addEvent: handleAddEvent,
        setAllEvents,
        onRefresh,
        selectedGroup,
        setSelectedGroup,
        rateCodeName,
      }}
    >
      {children}
    </SalesDashboardContext.Provider>
  );
};
