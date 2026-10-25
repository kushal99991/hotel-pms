import { Controller, FieldErrors, useForm } from "react-hook-form";
import React, { useEffect, useContext } from "react";
import moment from "moment";
import { Alert, Box, Grid } from "@mui/material";
import { yupResolver } from "@hookform/resolvers/yup";

import { addRoomSchema } from "utils/validations.utils";
import {
  useGetRateCodeByPropertyIdMutation,
  useGetRoomTypeAvailabilityMutation,
  useGetRoomTypeByPropertyIdMutation,
} from "services/roomTypeSlice";
import {
  IGetRoomTypeAvailability,
  IGetRoomTypeAvailabilityRequest,
  IRateCodeResponse,
  IRoomTypes,
} from "types/roomTypes";
import { IAddRoom, IReservation } from "types/reservationTypes";
import { useAuth } from "hooks";
import CustomDropdown from "components/widgets/CustomDropdown/CustomDropdown";
import PrimaryButton from "components/elements/Button/PrimaryButton";

import AddReservationViewContext from "contexts/AddReservationViewContext";
import { appConfig } from "config/app.config";
import CommonDateRangePicker from "components/elements/DatePicker/CommonDateRangePicker";
import RoomCounter from "./RoomCounter";
import { RoomRentalTypes } from "constants/room";

const DEFAULT_RESERVATION_DURATION_DAYS = 1;

export interface IUpdateDetail {
  startDate: Date;
  endDate: Date;
  rate: string;
  reservationUuid: string;
  roomTypeIds: string[];
}

interface IAddAvailableRooms {
  onUpdateRoomAvailability: (data: IGetRoomTypeAvailability[]) => void;
  onUpdate?: (detail: IUpdateDetail) => void;
  errors: FieldErrors<IReservation>;
  setParentFormValue: (name: any, value: unknown, config?: any) => void;
}

const AddAvailableRooms: React.FC<IAddAvailableRooms> = ({
  onUpdateRoomAvailability,
  onUpdate,
  errors,
  setParentFormValue,
}) => {
  const { viewState, setRoomTypeList, roomTypeList } = useContext(AddReservationViewContext)!;
  const { users } = useAuth();
  const timezoneCurrentDate = new Date();
  const maxRooms = 10;

  const methods = useForm<IAddRoom>({
    mode: "all",
    resolver: yupResolver(addRoomSchema(timezoneCurrentDate)),
    defaultValues: {
      arrivalDepatureDate: {
        checkIn: timezoneCurrentDate,
        checkOut: moment(timezoneCurrentDate).add(DEFAULT_RESERVATION_DURATION_DAYS, "days").toDate(),
      },
      roomCount: 1,
      rate: "",
      roomType: [],
    },
  });

  const {
    control,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors: availabilityError },
  } = methods;

  const roomCount = watch("roomCount") || 1;

  const [getRateCodeByPropertyId, { data: rateCodeList }] =
    useGetRateCodeByPropertyIdMutation();
  const [getRoomTypeByPropertyId, { data: apiRoomTypes }] =
    useGetRoomTypeByPropertyIdMutation();
  const [getRoomTypeAvailability, { isLoading }] =
    useGetRoomTypeAvailabilityMutation();

  // Update context with room type data when it changes
  useEffect(() => {
    if (apiRoomTypes) {
      setRoomTypeList(apiRoomTypes);
    }
  }, [apiRoomTypes, setRoomTypeList]);

  const onSubmit = async (data: IAddRoom) => {
    try {
      const numberOfGuests = viewState.totalAdults || 1;
      const start = moment(data.arrivalDepatureDate.checkIn);
      const end = moment(data.arrivalDepatureDate.checkOut);
      const formData: IGetRoomTypeAvailabilityRequest = {
        startDate: start.format(appConfig.dateApiFormat),
        endDate: end.format(appConfig.dateApiFormat),
        roomTypeIds: data.roomType?.join(","),
        numberOfGuests: numberOfGuests.toString(),
        rateCode: data.rate,
        property_id: (users?.defaultPropertyId ?? 0).toString(),
      };

      const response = await getRoomTypeAvailability(formData).unwrap();
      const sources = response.data;

      if ((sources?.availability ?? []).length === 0) {
        setError(
          "root",
          { message: "Room not available. Please select a different date." },
          { shouldFocus: true }
        );
      }

      const availabilityUpdateResponse: IGetRoomTypeAvailability[] = (
        sources?.availability ?? []
      ).map((availability: IGetRoomTypeAvailability) => {
        return {
          ...availability,
          noRooms: data.roomCount,
        };
      });

      onUpdateRoomAvailability(availabilityUpdateResponse);
      if (onUpdate) {
        onUpdate({
          startDate: data.arrivalDepatureDate.checkIn,
          endDate: data.arrivalDepatureDate.checkOut,
          rate: data.rate,
          reservationUuid: "",
          roomTypeIds: data.roomType || [],
        });
      }
    } catch (e: any) {
      setError("root", { message: e?.message || "Failed to fetch availability" });
    }
  };

  const handleRoomCountChange = (newCount: number) => {
    setValue("roomCount", newCount, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const rateCodeOptionList = (rateCodeList ?? [])
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((rateCode: IRateCodeResponse) => ({
      label: rateCode.name,
      value: rateCode.id.toString(),
    }));

  return (
    <Box component="form" mb={2} onSubmit={handleSubmit(onSubmit)}>
      {availabilityError?.root && (
        <Alert severity="error">{availabilityError.root.message}</Alert>
      )}
      <Grid container spacing={2} mb={2} alignItems="center">
        <Grid container item spacing={2} lg={12} alignItems="start">
          <Grid item xs={12} md={7}>
            <Controller
              name="arrivalDepatureDate"
              control={control}
              render={({
                field: { value, onChange },
                fieldState: { error, invalid },
              }) => {
                let errorMessage = error?.message;
                if (availabilityError?.arrivalDepatureDate?.checkIn) {
                  errorMessage =
                    availabilityError.arrivalDepatureDate.checkIn.message;
                }
                if (availabilityError?.arrivalDepatureDate?.checkOut) {
                  errorMessage =
                    availabilityError.arrivalDepatureDate.checkOut.message;
                }
                return (
                  <CommonDateRangePicker
                    label="Arrival / Departure"
                    value={[value?.checkIn || null, value?.checkOut || null]}
                    onChange={(selectedDate: [Date | null, Date | null]) =>
                      onChange({
                        checkIn: selectedDate?.[0],
                        checkOut: selectedDate?.[1],
                      })
                    }
                    minDate={new Date(timezoneCurrentDate)}
                    error={invalid}
                    helperText={errorMessage}
                  />
                );
              }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <Controller
              name="roomType"
              control={control}
              render={({
                field: { onChange, value },
                fieldState: { invalid, error },
              }) => (
                <>
                  <CustomDropdown
                    label="Room Type"
                    placeholder="Room Type"
                    onChange={onChange}
                    value={value}
                    isInvalid={invalid}
                    multiple
                    helperText={error?.message ?? ""}
                    options={(roomTypeList ?? [])
                      .filter(
                        (roomType: IRoomTypes) =>
                          roomType.rentalType === RoomRentalTypes.GUEST_ROOM
                      )
                      .map((roomType: IRoomTypes) => ({
                        label: roomType.type,
                        value: roomType.id.toString(),
                      }))}
                    fullWidth
                    aria-label="Room Type"
                    data-testid="room-type"
                  />
                </>
              )}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Controller
              name="rate"
              control={control}
              render={({
                field: { onChange, value },
                fieldState: { invalid, error },
              }) => (
                <CustomDropdown
                  label="Rate"
                  placeholder="Rate"
                  onChange={onChange}
                  value={value ?? null}
                  isInvalid={invalid}
                  helperText={error?.message ?? ""}
                  options={rateCodeOptionList}
                  fullWidth
                  aria-label="Rate"
                  data-testid="rate-dropdown"
                />
              )}
            />
          </Grid>
        </Grid>
        <Grid
          container
          spacing={2}
          justifyContent="space-between"
          alignItems="center"
          sx={{ paddingLeft: 2, marginTop: 1 }}
        >
          <Grid item xs={12} md={9} lg={9} sx={{ minWidth: 0, flexGrow: 1 }}>
            <RoomCounter
              count={roomCount}
              onChange={handleRoomCountChange}
              maxRooms={maxRooms}
            />
          </Grid>
          <Grid item xs={12} md={9} lg={3} sx={{ minWidth: 0, flexGrow: 1 }}>
            <PrimaryButton
              label="Check Availability"
              onClick={handleSubmit(onSubmit)}
              isLoading={isLoading}
              loadingText="Loading...."
              fullWidth
              data-testid="check-availability-button"
            />
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddAvailableRooms;





  const onSubmit = async (data: IAddRoom) => {
    try {
      const numberOfGuests = viewState.totalAdults || 1;
      const start = moment(data.arrivalDepatureDate.checkIn);
      const end = moment(data.arrivalDepatureDate.checkOut);
      const formData: IGetRoomTypeAvailabilityRequest = {
        startDate: start.format(appConfig.dateApiFormat),
        endDate: end.format(appConfig.dateApiFormat),
        roomTypeIds: data.roomType?.join(","),
        numberOfGuests: numberOfGuests.toString(),
        rateCode: data.rate,
        property_id: (users?.defaultPropertyId ?? 0).toString(),
      };

      const response = await getRoomTypeAvailability(formData);
      const sources = response.data;

      if ((sources?.availability ?? []).length === 0) {
        setError(
          "root",
          { message: "Room not available. Please select a different date." },
          { shouldFocus: true }
        );
      }

      const availabilityUpdateResponse: IGetRoomTypeAvailability[] = (
        sources?.availability ?? []
      ).map((availability: IGetRoomTypeAvailability) => {
        return {
          ...availability,
          noRooms: data.roomCount,
        };
      });

   
  };

  const handleRoomCountChange = (newCount: number) => {
    setValue("roomCount", newCount, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const rateCodeOptionList = (rateCodeList ?? [])
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((rateCode: IRateCodeResponse) => ({
      label: rateCode.name,
      value: rateCode.id.toString(),
    }));
  return (
    <Box component="form" mb={2} onSubmit={handleSubmit(onSubmit)}>
      {availabilityError?.root && (
        <Alert severity="error">{availabilityError.root.message}</Alert>
      )}
      <Grid container spacing={2} mb={2} alignItems="center">
        <Grid container item spacing={2} lg={12} alignItems="start">
          <Grid item xs={12} md={7}>
            <Controller
              name="arrivalDepatureDate"
              control={control}
              render={({
                field: { value, onChange },
                fieldState: { error, invalid },
              }) => {
                let errorMessage = error?.message;
                if (availabilityError?.arrivalDepatureDate?.checkIn) {
                  errorMessage =
                    availabilityError.arrivalDepatureDate.checkIn.message;
                }
                if (availabilityError?.arrivalDepatureDate?.checkOut) {
                  errorMessage =
                    availabilityError.arrivalDepatureDate.checkOut.message;
                }
                return (
                  <CommonDateRangePicker
                    label="Arrival / Departure"
                    value={[value.checkIn, value.checkOut]}
                    onChange={(selectedDate: [Date | null, Date | null]) =>
                      onChange({
                        checkIn: selectedDate?.[0],
                        checkOut: selectedDate?.[1],
                      })
                    }
                    minDate={new Date(timezoneCurrentDate)}
                    error={invalid}
                    helperText={errorMessage}
                  />
                );
              }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <Controller
              name="roomType"
              control={control}
              render={({
                field: { onChange, value },
                fieldState: { invalid, error },
              }) => (
                <>
                  <CustomDropdown
                    label="Room Type"
                    placeholder="Room Type"
                    onChange={onChange}
                    value={value}
                    isInvalid={invalid}
                    multiple
                    helperText={error?.message ?? ""}
                    options={(roomTypeList ?? [])
                      .filter(
                        (roomType: IRoomTypes) =>
                          roomType.rentalType === RoomRentalTypes.GUEST_ROOM
                      )
                      .map((roomType: IRoomTypes) => ({
                        label: roomType.type,
                        value: roomType.id.toString(),
                      }))}
                    fullWidth
                    aria-label="Room Type"
                    data-testid="room-type"
                  />
                </>
              )}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Controller
              name="rate"
              control={control}
              render={({
                field: { onChange, value },
                fieldState: { invalid, error },
              }) => (
                <CustomDropdown
                  label="Rate"
                  placeholder="Rate"
                  onChange={onChange}
                  value={value ?? null}
                  isInvalid={invalid}
                  helperText={error?.message ?? ""}
                  options={rateCodeOptionList}
                  fullWidth
                  aria-label="Rate"
                  data-testid="rate-dropdown"
                />
              )}
            />
          </Grid>
        </Grid>
        <Grid
          container
          spacing={2}
          justifyContent="space-between"
          alignItems="center"
          sx={{ paddingLeft: 2, marginTop: 1 }}
        >
          <Grid item xs={12} md={9} lg={9} sx={{ minWidth: 0, flexGrow: 1 }}>
            <RoomCounter
              count={roomCount}
              onChange={handleRoomCountChange}
              maxRooms={maxRooms}
            />
          </Grid>
          <Grid item xs={12} md={9} lg={3} sx={{ minWidth: 0, flexGrow: 1 }}>
            <PrimaryButton
              label="Check Availability"
              onClick={handleSubmit(onSubmit)}
              isLoading={isLoading}
              loadingText="Loading...."
              fullWidth
              data-testid="check-availability-button"
            />
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};
export default AddAvailableRooms;
