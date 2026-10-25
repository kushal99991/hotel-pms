import roomTypeSlice from "services/roomTypeSlice";
import roomSlice from "services/roomSlice";
import paymentsSlice from "services/paymentsSlice";
import reservationSlice from "services/reservationSlice";
import propertySlice from "services/propertySlice";
import organizationSlice from "services/organizationSlice";
import guestSlice from "services/guestSlice";
import houseKeeperSlice from "services/houseKeeperSlice";
import maintenanceSlice from "services/maintenanceSlice";
import emailTemplateSlice from "services/emailTemplateSlice";
import financeSlice from "services/financeSlice";
import dashboardSlice from "services/dashboardSlice";
import authSlice from "services/authSlice";
import historySlice from "services/historySlice";
import settingSlice from "services/settingSlice";
import storage from "redux-persist/lib/storage";
import { persistStore, persistReducer } from "redux-persist";
import { combineReducers } from "redux";
import { setupListeners } from "@reduxjs/toolkit/query";
import { configureStore } from "@reduxjs/toolkit";

import themeSlice from "./slice/theme.slice";
import applicationModeSlice from "./slice/applicationModeSlice";
import authReducer from "./slice/auth.slice";
import statusListSlice from "./slice/statusList.slice";
import userSlice from "services/userSlice";
import roleSlice from "services/roleSlice";
import salesSlice from "services/salesSlice";
import departmentSlice from "services/departmentSlice";
import propertyMediaSlice from "services/propertyMediaSlice";
import roomAmenitiesSlice from "services/roomAmenitiesSlice";
import nightAuditSlice from "services/nightAuditSlice";
import nightAuditReducer from "store/slice/nightAuditStateSlice";
import roomRateSlice from "services/roomRateSlice";
import fastChargeSlice from "services/fastChargeSlice";
import serviceRequestSlice from "services/serviceRequestSlice";
import inventorySlice from "services/inventorySlice";
import accountSlice from "services/accountingSlice";
import statusEnumSlice from "services/statusEnumSlice";
import socketServiceSlice from "services/socketServiceSlice";
import reportSlice from "services/reportSlice";
import metricsSlice from "services/metricsSlice";
import postingCodeSlice from "services/postingCodeSlice";

const appReducer = combineReducers({
  theme: themeSlice,
  auth: authReducer,
  nightAudit: nightAuditReducer,
  applicationMode: applicationModeSlice,
  statusList: statusListSlice,
  [authSlice.reducerPath]: authSlice.reducer,
  [guestSlice.reducerPath]: guestSlice.reducer,
  [houseKeeperSlice.reducerPath]: houseKeeperSlice.reducer,
  [maintenanceSlice.reducerPath]: maintenanceSlice.reducer,
  [dashboardSlice.reducerPath]: dashboardSlice.reducer,
  [organizationSlice.reducerPath]: organizationSlice.reducer,
  [propertySlice.reducerPath]: propertySlice.reducer,
  [roomTypeSlice.reducerPath]: roomTypeSlice.reducer,
  [reservationSlice.reducerPath]: reservationSlice.reducer,
  [emailTemplateSlice.reducerPath]: emailTemplateSlice.reducer,
  [financeSlice.reducerPath]: financeSlice.reducer,
  [roomSlice.reducerPath]: roomSlice.reducer,
  [paymentsSlice.reducerPath]: paymentsSlice.reducer,
  [userSlice.reducerPath]: userSlice.reducer,
  [roleSlice.reducerPath]: roleSlice.reducer,
  [salesSlice.reducerPath]: salesSlice.reducer,
  [departmentSlice.reducerPath]: departmentSlice.reducer,
  [propertyMediaSlice.reducerPath]: propertyMediaSlice.reducer,
  [roomAmenitiesSlice.reducerPath]: roomAmenitiesSlice.reducer,
  [nightAuditSlice.reducerPath]: nightAuditSlice.reducer,
  [roomRateSlice.reducerPath]: roomRateSlice.reducer,
  [fastChargeSlice.reducerPath]: fastChargeSlice.reducer,
  [serviceRequestSlice.reducerPath]: serviceRequestSlice.reducer,
  [historySlice.reducerPath]: historySlice.reducer,
  [inventorySlice.reducerPath]: inventorySlice.reducer,
  [settingSlice.reducerPath]: settingSlice.reducer,
  [accountSlice.reducerPath]: accountSlice.reducer,
  [statusEnumSlice.reducerPath]: statusEnumSlice.reducer,
  [socketServiceSlice.reducerPath]: socketServiceSlice.reducer,
  [reportSlice.reducerPath]: reportSlice.reducer,
  [metricsSlice.reducerPath]: metricsSlice.reducer,
  [postingCodeSlice.reducerPath]: postingCodeSlice.reducer,
});

const rootReducer = (state: S, action: A) => {
  return appReducer(state, action);
};

const persistConfig = {
  key: "root",
  storage,
  whitelist: [
    dashboardSlice.reducerPath,
    authSlice.reducerPath,
    "auth",
    "nightAudit",
    "statusList",
  ],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: process.env.NODE_ENV === "production" && {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
      immutableCheck: process.env.NODE_ENV === "production",
    }).concat(
      guestSlice.middleware,
      houseKeeperSlice.middleware,
      maintenanceSlice.middleware,
      dashboardSlice.middleware,
      organizationSlice.middleware,
      propertySlice.middleware,
      authSlice.middleware,
      roomTypeSlice.middleware,
      reservationSlice.middleware,
      emailTemplateSlice.middleware,
      financeSlice.middleware,
      roomSlice.middleware,
      paymentsSlice.middleware,
      userSlice.middleware,
      roleSlice.middleware,
      salesSlice.middleware,
      departmentSlice.middleware,
      propertyMediaSlice.middleware,
      roomAmenitiesSlice.middleware,
      nightAuditSlice.middleware,
      roomRateSlice.middleware,
      fastChargeSlice.middleware,
      serviceRequestSlice.middleware,
      historySlice.middleware,
      inventorySlice.middleware,
      settingSlice.middleware,
      accountSlice.middleware,
      statusEnumSlice.middleware,
      socketServiceSlice.middleware,
      reportSlice.middleware,
      metricsSlice.middleware,
      postingCodeSlice.middleware
    ),
});

const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;

setupListeners(store.dispatch);
export { store, persistor };
