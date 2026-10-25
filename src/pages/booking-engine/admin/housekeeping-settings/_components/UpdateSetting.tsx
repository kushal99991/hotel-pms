"use client";
import { Controller, FormProvider, useForm } from "react-hook-form";
import React, { useCallback, useState, useEffect } from "react";
import { Alert, Box, CircularProgress } from "@mui/material";
import {
  useGetSettingByIdQuery,
  useUpdateSettingMutation,
} from "services/settingSlice";
import CustomTextInput from "components/widgets/CustomTextInput/CustomTextInput";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import useAuth from "hooks/useAuth";
import { ISetting, IUpdateSettingRequest } from "types/settingTypes";
import { yupResolver } from "@hookform/resolvers/yup";
import { createSettingSchema } from "utils/validations.utils";

interface UpdateSettingProps {
  onClose: () => void;
  settingId: number;
}

const UpdateSetting: React.FC<UpdateSettingProps> = ({
  onClose,
  settingId,
}) => {
  const { users } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState("#000000");

  const propertyId = users?.defaultPropertyId ?? 0;

  const {
    data: settingData,
    isLoading: isLoadingData,
    error: loadingError,
  } = useGetSettingByIdQuery({
    id: settingId,
    property_id: propertyId,
  });

  const [updateSetting, { isLoading: isSubmitLoading }] =
    useUpdateSettingMutation();

  const methods = useForm<ISetting>({
    mode: "all",
    resolver: yupResolver(createSettingSchema),
    defaultValues: {
      key: "",
      value: "",
      info: "",
      is_public: false,
      property_id: propertyId,
      type: "",
      rule: { color: "#000000" },
    },
  });

  const {
    handleSubmit,
    control,
    setError,
    setValue,
    reset,
    formState: { errors },
  } = methods;

  // Populate form when data is loaded
  useEffect(() => {
    if (settingData) {
      reset({
        key: settingData.key,
        value: settingData.value,
        info: settingData.info,
        is_public: Boolean(settingData.is_public),
        property_id: settingData.property_id,
        type: settingData.type || "",
        rule: settingData.rule || { color: "#000000" },
      });

      // Initialize color if available
      if (
        typeof settingData.rule === "object" &&
        settingData.rule &&
        "color" in settingData.rule
      ) {
        setSelectedColor(String(settingData.rule.color));
      }
    }
  }, [settingData, reset]);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setSelectedColor(color);
    setValue("rule", { color }, { shouldValidate: true });
  };

  const onSubmit = useCallback(
    async (data: ISetting) => {
      try {
        const updateData: IUpdateSettingRequest = {
          id: settingId,
          key: data.key,
          value: data.value,
          info: data.info,
          is_public: data.is_public,
          property_id: propertyId,
          type: data.type,
          rule: { color: selectedColor },
        };

        const response = await updateSetting(updateData).unwrap();

        if (response) {
          setSuccessMessage("Setting Updated Successfully!");
          setTimeout(() => {
            onClose();
          }, 1500);
        }
      } catch (error: any) {
        setError(
          "root",
          { message: error?.data?.message || "Failed to update setting" },
          { shouldFocus: true }
        );
        setSuccessMessage(null);
      }
    },
    [updateSetting, onClose, setError, propertyId, selectedColor, settingId]
  );

  if (isLoadingData) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (loadingError) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Error loading setting data. Please try again.
      </Alert>
    );
  }

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
            label="UPDATE SETTING"
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

export default UpdateSetting;
