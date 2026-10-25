import React from "react";
import { Grid, Typography, Alert, Snackbar } from "@mui/material";
import CustomDropdown from "components/widgets/CustomDropdown/CustomDropdown";
import CustomTextInput from "components/widgets/CustomTextInput/CustomTextInput";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import { useGetHousekeepingShiftListQuery } from "services/houseKeeperSlice";
import { useGetDepartmentByIdQuery } from "services/departmentSlice";
import { useForm, Controller } from "react-hook-form";
import { IShift } from "types/houseKeeperTypes";
import useAuth from "hooks/useAuth";
import { INewRoomNumberList } from "types/roomSliceTypes";

interface HousekeeperAssignmentFormProps {
  sliceRooms: (item: number) => void;
  updateShift: (item: number, property: number) => void;
  roomList: INewRoomNumberList[];
}

const HousekeeperAssignmentForm: React.FC<HousekeeperAssignmentFormProps> = ({
  sliceRooms,
  updateShift,
  roomList,
}) => {
  const { users } = useAuth();

  const { data: shiftList } = useGetHousekeepingShiftListQuery({
    property_id: users?.defaultPropertyId ?? 1,
  });

  // Fetch housekeeping department (ID: 7) to get available housekeepers
  const {
    data: housekeepingDept,
    error: deptError,
    isLoading: isDeptLoading,
  } = useGetDepartmentByIdQuery({
    id: "7",
    default_property_id: users?.defaultPropertyId ?? 1,
  });

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: {
      shift: "", // Default value for shift
      housekeeperNumber: "", // Default value for housekeeper count
      property: users?.defaultPropertyId ?? 1,
    },
  });

  const onSubmit = (data: any) => {
    const availableHousekeepers = housekeepingDept?.data?.users || [];
    const requestedCount = parseInt(data.housekeeperNumber, 10);

    // Validate if requested count exceeds available housekeepers
    if (availableHousekeepers.length === 0) {
      setError("root", {
        message: "No housekeepers are currently available for assignment",
      });
      return;
    }

    if (requestedCount > availableHousekeepers.length) {
      setError("root", {
        message: `Cannot assign ${requestedCount} housekeepers. Only ${availableHousekeepers.length} housekeeper${availableHousekeepers.length === 1 ? "" : "s"} available`,
      });
      return;
    }

    if (requestedCount <= 0) {
      setError("housekeeperNumber", {
        message: "Number of housekeepers must be greater than 0",
      });
      return;
    }

    // If validation passes, proceed with assignment
    sliceRooms(data.housekeeperNumber);
    updateShift(data.shift, data.property);
  };

  return (
    <>
      <Typography variant="h6" mb={1} gutterBottom>
        Housekeeping Boards
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Controller
              name="shift"
              control={control}
              rules={{
                required: "Shift is required", // Validation rule
              }}
              render={({
                field: { onChange, value },
                fieldState: { error, invalid },
              }) => (
                <CustomDropdown
                  label="Shift"
                  placeholder="Select Shift"
                  value={value}
                  onChange={onChange}
                  isInvalid={invalid}
                  options={(shiftList ?? []).map((item: IShift) => ({
                    label: item?.name,
                    value: item?.id?.toString(),
                  }))}
                  fullWidth
                  helperText={error?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <Controller
              name="housekeeperNumber"
              control={control}
              rules={{
                required: "Number of housekeepers is required",
                pattern: {
                  value: /^[1-9]\d*$/,
                  message: "Please enter a valid positive number",
                },
                min: {
                  value: 1,
                  message: "Number must be at least 1",
                },
              }}
              render={({
                field: { onChange, value },
                fieldState: { invalid, error },
              }) => (
                <CustomTextInput
                  label="No. of Housekeepers"
                  value={value}
                  isInvalid={invalid}
                  onChange={(event) => onChange(event.target.value)}
                  fullWidth
                  helperText={error?.message}
                  inputProps={{ "data-testid": "number-input" }}
                  rootSX={{
                    "& .MuiInputBase-root": { height: "55px" }, // Adjust height and padding
                  }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={3} sx={{ marginTop: "25px" }}>
            <PrimaryButton
              label="Assign"
              buttonStyles={{
                backgroundColor: "#32A1AE",
                color: "#FFFFFF",
                fontWeight: "bold",
              }}
              type="submit"
              size="large"
              style={{ height: "56px" }}
              disabled={!roomList || roomList.length === 0 || isDeptLoading}
            />
          </Grid>
        </Grid>
      </form>

      {/* Error Message Display */}
      <Snackbar
        open={!!errors?.root?.message}
        autoHideDuration={6000}
        onClose={() => {
          setError("root", { message: "" }, { shouldFocus: false });
        }}
      >
        <Alert
          onClose={() => {
            setError("root", { message: "" }, { shouldFocus: false });
          }}
          severity="info"
          sx={{ width: "100%" }}
        >
          {errors?.root?.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default HousekeeperAssignmentForm;
