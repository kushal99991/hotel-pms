import {
  IGetRoomTypeAvailabilityMainResponse,
  IGetRoomTypeAvailabilityUpdateResponse,
  IRateCodeResponse,
  IRoomTypeInventory,
  IRoomTypeInventoryResponse,
  IRoomTypeResponse,
  IRoomTypes,
} from "types/roomTypes";
import {
  INewRoomNumberList,
  INewRoomNumberListResponse,
  IRoomAmenitiesCategory,
  IRoomNumberList,
  IRoomAvailabilityIdsResponse,
  IRoomNumberListResponse,
} from "types/roomSliceTypes";
import {
  IInventory,
  IInventoryResponse,
  IReservationResponse,
  IUpdateReservation,
  IUpdateReservationResponse,
} from "types/reservationTypes";
import {
  IQuickSearch,
  IQuickSearchResponse,
  IStayDate,
  StayDateResponse,
} from "types/quickSearch";
import { IOrg, IOrgResponse } from "types/org";
import {
  EmailTemplate,
  EmailTemplateResponse,
  EmailTemplateTag,
  EmailTemplateTagResponse,
} from "types/emailTemplateTypes";
import {
  FinancialDataResponse,
  GuestStatus,
  GuestStatusList,
} from "types/bookingDashboardTypes";
import {
  IPasswordResetCodeResponse,
  IUser,
  IUserResponse,
  Role,
  RoleResponse,
} from "types/authTypes";
import { ResponsePayload } from "types/apiTypes";
import {
  IAmenityAssignedProperty,
  IProperty,
  IPropertyAmenity,
  IPropertyAmenityCategory,
} from "types/property";
import { IPropertyMediaResponse } from "types/propertyMediaTypes";
import {
  IRateCodeListResponse,
  IRateDynamicResponse,
  IRateDynamicV2Response,
} from "types/roomRateTypes";
import { ICustomRoomStatus } from "constants/room";
import { IReservationStatusEnum } from "types/settingTypes";
import { IPostingCode, IPostingCodeDept } from "types/financialSettingTypes";

export const simpleTransformResponse = (response: ResponsePayload<T>): T => {
  return response.data;
};

export const simpleArrayTransformResponse = (
  response: ResponsePayload<T[]>
): T[] => {
  return response.data.map((a) => ({
    ...a,
  }));
};

export const transformResetCodeResponse = (
  response: ResponsePayload<IPasswordResetCodeResponse>
): IPasswordResetCodeResponse => {
  return {
    success: response.data.success,
    error: response.data.error,
    message: response.data.message,
  };
};

export const transformWhoAmiResponse = (
  response: ResponsePayload<IUser>
): IUserResponse => ({
  id: response.data.id,
  email: response.data.email,
  name: response.data.name,
  userName: response.data.user_name,
  firstName: response.data.first_name,
  lastName: response.data.last_name,
  image: response.data.image,
  isActive: response.data.is_active,
  isVerified: response.data.is_verified,
  defaultPropertyId: response.data.default_property_id,
  userDepartment: response.data.user_department?.department_name ?? "",
  roles: response.data.roles.map((a) => ({
    id: a.id,
    name: a.name,
    description: a.description,
  })),
  lastLoginAt: response.data.last_login_at,
  accessToken: response.data.access_token,
  domain: response.data.domain,
  profileStatus: response.data?.profile_status || "At Work",
  profileImage: response.data?.profile_image ?? "",
  propertyAccess: response.data?.property_access ?? [],
});

export const transformQuickSearchResponse = (
  data: IQuickSearchResponse
): IQuickSearch => {
  return {
    columns: data.columns,
    data: data.data.map((a) => ({
      ADDRESS: a.ADDRESS,
      ARRIVAL: a.ARRIVAL,
      DEPARTURE: a.DEPARTURE,
      EMAIL: a.EMAIL,
      FIRST_NAME: a.FIRST_NAME,
      GUEST_ID: a.GUEST_ID,
      LAST_NAME: a.LAST_NAME,
      PHONE_NUMBER: a.PHONE_NUMBER,
      RESERVATION_STATUS: a.RESERVATION_STATUS,
      STAY_STATUS: a.STAY_STATUS,
    })),
  };
};

export const transformDashboardResponse = (
  data: GuestStatusList
): GuestStatusList => {
  return data.map((a) => ({
    ...a,
  }));
};

export const transformDashboardResponseObj = (
  data: GuestStatus
): GuestStatus => {
  return { ...data }; // 🌟 **Updated**
};

export const transformDashboardFinancialResponse = (
  data: FinancialDataResponse
): FinancialDataResponse => {
  return { ...data };
};

export const transformStayDateResponse = (
  response: ResponsePayload<StayDateResponse>
): IStayDate => ({
  columns: [
    "RESERVATION_ID",
    "FIRST_NAME",
    "LAST_NAME",
    "RESERVATION_STATUS",
    "ROOM_TYPE",
    "ROOM",
    "RATE",
    "ARRIVAL",
    "DEPARTURE",
    "EXPECTED_CHECK_IN",
    "EXPECTED_CHECK_OUT",
    "BALANCE",
  ],
  data: response.data.data.map((a) => ({
    FIRST_NAME: a.FIRST_NAME,
    ARRIVAL: a.ARRIVAL,
    DEPARTURE: a.DEPARTURE,
    LAST_NAME: a.LAST_NAME,
    RATE: a.RATE,
    RATE_CODE_NAME: a.RATE_CODE_NAME,
    RESERVATION_STATUS: a.RESERVATION_STATUS,
    ROOM: a.ROOM,
    ROOM_TYPE: a.ROOM_TYPE,
    RESERVATION_ID: a.RESERVATION_ID,
    BALANCE: a.BALANCE,
    EXPECTED_CHECK_IN: a.EXPECTED_CHECK_IN,
    EXPECTED_CHECK_OUT: a.EXPECTED_CHECK_OUT,
    GUESTS: a.GUESTS,
  })),
});

export const transformOrganizationDetailResponse = (
  response: ResponsePayload<IOrgResponse>
): IOrg => {
  return {
    address: response.data.address,
    description: response.data.description,
    childProperty: response.data?.child_property ?? [],
    email: response.data.email,
    id: response.data.id,
    logo: response.data.logo,
    name: response.data.name,
    phone: response.data.phone,
  };
};

export const transformGetRoomTypeAvailabilityResponse = (
  response: ResponsePayload<IGetRoomTypeAvailabilityMainResponse>
): IGetRoomTypeAvailabilityUpdateResponse => ({
  availability: response.data.availability.map((a) => ({
    roomType: {
      adults: a.room_type.adults,
      children: a.room_type.children,
      id: a.room_type.id,
      occupancy: a.room_type.occupancy,
      propertyId: a.room_type.property_id,
      sizeBeds: a.room_type.size_beds,
      type: a.room_type.type,
      typeDescription: a.room_type.type_description,
    },
    pricing: a.pricing,
    roomsAvailable: a.rooms_available,
    roomsNeededOfThisType: a.rooms_needed_of_this_type,
    roomTypeId: Number(a.room_type_id),
  })),
  reservationUuid: response.data.reservation_token,
  fees: response.data.fees,
  taxes: response.data.taxes,
});

export const transformGetRoomTypesResponse = (
  response: ResponsePayload<IRoomTypeResponse[]>
): IRoomTypes[] => {
  return response.data.map((a) => ({
    adults: a.adults,
    children: a.children,
    createdAt: a.created_at,
    id: a.id,
    inventory: a.inventory,
    occupancy: a.occupancy,
    propertyId: a.property_id,
    sizeArea: a.size_area,
    sizeBeds: a.size_beds,
    type: a.type,
    typeDescription: a.type_description,
    typeIcon: a.type_icon,
    updatedAt: a.updated_at,
    name: a?.name ?? "-",
    rentalType: a?.rental_type,
    amenities: a.amenities,
  }));
};

export const transformGetRateCodeResponse = (
  response: ResponsePayload<IRateCodeResponse[]>
): IRateCodeResponse[] => {
  return response.data.map((a) => ({
    ...a,
  }));
};

export const transGetEmailTemplateTagListResponse = (
  response: ResponsePayload<EmailTemplateTagResponse>
): EmailTemplateTag[] => {
  return (response.data ?? []).map((a) => ({ id: a, name: a }));
};

export const transGetEmailTemplateListResponse = (
  response: ResponsePayload<EmailTemplateResponse[]>
): EmailTemplate[] => {
  const sources = response.data ?? [];
  if (sources.length === 0) {
    return [];
  }
  return sources.map((a) => ({
    id: a.id,
    name: a.name,
    body: a.body,
    subject: a.subject,
    category: a.category,
    fromAddress: a.from_address,
    createdAt: a.created_at,
    createdBy: a.created_by,
    updatedAt: a.updated_at,
    updatedBy: a.updated_by,
  }));
};

export const transGetEmailTemplateByIdResponse = (
  response: ResponsePayload<EmailTemplateResponse>
): EmailTemplate => {
  const sources = response.data;
  return {
    id: sources.id,
    name: sources.name,
    body: sources.body,
    subject: sources.subject,
    category: sources.category,
    fromAddress: sources.from_address,
    createdAt: sources.created_at,
    createdBy: sources.created_by,
    updatedAt: sources.updated_at,
    updatedBy: sources.updated_by,
  };
};

export const transformGetReservationDetailByIdResponse = (
  response: ResponsePayload<IReservationResponse>,
  enumList: IReservationStatusEnum[] = []
): IReservationResponse => {
  const reservation = response.data;
  const primaryGuest = reservation?.guests?.find(
    (guest) => guest?.id === reservation?.primary_guest_id
  );
  return {
    ...reservation,
    statusInfo: enumList.find((a) => a.name === reservation.status) || {
      name: reservation.status,
      bg_color: "gray",
      text_color: "#fff",
      description: reservation.status,
    },
    reservation_first_guest_info:
      primaryGuest ?? reservation.reservation_first_guest_info,
  };
};

export const transformGetReservationListResponse = (
  response: ResponsePayload<IReservationResponse[]>,
  enumList: IReservationStatusEnum[]
): IReservationResponse[] => {
  const reservation = response.data;
  return reservation.map((a: IReservationResponse) =>
    transformGetReservationDetailByIdResponse(
      {
        data: a,
        status: response.status,
        message: response.message,
      },
      enumList
    )
  );
};

export const transGetRoomAvailabilityListResponse = (
  response: ResponsePayload<IRoomAvailabilityIdsResponse[]>
): IRoomAvailabilityIdsResponse[] => response.data ?? [];

const combineRoomStatuses = (
  statusLinks?: { room_status: string }[]
): ICustomRoomStatus | undefined => {
  if (!statusLinks || statusLinks.length === 0) return undefined;

  // Convert array of status objects to comma-separated string without extra spaces
  const combinedStatus = statusLinks
    .map((link) => link?.room_status?.trim()) // Trim any whitespace from individual statuses
    .join(",") as ICustomRoomStatus; // Join without space after comma

  return combinedStatus;
};

export const transGetRoomNumberListResponse = (
  response: ResponsePayload<IRoomNumberListResponse[]>
): IRoomNumberList[] => {
  const sources = response.data ?? [];
  if (sources.length === 0) {
    return [];
  }
  return sources.map((a: IRoomNumberListResponse) => ({
    id: a.id,
    floor: a.floor,
    wing: a.wing,
    roomNumber: a.room_number,
    roomTypeId: a.room_type_id,
    state: a.state,
    status: a.housekeeping_status,
    frontdesk_status: a.frontdesk_status,
    room_status: combineRoomStatuses(a?.room_status_linking),
    room_type_info: a?.room_type,
    updated_at: a?.updated_at,
    occupied_by: a?.occupied_by,
    housekeeping_status: a.housekeeping_status,
    // Newly mapped passthrough fields
    adjacent_room: a?.adjacent_room ?? null,
    adjacent_rooms: a?.adjacent_rooms ?? [],
    child_rooms: a?.child_rooms ?? [],
    description: a?.description ?? null,
    image: a?.image ?? null,
    is_in_commission: a?.is_in_commission,
    name: a?.name ?? null,
    parent_room: a?.parent_room ?? null,
    parent_room_id: a?.parent_room_id ?? null,
    property_id: a?.property_id,
    size_area: a?.size_area ?? null,
  }));
};

export const transGetNewRoomNumberListResponse = (
  response: ResponsePayload<INewRoomNumberListResponse[]>
): INewRoomNumberList[] => {
  const sources = response.data ?? [];
  if (sources.length === 0) {
    return [];
  }

  return sources.map((a) => ({
    id: a.id,
    roomNumber: a.room_number,
    state: a.state,
    status: a.housekeeping_status,
    housekeeping_status: a.housekeeping_status,
    roomTypeId: a.room_type_id,
    reservationStatus: undefined, // Map from `reservation` if applicable
    frontdesk_status: a.frontdesk_status,
    room_type: a.room_type,
    floor: a.floor?.toString(), // Convert `floor` to string if needed
    wing: a.wing,
    property_id: a.property_id,
    suggested_service: a.suggested_service
      ? {
          id: a.suggested_service.id,
          service_type: a.suggested_service.service_type,
          description: a.suggested_service.description,
          credits: a.suggested_service.credits,
          room_type_id: a.suggested_service.room_type_id,
        }
      : undefined,
    reservation: a.reservation, // Map to appropriate type if detailed structure exists
  }));
};

export const transformUserByIdResponse = (
  response: ResponsePayload<IUser>
): IUserResponse => {
  const user = response.data;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    userName: user.user_name,
    firstName: user.first_name,
    lastName: user.last_name,
    image: user.image,
    isActive: user.is_active,
    isVerified: user.is_verified,
    defaultPropertyId: user.default_property_id,
    userDepartment: user?.user_department?.department_name ?? "",
    departments: user?.departments || [],
    roles: user.roles.map((a) => ({
      id: a.id,
      name: a.name,
      description: a.description,
    })),
    lastLoginAt: user.last_login_at,
    accessToken: user.access_token,
    domain: user.domain,
  };
};

export const transformUserListResponse = (
  response: ResponsePayload<IUser[]>
): IUserResponse[] => {
  const users = response.data;

  return users.map((user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    userName: user.user_name,
    firstName: user.first_name,
    lastName: user.last_name,
    image: user.image,
    isActive: user.is_active,
    isVerified: user.is_verified,
    defaultPropertyId: user.default_property_id,
    userDepartment: user?.user_department?.department_name ?? "",
    department: user?.user_department
      ? {
          departmentName: user?.user_department.department_name,
          id: user.user_department?.id,
        }
      : null,
    departments: user?.departments || [],
    roles: user.roles.map((a) => ({
      id: a.id,
      name: a.name,
      description: a.description,
    })),
    lastLoginAt: user.last_login_at,
    accessToken: user.access_token,
    domain: user.domain,
    propertyAccess: user?.property_access ?? [],
  }));
};

export const transformRoleListResponse = (
  response: ResponsePayload<RoleResponse>
): Role[] => {
  const sources = response.data;
  return sources.result;
};

export const transformRoomTypeInventoryResponse = (
  response: ResponsePayload<IRoomTypeInventoryResponse[]>
): IRoomTypeInventory[] => {
  return response.data.map((a) => ({
    availableCount: a.available_count,
    date: a.date,
    roomType: a.room_type,
    typeDescription: a.type_description,
    typeIcon: a.type_icon,
    roomTypeId: a.room_type_id,
  }));
};

export const transformInventoryResponse = (
  response: ResponsePayload<IInventoryResponse[]>
): IInventory[] => {
  return response.data.map((item) => ({
    roomTypeId: item.room_type_id,
    rateCodeId: item.rate_code_id,
    date: item.date,
    reservedCount: item.reserved_count,
    allocatedPerRate: item.allocated_per_rate,
    availableCount: item.available_count,
  }));
};

export const transformReservationUpdateResponse = (
  response: ResponsePayload<IUpdateReservationResponse>
): IUpdateReservation => {
  return {
    endDate: response.data.end_date,
    reservationHolderId: response.data.reservation_holder_id,
    reservationId: response.data.reservation_id,
    specialRequests: response.data.special_requests,
    startDate: response.data.start_date,
    status: response.data.status,
    userId: response.data.user_id,
  };
};

export const transformRoomAssignResponse = (
  response: ResponsePayload<{ message: string }>
): { message: string } => {
  return (
    response?.data && {
      message: "Room Assign Successfully!",
    }
  );
};

export const transformPropertyAmenityResponse = (
  response: ResponsePayload<IAmenityAssignedProperty[]>
): IAmenityAssignedProperty[] => {
  return response.data;
};

export const transformAddPropertyAmenityResponse = (
  response: ResponsePayload<IAmenityAssignedProperty>
): IAmenityAssignedProperty => {
  return response.data;
};

export const transformEditPropertyAmenityResponse = (
  response: ResponsePayload<IPropertyAmenity>
): IPropertyAmenity => {
  return response.data;
};

export const transformPropertyAmenityCategoryResponse = (
  response: ResponsePayload<IPropertyAmenityCategory[]>
): IPropertyAmenityCategory[] => {
  return response.data;
};

export const transformPropertyMediaResponse = (
  response: ResponsePayload<IPropertyMediaResponse[]>
): IPropertyMediaResponse[] => {
  return response.data;
};

export const transformAddPropertyResponse = (
  response: ResponsePayload<IProperty>
): IProperty => {
  return response.data;
};

export const transGetRoomAmenitiesResponse = (
  response: ResponsePayload<IRoomAmenitiesCategory[]>
): IRoomAmenitiesCategory[] => response.data;

export const transformRoomTypeByIdResponse = (
  response: ResponsePayload<IRoomTypeResponse>
): IRoomTypes => {
  const source = response.data;
  return {
    id: source?.id ?? 0,
    type: source.type,
    name: source.name ?? "",
    typeIcon: source.type_icon,
    typeDescription: source.type_description,
    sizeArea: source.size_area,
    inventory: source.inventory,
    occupancy: source.occupancy,
    adults: source.adults,
    children: source.children,
    sizeBeds: source.size_beds,
    propertyId: source.property_id,
    createdAt: source.created_at,
    updatedAt: source.updated_at,
    smoking: source.smoking,
    image: source?.image?.split(",") ?? [],
    rentalType: source?.rental_type ?? "STAY",
    amenities: source.amenities,
  };
};

export const transformRoomRateDynamicListResponse = (
  response: ResponsePayload<IRateDynamicResponse[]>
): IRateDynamicResponse[] =>
  response.data.map((a) => ({ ...a, rateCode: a?.code ?? undefined }));

export const transformRoomRateDynamicV2ListResponse = (
  response: ResponsePayload<IRateDynamicV2Response[]>
): IRateDynamicV2Response[] => response.data;

export const transformRoomRateListResponse = (
  response: ResponsePayload<IRateCodeListResponse[]>
): IRateCodeListResponse[] => response.data;

export const transformPostingcodeListResponse = (
  response: ResponsePayload<IPostingCode[]>
): IPostingCode[] =>
  [...(response?.data ?? [])].sort((a, b) => Number(a.code) - Number(b.code));

export const transformPostingcodeDeptListResponse = (
  response: ResponsePayload<IPostingCodeDept[]>
): IPostingCodeDept[] =>
  [...(response?.data ?? [])].sort((a, b) => Number(a.code) - Number(b.code));
