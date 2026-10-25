import { useCallback, useEffect, useState } from "react";
import useAuth from "./useAuth";
import { useGetHistoryByIdMutation } from "services/historySlice";
import { IHistory } from "types/historyTypes";
import { useUsersQuery } from "services/userSlice";

export interface IUserActivity {
  user: string;
  role: string;
  lastLogin: string;
  actions: number;
  status: string;
}

export interface ISystemPerformance {
  metric: string;
  value: number;
  status: string;
}

const useAdmistrationReports = () => {
  const { users } = useAuth();
  const [userActivity, setuserActivity] = useState<IHistory[]>([]);
  const [systemPerformance, setSystemPerformance] = useState<
    ISystemPerformance[]
  >([]);

  const [getHistoryById] = useGetHistoryByIdMutation();
  const { data: userList = [] } = useUsersQuery();

  useEffect(() => {
    if (users?.defaultPropertyId) {
      onRefresh();
    }
  }, [users?.defaultPropertyId]);

  const prettify = (action: string) =>
    // convert “room_type_created” → “Room Type Created”
    action
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  /** Pick a status label from the action’s share of total activity */
  const getStatus = (pct: number): string => {
    if (pct >= 50) return "Excellent";
    if (pct >= 25) return "Good";
    if (pct > 0) return "Low";
    return "None";
  };

  const buildSystemPerformance = (
    history: IHistory[]
  ): ISystemPerformance[] => {
    const totals: Record<string, number> = {};
    history.forEach(({ action = "unknown" }) => {
      totals[action] = (totals[action] ?? 0) + 1;
    });

    const totalCnt = history.length || 1;

    const metrics = Object.entries(totals).map(([action, count]) => {
      const pct = Math.round((count / totalCnt) * 100);

      return {
        metric: prettify(action),
        value: pct,
        status: getStatus(pct),
      };
    });

    metrics.unshift({
      metric: "Overall System Performance",
      value: Math.min(100, totalCnt * 2),
      status: totalCnt > 20 ? "Excellent" : totalCnt > 10 ? "Good" : "Low",
    });

    return metrics;
  };

  const onRefresh = useCallback(async () => {
    const [historyRespose] = await Promise.all([
      getHistoryById({
        property_id: users?.defaultPropertyId ?? 0,
      }),
    ]);
    const historyList = historyRespose?.data ?? [];
    const sortedHistoryData = historyList
      ? [...historyList].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      : [];
    setuserActivity(sortedHistoryData);
    setSystemPerformance(buildSystemPerformance(sortedHistoryData));
  }, [users?.defaultPropertyId]);

  return {
    userActivity,
    systemPerformance,
    userList,
  };
};

export default useAdmistrationReports;
