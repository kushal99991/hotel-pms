import { useGetRoomTypeAvailabilityMutation } from "services/roomTypeSlice";
import { ErrorResponse } from "types/apiTypes";
import { IGetRoomTypeAvailabilityUpdateResponse } from "types/roomTypes";

export enum GetGroupDateRangeEnum {
  SHOULDER_START = "Shoulder Start",
  SHOULDER_END = "Shoulder End",
  MAIN_GROUP = "Main Group",
}

export interface GetGroupAvailabilityError extends ErrorResponse {
  dateRange: GetGroupDateRangeEnum;
}

export interface IFetchGroupAvailabilityParams {
  shoulderStartDate?: string;
  shoulderEndDate?: string;
  shoulderRoomCount?: number;
  groupStartDate: string;
  groupEndDate: string;
  groupRoomCount: number;
  rateCodeId: number;
  roomTypeIds: string;
  propertyId: number;
}

export interface GroupAvailabilityData {
  shoulderStartAvailability?: IGetRoomTypeAvailabilityUpdateResponse;
  shoulderEndAvailability?: IGetRoomTypeAvailabilityUpdateResponse;
  mainAvailability?: IGetRoomTypeAvailabilityUpdateResponse;
}

export interface IGroupAvailabilityResult {
  data?: GroupAvailabilityData;
  isLoading: boolean;
  errors: GetGroupAvailabilityError[];
  fetchGroupAvailability: (params: IFetchGroupAvailabilityParams) => void;
  lazyFetchGroupAvailability: (
    params: IFetchGroupAvailabilityParams
  ) => Promise<{
    data?: GroupAvailabilityData;
    errors: GetGroupAvailabilityError[];
  }>;
}

export const useFetchGroupAvailability = (): IGroupAvailabilityResult => {
  const [
    fetchShoulderStart,
    {
      data: shoulderStartData,
      isLoading: isLoadingShoulderStart,
      error: errorShoulderStart,
    },
  ] = useGetRoomTypeAvailabilityMutation();

  const [
    fetchShoulderEnd,
    {
      data: shoulderEndData,
      isLoading: isLoadingShoulderEnd,
      error: errorShoulderEnd,
    },
  ] = useGetRoomTypeAvailabilityMutation();

  const [
    fetchMain,
    { data: mainAvailability, isLoading: isLoadingMain, error: errorMain },
  ] = useGetRoomTypeAvailabilityMutation();

  const lazyFetchGroupAvailability = async (
    params: IFetchGroupAvailabilityParams
  ): Promise<{
    data?: GroupAvailabilityData;
    errors: GetGroupAvailabilityError[];
  }> => {
    const {
      shoulderStartDate,
      shoulderEndDate,
      shoulderRoomCount,
      groupStartDate,
      groupEndDate,
      groupRoomCount,
      rateCodeId,
      roomTypeIds,
      propertyId,
    } = params;

    const hasShoulderData =
      shoulderStartDate &&
      shoulderEndDate &&
      shoulderRoomCount != null &&
      shoulderRoomCount > 0;

    const promises: {
      key: GetGroupDateRangeEnum;
      resultKey: keyof GroupAvailabilityData;
      promise: Promise<IGetRoomTypeAvailabilityUpdateResponse>;
    }[] = [];

    if (hasShoulderData) {
      promises.push({
        key: GetGroupDateRangeEnum.SHOULDER_START,
        resultKey: "shoulderStartAvailability",
        promise: fetchShoulderStart({
          startDate: shoulderStartDate,
          endDate: groupStartDate,
          roomTypeIds,
          numberOfGuests: String(shoulderRoomCount),
          rateCode: String(rateCodeId),
          property_id: String(propertyId),
        }).unwrap(),
      });

      promises.push({
        key: GetGroupDateRangeEnum.SHOULDER_END,
        resultKey: "shoulderEndAvailability",
        promise: fetchShoulderEnd({
          startDate: groupEndDate,
          endDate: shoulderEndDate,
          roomTypeIds,
          numberOfGuests: String(shoulderRoomCount),
          rateCode: String(rateCodeId),
          property_id: String(propertyId),
        }).unwrap(),
      });
    }

    promises.push({
      key: GetGroupDateRangeEnum.MAIN_GROUP,
      resultKey: "mainAvailability",
      promise: fetchMain({
        startDate: groupStartDate,
        endDate: groupEndDate,
        roomTypeIds,
        numberOfGuests: String(groupRoomCount),
        rateCode: String(rateCodeId),
        property_id: String(propertyId),
      }).unwrap(),
    });

    const results = await Promise.allSettled(promises.map((p) => p.promise));

    const errors: GetGroupAvailabilityError[] = [];
    const data: GroupAvailabilityData = {};

    results.forEach((result, i) => {
      if (result.status === "fulfilled") {
        data[promises[i].resultKey] = result.value;
      } else {
        errors.push({
          dateRange: promises[i].key,
          ...result.reason,
        } as GetGroupAvailabilityError);
      }
    });

    return {
      data: Object.keys(data).length > 0 ? data : undefined,
      errors,
    };
  };

  const fetchGroupAvailability = (params: IFetchGroupAvailabilityParams) => {
    const {
      shoulderStartDate,
      shoulderEndDate,
      shoulderRoomCount,
      groupStartDate,
      groupEndDate,
      groupRoomCount,
      rateCodeId,
      roomTypeIds,
      propertyId,
    } = params;

    const hasShoulderData =
      shoulderStartDate && shoulderEndDate && shoulderRoomCount != null;

    if (hasShoulderData) {
      fetchShoulderStart({
        startDate: shoulderStartDate,
        endDate: groupStartDate,
        roomTypeIds,
        numberOfGuests: String(shoulderRoomCount),
        rateCode: String(rateCodeId),
        property_id: String(propertyId),
      });

      fetchShoulderEnd({
        startDate: groupEndDate,
        endDate: shoulderEndDate,
        roomTypeIds,
        numberOfGuests: String(shoulderRoomCount),
        rateCode: String(rateCodeId),
        property_id: String(propertyId),
      });
    }

    fetchMain({
      startDate: groupStartDate,
      endDate: groupEndDate,
      roomTypeIds,
      numberOfGuests: String(groupRoomCount),
      rateCode: String(rateCodeId),
      property_id: String(propertyId),
    });
  };

  const isLoading =
    isLoadingShoulderStart || isLoadingShoulderEnd || isLoadingMain;
  const allErrorsObject = {
    [GetGroupDateRangeEnum.SHOULDER_START]: errorShoulderStart,
    [GetGroupDateRangeEnum.SHOULDER_END]: errorShoulderEnd,
    [GetGroupDateRangeEnum.MAIN_GROUP]: errorMain,
  };
  const errors = Object.keys(allErrorsObject)
    .map((key: GetGroupDateRangeEnum) => {
      const rawError = allErrorsObject[key];
      return {
        ...rawError,
        dateRange: key,
      } as GetGroupAvailabilityError;
    })
    .filter((e): e is NonNullable<typeof e> => e != null && !!e.code);

  const someDataPresent =
    shoulderStartData || shoulderEndData || mainAvailability;

  let data: GroupAvailabilityData | undefined = undefined;

  if (!isLoading) {
    data = someDataPresent
      ? {
          shoulderStartAvailability: shoulderStartData,
          shoulderEndAvailability: shoulderEndData,
          mainAvailability,
        }
      : undefined;
  }

  return {
    data,
    isLoading,
    errors,
    fetchGroupAvailability,
    lazyFetchGroupAvailability,
  };
};
