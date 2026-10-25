import { useEffect, useCallback, useState, useMemo } from "react";
import { useSocket } from "contexts/SocketContext";
import { useDispatch, useSelector } from "react-redux";
import {
  useGetNotificationListMutation,
  useLazyGetNotificationDetailQuery,
  useSendNotificationMutation,
  useUpdateNotificationMutation,
} from "services/socketServiceSlice";
import { RootState } from "store/store";
import {
  ISendNotificationRequest,
  IMessageAlertRequest,
  MessageResult,
} from "types/serviceSocket";
import {
  addNotification,
  resetUnreadCount,
  setNotifications,
  // updateNotificationInList,
} from "store/slice/statusList.slice";
import { appConfig } from "config/app.config";
import useAuth from "./useAuth";
import useSnackbar from "./useSnackbar";

export const useNotification = () => {
  const [latestMessage, setLatestMessage] = useState<string | null>(null);
  const { socket } = useSocket();
  const { users } = useAuth();
  const dispatch = useDispatch();
  const { openSnackbar } = useSnackbar();

  const notifications = useSelector(
    (state: RootState) => state.statusList.notifications
  );
  const unreadCount = useMemo(() => {
    return (
      notifications.filter(
        (a) => !a.data?.read // if read is missing or false → unread
      )?.length ?? 0
    );
  }, [notifications]);

  const [getNotificationList, { isLoading }] = useGetNotificationListMutation();
  const [sendNotificationMutation] = useSendNotificationMutation();
  const [getNotificationDetail] = useLazyGetNotificationDetailQuery();
  const [updateNotificationMutation] = useUpdateNotificationMutation();

  const fetchNotifications = useCallback(
    async (params: IMessageAlertRequest) => {
      try {
        const response = await getNotificationList(params);
        if (response?.error) {
          return false;
        }
        // const notificationList = response?.data?.results ?? [];
        dispatch(setNotifications(response?.data?.results ?? []));
      } catch {
        /** empty catch error */
      }
    },
    [getNotificationList, dispatch]
  );

  const sendNotification = async (payload: ISendNotificationRequest) => {
    try {
      await sendNotificationMutation(payload).unwrap();
    } catch {
      /** empty catch error */
    }
  };

  const fetchNotificationDetail = async (id: string) => {
    try {
      const response = await getNotificationDetail(id);
      if (response?.error) {
        return null;
      }
      return response.data;
    } catch (err) {
      console.error("Error fetching notification detail:", err);
      return null;
    }
  };

  const updateNotification = useCallback(
    async (data: Partial<ISendNotificationRequest>) => {
      const notificationId = data?.id ?? "";
      const response = await updateNotificationMutation(data);
      if (response?.error) {
        openSnackbar(response.error as string, "error");
        return false;
      }
      if (response.data) {
        const index = notifications.findIndex((a) => a.id === notificationId);

        if (index !== -1) {
          const updatedNotifications = [...notifications];
          updatedNotifications[index] = response.data;

          dispatch(setNotifications(updatedNotifications));
        }

        // dispatch(updateNotificationInList(response.data));
      }

      return response.data;
    },
    [notifications]
  );

  const handleReceiveAlert = useCallback(
    (data: MessageResult) => {
      dispatch(addNotification(data));
      if (data?.message) {
        setLatestMessage(data.message);
      }
      const domain = appConfig.getCookie(appConfig.domainName);
      if (domain) {
        const roomName = `${domain}-org-${users?.id}-property-${users?.defaultPropertyId}`;
        fetchNotifications({ room: roomName });
      }
    },
    [dispatch]
  );

  useEffect(() => {
    if (!socket) return;

    socket.on("receive-alert", handleReceiveAlert);
    return () => {
      socket.off("receive-alert", handleReceiveAlert);
    };
  }, [socket, handleReceiveAlert]);

  return {
    notifications,
    unreadCount,
    latestMessage,
    isLoading,
    fetchNotifications,
    sendNotification,
    updateNotification,
    fetchNotificationDetail,
    resetUnread: () => dispatch(resetUnreadCount()),
    clearLatestMessage: () => setLatestMessage(null),
  };
};
