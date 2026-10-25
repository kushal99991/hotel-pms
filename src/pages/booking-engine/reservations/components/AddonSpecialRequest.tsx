import { useForm, Controller } from "react-hook-form";
import React, { useEffect } from "react";
import { Box, Button, TextField } from "@mui/material";
import { yupResolver } from "@hookform/resolvers/yup";

import { addAddonSpecialRequest } from "utils/validations.utils";
import { useGetRoomTypeByPropertyIdMutation } from "services/roomTypeSlice";
import { IRoomTypes } from "types/roomTypes";
import { useAuth } from "hooks";
import CustomDropdown from "components/widgets/CustomDropdown/CustomDropdown";

interface FormData {
  specialRequests: string;
  roomType: string;
}

const AddonSpecialRequest: React.FC = () => {
  const { users } = useAuth();
  const [getRoomTypeByPropertyId, { data: roomTypeList }] =
    useGetRoomTypeByPropertyIdMutation();

  useEffect(() => {
    getRoomTypeByPropertyId({
      propertyId: users?.defaultPropertyId ?? 0,
    });
  }, [users?.defaultPropertyId]);

  const { control, handleSubmit } = useForm<FormData>({
    resolver: yupResolver(addAddonSpecialRequest),
    mode: "all",
    defaultValues: {
      specialRequests: "",
      roomType: "",
    },
  });

  const onSubmit = () => {
    /* empty */
  };

  return (
    <Box p={2} component="form" onSubmit={handleSubmit(onSubmit)}>
      {/* Roll Away Bed */}
      <Box display="flex" alignItems="center" mb={2}>
        <Controller
          name="specialRequests"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              label="Special Requests"
              error={!!error?.message}
              helperText={error?.message ?? ""}
              fullWidth
            />
          )}
        />
      </Box>

      {/* Select Type and Add Button */}
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Controller
          name="roomType"
          control={control}
          render={({ field, fieldState: { invalid, isDirty, error } }) => (
            <CustomDropdown
              {...field}
              label="Room Type"
              placeholder="Room Type"
              options={(roomTypeList ?? []).map((roomType: IRoomTypes) => ({
                label: roomType.type,
                value: roomType.id.toString(),
              }))}
              isInvalid={invalid || !isDirty}
              helperText={error?.message ?? ""}
              fullWidth
              aria-label="Room Type"
              data-testid="room-type"
            />
          )}
        />

        <Button
          type="submit"
          variant="contained"
          size="small"
          sx={{
            backgroundColor: "#32A1AE",
            color: "#fff",
          }}
        >
          Add
        </Button>
      </Box>
    </Box>
  );
};

export default AddonSpecialRequest;
