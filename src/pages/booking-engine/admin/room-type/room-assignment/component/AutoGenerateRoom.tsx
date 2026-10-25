import React, { useEffect, useState } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import {
  Box,
  Grid,
  Slider,
  Typography,
  Autocomplete,
  TextField,
} from "@mui/material";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import { IRoomAutoGenerateNumber } from "types/roomSliceTypes";
import FormTextField from "components/forms/FormTextField";
import SecondaryButton from "components/elements/Button/SecondaryButton";
import { yupResolver } from "@hookform/resolvers/yup";
import { roomAutoGenerateNumberSchema } from "utils/validations.utils";

interface AutoGenerateRoomProps {
  onSave?: (data: IRoomAutoGenerateNumber) => void;
  onClose?: () => void;
  currentFloor?: number | null;
  currentWing?: string | null;
  totalInventory?: number;
  isLoading: boolean;
}

const AutoGenerateRoom: React.FC<AutoGenerateRoomProps> = ({
  onSave,
  onClose,
  currentFloor,
  currentWing,
  totalInventory,
  isLoading,
}) => {
  const [sliderValue, setSliderValue] = useState<{ min: number; max: number }>({
    max: 1000,
    min: 0,
  });

  const methods = useForm<IRoomAutoGenerateNumber>({
    mode: "all",
    resolver: yupResolver(roomAutoGenerateNumberSchema),
    defaultValues: {
      room_range: [0, 1000],
      floor: currentFloor ?? 1,
      start_room_number: 1,
      wing: currentWing ?? "A",
      skip_numbers: [],
    },
  });

  const { handleSubmit, control, watch, setValue } = methods;
  const startRoomNumber = watch("start_room_number");
  const room_range = watch("room_range");

  useEffect(() => {
    if (totalInventory && totalInventory > 0) {
      setSliderValue((prev) => ({ ...prev, max: totalInventory }));
    }
  }, [totalInventory]);

  useEffect(() => {
    if (startRoomNumber && totalInventory && startRoomNumber > 0) {
      const maxNumber = Number(startRoomNumber) + Number(totalInventory - 1);
      setSliderValue({ min: Number(startRoomNumber), max: maxNumber });
      setValue("room_range", [Number(startRoomNumber), maxNumber], {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    }
  }, [startRoomNumber, totalInventory]);

  const onSubmit = (data: IRoomAutoGenerateNumber) => {
    onSave?.(data);
  };

  const isFormDisabled = (totalInventory ?? 0) <= 0;

  return (
    <FormProvider {...methods}>
      <Grid container spacing={2} mt={2}>
        {isFormDisabled && (
          <Grid item xs={12}>
            <Typography color="error" variant="body1">
              Please increase your room type inventory before adding more rooms.
            </Typography>
          </Grid>
        )}

        {/* Starting Room Number Field */}
        <FormTextField
          name="start_room_number"
          label="Starting Room Number"
          sm={6}
          textFieldProps={{
            placeholder: "Enter Starting Room Number",
            fullWidth: true,
            type: "number",
            disabled: isFormDisabled,
          }}
          required
          gridProps={{ mb: 2 }}
        />

        {/* Skip Numbers Autocomplete */}
        <Grid item xs={12} sm={6}>
          <Controller
            name="skip_numbers"
            control={control}
            render={({
              field: { value, onChange },
              fieldState: { invalid, error },
            }) => {
              const [start, end] = room_range ?? [];
              const startRoom = start ?? 0;
              const endRoom = end ?? sliderValue.max;
              const availableNumbers = Array.from(
                { length: endRoom - startRoom + 1 },
                (_, index) => startRoom + index
              );
              return (
                <Autocomplete
                  value={value || null}
                  onChange={(_, newValue) => {
                    onChange(newValue);
                  }}
                  options={availableNumbers.filter(
                    (num) => num !== startRoomNumber
                  )}
                  getOptionLabel={(option) => (option ? option.toString() : "")}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      name="skip_numbers"
                      label="Skip Room Numbers"
                      placeholder="Select Skip Room Numbers"
                      error={invalid}
                      helperText={error?.message}
                      disabled={isFormDisabled}
                    />
                  )}
                  fullWidth
                  multiple
                />
              );
            }}
          />
        </Grid>

        {/* Room Range with Slider */}
        <Grid item xs={12}>
          <Controller
            control={control}
            name="room_range"
            render={({ field: { value, onChange } }) => {
              const [start, end] = value;
              const startRoom = start ?? 0;
              const endRoom = end ?? sliderValue.max;
              const availableNumbers = Array.from(
                { length: endRoom - startRoom + 1 },
                (_, index) => startRoom + index
              );
              return (
                <Box mx={2} pr={2}>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography variant="body2" sx={{ cursor: "pointer" }}>
                      Select Room Range{" "}
                    </Typography>
                    <Typography variant="body2" sx={{ cursor: "pointer" }}>
                      {`Selected Rooms : ${availableNumbers.length}`}
                    </Typography>
                  </Box>
                  <Slider
                    value={[start ?? 0, end ?? 0]}
                    onChange={(_, newValue) => {
                      onChange(newValue);
                    }}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(val) => `Room ${val}`}
                    min={sliderValue.min}
                    max={sliderValue.max}
                    disabled={isFormDisabled}
                  />
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2" sx={{ cursor: "pointer" }}>
                      {start ?? sliderValue.min}
                    </Typography>
                    <Typography variant="body2" sx={{ cursor: "pointer" }}>
                      {end ?? sliderValue.max}
                    </Typography>
                  </Box>
                </Box>
              );
            }}
          />
        </Grid>

        {/* Floor Field */}
        <FormTextField
          name="floor"
          sm={6}
          label="Floor"
          textFieldProps={{
            placeholder: "Enter Floor",
            fullWidth: true,
            type: "number",
            disabled: isFormDisabled,
          }}
          gridProps={{ mb: 2 }}
        />

        {/* Wing Field */}
        <FormTextField
          name="wing"
          label="Wing"
          sm={6}
          textFieldProps={{
            placeholder: "Enter Wing",
            fullWidth: true,
            disabled: isFormDisabled,
          }}
          gridProps={{ mb: 2 }}
        />

        {/* Action Buttons */}
        <Grid
          item
          xs={12}
          display="flex"
          alignItems="center"
          justifyContent="flex-end"
          gap={2}
        >
          <SecondaryButton
            label="Cancel"
            color="secondary"
            isLoading={false}
            onClick={() => onClose?.()}
            loadingText="Loading..."
            disabled={isFormDisabled}
          />
          <PrimaryButton
            label="Save"
            color="secondary"
            onClick={handleSubmit(onSubmit)}
            isLoading={isLoading}
            loadingText="Loading..."
            disabled={isFormDisabled}
          />
        </Grid>
      </Grid>
    </FormProvider>
  );
};

export default AutoGenerateRoom;
