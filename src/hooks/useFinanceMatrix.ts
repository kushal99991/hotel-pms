import { useState, useEffect } from "react";
import {
  useGetRoomGuestReadyMutation,
  useGetRoomRevenueMutation,
  useGetRoomSoldMutation,
} from "services/dashboardSlice";

interface FinancialMetrics {
  roomsSoldOutOfAvailable: string;
  occupancyPercentage: string;
  revenue: number;
  adr: string;
  isLoading?: boolean;
  error?: string;
}

interface MetricResponse {
  num: number;
  date: string;
  status: string;
  customStatus: string;
}

export const useFinancialMetrics = (propertyId: number, date: string) => {
  const [getRoomGuestReady] = useGetRoomGuestReadyMutation();
  const [getRoomRevenue] = useGetRoomRevenueMutation();
  const [getRoomSold] = useGetRoomSoldMutation();

  const [metrics, setMetrics] = useState<FinancialMetrics>({
    roomsSoldOutOfAvailable: "",
    occupancyPercentage: "0%",
    revenue: 0,
    adr: "$0",
    isLoading: true,
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      // Fetch all required data in parallel
      const [guestReadyRes, revenueRes, soldRes] = await Promise.all([
        getRoomGuestReady({ date, propertyId }),
        getRoomRevenue({ date, propertyId }),
        getRoomSold({ date, propertyId }),
      ]);

      const guestReady = guestReadyRes.data as MetricResponse;
      const revenue = revenueRes.data as MetricResponse;
      const sold = soldRes.data as MetricResponse;

      // Calculate metrics
      const adr = guestReady.num ? revenue.num / guestReady.num : 0;
      const occupancyRate = guestReady.num
        ? (sold.num / guestReady.num) * 100
        : 0;

      setMetrics({
        roomsSoldOutOfAvailable: `${sold.num} of ${guestReady.num}`,
        occupancyPercentage: `${occupancyRate.toFixed(1)}%`,
        revenue: revenue.num,
        adr: `$${adr.toFixed(2)}`,
        isLoading: false,
      });
    };

    fetchMetrics();
  }, [propertyId, date]);

  return metrics;
};
