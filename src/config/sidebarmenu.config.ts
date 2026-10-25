import { PathRouteProps } from "react-router-dom";
import { OverridableComponent } from "@mui/material/OverridableComponent";
import { SvgIconTypeMap } from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Apartment as ApartmentIcon,
} from "@mui/icons-material";
import { lazy } from "react";
import { UserRole } from "constants/roles";
import { appConfig } from "./app.config";
import { ReservationStatusEnum } from "constants/reservation";

const Dashboard = lazy(() => import("pages/booking-engine/dashboard/page"));
const AllReportPage = lazy(
  () => import("pages/booking-engine/reports/all-reports/ReportPage")
);
const AdvanceSearchReservationPage = lazy(
  () => import("pages/booking-engine/front-office/advance-search/page")
);
const NewReservation = lazy(
  () => import("pages/booking-engine/front-office/new-reservation/page")
);
const Arrival = lazy(
  () => import("pages/booking-engine/front-office/arrivals/page")
);
const InHouse = lazy(
  () => import("pages/booking-engine/front-office/in-house/page")
);
const Departure = lazy(
  () => import("pages/booking-engine/front-office/departures/page")
);
const ReservationSummary = lazy(
  () => import("pages/booking-engine/reservations/page")
);
const ReservationFolios = lazy(
  () => import("pages/booking-engine/reservations/folios/page")
);
const OccupancyChart = lazy(
  () => import("pages/booking-engine/front-office/tape-chart/page")
);
const RegistrationCard = lazy(
  () => import("pages/booking-engine/reservations/components/RegistrationCard")
);
const RoomsManagementReports = lazy(
  () =>
    import("pages/booking-engine/house-keeping/rooms-management-reports/page")
);
const HousekeepingDashboard = lazy(
  () => import("pages/booking-engine/house-keeping/housekeeping-dashboard/page")
);
const ArchivedBoardsPage = lazy(
  () => import("pages/booking-engine/rooms/archeived-boards/page")
);
const HousekeepingBoardsView = lazy(
  () =>
    import(
      "pages/booking-engine/house-keeping/rooms-management-reports/housekeeper-board-view/page"
    )
);
const HousekeepingBoardUpdate = lazy(
  () =>
    import(
      "pages/booking-engine/house-keeping/rooms-management-reports/edit/page"
    )
);
const RoomsStatusUpdate = lazy(
  () => import("pages/booking-engine/house-keeping/room-status-update/page")
);
const Sales = lazy(() => import("pages/booking-engine/sales"));
const SalesDashboard = lazy(
  () => import("pages/booking-engine/sales/sales-dashboard/page")
);
const GroupRoomingListPage = lazy(
  () => import("pages/booking-engine/sales/rooming-list/GroupRoomingListPage")
);
const SalesGroupForm = lazy(
  () => import("pages/booking-engine/sales/group/SalesGroupForm")
);
const SalesGroupDetail = lazy(
  () => import("pages/booking-engine/sales/sales-group-detail/page")
);
const GroupMasterFolioPage = lazy(
  () => import("pages/booking-engine/sales/folio/GroupMasterFolioPage")
);
const SalesRoomingDetail = lazy(
  () => import("pages/booking-engine/sales/sales-rooming-detail/page")
);
const AddSales = lazy(() => import("pages/booking-engine/sales/add/page"));
const EditSales = lazy(() => import("pages/booking-engine/sales/edit/page"));
const ViewSales = lazy(() => import("pages/booking-engine/sales/salesView"));
const RentalSpaces = lazy(
  () => import("pages/booking-engine/sales/rental-spaces/page")
);
const CreateRentalSpace = lazy(
  () => import("pages/booking-engine/sales/rental-spaces/create/page")
);
const Accounting = lazy(() => import("pages/booking-engine/accounting/page"));
const ARAccounting = lazy(
  () => import("pages/booking-engine/accounting/ar-accounts/page")
);
const SingleAccount = lazy(
  () => import("pages/booking-engine/accounting/account/page")
);
// const AccountsList = lazy(
//   () => import("pages/booking-engine/accounting/accounts/page")
// );
const CreateDBAccount = lazy(
  () => import("pages/booking-engine/accounting/create-account/page")
);
const EditDBAccount = lazy(
  () => import("pages/booking-engine/accounting/account/edit/EditAccount")
);
const InvoiceDetails = lazy(
  () => import("pages/booking-engine/accounting/invoices/InvoiceDetails")
);
const RateManagement = lazy(
  () => import("pages/booking-engine/revenue-management/rate-management/page")
);
const InventoryManagement = lazy(
  () =>
    import("pages/booking-engine/revenue-management/inventory-management/page")
);
const Reports = lazy(() => import("pages/booking-engine/reports/page"));
const HousekeepingBoardsReport = lazy(
  () =>
    import(
      "pages/booking-engine/reports/housekeeping-report/HousekeepingBoards/HousekeepingBoardsReport"
    )
);
// const OccupancyForecastReport = lazy(
//   () => import("pages/booking-engine/reports/occupancy-forecast/page")
// );

const ReportReservation = lazy(
  () => import("pages/booking-engine/reports/reservation/page")
);
const ReportRoomStatusDetail = lazy(
  () => import("pages/booking-engine/reports/room-status-detail/page")
);
const ReportRoomStatusSummary = lazy(
  () => import("pages/booking-engine/reports/room-status-summary/page")
);
const ExpectedDepartures = lazy(
  () => import("pages/booking-engine/reports/expected-departures-reports/page")
);
const ArrivalReports = lazy(
  () => import("pages/booking-engine/reports/arrival-report/page")
);
const ExpectedArrivalReports = lazy(
  () => import("pages/booking-engine/reports/expected-arrival-report/page")
);
// const MaintenanceReports = lazy(
//   () =>
//     import(
//       "pages/booking-engine/reports/housekeeping-report/maintenance-report/page"
//     )
// );
const DepartureReports = lazy(
  () => import("pages/booking-engine/reports/departure-report/page")
);
const InHouseReports = lazy(
  () => import("pages/booking-engine/reports/in-house-report/page")
);
// const ReportDashboard = lazy(
//   () => import("pages/booking-engine/reports/reports-dashboard/page")
// );
// const HighBalanceReport = lazy(
//   () => import("pages/booking-engine/reports/high-balance-report/page")
// );
const AgingReport = lazy(
  () => import("pages/booking-engine/reports/direct-billing/aging-report/page")
);

const NightAudit = lazy(
  () => import("pages/booking-engine/night-audit/list/page")
);

const AddNightAudit = lazy(
  () => import("pages/booking-engine/night-audit/add/page")
);

const UserManagement = lazy(
  () => import("pages/booking-engine/admin/user-management/list/page")
);
const AddUserManagement = lazy(
  () => import("pages/booking-engine/admin/user-management/add/page")
);
const EditUserManagement = lazy(
  () => import("pages/booking-engine/admin/user-management/edit/page")
);
const EditRoleManagement = lazy(
  () => import("pages/booking-engine/admin/user-management/edit/role")
);
const EmailTemplateList = lazy(
  () => import("pages/booking-engine/admin/email-templates/list/page")
);
const AddEmailTemplate = lazy(
  () => import("pages/booking-engine/admin/email-templates/add/page")
);
const AddNewPostingCode = lazy(
  () =>
    import(
      "pages/booking-engine/admin/financial-settings/add/_components/AddNewPostingCode"
    )
);
const EditPostingCode = lazy(
  () =>
    import("pages/booking-engine/admin/financial-settings/edit/editPostingCode")
);
const AddTax = lazy(
  () => import("pages/booking-engine/admin/financial-settings/add/page")
);
const UpdateTax = lazy(
  () => import("pages/booking-engine/admin/financial-settings/edit/page")
);
const AddNewPostConfigureCharge = lazy(
  () =>
    import(
      "pages/booking-engine/admin/financial-settings/add/_components/AddNewPostConfigureCharge"
    )
);
const EditNewPostConfigureCharge = lazy(
  () =>
    import(
      "pages/booking-engine/admin/financial-settings/edit/EditNewPostConfigureCharge"
    )
);
const UpdateFee = lazy(
  () => import("pages/booking-engine/admin/financial-settings/edit/fees")
);
const EditEmailTemplate = lazy(
  () => import("pages/booking-engine/admin/email-templates/edit/page")
);
const PropertySettings = lazy(
  () => import("pages/booking-engine/admin/property-settings/page")
);
const AddPropertyForm = lazy(
  () =>
    import(
      "pages/booking-engine/admin/property-settings/_components/organization/_components/AddPropertyForm"
    )
);
const PropertyAmenities = lazy(
  () => import("pages/booking-engine/admin/property-amenities/list/page")
);
const AddPropertyAmenities = lazy(
  () => import("pages/booking-engine/admin/property-amenities/add/page")
);
const EditPropertyAmenities = lazy(
  () => import("pages/booking-engine/admin/property-amenities/edit/page")
);
const Property = lazy(
  () => import("pages/booking-engine/admin/property-settings/property/page")
);
const HousekeepingSettings = lazy(
  () => import("pages/booking-engine/admin/housekeeping-settings/page")
);
const Maintenance = lazy(
  () => import("pages/booking-engine/admin/maintenance/page")
);
const MyTask = lazy(
  () => import("pages/booking-engine/house-keeping/my-tasks/page")
);
const CreateMaintenance = lazy(
  () => import("pages/booking-engine/admin/maintenance/create/page")
);
const ViewMaintenance = lazy(
  () => import("pages/booking-engine/admin/maintenance/view/page")
);
const LostAndFound = lazy(
  () => import("pages/booking-engine/admin/lost-and-found/page")
);
const CreateLostAndFound = lazy(
  () => import("pages/booking-engine/admin/lost-and-found/create/page")
);
const EditLostAndFound = lazy(
  () => import("pages/booking-engine/admin/lost-and-found/edit/page")
);
const RoomSetting = lazy(
  () => import("pages/booking-engine/admin/rooms-settings/list/page")
);
const AddRoomSetting = lazy(
  () => import("pages/booking-engine/admin/rooms-settings/add/page")
);
const EditRoomSetting = lazy(
  () => import("pages/booking-engine/admin/rooms-settings/edit/page")
);
const FinancialSettings = lazy(
  () => import("pages/booking-engine/admin/financial-settings/page")
);
const ServiceRequest = lazy(
  () => import("pages/booking-engine/admin/service-request/page")
);
const AddServiceRequest = lazy(
  () => import("pages/booking-engine/admin/service-request/add/page")
);
const EditServiceRequest = lazy(
  () => import("pages/booking-engine/admin/service-request/edit/page")
);
const NightAuditSettings = lazy(
  () => import("pages/booking-engine/admin/night-audit-settings/page")
);

const RateCodes = lazy(
  () => import("pages/booking-engine/revenue-management/rate-codes/page")
);
const RatePlans = lazy(
  () => import("pages/booking-engine/revenue-management/rate-plans/page")
);
const CreateRateCode = lazy(
  () =>
    import("pages/booking-engine/revenue-management/rate-codes/add rate/page")
);
const AddRatePlan = lazy(
  () => import("pages/booking-engine/revenue-management/rate-plans/add/page")
);
const ManageRules = lazy(
  () => import("pages/booking-engine/revenue-management/rate-plans/rules/page")
);
const UpdateRateCode = lazy(
  () =>
    import("pages/booking-engine/revenue-management/rate-codes/edit-rate/page")
);
const ApplicationSettings = lazy(
  () => import("pages/booking-engine/admin/application-settings/page")
);
const UserProfile = lazy(
  () => import("pages/booking-engine/user-profile/page")
);
const NotificationList = lazy(
  () => import("pages/booking-engine/notifications/page")
);
const AddRoomNumberAssignment = lazy(
  () => import("pages/booking-engine/admin/room-type/room-assignment/page")
);
const AddRoomType = lazy(
  () => import("pages/booking-engine/admin/room-type/add/AddRoomType")
);
const EditRoomType = lazy(
  () => import("pages/booking-engine/admin/room-type/edit/page")
);
const RoomTypeList = lazy(
  () =>
    import("pages/booking-engine/admin/room-type/list/PropertyRoomTypeTable")
);

const UserActivityLog = lazy(
  () => import("pages/booking-engine/admin/user-activity-log/page")
);

const AddPostcodeDeptPage = lazy(
  () =>
    import(
      "pages/booking-engine/admin/financial-settings/posting-code-departments/add/page"
    )
);
const EditPostcodeDeptPage = lazy(
  () =>
    import(
      "pages/booking-engine/admin/financial-settings/posting-code-departments/edit/page"
    )
);

export interface RouteList extends PathRouteProps {
  showMenuBar?: boolean;
  menuTitle: string;
  isShowSidebar?: boolean;
  icon?: OverridableComponent<SvgIconTypeMap<object, "svg">>;
  subMenu?: RouteList[];
  roles?: UserRole[];
  Component?: React.FC;
  name?: string;
}

export const menuList: RouteList[] = [
  {
    path: "/dashboard",
    showMenuBar: true,
    menuTitle: "Dashboard",
    icon: DashboardIcon,
    roles: [UserRole.SUDO, UserRole.ADMIN],
  },
  {
    path: "/property-type",
    showMenuBar: true,
    menuTitle: "Property Type",
    icon: ApartmentIcon,
    roles: [UserRole.ADMIN, UserRole.SUDO],
  },
  {
    path: "/properties",
    showMenuBar: true,
    menuTitle: "Properties",
    icon: ApartmentIcon,
    roles: [UserRole.ADMIN, UserRole.SUDO],
  },
  {
    path: "/property-setting",
    showMenuBar: true,
    menuTitle: "Property Setting",
    icon: ApartmentIcon,
    roles: [UserRole.ADMIN, UserRole.SUDO],
  },
  {
    path: "/property-feature",
    showMenuBar: true,
    menuTitle: "Property Feature",
    icon: ApartmentIcon,
    roles: [UserRole.ADMIN, UserRole.SUDO],
  },
];

export const frontOfficeMenu: RouteList[] = [
  {
    path: "/booking-engine/front-office/new-reservation",
    showMenuBar: true,
    menuTitle: "New Reservation",
    name: "New Booking",
    icon: DashboardIcon,
    isShowSidebar: true,
    Component: NewReservation,
    roles: [UserRole.ADMIN, UserRole.SUDO, UserRole.DIRECTOR, UserRole.STAFF],
  },
  {
    path: "/booking-engine/front-office/advanced-search",
    showMenuBar: true,
    menuTitle: "Advance Search",
    icon: DashboardIcon,
    isShowSidebar: true,
    Component: AdvanceSearchReservationPage,
    roles: [UserRole.SUDO, UserRole.ADMIN, UserRole.DIRECTOR, UserRole.STAFF],
    name: "Advance Search",
  },
  {
    path: "/booking-engine/reservations/:id",
    showMenuBar: true,
    menuTitle: "Reservation Summary",
    name: "Reservation Summary",
    icon: DashboardIcon,
    isShowSidebar: false,
    Component: ReservationSummary,
    roles: [UserRole.ADMIN, UserRole.SUDO, UserRole.DIRECTOR, UserRole.STAFF],
  },
  {
    path: "/booking-engine/reservations/folios/:reservationId",
    showMenuBar: true,
    menuTitle: "Folios",
    name: "Folios",
    isShowSidebar: false,
    Component: ReservationFolios,
    roles: [UserRole.ADMIN, UserRole.SUDO, UserRole.DIRECTOR, UserRole.STAFF],
  },
  {
    path: "/booking-engine/reservations/registration-card/:reservationId/:propertyId",
    showMenuBar: true,
    menuTitle: "Registration card",
    name: "Registration card",
    isShowSidebar: false,
    Component: RegistrationCard,
    roles: [UserRole.ADMIN, UserRole.SUDO, UserRole.DIRECTOR, UserRole.STAFF],
  },
  {
    path: "/booking-engine/front-office/arrivals",
    showMenuBar: true,
    menuTitle: "Arrivals",
    name: "Arrivals",
    icon: DashboardIcon,
    isShowSidebar: true,
    Component: Arrival,
    roles: [UserRole.ADMIN, UserRole.SUDO, UserRole.DIRECTOR, UserRole.STAFF],
  },
  {
    path: "/booking-engine/front-office/in-house",
    showMenuBar: true,
    menuTitle: "In-House",
    name: "In-House",
    icon: DashboardIcon,
    isShowSidebar: true,
    Component: InHouse,
    roles: [UserRole.ADMIN, UserRole.SUDO, UserRole.DIRECTOR, UserRole.STAFF],
  },
  {
    path: "/booking-engine/front-office/departures",
    showMenuBar: true,
    menuTitle: "Departures",
    name: "Departures",
    icon: DashboardIcon,
    isShowSidebar: true,
    Component: Departure,
    roles: [UserRole.ADMIN, UserRole.SUDO, UserRole.DIRECTOR, UserRole.STAFF],
  },
  {
    path: "/booking-engine/reservations/occupancy/chart",
    showMenuBar: true,
    menuTitle: "Tape chart",
    name: "Tape chart",
    isShowSidebar: true,
    Component: OccupancyChart,
    roles: [UserRole.ADMIN, UserRole.SUDO, UserRole.DIRECTOR, UserRole.STAFF],
  },
];

export const frontOfficeReportMenu: RouteList[] = [
  {
    path: "/booking-engine/reports/arrival-report-day",
    showMenuBar: true,
    menuTitle: "Arrival Report(Day)",
    name: "Arrival Report(Day)",
    icon: DashboardIcon,
    isShowSidebar: true,
    Component: Dashboard,
    roles: [UserRole.ADMIN, UserRole.SUDO],
  },
  {
    path: "/booking-engine/reports/in-house-report",
    showMenuBar: true,
    menuTitle: "In-House Report(Day)",
    icon: DashboardIcon,
    isShowSidebar: true,
    roles: [UserRole.ADMIN, UserRole.SUDO],
  },
  {
    path: "/booking-engine/reports/departure-report",
    showMenuBar: true,
    menuTitle: "Departure Report",
    icon: DashboardIcon,
    isShowSidebar: true,
    roles: [UserRole.ADMIN, UserRole.SUDO],
  },
  {
    path: "/booking-engine/reports/house-report",
    showMenuBar: true,
    menuTitle: "House Report",
    icon: DashboardIcon,
    isShowSidebar: true,
    roles: [UserRole.ADMIN, UserRole.SUDO],
  },
];

export const housekeepingMenuList: RouteList[] = [
  {
    path: "/booking-engine/rooms/dashboard",
    showMenuBar: true,
    menuTitle: "Dashboard",
    icon: DashboardIcon,
    isShowSidebar: true,
    Component: HousekeepingDashboard,
    roles: [UserRole.ADMIN, UserRole.SUDO, UserRole.HOUSEKEEPING],
  },
  {
    path: "/booking-engine/rooms/rooms-management-reports",
    showMenuBar: true,
    menuTitle: "Room Management",
    icon: DashboardIcon,
    isShowSidebar: true,
    Component: RoomsManagementReports,
    roles: [UserRole.ADMIN, UserRole.SUDO, UserRole.HOUSEKEEPING],
  },
  {
    path: "/booking-engine/rooms/rooms-management-reports/view",
    showMenuBar: true,
    menuTitle: "Boards",
    isShowSidebar: false,
    icon: DashboardIcon,
    Component: HousekeepingBoardsView,
    roles: [UserRole.ADMIN, UserRole.SUDO, UserRole.HOUSEKEEPING],
  },
  {
    path: "/booking-engine/rooms/rooms-management-reports/update",
    showMenuBar: true,
    menuTitle: "Boards",
    isShowSidebar: false,
    icon: DashboardIcon,
    Component: HousekeepingBoardUpdate,
    roles: [UserRole.ADMIN, UserRole.SUDO, UserRole.HOUSEKEEPING],
  },
  {
    path: "/booking-engine/rooms/room-status-update",
    showMenuBar: true,
    menuTitle: "Room Status Update",
    icon: DashboardIcon,
    isShowSidebar: true,
    Component: RoomsStatusUpdate,
    roles: [UserRole.ADMIN, UserRole.SUDO, UserRole.HOUSEKEEPING],
  },
  {
    path: "/booking-engine/rooms/archeived-boards",
    showMenuBar: true,
    menuTitle: "Archived Boards",
    icon: DashboardIcon,
    isShowSidebar: true,
    Component: ArchivedBoardsPage,
    roles: [UserRole.SUDO, UserRole.ADMIN, UserRole.HOUSEKEEPING],
  },
  {
    path: "/booking-engine/rooms/maintenance",
    showMenuBar: true,
    menuTitle: "Maintenance Ticket",
    icon: DashboardIcon,
    isShowSidebar: true,
    Component: Maintenance,
    roles: [
      UserRole.SUDO,
      UserRole.ADMIN,
      UserRole.DIRECTOR,
      UserRole.STAFF,
      UserRole.HOUSEKEEPING,
    ],
  },
  {
    path: "/booking-engine/rooms/lost-and-found",
    showMenuBar: true,
    menuTitle: "Lost & Found",
    icon: DashboardIcon,
    isShowSidebar: true,
    Component: LostAndFound,
    roles: [
      UserRole.SUDO,
      UserRole.ADMIN,
      UserRole.DIRECTOR,
      UserRole.STAFF,
      UserRole.HOUSEKEEPING,
    ],
  },
  {
    path: "/booking-engine/rooms/my-task",
    showMenuBar: true,
    menuTitle: "My Tasks",
    icon: DashboardIcon,
    isShowSidebar: true,
    Component: MyTask,
    roles: [UserRole.SUDO, UserRole.ADMIN, UserRole.HOUSEKEEPING],
  },
  {
    path: "/booking-engine/rooms/maintenance/create",
    showMenuBar: true,
    menuTitle: "Create Maintenance Ticket",
    icon: DashboardIcon,
    isShowSidebar: false,
    Component: CreateMaintenance,
    roles: [
      UserRole.SUDO,
      UserRole.ADMIN,
      UserRole.DIRECTOR,
      UserRole.STAFF,
      UserRole.HOUSEKEEPING,
    ],
  },
  {
    path: "/booking-engine/rooms/maintenance/view/:id",
    showMenuBar: true,
    menuTitle: "View Maintenance Ticket",
    icon: DashboardIcon,
    isShowSidebar: false,
    Component: ViewMaintenance,
    roles: [
      UserRole.SUDO,
      UserRole.ADMIN,
      UserRole.DIRECTOR,
      UserRole.STAFF,
      UserRole.HOUSEKEEPING,
    ],
  },
  {
    path: "/booking-engine/rooms/lost-and-found/create",
    showMenuBar: true,
    menuTitle: "Add Lost & Found Item",
    icon: DashboardIcon,
    isShowSidebar: false,
    Component: CreateLostAndFound,
    roles: [
      UserRole.SUDO,
      UserRole.ADMIN,
      UserRole.DIRECTOR,
      UserRole.STAFF,
      UserRole.HOUSEKEEPING,
    ],
  },
  {
    path: "/booking-engine/rooms/lost-and-found/edit/:id",
    showMenuBar: true,
    menuTitle: "Edit Lost & Found Item",
    icon: DashboardIcon,
    isShowSidebar: false,
    Component: EditLostAndFound,
    roles: [
      UserRole.SUDO,
      UserRole.ADMIN,
      UserRole.DIRECTOR,
      UserRole.STAFF,
      UserRole.HOUSEKEEPING,
    ],
  },
];

export const salesMenuList: RouteList[] = [
  {
    path: "/booking-engine/sales/dashboard",
    showMenuBar: true,
    menuTitle: "Sales Dashboard",
    icon: DashboardIcon,
    isShowSidebar: true,
    Component: SalesDashboard,
    roles: [UserRole.ADMIN, UserRole.SUDO],
  },
  {
    path: "/booking-engine/sales/rental-spaces/create",
    showMenuBar: true,
    menuTitle: "Create Rental Space",
    icon: DashboardIcon,
    isShowSidebar: false,
    Component: CreateRentalSpace,
    roles: [UserRole.ADMIN, UserRole.SUDO],
  },
  {
    path: "/booking-engine/sales/group",
    showMenuBar: true,
    menuTitle: "Sales Group",
    icon: DashboardIcon,
    isShowSidebar: false,
    Component: SalesDashboard,
    roles: [UserRole.ADMIN, UserRole.SUDO],
  },
  {
    path: "/booking-engine/sales/group/create",
    showMenuBar: true,
    menuTitle: "Sales Group",
    icon: DashboardIcon,
    isShowSidebar: false,
    Component: SalesGroupForm,
    roles: [UserRole.ADMIN, UserRole.SUDO],
  },
  {
    path: "/booking-engine/sales/rooming-list",
    showMenuBar: true,
    menuTitle: "Sales Group",
    icon: DashboardIcon,
    isShowSidebar: false,
    Component: SalesDashboard,
    roles: [UserRole.ADMIN, UserRole.SUDO],
  },
  {
    path: "/booking-engine/sales/group/rooming-list/:id",
    showMenuBar: true,
    menuTitle: "Sales Rooming List",
    icon: DashboardIcon,
    isShowSidebar: false,
    Component: GroupRoomingListPage,
    roles: [UserRole.ADMIN, UserRole.SUDO],
  },
  {
    path: "/booking-engine/sales/banquet",
    showMenuBar: true,
    menuTitle: "Sales Banquet",
    icon: DashboardIcon,
    isShowSidebar: false,
    Component: SalesDashboard,
    roles: [UserRole.ADMIN, UserRole.SUDO],
  },
  {
    path: "/booking-engine/sales/group-detail/:id/folio",
    showMenuBar: true,
    menuTitle: "Group Master Folio",
    icon: DashboardIcon,
    isShowSidebar: false,
    Component: GroupMasterFolioPage,
    roles: [UserRole.ADMIN, UserRole.SUDO],
  },
  {
    path: "/booking-engine/sales/group-detail/:id",
    showMenuBar: true,
    menuTitle: "Sales Group Detail",
    icon: DashboardIcon,
    isShowSidebar: false,
    Component: SalesGroupDetail,
    roles: [UserRole.ADMIN, UserRole.SUDO],
  },
  {
    path: "/booking-engine/sales/rooming-detail/:id",
    showMenuBar: true,
    menuTitle: "Add Group Reservation",
    icon: DashboardIcon,
    isShowSidebar: false,
    Component: SalesRoomingDetail,
    roles: [UserRole.ADMIN, UserRole.SUDO],
  },
  {
    path: "/booking-engine/sales",
    showMenuBar: true,
    menuTitle: "Sales Contacts",
    icon: DashboardIcon,
    isShowSidebar: true,
    Component: Sales,
    roles: [UserRole.ADMIN, UserRole.SUDO],
  },
  {
    path: "/booking-engine/sales/rental-spaces",
    showMenuBar: true,
    menuTitle: "Room Detail & Rates",
    icon: DashboardIcon,
    isShowSidebar: true,
    Component: RentalSpaces,
    roles: [UserRole.ADMIN, UserRole.SUDO],
  },
];

export const reportMenuList: RouteList[] = [
  {
    path: "#frontOffice",
    showMenuBar: true,
    menuTitle: "Front Office",
    icon: DashboardIcon,
    isShowSidebar: true,
    roles: [UserRole.ADMIN, UserRole.SUDO, UserRole.REPORTING],
    subMenu: [
      {
        path: "/booking-engine/reports/arrival-report-day",
        showMenuBar: true,
        menuTitle: "Arrival (Downtime)",
        icon: DashboardIcon,
        isShowSidebar: true,
        Component: ArrivalReports,
        roles: [UserRole.ADMIN, UserRole.SUDO, UserRole.REPORTING],
      },
      {
        path: "/booking-engine/reports/expected-arrival-report-day",
        showMenuBar: true,
        menuTitle: "Expected Arrival (Downtime)",
        icon: DashboardIcon,
        isShowSidebar: true,
        Component: ExpectedArrivalReports,
        roles: [UserRole.ADMIN, UserRole.SUDO, UserRole.REPORTING],
      },
      {
        path: "/booking-engine/reports/in-house-report-day",
        showMenuBar: true,
        menuTitle: "In-House (Downtime)",
        icon: DashboardIcon,
        isShowSidebar: true,
        Component: InHouseReports,
        roles: [UserRole.ADMIN, UserRole.SUDO, UserRole.REPORTING],
      },
      {
        path: "/booking-engine/reports/departure-report",
        showMenuBar: true,
        menuTitle: "Departure (Downtime)",
        icon: DashboardIcon,
        isShowSidebar: true,
        Component: DepartureReports,
        roles: [UserRole.ADMIN, UserRole.SUDO, UserRole.REPORTING],
      },
      {
        path: "/booking-engine/reports/expected-departures",
        showMenuBar: true,
        menuTitle: "Expected Departure (Downtime)",
        icon: DashboardIcon,
        isShowSidebar: true,
        Component: ExpectedDepartures,
        roles: [UserRole.ADMIN, UserRole.SUDO, UserRole.REPORTING],
      },
      {
        path: `/booking-engine/reports/reservation-reports/${ReservationStatusEnum.NO_SHOW}`,
        showMenuBar: true,
        menuTitle: "No-Show Reservation",
        icon: DashboardIcon,
        isShowSidebar: true,
        Component: ReportReservation,
        roles: [UserRole.ADMIN, UserRole.SUDO, UserRole.REPORTING],
      },
      {
        path: `/booking-engine/reports/reservation-reports/${ReservationStatusEnum.CANCELED}`,
        showMenuBar: true,
        menuTitle: "Cancelled Reservation",
        icon: DashboardIcon,
        isShowSidebar: true,
        Component: ReportReservation,
        roles: [UserRole.ADMIN, UserRole.SUDO, UserRole.REPORTING],
      },
      {
        path: "/booking-engine/reports/room-status-summary",
        showMenuBar: true,
        menuTitle: "Room Status Summary",
        icon: DashboardIcon,
        isShowSidebar: true,
        Component: ReportRoomStatusSummary,
        roles: [UserRole.ADMIN, UserRole.SUDO, UserRole.REPORTING],
      },
      {
        path: "/booking-engine/reports/direct-billing/aging-report",
        showMenuBar: true,
        menuTitle: "Aging",
        icon: DashboardIcon,
        isShowSidebar: true,
        Component: AgingReport,
        roles: [UserRole.ADMIN, UserRole.SUDO],
      },
    ],
  },
  {
    path: "#rooms",
    showMenuBar: true,
    menuTitle: "Rooms",
    icon: DashboardIcon,
    isShowSidebar: true,
    roles: [UserRole.ADMIN, UserRole.SUDO, UserRole.REPORTING],
    subMenu: [
      {
        path: "/booking-engine/reports/housekeeping-boards",
        showMenuBar: true,
        menuTitle: "Housekeeping Boards",
        icon: DashboardIcon,
        isShowSidebar: true,
        Component: HousekeepingBoardsReport,
        roles: [UserRole.ADMIN, UserRole.SUDO, UserRole.REPORTING],
      },
      {
        path: "/booking-engine/reports/room-status-summary",
        showMenuBar: true,
        menuTitle: "Rooms Status Summary",
        icon: DashboardIcon,
        isShowSidebar: true,
        Component: ReportRoomStatusSummary,
        roles: [UserRole.ADMIN, UserRole.SUDO, UserRole.REPORTING],
      },
      {
        path: "/booking-engine/reports/room-status-detail",
        showMenuBar: true,
        menuTitle: "Rooms Status Detail",
        icon: DashboardIcon,
        isShowSidebar: true,
        Component: ReportRoomStatusDetail,
        roles: [UserRole.ADMIN, UserRole.SUDO, UserRole.REPORTING],
      },
    ],
  },
  {
    path: "#engineering",
    showMenuBar: true,
    menuTitle: "Engineering",
    icon: DashboardIcon,
    isShowSidebar: true,
    roles: [UserRole.ADMIN, UserRole.SUDO, UserRole.REPORTING],
    subMenu: [
      {
        path: "/booking-engine/reports/room-status-summary",
        showMenuBar: true,
        menuTitle: "Room Status Summary",
        icon: DashboardIcon,
        isShowSidebar: true,
        Component: ReportRoomStatusSummary,
        roles: [UserRole.ADMIN, UserRole.SUDO, UserRole.REPORTING],
      },
    ],
  },
  {
    path: "#sales",
    showMenuBar: true,
    menuTitle: "Sales",
    icon: DashboardIcon,
    isShowSidebar: true,
    roles: [UserRole.ADMIN, UserRole.SUDO, UserRole.REPORTING],
    subMenu: [
      {
        path: "/booking-engine/reports/direct-billing/aging-report",
        showMenuBar: true,
        menuTitle: "Aging",
        icon: DashboardIcon,
        isShowSidebar: true,
        Component: AgingReport,
        roles: [UserRole.ADMIN, UserRole.SUDO],
      },
    ],
  },
];

export const administrationMenu: RouteList[] = [
  {
    path: "#user-management",
    showMenuBar: true,
    menuTitle: "User Management",
    icon: DashboardIcon,
    isShowSidebar: true,
    roles: [UserRole.SUDO, UserRole.ADMIN, UserRole.DIRECTOR],
    subMenu: [
      {
        path: "/booking-engine/admin/user-management",
        showMenuBar: true,
        menuTitle: "User Management",
        icon: DashboardIcon,
        isShowSidebar: true,
        Component: UserManagement,
        roles: [UserRole.SUDO, UserRole.ADMIN, UserRole.DIRECTOR],
      },
      {
        path: "/booking-engine/admin/user-activity-log",
        showMenuBar: true,
        menuTitle: "Activity Log",
        icon: DashboardIcon,
        isShowSidebar: true,
        Component: UserActivityLog,
        roles: [UserRole.SUDO, UserRole.ADMIN],
      },
    ],
  },
  {
    path: "/booking-engine/admin/role-management",
    showMenuBar: true,
    menuTitle: "User Management",
    icon: DashboardIcon,
    isShowSidebar: false,
    Component: UserManagement,
    roles: [UserRole.SUDO, UserRole.ADMIN, UserRole.DIRECTOR],
  },
  {
    path: "/booking-engine/admin/user-management/add",
    showMenuBar: true,
    menuTitle: "User Management",
    icon: DashboardIcon,
    isShowSidebar: false,
    Component: AddUserManagement,
    roles: [UserRole.SUDO, UserRole.ADMIN, UserRole.DIRECTOR],
  },
  {
    path: "/booking-engine/admin/user-management/:id",
    showMenuBar: true,
    menuTitle: "User Management",
    icon: DashboardIcon,
    isShowSidebar: false,
    Component: EditUserManagement,
    roles: [UserRole.SUDO, UserRole.ADMIN, UserRole.DIRECTOR],
  },
  {
    path: "/booking-engine/admin/role-management/:id",
    showMenuBar: true,
    menuTitle: "User Management",
    icon: DashboardIcon,
    isShowSidebar: false,
    Component: EditRoleManagement,
    roles: [UserRole.SUDO, UserRole.ADMIN, UserRole.DIRECTOR],
  },
  {
    path: "/booking-engine/admin/role-management/add",
    showMenuBar: true,
    menuTitle: "User Management",
    icon: DashboardIcon,
    isShowSidebar: false,
    Component: AddUserManagement,
    roles: [UserRole.SUDO, UserRole.ADMIN, UserRole.DIRECTOR],
  },
  {
    path: "/booking-engine/admin/email-templates/list",
    showMenuBar: true,
    menuTitle: "Email Template Module",
    icon: DashboardIcon,
    isShowSidebar: true,
    Component: EmailTemplateList,
    roles: [UserRole.SUDO, UserRole.ADMIN],
  },
  {
    path: "/booking-engine/admin/email-templates/add",
    showMenuBar: true,
    menuTitle: "Add Email Template",
    icon: DashboardIcon,
    isShowSidebar: false,
    Component: AddEmailTemplate,
    roles: [UserRole.SUDO, UserRole.ADMIN],
  },
  {
    path: "/booking-engine/admin/financial-settings/tax",
    showMenuBar: true,
    menuTitle: "Financial Settings",
    icon: DashboardIcon,
    isShowSidebar: false,
    Component: FinancialSettings,
    roles: [UserRole.SUDO, UserRole.ADMIN],
  },
  {
    path: "/booking-engine/admin/financial-settings/fee",
    showMenuBar: true,
    menuTitle: "Financial Settings",
    icon: DashboardIcon,
    isShowSidebar: false,
    Component: FinancialSettings,
    roles: [UserRole.SUDO, UserRole.ADMIN],
  },
  {
    path: "/booking-engine/admin/financial-settings/tax/add",
    showMenuBar: true,
    menuTitle: "Add TAX/FEE",
    icon: DashboardIcon,
    isShowSidebar: false,
    Component: AddTax,
    roles: [UserRole.SUDO, UserRole.ADMIN],
  },
  {
    path: "/booking-engine/admin/financial-settings/fees/add",
    showMenuBar: true,
    menuTitle: "Add Fee",
    icon: DashboardIcon,
    isShowSidebar: false,
    Component: AddTax,
    roles: [UserRole.SUDO, UserRole.ADMIN],
  },
  {
    path: "/booking-engine/admin/financial-settings/preconfigured-charge",
    showMenuBar: true,
    menuTitle: "Financial Settings",
    icon: DashboardIcon,
    isShowSidebar: false,
    Component: FinancialSettings,
    roles: [UserRole.SUDO, UserRole.ADMIN],
  },
  {
    path: "/booking-engine/admin/financial-settings/posting-codes",
    showMenuBar: true,
    menuTitle: "Financial Settings",
    icon: DashboardIcon,
    isShowSidebar: false,
    Component: FinancialSettings,
    roles: [UserRole.SUDO, UserRole.ADMIN],
  },
  {
    path: "/booking-engine/admin/financial-settings/posting-code-departments",
    showMenuBar: true,
    menuTitle: "Financial Settings",
    icon: DashboardIcon,
    isShowSidebar: false,
    Component: FinancialSettings,
    roles: [UserRole.SUDO, UserRole.ADMIN],
  },
  {
    path: "/booking-engine/admin/financial-settings/posting-code-departments/add",
    showMenuBar: true,
    menuTitle: "Add Department",
    icon: DashboardIcon,
    isShowSidebar: false,
    Component: AddPostcodeDeptPage,
    roles: [UserRole.SUDO, UserRole.ADMIN],
  },
  {
    path: "/booking-engine/admin/financial-settings/posting-code-departments/edit/:id",
    showMenuBar: true,
    menuTitle: "Edit Department",
    icon: DashboardIcon,
    isShowSidebar: false,
    Component: EditPostcodeDeptPage,
    roles: [UserRole.SUDO, UserRole.ADMIN],
  },
  {
    path: "/booking-engine/admin/financial-settings/posting-codes/add",
    showMenuBar: true,
    menuTitle: "Add Posting Code",
    icon: DashboardIcon,
    isShowSidebar: false,
    Component: AddNewPostingCode, // Make sure this component is imported at the top
    roles: [UserRole.SUDO, UserRole.ADMIN],
  },
  {
    path: "/booking-engine/admin/financial-settings/posting-codes/edit/:id",
    showMenuBar: true,
    menuTitle: "Edit Posting Code",
    icon: DashboardIcon,
    isShowSidebar: false,
    Component: EditPostingCode,
    roles: [UserRole.SUDO, UserRole.ADMIN],
  },
  {
    path: "/booking-engine/admin/financial-settings/preconfigured-charge/add-preconfigured-charge",
    showMenuBar: true,
    menuTitle: "Add Preconfigured Charge",
    icon: DashboardIcon,
    isShowSidebar: false,
    Component: AddNewPostConfigureCharge,
    roles: [UserRole.SUDO, UserRole.ADMIN],
  },
  {
    path: "/booking-engine/admin/financial-settings/preconfigured-charge/:id/edit",
    showMenuBar: true,
    menuTitle: "Edit Preconfigured Charge",
    icon: DashboardIcon,
    isShowSidebar: false,
    Component: EditNewPostConfigureCharge,
    roles: [UserRole.SUDO, UserRole.ADMIN],
  },
  {
    path: "/booking-engine/admin/financial-settings/:id",
    showMenuBar: true,
    menuTitle: "Edit TAX/FEE",
    icon: DashboardIcon,
    isShowSidebar: false,
    Component: UpdateTax,
    roles: [UserRole.SUDO, UserRole.ADMIN],
  },
  {
    path: "/booking-engine/admin/financial-settings/fee/:id",
    showMenuBar: true,
    menuTitle: "Edit Fee",
    icon: DashboardIcon,
    isShowSidebar: false,
    Component: UpdateFee,
    roles: [UserRole.SUDO, UserRole.ADMIN],
  },
  {
    path: "/booking-engine/admin/email-templates/:id",
    showMenuBar: true,
    menuTitle: "Edit Email Template",
    icon: DashboardIcon,
    isShowSidebar: false,
    Component: EditEmailTemplate,
    roles: [UserRole.SUDO, UserRole.ADMIN],
  },
  {
    path: "/booking-engine/admin/property-amenities",
    showMenuBar: true,
    menuTitle: "Property Amenities",
    icon: DashboardIcon,
    isShowSidebar: true,
    Component: PropertyAmenities,
    roles: [UserRole.SUDO, UserRole.ADMIN],
  },
  {
    path: "/booking-engine/admin/property-amenities/add",
    showMenuBar: true,
    menuTitle: "Add Property Amenities",
    icon: DashboardIcon,
    isShowSidebar: false,
    Component: AddPropertyAmenities,
    roles: [UserRole.SUDO, UserRole.ADMIN],
  },
  {
    path: "/booking-engine/admin/property-amenities/edit/:id",
    showMenuBar: true,
    menuTitle: "Edit Property Amenities",
    icon: DashboardIcon,
    isShowSidebar: false,
    Component: EditPropertyAmenities,
    roles: [UserRole.SUDO, UserRole.ADMIN],
  },
  {
    path: "/booking-engine/admin/property-settings",
    showMenuBar: true,
    menuTitle: "Property Settings",
    icon: DashboardIcon,
    isShowSidebar: true,
    Component: PropertySettings,
    roles: [UserRole.SUDO, UserRole.ADMIN, UserRole.DIRECTOR],
  },
  {
    path: "/booking-engine/admin/add-new-property",
    showMenuBar: true,
    menuTitle: "Add New Property",
    icon: DashboardIcon,
    isShowSidebar: false,
    Component: AddPropertyForm,
    roles: [UserRole.SUDO, UserRole.ADMIN, UserRole.DIRECTOR],
  },

  {
    path: "/booking-engine/admin/property/detail/:id",
    showMenuBar: true,
    menuTitle: "Property Details",
    isShowSidebar: false,
    Component: Property,
    roles: [UserRole.SUDO, UserRole.ADMIN, UserRole.DIRECTOR],
  },

  {
    path: "/booking-engine/admin/housekeeping-settings",
    showMenuBar: true,
    menuTitle: "Housekeeping Settings",
    icon: DashboardIcon,
    isShowSidebar: true,
    Component: HousekeepingSettings,
    roles: [UserRole.SUDO, UserRole.ADMIN],
  },
  {
    path: "/booking-engine/admin/rooms-settings",
    showMenuBar: true,
    menuTitle: "Room Amenity",
    icon: DashboardIcon,
    isShowSidebar: true,
    Component: RoomSetting,
    roles: [UserRole.SUDO, UserRole.ADMIN],
  },
  {
    path: "/booking-engine/admin/rooms-settings/add",
    showMenuBar: true,
    menuTitle: "Add Room Amenity",
    icon: DashboardIcon,
    isShowSidebar: false,
    Component: AddRoomSetting,
    roles: [UserRole.SUDO, UserRole.ADMIN],
  },
  {
    path: "/booking-engine/admin/rooms-type",
    showMenuBar: true,
    menuTitle: "Property Room Type",
    icon: DashboardIcon,
    isShowSidebar: false,
    Component: RoomTypeList,
    roles: [UserRole.SUDO, UserRole.ADMIN],
  },
  {
    path: "/booking-engine/admin/rooms-type/add",
    showMenuBar: true,
    menuTitle: "Add Room Type",
    icon: DashboardIcon,
    isShowSidebar: false,
    Component: AddRoomType,
    roles: [UserRole.SUDO, UserRole.ADMIN],
  },
  {
    path: "/booking-engine/admin/rooms-type/room-assign/:roomTypeId",
    showMenuBar: true,
    menuTitle: "Assign Room",
    icon: DashboardIcon,
    isShowSidebar: false,
    Component: AddRoomNumberAssignment,
    roles: [UserRole.SUDO, UserRole.ADMIN],
  },
  {
    path: "/booking-engine/admin/rooms-type/edit/:id",
    showMenuBar: true,
    menuTitle: "Edit Room Type",
    icon: DashboardIcon,
    isShowSidebar: false,
    Component: EditRoomType,
    roles: [UserRole.SUDO, UserRole.ADMIN],
  },
  {
    path: "/booking-engine/admin/rooms-settings/edit/:id",
    showMenuBar: true,
    menuTitle: "Edit Room Amenity",
    icon: DashboardIcon,
    isShowSidebar: false,
    Component: EditRoomSetting,
    roles: [UserRole.SUDO, UserRole.ADMIN],
  },
  {
    path: "/booking-engine/admin/financial-settings",
    showMenuBar: true,
    menuTitle: "Financial Settings",
    icon: DashboardIcon,
    isShowSidebar: true,
    Component: FinancialSettings,
    roles: [UserRole.SUDO, UserRole.ADMIN],
  },
  {
    path: "/booking-engine/admin/service-request",
    showMenuBar: true,
    menuTitle: "Guest Request",
    icon: DashboardIcon,
    isShowSidebar: true,
    Component: ServiceRequest,
    roles: [UserRole.SUDO, UserRole.ADMIN],
  },
  {
    path: "/booking-engine/admin/service-request/add",
    showMenuBar: true,
    menuTitle: "Add Guest Request",
    icon: DashboardIcon,
    isShowSidebar: false,
    Component: AddServiceRequest,
    roles: [UserRole.SUDO, UserRole.ADMIN],
  },
  {
    path: "/booking-engine/admin/service-request/:service_request_id/edit",
    showMenuBar: true,
    menuTitle: "Update Guest Request",
    icon: DashboardIcon,
    isShowSidebar: false,
    Component: EditServiceRequest,
    roles: [UserRole.SUDO, UserRole.ADMIN],
  },
  {
    path: "/booking-engine/admin/night-audit-settings",
    showMenuBar: true,
    menuTitle: "Night Audit Settings",
    icon: DashboardIcon,
    isShowSidebar: true,
    Component: NightAuditSettings,
    roles: [UserRole.SUDO, UserRole.ADMIN],
  },
  {
    path: `/${appConfig.pmsDir}/admin/application-settings`,
    showMenuBar: true,
    menuTitle: "Application Settings",
    icon: DashboardIcon,
    isShowSidebar: true,
    Component: ApplicationSettings,
    roles: [UserRole.SUDO],
  },
];

export const bookingEngineMenuList: RouteList[] = [
  {
    path: "/booking-engine/dashboard",
    showMenuBar: true,
    menuTitle: "Dashboard",
    icon: DashboardIcon,
    isShowSidebar: true,
    Component: Dashboard,
    roles: [
      UserRole.SUDO,
      UserRole.ADMIN,
      UserRole.DIRECTOR,
      UserRole.STAFF,
      UserRole.HOUSEKEEPING,
      UserRole.REPORTING,
      UserRole.ACCOUNTING,
    ],
    name: "Dashboard",
  },
  {
    path: "#front-office",
    showMenuBar: true,
    menuTitle: "Front Office",
    icon: DashboardIcon,
    subMenu: frontOfficeMenu,
    isShowSidebar: true,
    roles: [UserRole.SUDO, UserRole.ADMIN, UserRole.DIRECTOR],
    name: "Front and Back Office Access",
  },
  {
    path: "#house-keeping",
    showMenuBar: true,
    menuTitle: "Rooms",
    icon: DashboardIcon,
    subMenu: housekeepingMenuList,
    isShowSidebar: true,
    roles: [UserRole.SUDO, UserRole.ADMIN, UserRole.HOUSEKEEPING],
    name: "Housekeeping Access",
  },
  {
    path: "#sales",
    showMenuBar: true,
    menuTitle: "Sales",
    icon: DashboardIcon,
    isShowSidebar: true,
    subMenu: salesMenuList,
    roles: [UserRole.SUDO, UserRole.ADMIN],
    name: "Sales",
  },
  {
    path: "/booking-engine/sales/contact/create",
    showMenuBar: true,
    menuTitle: "Create Sales Contact",
    icon: DashboardIcon,
    isShowSidebar: false,
    Component: AddSales,
    roles: [UserRole.SUDO, UserRole.ADMIN],
    name: "Sales",
  },
  {
    path: "/booking-engine/sales/contact/edit/:id",
    showMenuBar: true,
    menuTitle: "Edit Sales Contact",
    icon: DashboardIcon,
    isShowSidebar: false,
    Component: EditSales,
    roles: [UserRole.SUDO, UserRole.ADMIN],
    name: "Sales",
  },
  {
    path: "/booking-engine/accounting",
    showMenuBar: true,
    menuTitle: "Accounting",
    icon: DashboardIcon,
    isShowSidebar: true,
    Component: Accounting,
    roles: [UserRole.SUDO, UserRole.ADMIN, UserRole.ACCOUNTING],
    name: "Accounts",
  },
  {
    path: "/booking-engine/accounting/ar/account/:id",
    showMenuBar: true,
    menuTitle: "AR Accounts",
    icon: DashboardIcon,
    isShowSidebar: false,
    Component: ARAccounting,
    roles: [UserRole.SUDO, UserRole.ADMIN, UserRole.ACCOUNTING],
    name: "AR Accounts",
  },
  {
    path: "/booking-engine/accounting/account/:id",
    showMenuBar: true,
    menuTitle: "Account View",
    icon: DashboardIcon,
    isShowSidebar: false,
    Component: SingleAccount,
    roles: [UserRole.SUDO, UserRole.ADMIN, UserRole.ACCOUNTING],
    name: "Accounting",
  },
  {
    path: "/booking-engine/accounting/account/:id/edit",
    showMenuBar: true,
    menuTitle: "Edit Account",
    icon: DashboardIcon,
    isShowSidebar: false,
    Component: EditDBAccount,
    roles: [UserRole.SUDO, UserRole.ADMIN, UserRole.ACCOUNTING],
    name: "Accounting",
  },
  {
    path: "/booking-engine/accounting/accounts",
    showMenuBar: true,
    menuTitle: "Accounting",
    icon: DashboardIcon,
    isShowSidebar: false,
    Component: Accounting,
    roles: [UserRole.SUDO, UserRole.ADMIN, UserRole.ACCOUNTING],
    name: "Accounts",
  },
  {
    path: "/booking-engine/accounting/create-account",
    showMenuBar: true,
    menuTitle: "Create Account",
    icon: DashboardIcon,
    isShowSidebar: false,
    Component: CreateDBAccount,
    roles: [UserRole.SUDO, UserRole.ADMIN, UserRole.ACCOUNTING],
    name: "Accounting",
  },
  {
    path: "/booking-engine/accounting/invoices/:id",
    showMenuBar: true,
    menuTitle: "View Invoice",
    icon: DashboardIcon,
    isShowSidebar: false,
    Component: InvoiceDetails,
    roles: [UserRole.SUDO, UserRole.ADMIN],
    name: "Accounting",
  },
  {
    path: "#revenue-management",
    showMenuBar: true,
    menuTitle: "Revenue Management",
    icon: DashboardIcon,
    isShowSidebar: true,
    name: "Revenue Management",
    roles: [UserRole.SUDO, UserRole.ADMIN],
    subMenu: [
      {
        path: "/booking-engine/revenue-management/rate-management",
        showMenuBar: true,
        menuTitle: "Rate Management",
        icon: DashboardIcon,
        isShowSidebar: true,
        Component: RateManagement,
        roles: [UserRole.SUDO, UserRole.ADMIN, UserRole.DIRECTOR],
      },
      {
        path: "/booking-engine/revenue-management/rate-code",
        showMenuBar: true,
        menuTitle: "Rate Codes",
        icon: DashboardIcon,
        isShowSidebar: true,
        Component: RateCodes,
        roles: [UserRole.SUDO, UserRole.ADMIN],
      },
      {
        path: "/booking-engine/revenue-management/rate-plan",
        showMenuBar: true,
        menuTitle: "Rate Plans",
        icon: DashboardIcon,
        isShowSidebar: true,
        Component: RatePlans,
        roles: [UserRole.SUDO, UserRole.ADMIN],
      },
      {
        path: "/booking-engine/revenue-management/inventory-management",
        showMenuBar: true,
        menuTitle: "Inventory Management",
        icon: DashboardIcon,
        isShowSidebar: true,
        Component: InventoryManagement,
        roles: [UserRole.SUDO, UserRole.ADMIN, UserRole.DIRECTOR],
      },
      {
        path: "/booking-engine/revenue-management/rate-plan/create",
        showMenuBar: true,
        menuTitle: "Create Rate Plan",
        icon: DashboardIcon,
        isShowSidebar: false,
        Component: AddRatePlan,
        roles: [UserRole.SUDO, UserRole.ADMIN],
      },
      {
        path: "/booking-engine/revenue-management/rate-plan/:id",
        showMenuBar: true,
        menuTitle: "Manage Rules",
        icon: DashboardIcon,
        isShowSidebar: false,
        Component: ManageRules,
        roles: [UserRole.SUDO, UserRole.ADMIN],
      },
      {
        path: "/booking-engine/revenue-management/rate-code/create",
        showMenuBar: true,
        menuTitle: "Create Rate Codes",
        icon: DashboardIcon,
        isShowSidebar: false,
        Component: CreateRateCode,
        roles: [UserRole.SUDO, UserRole.ADMIN],
      },
      {
        path: "/booking-engine/revenue-management/rate-code/:id",
        showMenuBar: true,
        menuTitle: "Update Rate Codes",
        icon: DashboardIcon,
        isShowSidebar: false,
        Component: UpdateRateCode,
        roles: [UserRole.SUDO, UserRole.ADMIN],
      },
    ],
  },
  {
    path: "#reports",
    showMenuBar: true,
    menuTitle: "Reports",
    icon: DashboardIcon,
    isShowSidebar: true,
    subMenu: reportMenuList,
    roles: [UserRole.SUDO, UserRole.ADMIN, UserRole.REPORTING],
    name: "Access to Reports",
  },
  {
    path: "/booking-engine/night-audit",
    showMenuBar: true,
    menuTitle: "Night Audit",
    name: "Night Audit",
    icon: DashboardIcon,
    isShowSidebar: true,
    Component: NightAudit,
    roles: [UserRole.SUDO, UserRole.ADMIN],
  },
  {
    path: "/booking-engine/night-audit/add",
    showMenuBar: true,
    menuTitle: "Night Audit",
    name: "Night Audit",
    icon: DashboardIcon,
    isShowSidebar: false,
    Component: AddNightAudit,
    roles: [UserRole.SUDO, UserRole.ADMIN],
  },
  {
    path: "#admin",
    showMenuBar: true,
    menuTitle: "Administration",
    name: "Administration",
    icon: DashboardIcon,
    isShowSidebar: true,
    subMenu: administrationMenu,
    roles: [UserRole.SUDO, UserRole.ADMIN],
  },
  {
    path: "/booking-engine/user-profile",
    showMenuBar: true,
    menuTitle: "User Profile",
    name: "User Profile",
    icon: DashboardIcon,
    isShowSidebar: false,
    Component: UserProfile,
    roles: [
      UserRole.SUDO,
      UserRole.ADMIN,
      UserRole.DIRECTOR,
      UserRole.STAFF,
      UserRole.HOUSEKEEPING,
      UserRole.REPORTING,
      UserRole.ACCOUNTING,
    ],
  },
  {
    path: "/booking-engine/notification-alert",
    showMenuBar: true,
    menuTitle: "Notification Alert",
    name: "Notification Alert",
    icon: DashboardIcon,
    isShowSidebar: false,
    Component: NotificationList,
    roles: [
      UserRole.SUDO,
      UserRole.ADMIN,
      UserRole.DIRECTOR,
      UserRole.STAFF,
      UserRole.HOUSEKEEPING,
      UserRole.REPORTING,
      UserRole.ACCOUNTING,
    ],
  },
];

export const posMenuList: RouteList[] = [];
