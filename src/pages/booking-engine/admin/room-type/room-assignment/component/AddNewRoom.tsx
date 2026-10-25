import React from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { Grid, TextField, Autocomplete } from "@mui/material";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import SecondaryButton from "components/elements/Button/SecondaryButton";
import { yupResolver } from "@hookform/resolvers/yup";
import { addRoomNumberSchema } from "utils/validations.utils";

interface IAddNewRoomRequest {
  floor?: string;
  wing?: string;
}

interface AutoGenerateRoomProps {
  onSave?: (data: IAddNewRoomRequest) => void;
  onClose?: () => void;
  wingList?: string[];
  floorList?: string[];
  currentFloor?: string | null; // Changed to string to match list options
  currentWing?: string | null;
}

const AddNewRoom: React.FC<AutoGenerateRoomProps> = ({
  onSave,
  onClose,
  wingList = [],
  floorList = [],
  currentFloor,
  currentWing,
}) => {
  const methods = useForm<IAddNewRoomRequest>({
    mode: "all",
    resolver: yupResolver(addRoomNumberSchema),
    defaultValues: {
      floor: currentFloor ?? "",
      wing: currentWing ?? "",
    },
  });

  const { handleSubmit, control } = methods;

  const onSubmit = (data: IAddNewRoomRequest) => {
    onSave?.(data);
  };

  return (
    <FormProvider {...methods}>
      <Grid container spacing={2} mt={2}>
        {/* Floor Field */}
        <Grid item xs={12}>
          <Controller
            name="floor"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Autocomplete
                freeSolo
                options={floorList}
                value={field.value ?? ""}
                onChange={(_, value) => field.onChange(value)}
                onInputChange={(_, value) => field.onChange(value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Floor"
                    placeholder="Select or type a Floor"
                    error={!!error}
                    helperText={error?.message}
                    fullWidth
                  />
                )}
              />
            )}
          />
        </Grid>

        {/* Wing Field */}
        <Grid item xs={12}>
          <Controller
            name="wing"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Autocomplete
                freeSolo
                options={wingList}
                value={field.value ?? ""}
                onChange={(_, value) => field.onChange(value)}
                onInputChange={(_, value) => field.onChange(value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Wing"
                    placeholder="Select or type a Wing"
                    error={!!error}
                    helperText={error?.message}
                    fullWidth
                  />
                )}
              />
            )}
          />
        </Grid>

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
            onClick={onClose}
            loadingText="Loading..."
          />
          <PrimaryButton
            label="Save"
            color="secondary"
            onClick={handleSubmit(onSubmit)}
            isLoading={false}
            loadingText="Loading..."
          />
        </Grid>
      </Grid>
    </FormProvider>
  );
};

export default AddNewRoom;
