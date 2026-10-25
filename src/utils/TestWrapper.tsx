import React, { ReactNode } from "react";
import { combineReducers } from "redux";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";

import { configureStore } from "@reduxjs/toolkit";

import ThemeProvider from "../ThemeProvider";
import { SnackbarProvider } from "contexts/SnackbarContext";
import { CommandPaletteProvider } from "contexts/CommandPaletteContext";
import { IProperty } from "types/property";
import TestWrapperSocket from "./TestWrapperSocket";

const guestSlice = jest.requireActual("services/guestSlice").default;
const dashboardSlice = jest.requireActual("services/dashboardSlice").default;
const themeSlice = jest.requireActual("store/slice/theme.slice").default;
const applicationModeSlice = jest.requireActual(
  "store/slice/applicationModeSlice"
).default;
const statusListSlice = jest.requireActual(
  "store/slice/statusList.slice"
).default;
const authSlice = jest.requireActual("services/authSlice").default;
const organizationSlice = jest.requireActual(
  "services/organizationSlice"
).default;
const statusEnumSlice = jest.requireActual("services/statusEnumSlice").default;
const propertySlice = jest.requireActual("services/propertySlice").default;
const roomTypeSlice = jest.requireActual("services/roomTypeSlice").default;
const salesSlice = jest.requireActual("services/salesSlice").default;
const reservationSlice = jest.requireActual(
  "services/reservationSlice"
).default;
const emailTemplateSlice = jest.requireActual(
  "services/emailTemplateSlice"
).default;
const roomSlice = jest.requireActual("services/roomSlice").default;
const houseKeeperSlice = jest.requireActual(
  "services/houseKeeperSlice"
).default;
const authReducer = jest.requireActual("store/slice/auth.slice").default;
const nightAuditReducer = jest.requireActual(
  "store/slice/nightAuditStateSlice"
).default;
const roomAmenitiesSlice = jest.requireActual(
  "services/roomAmenitiesSlice"
).default;
const nightAuditSlice = jest.requireActual("services/nightAuditSlice").default;
const roomRateSlice = jest.requireActual("services/roomRateSlice").default;
const fastChargeSlice = jest.requireActual("services/fastChargeSlice").default;
const paymentsSlice = jest.requireActual("services/paymentsSlice").default;
const serviceRequestSlice = jest.requireActual(
  "services/serviceRequestSlice"
).default;
const financeSlice = jest.requireActual("services/financeSlice").default;
const historySlice = jest.requireActual("services/historySlice").default;
const accountSlice = jest.requireActual("services/accountingSlice").default;
const settingSlice = jest.requireActual("services/settingSlice").default;
const postingCodeSlice = jest.requireActual("services/postingCodeSlice").default;

export const mockUserSession = {
  id: 1,
  email: "user[at]example.com",
  name: "John Doe",
  userName: "johndoe",
  firstName: "John",
  lastName: "Doe",
  image: "path/to/image.jpg",
  isActive: true,
  isVerified: true,
  defaultPropertyId: 1,
  timezone: "America/Los_Angeles",
  userDepartment: "Sales",
  department: { departmentName: "Sales", id: 1 },
  roles: [
    { id: 1, name: "sudo", description: "Super Admin access" },
    { id: 2, name: "Admin", description: "Admin access" },
  ],
  lastLoginAt: new Date().toISOString(),
  accessToken: "mockAccessToken",
  domain: "example.com",
};

export const mockPropertyList: IProperty[] = [
  {
    id: 1,
    logo: "https://example.com/logo1.png",
    timezone: "America/Los_Angeles",
    is_active: true,
    organization_id: 101,
    checkin_time: "15:00",
    checkout_time: "11:00",
    max_stay_duration_days: 30,
    cancellation_policy: "Flexible",
    cancellation_policy_duration_days: 3,
    created_at: "2024-01-01T10:00:00Z",
    updated_at: "2024-06-01T15:00:00Z",
    parent_organization: {
      name: "Global Hospitality Group",
      phone: "+1-555-1234",
      address: "123 Main Street, New York, NY",
      email: "contact[at]globalhospitality.com",
      description: "A leading group in hospitality management.",
      logo: "https://example.com/org1-logo.png",
    },
    rating_avg: 4.5,
    rating_star: 5,
    price_avg: "$150",
    tax_rate: 10,
    floor_count: 10,
    room_count: 200,
    occupancy_count: 150,
    name: "Luxury New York Hotel",
    description: "A top-rated luxury hotel in the heart of New York City.",
  },
  {
    id: 2,
    logo: "https://example.com/logo2.png",
    timezone: "America/Los_Angeles",
    is_active: false,
    organization_id: 102,
    checkin_time: "14:00",
    checkout_time: "10:00",
    max_stay_duration_days: 15,
    cancellation_policy: "Strict",
    cancellation_policy_duration_days: 7,
    created_at: "2023-05-15T09:00:00Z",
    updated_at: "2024-05-15T14:00:00Z",
    parent_organization: {
      name: "Continental Hotels",
      phone: "+44-20-7946-0958",
      address: "456 Queen's Street, London, UK",
      email: "info[at]continentalhotels.co.uk",
      description: "Luxury hotels across Europe.",
      logo: "https://example.com/org2-logo.png",
    },
    rating_avg: 4.2,
    rating_star: 4,
    price_avg: "$200",
    tax_rate: 12,
    floor_count: 8,
    room_count: 100,
    occupancy_count: 80,
    name: "Elegant London Suites",
    description: "Modern suites offering unmatched comfort in London.",
  },
  {
    id: 3,
    logo: "https://example.com/logo3.png",
    timezone: "America/Los_Angeles",
    is_active: true,
    organization_id: 103,
    checkin_time: "16:00",
    checkout_time: "12:00",
    max_stay_duration_days: 20,
    cancellation_policy: "Moderate",
    cancellation_policy_duration_days: 5,
    created_at: "2022-08-20T08:00:00Z",
    updated_at: "2024-06-10T10:00:00Z",
    parent_organization: {
      name: "Pacific Resorts",
      phone: "+81-3-1234-5678",
      address: "789 Sakura Lane, Tokyo, Japan",
      email: "support[at]pacificresorts.jp",
      description: "Exclusive resorts in the Pacific region.",
      logo: "https://example.com/org3-logo.png",
    },
    rating_avg: 4.8,
    rating_star: 5,
    price_avg: "$300",
    tax_rate: 8,
    floor_count: 12,
    room_count: 250,
    occupancy_count: 200,
    name: "Tokyo Sakura Inn",
    description: "Experience the charm of Tokyo with unmatched hospitality.",
  },
];

const mockStore = configureStore({
  reducer: combineReducers({
    [guestSlice.reducerPath]: guestSlice.reducer,
    [dashboardSlice.reducerPath]: dashboardSlice.reducer,
    theme: themeSlice,
    applicationMode: applicationModeSlice,
    auth: authReducer,
    nightAudit: nightAuditReducer,
    statusList: statusListSlice,
    [authSlice.reducerPath]: authSlice.reducer,
    [guestSlice.reducerPath]: guestSlice.reducer,
    [dashboardSlice.reducerPath]: dashboardSlice.reducer,
    [organizationSlice.reducerPath]: organizationSlice.reducer,
    [propertySlice.reducerPath]: propertySlice.reducer,
    [roomTypeSlice.reducerPath]: roomTypeSlice.reducer,
    [reservationSlice.reducerPath]: reservationSlice.reducer,
    [emailTemplateSlice.reducerPath]: emailTemplateSlice.reducer,
    [roomSlice.reducerPath]: roomSlice.reducer,
    [salesSlice.reducerPath]: salesSlice.reducer,
    [houseKeeperSlice.reducerPath]: houseKeeperSlice.reducer,
    [roomAmenitiesSlice.reducerPath]: roomAmenitiesSlice.reducer,
    [nightAuditSlice.reducerPath]: nightAuditSlice.reducer,
    [roomRateSlice.reducerPath]: roomRateSlice.reducer,
    [fastChargeSlice.reducerPath]: fastChargeSlice.reducer,
    [paymentsSlice.reducerPath]: paymentsSlice.reducer,
    [serviceRequestSlice.reducerPath]: serviceRequestSlice.reducer,
    [financeSlice.reducerPath]: financeSlice.reducer,
    [historySlice.reducerPath]: historySlice.reducer,
    [accountSlice.reducerPath]: accountSlice.reducer,
    [settingSlice.reducerPath]: settingSlice.reducer,
    [statusEnumSlice.reducerPath]: statusEnumSlice.reducer,
    [postingCodeSlice.reducerPath]: postingCodeSlice.reducer,
  }),
  middleware: (getDefaultMiddleware: T) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }).concat(
      guestSlice.middleware,
      dashboardSlice.middleware,
      organizationSlice.middleware,
      propertySlice.middleware,
      authSlice.middleware,
      roomTypeSlice.middleware,
      reservationSlice.middleware,
      emailTemplateSlice.middleware,
      houseKeeperSlice.middleware,
      roomSlice.middleware,
      roomAmenitiesSlice.middleware,
      nightAuditSlice.middleware,
      salesSlice.middleware,
      roomRateSlice.middleware,
      fastChargeSlice.middleware,
      paymentsSlice.middleware,
      serviceRequestSlice.middleware,
      financeSlice.middleware,
      historySlice.middleware,
      accountSlice.middleware,
      settingSlice.middleware,
      statusEnumSlice.middleware,
      postingCodeSlice.middleware
    ),
});

// TestWrapper component
interface TestWrapperProps {
  children: ReactNode;
}
jest.mock("contexts/SnackbarContext", () => ({
  ...jest.requireActual("contexts/SnackbarContext"),
  useSnackbar: jest.fn(),
}));

const TestWrapper: React.FC<TestWrapperProps> = ({ children }) => {
  return (
    <Provider store={mockStore}>
      <BrowserRouter>
        <TestWrapperSocket>
          <ThemeProvider>
            <SnackbarProvider>
              <CommandPaletteProvider>{children}</CommandPaletteProvider>
            </SnackbarProvider>
          </ThemeProvider>
        </TestWrapperSocket>
      </BrowserRouter>
    </Provider>
  );
};

export default TestWrapper;
