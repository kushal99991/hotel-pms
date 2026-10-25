import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MessageResult } from "types/serviceSocket";
import { IReservationStatusEnum } from "types/settingTypes";

interface StatusEnumState {
  reservationStatusList: IReservationStatusEnum[];
  notifications: MessageResult[];
  unreadCount: number;
}

const initialState: StatusEnumState = {
  reservationStatusList: [],
  notifications: [],
  unreadCount: 0,
};

const statusListSlice = createSlice({
  name: "statusListSlice",
  initialState,
  reducers: {
    setReservationStatus: (
      state: StatusEnumState,
      action: PayloadAction<IReservationStatusEnum[]>
    ) => {
      state.reservationStatusList = action.payload;
    },
    addNotification: (state, action: PayloadAction<MessageResult>) => {
      state.notifications.push(action.payload);
      state.unreadCount += 1;
    },
    setNotifications: (state, action: PayloadAction<MessageResult[]>) => {
      state.notifications = action.payload;
      state.unreadCount = action.payload.length;
    },
    resetUnreadCount: (state) => {
      state.unreadCount = 0;
    },
    updateNotificationInList: (state, action) => {
      const updated = action.payload;
      if (!Array.isArray(state.notifications)) {
        console.warn("Expected notifications to be an array");
        return;
      }

      const index = state.notifications.findIndex((n) => n.id === updated.id);
      console.log(updated, state.notifications, "index");
      if (index !== -1) {
        state.notifications[index] = {
          ...state.notifications[index],
          ...updated,
          data: {
            ...state.notifications[index].data,
            ...updated.data,
          },
        };
      }
    },
  },
});

export const {
  setReservationStatus,
  addNotification,
  setNotifications,
  resetUnreadCount,
  updateNotificationInList,
} = statusListSlice.actions;
export default statusListSlice.reducer;
