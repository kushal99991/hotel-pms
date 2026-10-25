// src/constants/roles.ts
export enum UserRole {
  SUDO = "sudo",
  ADMIN = "admin",
  HOUSEKEEPING = "housekeeping",
  REPORTING = "reporting",
  ACCOUNTING = "accounting",
  STAFF = "staff",
  DIRECTOR = "director",
}

export enum RoleAccess {
  "Dashboard" = "dashboard",
  "Reception List" = "reception",
  "Calendar" = "calendar",
  "Access to Reports" = "reports",
  "Super User Access" = "Super User Access",
  "Admin Access" = "Admin Access",
  "New Booking" = "front-access",
  "Housekeeping Access" = "house-keeping",
  "Front and Back Office Access" = "front-office",
  "Front and Back Office Access With Override" = "front",
  "Financial Access" = "accounting",
}

export const defaultPermssionList = [
  "Dashboard",
  "Reception List",
  "Calendar",
  "Access to Reports",
  "New Booking",
  "Housekeeping Access",
  "Front and Back Office Access",
  "Front and Back Office Access With Override",
  "Financial Access",
  "Arrival Report(Day)",
];
