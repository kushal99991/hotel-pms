"use client";
import { Controller, FormProvider, useForm } from "react-hook-form";
import React, { useCallback, useState } from "react";
import { Alert, Box } from "@mui/material";
import { useCreateSettingMutation } from "services/settingSlice";
import CustomTextInput from "components/widgets/CustomTextInput/CustomTextInput";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import useAuth from "hooks/useAuth";
import { ISetting } from "types/settingTypes";
import { yupResolver } from "@hookform/resolvers/yup";
import { createSettingSchema } from "utils/validations.utils";

interface AddNewSettingProps {
  onClose: () => void;
}

const AddNewSetting: React.FC<AddNewSettingProps> = ({ onClose }) => {
  const { users } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [createSetting, { isLoading: isSubmitLoading }] =
    useCreateSettingMutation();
  const [selectedColor, setSelectedColor] = useState("#000000");

  const methods = useForm<ISetting>({
    mode: "all",
    resolver: yupResolver(createSettingSchema),
    defaultValues: {
      key: "ROOMSTATUS",
      value: "",
      info: "",
      is_public: false,
      property_id: users?.defaultPropertyId ?? 0,
      type: "",
      rule: { color: "#000000" },
    },
  });

  const {
    handleSubmit,
    control,
    setError,
    setValue,
    formState: { errors },
    reset,
  } = methods;

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setSelectedColor(color);
    setValue("rule", { color }, { shouldValidate: true });
  };

  const onSubmit = useCallback(
    async (data: ISetting) => {
      try {
        // Include the selectedColor in the rule
        const updatedData = {
          ...data,
          rule: { color: selectedColor },
          property_id: users?.defaultPropertyId ?? 0,
        };

        const response = await createSetting(updatedData).unwrap();

        if (response) {
          reset();
          setSuccessMessage("Setting Added Successfully!");
          setTimeout(() => {
            onClose();
          }, 1500);
        }
      } catch (error: any) {
        setError(
          "root",
          { message: error?.data?.message || "Failed to create setting" },
          { shouldFocus: true }
        );
        setSuccessMessage(null);
      }
    },
    [
      createSetting,
      reset,
      onClose,
      setError,
      users?.defaultPropertyId,
      selectedColor,
    ]
  );

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        {errors?.root && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors?.root?.message}
          </Alert>
        )}
        {successMessage && (
          <Alert
            severity="success"
            sx={{ mb: 2 }}
            data-testid="success-message"
          >
            {successMessage}
          </Alert>
        )}

        <Box mb={2} mt={2}>
          <Controller
            name="key"
            control={control}
            render={({
              field: { onChange, value },
              fieldState: { invalid, error },
            }) => (
              <CustomTextInput
                fullWidth
                value={value}
                isInvalid={invalid}
                label="Key"
                placeholder="Enter Key"
                onChange={(event) => onChange(event.target.value)}
                helperText={error?.message ?? ""}
                inputProps={{ "data-testid": "key-input", readOnly: true }}
              />
            )}
          />
        </Box>

        <Box mb={2}>
          <Controller
            name="value"
            control={control}
            render={({
              field: { onChange, value },
              fieldState: { invalid, error },
            }) => (
              <CustomTextInput
                fullWidth
                value={value}
                isInvalid={invalid}
                label="Tag Name"
                placeholder="Enter Tag Name"
                onChange={(event) => onChange(event.target.value)}
                helperText={error?.message ?? ""}
                inputProps={{ "data-testid": "value-input" }}
              />
            )}
          />
        </Box>

        <Box mb={2}>
          <Controller
            name="type"
            control={control}
            render={({
              field: { onChange, value },
              fieldState: { invalid, error },
            }) => (
              <CustomTextInput
                fullWidth
                value={value || ""}
                isInvalid={invalid}
                label="Tag Value"
                placeholder="Enter Tag Value"
                onChange={(event) => onChange(event.target.value)}
                helperText={error?.message ?? ""}
                inputProps={{ "data-testid": "type-input" }}
              />
            )}
          />
        </Box>

        <Box mb={2}>
          <Controller
            name="info"
            control={control}
            render={({
              field: { onChange, value },
              fieldState: { invalid, error },
            }) => (
              <CustomTextInput
                fullWidth
                value={value}
                isInvalid={invalid}
                label="Description"
                placeholder="Enter Information"
                onChange={(event) => onChange(event.target.value)}
                helperText={error?.message ?? ""}
                inputProps={{ "data-testid": "info-input" }}
              />
            )}
          />
        </Box>

        <Box mb={3}>
          <Box display="flex" alignItems="center" sx={{ fontWeight: "500" }}>
            <Box flexGrow={0.1}>Select Room Status Tag Color</Box>
            <input
              type="color"
              value={selectedColor}
              onChange={handleColorChange}
              style={{
                width: "100px",
                height: "35px",
                cursor: "pointer",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
          </Box>
        </Box>

        <Box display="flex" justifyContent="flex-end" gap={2}>
          <PrimaryButton
            label="CANCEL"
            buttonStyles={{
              backgroundColor: "#F5F5F5",
              color: "#000",
              fontWeight: "bold",
            }}
            isLoading={false}
            type="button"
            onClick={onClose}
          />
          <PrimaryButton
            label="ADD SETTING"
            loadingText="Loading...."
            buttonStyles={{
              backgroundColor: "#32A1AE",
              color: "#FFFFFF",
              fontWeight: "bold",
            }}
            isLoading={isSubmitLoading}
            type="submit"
          />
        </Box>
      </form>
    </FormProvider>
  );
};

export default AddNewSetting;

// const MainWrapper = styled(Grid)(({ theme }) => ({
//   backgroundColor: theme.palette.common.white,
//   padding: "15px",
//   height: "100%",
//   marginTop: "10px",
// }));
