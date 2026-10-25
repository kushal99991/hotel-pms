import { PaymentChargeTypeEnum } from "constants/payments";
import { RoomRentalTypes } from "constants/room";
import { TaxRateType } from "constants/taxes";
import dayjs from "dayjs";
import moment from "moment";
import { IFullGuest, IReservation, IGuest } from "types/reservationTypes";
import * as Yup from "yup";

const allowedCharactersRegex = /^[a-zA-Z0-9\s.,!?'-]*$/;

export const loginSchema = Yup.object().shape({
  domain: Yup.string().required("Domain is required"),
  username: Yup.string().required("Username is required"),
  password: Yup.string().required("Password is required"),
});

export const forgotPasswordSchema = Yup.object().shape({
  email: Yup.string().required(),
});

export const addPostingCodeSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  code: Yup.string().required("Code is required"),
  posting_code_department_id: Yup.number()
    .required("Department is required")
    .min(1, "Department is required"),
  adjustment: Yup.boolean().required("Adjustment is required"),
  is_active: Yup.boolean(),
  type: Yup.string().required("Type is required"),
});

export const otpVerifySchema = Yup.object().shape({
  resetCode: Yup.string()
    .required("Reset code is required")
    .matches(/^[A-Z]{2}-\d{6}$/, "Reset code must be in the format AZ-123456"),
});

export const resetPasswordSchema = Yup.object().shape({
  newPassword: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(/^\S*$/, "Password cannot contain spaces"),
  confirmPassword: Yup.string()
    .required("Confirm Password is required")
    .oneOf([Yup.ref("newPassword")], "Passwords must match"),
});

export const updatePropertySchema = Yup.object().shape({
  name: Yup.string().required("Property Name is required"),
  description: Yup.string().required("Description is required"),
  phone: Yup.string().optional(),
  address_1: Yup.string().optional(),
  email: Yup.string().optional(),
  country: Yup.string().optional(),
  city: Yup.string().optional(),
  state: Yup.string().optional(),
  zip_code: Yup.string().optional(),
});

export const updateOrganizationSchema = Yup.object().shape({
  name: Yup.string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters"),
  phone: Yup.string()
    .required("Phone is required")
    .matches(
      /^\+?(\d.*){3,}$/,
      "Phone number is not valid. It should have at least 3 digits and can start with a +"
    ),
  address: Yup.string()
    .required("Address is required")
    .min(5, "Address must be at least 5 characters"),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  description: Yup.string()
    .required("Description is required")
    .min(10, "Description must be at least 10 characters"),
});

export const addRoomSchema = (timezoneCurrentDate: string) =>
  Yup.object().shape({
    arrivalDepatureDate: Yup.object().shape({
      checkIn: Yup.date()
        .required("Check-in date is required")
        .typeError("Check-in date must be a valid date")
        .test(
          "check-in-future-date",
          "Check-in date must be today or in the future",
          function (value) {
            if (!value) return true;
            return moment(value).isSameOrAfter(
              moment(timezoneCurrentDate),
              "day"
            );
          }
        ),

      checkOut: Yup.date()
        .required("Check-out date is required")
        .typeError("Check-out date must be a valid date")
        .min(
          Yup.ref("checkIn"),
          "Check-out date cannot be before check-in date"
        )
        .test(
          "check-out-after-check-in",
          "Check-out date must be after check-in date",
          function (value) {
            const { checkIn } = this.parent;
            return checkIn && value ? value > checkIn : true;
          }
        ),
    }),

    roomCount: Yup.number()
      .required("Room Count is required")
      .min(0, "Room Count cannot be negative"),

    rate: Yup.string().required("Rate is required"),

    roomType: Yup.array()
      .of(Yup.string().required("Room type is required"))
      .min(1, "At least one room type is required")
      .required("Room type is required"),
  });

const guestSchema: Yup.ObjectSchema<IGuest> = Yup.object().shape({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  email: Yup.string().notRequired().email("Invalid email"),
  id: Yup.number(),
  primaryGuest: Yup.boolean().optional(),
});

export const fullGuestSchema: Yup.ObjectSchema<IFullGuest> = Yup.object().shape(
  {
    first_name: Yup.string().required("First name is required"),
    last_name: Yup.string().required("Last name is required"),
    email: Yup.string().required("Email is required").email("Invalid email"),
    country: Yup.string()
      .required("Two letter country is required.")
      .min(2)
      .max(2),
    phone: Yup.string(),
    cell_phone: Yup.string(),
    address: Yup.string(),
    gender: Yup.string(),
    birth_date: Yup.string(),
    document_type: Yup.string(),
    document_number: Yup.string(),
    document_issue_date: Yup.string(),
    document_issuing_country: Yup.string(),
    document_expiration_date: Yup.string(),
    custom_fields: Yup.array(),
    note: Yup.string(),
    tax_id: Yup.string(),
    company_name: Yup.string(),
    company_tax_id: Yup.string(),
    id: Yup.number(),
  }
);

// Room Type Schema
const roomTypeSchema = Yup.object().shape({
  id: Yup.number().required("Room type ID is required"),
  type: Yup.string().required("Room type is required"),
  typeDescription: Yup.string().required("Room type description is required"),
  adults: Yup.number()
    .min(1, "At least one adult is required")
    .required("Number of adults is required"),
  children: Yup.number()
    .min(0, "Number of children cannot be negative")
    .required("Number of children is required"),
  sizeBeds: Yup.number()
    .min(1, "At least one bed is required")
    .required("Number of beds is required"),
  propertyId: Yup.number().required("Property ID is required"),
  occupancy: Yup.number()
    .min(1, "Occupancy must be at least 1")
    .required("Occupancy is required"),
});

const selectedRoomSchema = Yup.object().shape({
  roomNumber: Yup.number()
    .required("Room number is required")
    .min(1, "Room number must be a positive integer"),
  guests: Yup.array()
    .of(guestSchema)
    .min(1, "At least one guest is required")
    .required("Guest is required"),
});

const staySchema = Yup.object().shape({
  roomTypeId: Yup.number().required("Room type ID is required"),
  roomType: roomTypeSchema.required(),
  primaryGuest: Yup.bool().default(false),
  guests: Yup.array().of(guestSchema).notRequired().nullable(),
  childrenCount: Yup.number(),
  roomList: Yup.array()
    .of(selectedRoomSchema)
    .min(1, "At least one room must be selected"),
  noOfRooms: Yup.number().required(),
  // guests: Yup.array()
  //   .of(guestSchema)
  //   .min(1, "At least one guest is required")
  //   .required("Guest is required"),
  specialRequests: Yup.string()
    .notRequired()
    .matches(
      allowedCharactersRegex,
      "Special requests contain invalid characters"
    ),
  expectedCheckinTime: Yup.date()
    .notRequired() // Mark as optional
    .nullable() // Allows the field to be null
    .test(
      "is-valid-time",
      "Invalid time format",
      (value) => !value || dayjs(value).isValid() // Validate only if a value is provided
    ),

  // Optional Check-Out Time
  expectedCheckOutTime: Yup.date()
    .notRequired() // Mark as optional
    .nullable() // Allows the field to be null
    .test(
      "is-valid-time",
      "Invalid time format",
      (value) => !value || dayjs(value).isValid() // Validate only if a value is provided
    ),
});

const paymentDetailSchema = Yup.object().shape({
  paymentType: Yup.string()
    .oneOf(["Card", "Cash"], "Payment type must be either Card or Cash")
    .required("Payment type is required"),
});

export const reservationSchema: Yup.ObjectSchema<IReservation> =
  Yup.object().shape({
    startDate: Yup.date().required("Start date is required"),
    endDate: Yup.date().required("End date is required"),
    id: Yup.number(),
    guestId: guestSchema.nullable().default(null),
    groupId: Yup.number(),
    propId: Yup.number()
      .required("Property ID is required")
      .positive("Property ID must be a positive number"),
    reservationUuid: Yup.string().required("Reservation Uuid is required"),
    roomTypeIds: Yup.array()
      .of(Yup.string().required("Room type ID is required"))
      .min(1, "At least one room type ID is required")
      .required("Room type IDs are required"),
    rateCode: Yup.number()
      .required("Rate Code is required")
      .positive("Rate Code must be a positive number"),
    marketSegment: Yup.string().required("Marketing segment is required"),
    bookingChannel: Yup.string().required("Booking channel is required"),
    fees: Yup.array(),
    taxes: Yup.array(),
    guest: fullGuestSchema.notRequired().nullable(),
    stays: Yup.array()
      .of(staySchema)
      .min(1, "At least one stay is required")
      .required("Stays are required"),
    paymentDetail: paymentDetailSchema,
    payment: Yup.string().oneOf(
      Object.values(PaymentChargeTypeEnum).map(
        (e) => e as PaymentChargeTypeEnum
      )
    ),
  });

export const addEmailTemplateValidationSchema = Yup.object().shape({
  name: Yup.string().required("Template name is required"),
  subject: Yup.string().required("Subject is required"),
  category: Yup.string().required("Category is required"),
  fromAddress: Yup.string()
    .email("Invalid email address")
    .required("From address is required"),
  body: Yup.string().required("Body is required"),
});

export const addRateSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  description: Yup.string().required("Description is required"),
  rate: Yup.string()
    .required("Rate is required")
    .test("is-numeric", "Rate must be a valid number", (value) =>
      value !== undefined ? /^[0-9]*\.?[0-9]+$/.test(value) : false
    ),
  posting_department: Yup.string().required("Posting Department is required"),
  starts_from: Yup.date().required("Start from date is required"),
  posting_code_id: Yup.number()
    .typeError("Posting code is required")
    .required("Posting code is required"),
  active: Yup.boolean().required("Active field is required"),
  type: Yup.mixed<TaxRateType>()
    .oneOf([TaxRateType.PERCENTAGE, TaxRateType.RATE])
    .required("Type is required"),

  // Fee-specific fields (conditionally required if type === "RATE")
  assignment_type: Yup.mixed<"AUTO_APPLIED" | "MANUALLY_ADDED">().test(
    "assignment-type-required-when-rate",
    "Assignment Type must be AUTO_APPLIED or MANUALLY_ADDED when type is RATE",
    function (value) {
      const { type } = this.parent;
      if (type === TaxRateType.RATE) {
        return value === "AUTO_APPLIED" || value === "MANUALLY_ADDED";
      }
      return true;
    }
  ),

  occurrence: Yup.mixed<
    "PER_NIGHT" | "PER_RESERVATION" | "PER_ROOM" | "PER_PERSON"
  >().test(
    "occurrence-required-when-rate",
    "Occurrence must be one of the allowed values when type is RATE",
    function (value) {
      const { type } = this.parent;
      if (type === TaxRateType.RATE) {
        return [
          "PER_NIGHT",
          "PER_RESERVATION",
          "PER_ROOM",
          "PER_PERSON",
        ].includes(value as string);
      }
      return true;
    }
  ),

  taxable: Yup.boolean().test(
    "taxable-required-when-rate",
    "Taxable must be true or false when type is RATE",
    function (value) {
      const { type } = this.parent;
      if (type === TaxRateType.RATE) {
        return typeof value === "boolean";
      }
      return true;
    }
  ),
  // assignment_type: Yup.string().when("type", {
  //   is: TaxRateType.RATE,
  //   then: (schema) => schema.required("Assignment Type is required"),
  //   otherwise: (schema) => schema.notRequired(),
  // }),
  // occurrence: Yup.string().when("type", {
  //   is: TaxRateType.RATE,
  //   then: (schema) => schema.required("Occurrence is required"),
  //   otherwise: (schema) => schema.notRequired(),
  // }),
  // taxable: Yup.boolean().when("type", {
  //   is: TaxRateType.RATE,
  //   then: (schema) => schema.required("Taxable field is required"),
  //   otherwise: (schema) => schema.notRequired(),
  // }),
});

export const editRateSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  description: Yup.string().required("Descriptiom is required"),
  posting_department: Yup.string().required("Posting Department is required"),
  posting_code_id: Yup.number()
    .typeError("Please select Posting code")
    .required("Please select Posting code")
    .moreThan(0, "Please select Posting code"),

  active: Yup.boolean().required("Active field is required"),
  type: Yup.mixed<TaxRateType>()
    .oneOf([TaxRateType.PERCENTAGE, TaxRateType.RATE])
    .required("Type is required"),

  // Fee-specific fields (conditionally required if type === "RATE")
  assignment_type: Yup.mixed<"AUTO_APPLIED" | "MANUALLY_ADDED">().test(
    "assignment-type-required-when-rate",
    "Assignment Type must be AUTO_APPLIED or MANUALLY_ADDED when type is RATE",
    function (value) {
      const { type } = this.parent;
      if (type === TaxRateType.RATE) {
        return value === "AUTO_APPLIED" || value === "MANUALLY_ADDED";
      }
      return true;
    }
  ),

  occurrence: Yup.mixed<
    "PER_NIGHT" | "PER_RESERVATION" | "PER_ROOM" | "PER_PERSON"
  >().test(
    "occurrence-required-when-rate",
    "Occurrence must be one of the allowed values when type is RATE",
    function (value) {
      const { type } = this.parent;
      if (type === TaxRateType.RATE) {
        return [
          "PER_NIGHT",
          "PER_RESERVATION",
          "PER_ROOM",
          "PER_PERSON",
        ].includes(value as string);
      }
      return true;
    }
  ),

  taxable: Yup.boolean().test(
    "taxable-required-when-rate",
    "Taxable must be true or false when type is RATE",
    function (value) {
      const { type } = this.parent;
      if (type === TaxRateType.RATE) {
        return typeof value === "boolean";
      }
      return true;
    }
  ),
});

export const addFeeSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  occurrence: Yup.string().required("Occurrence is required"),
  description: Yup.string().required("Descriptiom is required"),
  posting_department: Yup.string().required("Posting Department is required"),
  posting_code_id: Yup.number().required("Posting code is required"),
});

export const createFeeSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  occurrence: Yup.string().required("Occurrence is required"),
  description: Yup.string().required("Descriptiom is required"),
  rate: Yup.string().required("Rate is required"),
  starts_from: Yup.date().required("Start from date is required"),
  posting_department: Yup.string().required("Posting Department is required"),
  posting_code_id: Yup.number().required("Posting code is required"),
});

export const createMaintenanceSchema = Yup.object().shape({
  property_id: Yup.number().required("Property is required"),
  service_code: Yup.string().required("Service code is required"),
  service_subject: Yup.string().required("Service subject is required"),
  service_request: Yup.string().required("Service request is required"),
  expected_start_date: Yup.string()
    .optional()
    .test(
      "is-valid-start-date",
      "Expected start date must be a valid date",
      (value) => !value || moment(value).isValid()
    ),
  expected_completion_date: Yup.string()
    .required("Expected completion date is required")
    .test(
      "is-valid-completion-date",
      "Expected completion date must be a valid date",
      (value) => (value ? moment(value).isValid() : false)
    )
    .test(
      "is-after-start",
      "Expected completion date must be after start date",
      function (value) {
        const { expected_start_date } = this.parent as {
          expected_start_date?: string;
        };
        if (!value || !moment(value).isValid()) return false; // required + valid handled above
        if (!expected_start_date) return true; // no start -> skip ordering rule
        return moment(value).isSameOrAfter(moment(expected_start_date), "day");
      }
    ),
});

export const createRateCodeSchema = Yup.object().shape({
  name: Yup.string()
    .matches(/^[A-Z0-9\s]*$/, "Name must be in uppercase")
    .required("Name is required"),
  type: Yup.string().required("Type is required"),
  description: Yup.string().required("Description is required"),
  suppressed: Yup.boolean().required("Suppressed is required"),
});

export const addAddonSpecialRequest = Yup.object().shape({
  specialRequests: Yup.string()
    .required()
    .matches(
      allowedCharactersRegex,
      "Special requests contain invalid characters"
    ),
  roomType: Yup.string().required("Room type is required"),
});

export const checkInCheckoutSchema = Yup.object().shape({
  startDate: Yup.string()
    .nullable()
    .test("is-valid-time", "Invalid time format", (value) => {
      if (!value) {
        // since it is nullable it is valid
        return true;
      }
      return dayjs(value).isValid();
    })
    .test(
      "is-before-end",
      "Start Date must be before End Date",
      function (value) {
        const { endDate } = this.parent;
        if (endDate && value) {
          return dayjs(endDate).isAfter(dayjs(value), "day");
        }
        return true;
      }
    ),
  endDate: Yup.string()
    .nullable()
    .test("is-valid-time", "Invalid time format", (value) => {
      if (!value) {
        // since it is nullable it is valid
        return true;
      }
      return dayjs(value).isValid();
    })
    .test(
      "is-after-start",
      "End Date must be after Start Date",
      function (value) {
        const { startDate } = this.parent;
        if (startDate && value) {
          return dayjs(value).isAfter(dayjs(startDate), "day");
        }
        return true;
      }
    ),
  checkInTime: Yup.date()
    .nullable()
    .test("is-valid-time", "Invalid time format", (value) => {
      if (!value) {
        // since it is nullable it is valid
        return true;
      }
      return dayjs(value).isValid();
    }),

  checkOutTime: Yup.date()
    .nullable()
    .test("is-valid-time", "Invalid time format", (value) => {
      if (!value) {
        // since it is nullable it is valid
        return true;
      }
      return dayjs(value).isValid();
    })
    .test(
      "is-after-checkin",
      "Check-Out Time must be after Check-In Time",
      function (value) {
        const { checkInTime } = this.parent;
        if (checkInTime && value) {
          return dayjs(value).isAfter(dayjs(checkInTime));
        }
        return true;
      }
    ),
});

export const addUserValidationSchema = Yup.object().shape({
  userName: Yup.string().required("User Name is required"),
  email: Yup.string().required("Email is required").email("Email is not valid"),
  password: Yup.string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
  department: Yup.string().required("Department is required"),
  role: Yup.string().required("Role is required"),
  firstName: Yup.string().required("First Name is required"),
  lastName: Yup.string().required("Last Name is required"),
  property: Yup.string().required("Property is required"),
});

export const addRoleValidationSchema = Yup.object().shape({
  name: Yup.string().required("Role Name is required"),
  description: Yup.string().required("Description is required"),
});

export const editRoleValidationSchema = Yup.object().shape({
  id: Yup.string().required("Role Name is required"),
  name: Yup.string().required("Role Name is required"),
  description: Yup.string().required("Description is required"),
});

export const assignRoleValidationSchema = Yup.object().shape({
  user: Yup.string().required("User ID is required"),
  roles: Yup.string().required("Assign Role is required"),
});

export const updateUserValidationSchema = Yup.object().shape({
  userName: Yup.string().required("User Name is required"),
  email: Yup.string().required("Email is required").email("Email is not valid"),
  id: Yup.string().required(),
  firstName: Yup.string().required("First Name is required"),
  lastName: Yup.string().required("Last Name is required"),
  property: Yup.string().required("Property is required"),
});

export const assignRoomSchema = Yup.object().shape({
  roomId: Yup.number().required("Room number is required"),
});

export const addPropertyAmenitiesSchema = Yup.object({
  name: Yup.string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters long"),
  description: Yup.string()
    .required("Description is required")
    .min(5, "Description must be at least 5 characters long"),
  additional_charge: Yup.boolean().required(
    "Additional charge field is required"
  ),
  featured: Yup.boolean().required("Featured field is required"),
  category_id: Yup.number()
    .required("Category ID is required")
    .positive("Category ID must be a positive number")
    .integer("Category ID must be an integer")
    .min(1, "Category ID must be greater than 0"),
});

export const addRoomAmenitySchema = Yup.object({
  name: Yup.string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters long"),
  description: Yup.string()
    .required("Description is required")
    .min(5, "Description must be at least 5 characters long"),
  additional_charge: Yup.boolean().required(
    "Additional charge field is required"
  ),
  featured: Yup.boolean().required("Featured field is required"),
  category_id: Yup.number()
    .required("Category ID is required")
    .positive("Category ID must be a positive number")
    .integer("Category ID must be an integer"),
  charge: Yup.number()
    .required("Charge is required")
    .typeError("Charge must be a number"),
});

export const propertySchema = Yup.object().shape({
  name: Yup.string().required("Property Name is required"),
  description: Yup.string().required("Description is required"),
  phone: Yup.string().required("Phone is required").optional(),
  address_1: Yup.string().required("Address is required").optional(),
  email: Yup.string().optional().email("Enter valid email"),
  country: Yup.string().required("Country is required").optional(),
  city: Yup.string().required("City is required").optional(),
  state: Yup.string().required("State is required").optional(),
  zip_code: Yup.string().required("Zip is required").optional(),
  phone_toll_free: Yup.string().optional(),
  fax: Yup.string().optional(),
  address_2: Yup.string().optional(),
});

export const changeEmailSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  emailVerify: Yup.string()
    .oneOf([Yup.ref("email")], "Emails must match")
    .required("Please confirm your email"),
});

export const changePasswordSchema = Yup.object().shape({
  oldPassword: Yup.string().required("Password is required"),
  newPassword: Yup.string()
    .min(8, "New password must be at least 8 characters")
    .required("New password is required"),
  passwordVerify: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .required("Please confirm your new password"),
});

export const addRoomTypeSchema = Yup.object().shape({
  name: Yup.string().required("Room Name is required"),
  type: Yup.string().required("Room Type is required"),
  type_icon: Yup.string().optional(),
  type_description: Yup.string().required("Description is required"),
  // inventory: Yup.number()
  //   .transform((value, originalValue) => (originalValue === "" ? null : value))
  //   .required("Inventory is required")
  //   .min(0, "Inventory cannot be negative"),
  // occupancy: Yup.number()
  //   .transform((value, originalValue) => (originalValue === "" ? null : value))
  //   .required("Occupancy is required")
  //   .min(0, "Occupancy cannot be negative"),
  adults: Yup.number()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .required("Adults count is required")
    .min(0, "Adults count cannot be negative"),
  children: Yup.number()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .required("Children count is required")
    .min(0, "Children count cannot be negative"),
  smoking: Yup.boolean(),
  size_beds: Yup.number()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .required("No. of Beds is required"),
  rental_type: Yup.string()
    .oneOf(
      Object.values(RoomRentalTypes),
      "Rental Type must be one of: Guest Room, Rental Space, Event Space"
    )
    .required("Rental Type is required"),
});

export const addSaleAccountSchema = Yup.object().shape({
  property_id: Yup.number().required(),

  first_name: Yup.string().required("First Name is required"),
  last_name: Yup.string().required("Last Name is required"),
  country: Yup.string().required("Country is required"),

  phone: Yup.string().required("Phone is required"),
  phone_extension: Yup.string().optional(),
  cell_phone: Yup.string().optional(),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  address: Yup.string().optional(),

  billing_name: Yup.string().required("Billing Name is required"),
  billing_phone: Yup.string().required("Billing Phone is required"),
  billing_phone_ext: Yup.string().optional(),
  billing_fax: Yup.string().optional(),
  billing_email: Yup.string()
    .email("Invalid email format")
    .required("Billing Email is required"),
  billing_address: Yup.string().required("Billing Address is required"),
  billing_city: Yup.string().required("Billing City is required"),
  billing_state: Yup.string().required("Billing State is required"),
  billing_zip: Yup.string().required("Billing Zip is required"),
  billing_country: Yup.string().optional(),

  role: Yup.string().optional(),
  notes: Yup.string().optional(),
});

export const salesContactSchema = addSaleAccountSchema.shape({
  id: Yup.number(),
  email: Yup.string().optional(),
  phone: Yup.string().optional(),
  billing_name: Yup.string().optional(),
  billing_phone: Yup.string().optional(),
  billing_email: Yup.string().email("Invalid email format").optional(),
  billing_address: Yup.string().optional(),
  billing_city: Yup.string().optional(),
  billing_state: Yup.string().optional(),
  billing_zip: Yup.string().optional(),
});

export const addSalesGroupSchema = Yup.object().shape({
  group_code: Yup.string()
    .nullable()
    .max(20, "Group code must be at most 20 characters"),

  group_name: Yup.string()
    .required("Group name is required")
    .max(50, "Group name must be at most 50 characters"),

  group_type: Yup.string()
    .required("Group type is required")
    .max(30, "Group type must be at most 30 characters"),

  group_description: Yup.string()
    .nullable()
    .max(255, "Group description must be at most 255 characters"),

  group_status: Yup.string()
    .required("Group status is required")
    .max(20, "Group status must be at most 20 characters"),

  group_arrival_date: Yup.date()
    .required("Group arrival date is required")
    .typeError("Group arrival date must be a valid date"),

  group_departure_date: Yup.date()
    .required("Group departure date is required")
    .min(
      Yup.ref("group_arrival_date"),
      "Departure date must be after arrival date"
    )
    .typeError("Group departure date must be a valid date"),

  group_release_date: Yup.date()
    .required("Group release date is required")
    .typeError("Group release date must be a valid date"),

  group_cutoff_date: Yup.date()
    .required("Group cutoff date is required")
    .typeError("Group cutoff date must be a valid date"),
});

export const addNewGuestValidationSchema = Yup.object().shape({
  first_name: Yup.string()
    .required("First name is required")
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name cannot be longer than 50 characters"),

  last_name: Yup.string()
    .required("Last name is required")
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name cannot be longer than 50 characters"),

  email: Yup.string()
    .required("Email is required")
    .email("Must be a valid email address")
    .max(100, "Email cannot be longer than 100 characters"),
});

export const addNewSecondaryGuestValidationSchema = Yup.object().shape({
  first_name: Yup.string()
    .required("First name is required")
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name cannot be longer than 50 characters"),

  last_name: Yup.string()
    .required("Last name is required")
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name cannot be longer than 50 characters"),

  email: Yup.string(),
});

export const addRoomNumberAssignSchema = Yup.object().shape({
  room_type_id: Yup.number()
    .required("Room Type ID is required")
    .min(1, "Room Type ID must be greater than 0"),
  property_id: Yup.number()
    .optional()
    .nullable()
    .min(1, "Property ID must be greater than 0"),
  wing: Yup.string()
    .optional()
    .nullable()
    .max(50, "Wing must not exceed 50 characters"),
  floor: Yup.number().optional().nullable().min(0, "Floor must be at least 0"),
  rooms: Yup.array()
    .of(
      Yup.object().shape({
        room_number: Yup.string()
          .required("Room Number is required")
          .matches(/^\d+$/, "Room Number must be numeric"),
      })
    )
    .min(1, "At least one room must be added")
    .required("Rooms are required"),
});

export const roomAutoGenerateNumberSchema = Yup.object().shape({
  wing: Yup.string().optional(),
  floor: Yup.number().optional().positive("Floor must be a positive number"),
  start_room_number: Yup.number()
    .required("Starting room number is required")
    .positive("Starting room number must be a positive number"),
  room_range: Yup.array()
    .of(Yup.number().positive("Room range must contain positive numbers"))
    .length(2, "Room range must contain exactly two numbers")
    .test(
      "valid-range",
      "Room range must have a start less than or equal to the end",
      (value) => {
        if (!Array.isArray(value) || value.length < 2) return true; // Skip validation if value is invalid
        const [start, end] = value;

        // Ensure start and end are not undefined
        if (start === undefined || end === undefined) return true;

        return start <= end;
      }
    )
    .required("Room range is required"),
  skip_numbers: Yup.array()
    .of(
      Yup.number()
        .positive("Skip numbers must be positive numbers")
        .test(
          "within-range",
          "Skip numbers must be within the room range",
          function (value) {
            if (value == null) return true; // Skip validation if value is undefined or null
            const { room_range } = this.parent;
            if (!room_range || room_range.length < 2) return true; // Skip validation if range isn't set
            const [start, end] = room_range;

            // Ensure start and end are not undefined
            if (start === undefined || end === undefined) return true;

            return value >= start && value <= end;
          }
        )
    )
    .required(),
});

export const addRoomNumberSchema = Yup.object().shape({
  wing: Yup.string().optional(),
  floor: Yup.string().optional().min(0, "Floor must be at least 0"),
});

export const roomRateRequestSchema = Yup.object().shape({
  roomType: Yup.string().required("Room Type is required"),
  days: Yup.array()
    .of(Yup.string().required()) // Ensure every value is a string and not undefined
    .min(1, "At least one day must be selected")
    .required("Days are required"),

  rate: Yup.number()
    .typeError("Rate must be a number")
    .min(0, "Rate must be 0 or greater")
    .required("Rate is required"),
  billing_unit: Yup.string()
    .oneOf(["PER_DAY", "PER_HOUR", "PER_HALF_HOUR"], "Select a billing unit")
    .required("Billing unit is required"),
  dateRange: Yup.object()
    .shape({
      startDate: Yup.string().required("Start Date is required"),
      endDate: Yup.string()
        .required("End Date is required")
        .test(
          "is-after-start",
          "End Date must be after Start Date",
          function (endDate) {
            const { startDate } = this.parent;
            return (
              startDate &&
              endDate &&
              moment(endDate).isSameOrAfter(moment(startDate), "day")
            );
          }
        ),
    })
    .required("Date Range is required"),
});

export const rateCodeValidationSchema = Yup.object({
  rate_code_id: Yup.number()
    .required("Please Select Rate code")
    .min(1, "Please Select Rate code"),
  rate: Yup.number().required("Rate is required"),
  date: Yup.string().required("Rate Date is required"),
});

export const addPreconfigureChargesSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  amount: Yup.number()
    .required("Amount is required")
    .min(0, "Amount must be at least 0"),
  posting_code_id: Yup.number()
    .required("Posting Code Department ID is required")
    .min(1, "Posting Code Department ID must be at least 1"),
  posting_code_department_id: Yup.number()
    .required("Posting Code Department ID is required")
    .min(1, "Posting Code Department ID must be at least 1"),
  description: Yup.string().optional(),
  max_qty: Yup.number().optional().min(0, "Max Quantity must be at least 0"),
});

export const reservationEmailConfirmationSchema = Yup.object({
  guest_emails: Yup.array()
    .of(
      Yup.object({
        email: Yup.string()
          .email("Invalid email address")
          .required("Email is required"),
      })
    )
    .min(1, "At least one email is required")
    .required("Guest emails are required")
    .test("unique-emails", "Emails must be unique", (emails) => {
      const emailSet = new Set();
      for (let i = 0; i < emails?.length; i++) {
        const email = emails[i]?.email?.trim().toLowerCase();
        if (!email) continue;
        if (emailSet.has(email)) {
          return false;
        }
        emailSet.add(email);
      }
      return true;
    }),
});

export const addServiceRequestSchema = Yup.object().shape({
  request: Yup.string().required("Service Request Name is required"),
  description: Yup.string().required("Description is required"),
  posting_code_id: Yup.number()
    .positive("Posting Code ID must be a positive number")
    .integer("Posting Code ID must be an integer")
    .required("Posting Code ID is required"),
  rate: Yup.number()
    .min(0, "Rate must be zero or positive")
    .required("Rate is required"),
});

export const verifyGuestSchema = Yup.object().shape({
  first_name: Yup.string().required("First name is required"),
  last_name: Yup.string().required("Last name is required"),
  email: Yup.string().required("Email is required").email("Invalid email"),
  id: Yup.number(),
  document_type: Yup.string(),
  document_number: Yup.string(),
  document_issue_date: Yup.date()
    .nullable()
    .optional()
    .typeError("Document issue date must be a valid date")
    .max(new Date(), "Issue date cannot be in the future"),
  document_expiration_date: Yup.date()
    .nullable()
    .optional()
    .typeError("Expiration date must be a valid date")
    .min(
      Yup.ref("document_issue_date"),
      "Expiration date must be after issue date"
    ),
  document_issuing_country: Yup.string(),
});

export const createSettingSchema = Yup.object().shape({
  key: Yup.string().required("Key is required"),
  value: Yup.string().required("Value is required"),
  info: Yup.string().required("Info is required"),
  property_id: Yup.number().required("Property ID is required"),
});

export const addDirectBillingAccountSchema = Yup.object({
  guest_id: Yup.number().required("Guest ID is required"),
  credit_limit: Yup.number().min(0).required("Credit Limit is required"),
  billing_name: Yup.string().required("Billing Name is required"),
  billing_phone: Yup.string()
    .matches(/^\d+$/, "Phone number must be numeric")
    .required("Billing Phone is required"),
  billing_phone_ext: Yup.string().max(10).optional(),
  billing_fax: Yup.string().optional(),
  billing_email: Yup.string().email().required("Billing Email is required"),
  billing_address: Yup.string().required("Billing Address is required"),
  billing_city: Yup.string().required("Billing City is required"),
  billing_state: Yup.string().required("Billing State is required"),
  billing_zip: Yup.string().matches(/^\d+$/, "Zip must be numeric").required(),
  billing_country: Yup.string().required("Country is required"),
});

export const RoomingGuestSchema = Yup.object({
  first_name: Yup.string().required("First name is required"),
  last_name: Yup.string().required("Last name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
});

// Stay Schema
export const RoomingStaySchema = Yup.object({
  room_type_id: Yup.number()
    .required("Room type is required")
    .test("not-zero", "Please select room type", (value) => value !== 0),

  rate_code_id: Yup.number()
    .required("Rate code is required")
    .test("not-zero", "Please select rate code", (value) => value !== 0),
  primary_guest: Yup.boolean().required("Primary guest flag is required"),
  guests: Yup.array()
    .of(RoomingGuestSchema)
    .min(1, "At least one guest is required")
    .required("Guests are required"),
  special_requests: Yup.string().optional(),
  children_count: Yup.number()
    .min(0, "Children count cannot be negative")
    .required("Children count is required"),
  adults_count: Yup.number()
    .min(1, "There must be at least one adult")
    .required("Adults count is required"),
  tax_exemption_id: Yup.number().optional(),
});

// Main Rooming Schema
export const roomingSchema = Yup.object({
  startDate: Yup.date().required("Start date is required"),
  endDate: Yup.date()
    .min(Yup.ref("startDate"), "End date cannot be before start date")
    .required("End date is required"),
  stay: Yup.array()
    .of(RoomingStaySchema)
    .min(1, "At least one stay is required")
    .required("Stay information is required"),
});

export const createLostAndFoundSchema = Yup.object().shape({
  // Required fields from database
  location_found: Yup.string().required("Location found is required"),
  datetime_found: Yup.date().test(
    "required",
    "Date found is required",
    (value) => value != null
  ),
  item_description: Yup.string().required("Item description is required"),

  // Optional fields
  reservation_id: Yup.number().nullable(),
  guest_name: Yup.string(),
  departure_date: Yup.date(),
  item_name: Yup.string(),
  item_category: Yup.string(),
  item_attributes: Yup.string(),
  item_value_over_100: Yup.boolean(),
  item_storage_location: Yup.string(),
  found_by_name: Yup.string(),
  guest_contact: Yup.string(),
  guest_contacted: Yup.boolean(),
  guest_room_number: Yup.string(),
  guest_contacted_date: Yup.date(),
  release_date: Yup.date(),
  release_notes: Yup.string(),
  notes: Yup.string(),
  user_id: Yup.string(),
});

const rentalSpaceSectionSchema = Yup.object().shape({
  name: Yup.string().required("Section name is required"),
  description: Yup.string(),
  max_adults: Yup.number()
    .positive("Must be a positive number")
    .integer("Must be a whole number"),
  size_area: Yup.string(),
});

export const createRentalSpaceSchema = Yup.object().shape({
  name: Yup.string().required("Space name is required"),
  room_type_id: Yup.number()
    .transform((value, originalValue) =>
      originalValue === null || originalValue === "" ? undefined : value
    )
    .required("Room type is required"),
  description: Yup.string(),
  max_adults: Yup.number()
    .transform((value, originalValue) =>
      originalValue === null || originalValue === "" ? undefined : value
    )
    .positive("Must be a positive number")
    .integer("Must be a whole number")
    .optional(),
  size_area: Yup.string(),
  sections: Yup.array().of(rentalSpaceSectionSchema),
  adjacent_rooms: Yup.array(),
});
