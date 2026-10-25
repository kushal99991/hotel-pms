import moment from "moment";
import * as yup from "yup";
import { salesContactSchema } from "utils/validations.utils";

const blockItemSchema = yup.object({
  start_date: yup.date().required(),
  end_date: yup.date().required(),
  room_type_id: yup.number().required(),
  alloc_count: yup.number().min(0).required(),
});

export type GroupFormBlock = yup.InferType<typeof blockItemSchema>;

export const makeNewGroupSchema = (tzCurrentDate: string) => {
  const schema = yup
    .object({
      group_arrival_date: yup
        .date()
        .required("Main arrival date is required")
        .typeError("Check-in date must be a valid date object")
        .test(
          "check-in-future-date",
          "Check-in date must be today or in the future",
          function (value) {
            if (!value) return true;
            return moment(value).isSameOrAfter(moment(tzCurrentDate), "day");
          }
        ),
      group_departure_date: yup
        .date()
        .required("Main departure date is required")
        .typeError("Check-out date must be a valid date")
        .min(
          yup.ref("group_arrival_date"),
          "Departure date cannot be before arrival date"
        )
        .test(
          "departure-after-arrival",
          "Departure date must be after arrival date",
          function (value) {
            const { group_arrival_date } = this.parent;
            return group_arrival_date && value
              ? value > group_arrival_date
              : true;
          }
        ),
      shoulder_arrival_date: yup.date().nullable(),
      shoulder_departure_date: yup.date().nullable(),
      group_release_date: yup.date().nullable(),
      group_cutoff_date: yup.date().nullable(),

      // Main group rooms
      main_group_rooms: yup.number().min(1).required(),
      shoulder_rooms: yup.number().min(0).default(0),

      // Room blocks
      group_blocks: yup.array().of(blockItemSchema).required(),

      method_of_payment: yup.string(),
      rate_code_id: yup
        .number()
        .typeError("Please select a rate code.")
        .test("rate-code-check", "Please select a rate code.", (value) => {
          return !!(value && value > 0);
        }),
      catering: yup.boolean().default(false),
      banquet: yup.boolean().default(false),
      contract_signed: yup.boolean().default(false),
      shoulder_dates: yup.boolean().default(false),
      property_id: yup.number(),
      sales_contact_id: yup.number(),
      sales_contact: yup.mixed().optional(),
      status: yup.string(),
      payment_routing: yup.array().of(
        yup.object({
          folio: yup.string(),
          payment_type: yup.string(),
          posting_code_department_ids: yup.array().of(yup.number()),
        })
      ),
      group_attributes: yup.array().of(yup.string()),

      // Customer details
      group_name: yup.string().required("Group name is required"),
      group_code: yup.string(),
      group_description: yup.string(),
      group_status: yup.string(),
      first_name: yup.string().required("First name is required"),
      last_name: yup.string().required("Last name is required"),
      email: yup.string().email().required("Email is required"),
      phone: yup.string(),
      phone_extension: yup.string(),
      cell_phone: yup.string(),
      address: yup.string(),
      country: yup.string(),
      notes: yup.string(),
      booking_channel: yup.string(),
      market_segment: yup.string(),
      sales_distribution: yup.string(),
    })
    .required();

  return schema;
};

export type GroupReservationFormData = yup.InferType<
  ReturnType<typeof makeNewGroupSchema>
>;
