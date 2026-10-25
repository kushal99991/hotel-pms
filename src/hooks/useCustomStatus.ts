import { useMemo } from "react";
import { useGetHousekeeperEnumsListQuery } from "services/houseKeeperSlice";
import useAuth from "./useAuth";
import { useGetSettingsQuery } from "services/settingSlice";
import { ICustomRoomStatus } from "constants/room";
import { IReservationStatusEnumOptions } from "types/settingTypes";
import { reservationStatusDisplayValues } from "constants/reservation";

const useCustomStatus = () => {
  const { users, statusList } = useAuth();
  const { data, isLoading, isError } = useGetHousekeeperEnumsListQuery();
  const { data: roomSettingList } = useGetSettingsQuery({
    property_id: users?.defaultPropertyId ?? 0,
  });

  const roomStatus = useMemo(() => {
    const statuses = (roomSettingList ?? []).filter(
      (a) => a.key === "ROOMSTATUS"
    );

    return statuses.reduce(
      (acc, curr) => {
        const key = curr.value as ICustomRoomStatus;

        acc[key] = {
          label: curr?.type ?? "",
          info: curr.info,
          color: curr.rule?.color ?? "#000000",
        };

        return acc;
      },
      {} as Partial<
        Record<
          ICustomRoomStatus,
          { label: string; info: string; color: string }
        >
      >
    );
  }, [roomSettingList]);

  // Transform the API response dynamically
  const statuses = useMemo(() => {
    if (!data) return {};

    return {
      HousekeepingStatusEnum: data.house_keeping.reduce(
        (acc, { name, full_name }) => {
          acc[name] = full_name;
          return acc;
        },
        {} as Record<string, string>
      ),

      HousekeepingApplicableEnum: data.house_keeping_applicable.reduce(
        (acc, { name, full_name }) => {
          acc[name] = full_name;
          return acc;
        },
        {} as Record<string, string>
      ),

      // New enum for housekeeping services
      HousekeepingServiceEnum: data.house_keeping_service || [],
      // Also provide the raw service data for more complete access
      HousekeepingServices: data.house_keeping_service || [],

      FrontdeskStatusEnum: data.front_desk.reduce(
        (acc, { name, full_name }) => {
          acc[name] = full_name;
          return acc;
        },
        {} as Record<string, string>
      ),

      BoardActivityEnum: data.board_activity.reduce(
        (acc, { name, description }) => {
          acc[name] = description;
          return acc;
        },
        {} as Record<string, string>
      ),

      TaskInspectionStatusEmum: data.task_inspection_status.reduce(
        (acc, { name, description }) => {
          acc[name] = description;
          return acc;
        },
        {} as Record<string, string>
      ),

      TaskPriorityEnum: data.task_priority.reduce(
        (acc, { name, description }) => {
          acc[name] = description;
          return acc;
        },
        {} as Record<string, string>
      ),

      TaskStatusEnum: data.task_status.reduce(
        (acc, { name, description }) => {
          acc[name] = description;
          return acc;
        },
        {} as Record<string, string>
      ),
    };
  }, [data]);

  const reservationStatusOptions: IReservationStatusEnumOptions[] =
    useMemo(() => {
      const reservationStatusList = statusList.reservationStatusList.map(
        (a) => ({
          label: reservationStatusDisplayValues[a.name]?.label ?? a.name,
          value: a.name,
        })
      );
      return [{ label: "All", value: "All" }, ...reservationStatusList];
    }, [statusList.reservationStatusList]);

  // Return the formatted statuses along with loading and error states
  return {
    statuses,
    roomStatus,
    isLoading,
    isError,
    reservationStatusOptions,
    reservationStatusList: statusList.reservationStatusList,
  };
};

export default useCustomStatus;
