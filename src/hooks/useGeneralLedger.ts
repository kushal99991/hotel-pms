import { useCallback, useEffect, useMemo, useState } from "react";
import useAuth from "hooks/useAuth";
import {
  useLazyGetReportDailyRevenueQuery,
  DailyRevenueFilterType,
} from "services/reportSlice";
import { IDailyRevenueData } from "types/salesTypes";

const useGeneralLedger = () => {
  const { users } = useAuth();
  const [getReportDailyRevenue, { data: reportDailyRevenue, isLoading }] =
    useLazyGetReportDailyRevenueQuery();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filter, setFilter] = useState(DailyRevenueFilterType.DAY);
  const [chartView, setChartView] = useState<"top" | "all">("top");
  const [topCount, setTopCount] = useState(10);
  const [showBars, setShowBars] = useState(true);
  const [showLines, setShowLines] = useState(true);
  const [mockRevenueData, setMockRevenueData] = useState<IDailyRevenueData[]>(
    []
  );

  useEffect(() => {
    if (users?.defaultPropertyId) fetchReportDailyRevenue();
  }, [users?.defaultPropertyId, filter]);

  const fetchReportDailyRevenue = useCallback(async () => {
    const response = await getReportDailyRevenue({
      filter_type: filter,
      property_id: users?.defaultPropertyId,
    });

    if (!response?.error) {
      const sources = response?.data?.data ?? [];
      const sortedSources = [...sources].sort((a, b) => {
        const maxA = Math.max(
          +a.today,
          +a.month_to_date,
          +a.last_year_mtd,
          +a.year_to_date,
          +a.last_year_to_date
        );
        const maxB = Math.max(
          +b.today,
          +b.month_to_date,
          +b.last_year_mtd,
          +b.year_to_date,
          +b.last_year_to_date
        );
        return maxB - maxA;
      });
      setMockRevenueData(sortedSources);
    }
  }, [filter, users?.defaultPropertyId]);

  const totals = useMemo(() => {
    return mockRevenueData.reduce(
      (acc, row) => {
        acc.today += row.today;
        acc.mtd += row.month_to_date;
        acc.last_year_mtd += row.last_year_mtd;
        acc.ytd += row.year_to_date;
        acc.last_year_ytd += row.last_year_to_date;
        return acc;
      },
      { today: 0, mtd: 0, last_year_mtd: 0, ytd: 0, last_year_ytd: 0 }
    );
  }, [mockRevenueData]);

  const paginatedRows = useMemo(() => {
    return mockRevenueData.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [page, rowsPerPage, mockRevenueData]);

  const groupedData = useMemo(() => {
    const sortedData = [...mockRevenueData].sort(
      (a, b) => b.month_to_date - a.month_to_date
    );
    if (chartView === "top") {
      const topItems = sortedData.slice(0, topCount);
      const otherItems = sortedData.slice(topCount);
      if (otherItems.length) {
        const othersTotal = otherItems.reduce(
          (acc, item) => ({
            name: `Others (${otherItems.length} codes)`,
            today: acc.today + item.today,
            month_to_date: acc.month_to_date + item.month_to_date,
            last_year_mtd: acc.last_year_mtd + item.last_year_mtd,
            year_to_date: acc.year_to_date + item.year_to_date,
            last_year_to_date: acc.last_year_to_date + item.last_year_to_date,
          }),
          {
            name: "",
            today: 0,
            month_to_date: 0,
            last_year_mtd: 0,
            year_to_date: 0,
            last_year_to_date: 0,
          }
        );
        return [...topItems, othersTotal];
      }
      return topItems;
    }
    return sortedData;
  }, [chartView, topCount, mockRevenueData]);

  const chartData = groupedData.map((item) => ({
    name: item.name.trim().substring(0, 4).toUpperCase(),
    fullName: item.name,
    Today: item.today ?? 0,
    "Month To Date": item.month_to_date ?? 0,
    "Last Year MTD": item.last_year_mtd,
    "Year To Date": item.year_to_date,
    "Last Year YTD": item.last_year_to_date,
  }));

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getVariancePercentage = (current: number, previous: number): number => {
    if (!previous) return current ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const colors = {
    Today: "#0f4c81", // Dark Blue (mountain)
    "Month To Date": "#f4a300", // Orange/Gold (outer ring)
    "Last Year MTD": "#a0522d", // Brown/Rust (land)
    "Year To Date": "#1ca9c9", // Light Blue/Teal (river)
    "Last Year YTD": "#b22222", // Red/Maroon (cliffs)
  };

  const summaryCards = [
    {
      label: "Today",
      value: totals.today,
      color: colors["Today"],
    },
    {
      label: "Month To Date",
      value: totals.mtd,
      color: colors["Month To Date"],
    },
    {
      label: "Last Year MTD",
      value: totals.last_year_mtd,
      color: colors["Last Year MTD"],
    },
    {
      label: "Year To Date",
      value: totals.ytd,
      color: colors["Year To Date"],
    },
    {
      label: "Last Year YTD",
      value: totals.last_year_ytd,
      color: colors["Last Year YTD"],
    },
  ];

  return {
    isLoading,
    reportDailyRevenue,
    mockRevenueData,
    totals,
    paginatedRows,
    chartData,
    filter,
    setFilter,
    chartView,
    setChartView,
    topCount,
    setTopCount,
    showBars,
    setShowBars,
    showLines,
    setShowLines,
    page,
    rowsPerPage,
    colors,
    summaryCards,
    handleChangePage,
    handleChangeRowsPerPage,
    getVariancePercentage,
  };
};

export default useGeneralLedger;
