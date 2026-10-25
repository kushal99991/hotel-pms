import { Controller, useFormContext } from "react-hook-form";
import {
  Box,
  TextField,
  Grid,
  Typography,
  Select,
  MenuItem,
  FormControl,
  Paper,
  Button,
  styled,
} from "@mui/material";
import { Autocomplete } from "@mui/material";
import { Person, ChildCare } from "@mui/icons-material";
import { IRoomTypes } from "types/roomTypes";
import { useEffect } from "react";
import { useGetRoomTypeByPropertyIdMutation } from "services/roomTypeSlice";
import { useLazyGetTaxExemptionListQuery } from "services/financeSlice";
import useAuth from "hooks/useAuth";
import GuestList from "./GuestList";
import { useGetRatesRateCodeMutation } from "services/roomRateSlice";
import { IRateCodeListResponse } from "types/roomRateTypes";
import GuestCount from "pages/booking-engine/front-office/new-reservation/_components/GuestCount";
import { ISalesGroupDetail } from "types/salesTypes";
import { RoomRentalTypes } from "constants/room";

interface StayDetailProps {
  group?: ISalesGroupDetail;
}

const StayDetail: React.FC<StayDetailProps> = ({ group }) => {
  const { users } = useAuth();
  const methods = useFormContext();
  const {
    control,
    register,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = methods;

  const stay = watch("stay.0"); // we only use one stay here
  const roomTypeId = watch("stay.0.room_type_id");
  const guests = watch("stay.0.guests");

  const [getRoomTypeByPropertyId, { data: roomTypeList = [] }] =
    useGetRoomTypeByPropertyIdMutation();
  const [getRatesRateCode, { data: roomRateCode = [] }] =
    useGetRatesRateCodeMutation();
  const [getTaxExemptions, { data: taxExemptions = [] }] =
    useLazyGetTaxExemptionListQuery();

  useEffect(() => {
    if (users?.defaultPropertyId) {
      getRoomTypeByPropertyId({ propertyId: users.defaultPropertyId });
      getRatesRateCode({ property_id: users.defaultPropertyId });
      getTaxExemptions({ property_id: users.defaultPropertyId });
    }
  }, [users?.defaultPropertyId]);

  // Only show types for what the group blocked
  const blockedRoomTypes = Object.keys(group?.rooms_blocked_by_type ?? {});
  const guestRoomOpts = (roomTypeList ?? []).filter((rt) => {
    const isBlockedForGroup =
      blockedRoomTypes.length === 0 || blockedRoomTypes.includes(rt.type);
    return rt.rentalType === RoomRentalTypes.GUEST_ROOM && isBlockedForGroup;
  });

  useEffect(() => {
    if (guestRoomOpts.length === 1 && roomTypeId === 0) {
      setValue("stay.0.room_type_id", guestRoomOpts[0].id, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    }
  }, [guestRoomOpts.length]);

  function getRoomTypeValue(val: number) {
    // always use the single value when only one is available
    const comparisonId = guestRoomOpts.length === 1 ? guestRoomOpts[0].id : val;
    return (
      roomTypeList.find((rt: IRoomTypes) => rt.id === comparisonId) ?? null
    );
  }

  const selectedRoomType = roomTypeList.find((rt) => rt.id === roomTypeId);
  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} key="new-group-stay">
          <Box
            border={1}
            borderRadius={5}
            p={3}
            gap={2}
            component={Paper}
            elevation={2}
          >
            <Box
              display="flex"
              alignItems={"center"}
              justifyContent={"space-between"}
              flexWrap={"wrap"}
              gap={2}
              mb={2}
            >
              {/* Room Type */}
              <Box
                display="flex"
                alignItems={"center"}
                justifyContent={"space-between"}
              >
                <Controller
                  name={`stay.0.room_type_id`}
                  control={control}
                  render={({ field, fieldState }) => (
                    <Autocomplete
                      options={guestRoomOpts}
                      getOptionLabel={(opt: IRoomTypes) => opt?.type ?? ""}
                      value={getRoomTypeValue(field.value)}
                      onChange={(_, val) => {
                        clearErrors("stay.0.room_type_id");
                        field.onChange(val?.id ?? 0);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Room Type"
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                          fullWidth
                        />
                      )}
                      sx={{ minWidth: 150 }}
                    />
                  )}
                />
              </Box>

              {/* Rate Code */}
              <Box
                display="flex"
                alignItems={"center"}
                justifyContent={"space-between"}
              >
                <Controller
                  name={`stay.0.rate_code_id`}
                  control={control}
                  render={({ field, fieldState }) => (
                    <Autocomplete
                      options={roomRateCode}
                      getOptionLabel={(opt: IRateCodeListResponse) => opt.name}
                      value={
                        roomRateCode.find(
                          (rt: IRateCodeListResponse) => rt.id === field.value
                        ) ?? null
                      }
                      onChange={(_, val) => field.onChange(val?.id ?? 0)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Rate Code"
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                          fullWidth
                        />
                      )}
                      sx={{ minWidth: 150 }}
                    />
                  )}
                />
                <TextButton>Edit Nightly Rates</TextButton>
              </Box>
            </Box>

            {/* Special Requests */}
            <TextField
              label="Special Requests"
              multiline
              rows={2}
              fullWidth
              {...register(`stay.0.special_requests`)}
              sx={{ mt: 2 }}
            />

            {/* Adults / Children Count */}
            <Typography mt={2} fontWeight="700" sx={{ whiteSpace: "nowrap" }}>
              Guest Count
            </Typography>
            <GuestCount
              items={[
                {
                  icon: <Person />,
                  label: "Adults",
                  count: stay.adults_count || 1,
                  key: "adult",
                  maxCount: selectedRoomType?.adults,
                },
                {
                  icon: <ChildCare />,
                  label: "Children",
                  count: stay.children_count || 0,
                  key: "child",
                  maxCount: selectedRoomType?.children,
                },
              ]}
              onChange={(itemCounts) => {
                if (!selectedRoomType) {
                  setError("stay.0.room_type_id", {
                    message: "Select Room Type",
                  });
                  return;
                }
                if (itemCounts.key === "adult") {
                  setValue(`stay.0.adults_count`, itemCounts.count, {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true,
                  });
                  if (itemCounts.count < guests.length) {
                    const newGuests = [...guests];
                    newGuests.pop();
                    setValue("stay.0.guests", newGuests);
                  }
                } else if (itemCounts.key === "child") {
                  setValue(`stay.0.children_count`, itemCounts.count, {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true,
                  });
                }
              }}
            />
            {errors?.stays?.[0]?.message && (
              <Typography color="error" mt={1}>
                {errors?.stays?.[0]?.message}
              </Typography>
            )}
            {/* Tax Exemption */}
            <Typography
              mt={2}
              mb={2}
              fontWeight="700"
              sx={{ whiteSpace: "nowrap" }}
            >
              Tax Exemption
            </Typography>
            <FormControl fullWidth size="small">
              <Controller
                name={`stay.0.tax_exemption_id`}
                control={control}
                render={({ field }) => (
                  <Select {...field} displayEmpty>
                    <MenuItem value={0}>
                      <em>None</em>
                    </MenuItem>
                    {taxExemptions.map((te) => {
                      return <MenuItem value={te.id}>{te.reason}</MenuItem>;
                    })}
                  </Select>
                )}
              />
            </FormControl>

            <TextField
              label="Comment (optional)"
              multiline
              rows={2}
              fullWidth
              {...register(`stay.0.comment`)}
              sx={{ mt: 2 }}
            />

            <GuestList
              name={`stay.0.guests`}
              maxGuest={selectedRoomType?.adults ?? 1}
            />
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

export default StayDetail;

const TextButton = styled(Button)({
  textTransform: "none",
  textDecoration: "underline",
  color: "#32A1AE",
});
