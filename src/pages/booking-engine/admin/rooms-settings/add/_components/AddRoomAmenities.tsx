"use client";
import { Controller, FormProvider, useForm } from "react-hook-form";
import React, { useCallback, useState } from "react";
import {
  Alert,
  Box,
  Grid,
  styled,
  Checkbox,
  FormControlLabel,
  Typography,
} from "@mui/material";
import { yupResolver } from "@hookform/resolvers/yup";

import CustomTextInput from "components/widgets/CustomTextInput/CustomTextInput";
import CustomDropdown from "components/widgets/CustomDropdown/CustomDropdown";
import PrimaryButton from "components/elements/Button/PrimaryButton";

import { useNavigate } from "react-router-dom";
import { addRoomAmenitySchema } from "utils/validations.utils";
import { IRoomAmenityRequest } from "types/roomAmenitiesTypes";
import { useAddRoomAmenityMutation } from "services/roomAmenitiesSlice";
import { useGetRoomAmenitiesCategoryQuery } from "services/roomSlice";
import { IRoomAmenitiesCategory } from "types/roomSliceTypes";
import DynamicIcon from "components/ui/DynamicIcon/DynamicIcon";
import IconSelectorModal from "components/ui/DynamicIcon/IconSelectorModal";
import useAuth from "hooks/useAuth";

const AddRoomAmenities: React.FC = () => {
  const Navigate = useNavigate();
  const { users } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [addRoomAmenity, { isLoading: isSubmitLoading }] =
    useAddRoomAmenityMutation();
  const { data: amenitiesCategoriesList } = useGetRoomAmenitiesCategoryQuery(
    {
      property_id: users?.defaultPropertyId,
    },
    {
      refetchOnMountOrArgChange: true,
      skip: false,
    }
  );
  const methods = useForm<IRoomAmenityRequest>({
    mode: "all",
    resolver: yupResolver(addRoomAmenitySchema),
    defaultValues: {
      name: "",
      description: "",
      additional_charge: false,
      featured: false,
      category_id: 0,
      charge: 0,
    },
  });

  const {
    handleSubmit,
    control,
    setError,
    formState: { errors },
    reset,
  } = methods;

  const onSubmit = useCallback(
    async (data: IRoomAmenityRequest) => {
      data.property_id = users?.defaultPropertyId;
      const response = await addRoomAmenity(data);
      if (response.error) {
        setError("root", {
          type: "manual",
          message: response.error as string,
        });
        setSuccessMessage(null);
        return false;
      }
      reset();
      setSuccessMessage("Room Amenity Added successfully!");
      setTimeout(() => {
        Navigate("/booking-engine/admin/rooms-settings");
      }, 1000);
    },
    [addRoomAmenity, reset, Navigate, setError]
  );

  return (
    <MainWrapper>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container style={{ height: "100vh" }}>
            <Grid item xs={12} md={8} p={2}>
              {errors?.root && (
                <Alert severity="error">{errors.root.message}</Alert>
              )}
              {successMessage && (
                <Alert severity="success" data-testid="success-message">
                  {successMessage}
                </Alert>
              )}
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="name"
                    control={control}
                    render={({
                      field: { onChange, value },
                      fieldState: { invalid, error },
                    }) => (
                      <CustomTextInput
                        fullWidth
                        value={value}
                        isInvalid={invalid}
                        label="Name"
                        placeholder="Enter Name"
                        className="mb-7"
                        onChange={onChange}
                        helperText={error?.message ?? ""}
                        inputProps={{ "data-testid": "name-input" }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="charge"
                    control={control}
                    render={({
                      field: { onChange, value },
                      fieldState: { invalid, error },
                    }) => (
                      <CustomTextInput
                        fullWidth
                        label="Charge"
                        value={value?.toString()}
                        onChange={onChange}
                        helperText={error?.message ?? ""}
                        isInvalid={invalid}
                        type="number"
                        inputProps={{ "data-testid": "charge-input" }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="category_id"
                    control={control}
                    render={({
                      field: { onChange, value },
                      fieldState: { invalid, error },
                    }) => (
                      <CustomDropdown
                        label="Category"
                        placeholder="Select Category"
                        onChange={onChange}
                        name="category_id"
                        value={value}
                        isInvalid={invalid}
                        helperText={error?.message ?? ""}
                        options={(amenitiesCategoriesList ?? []).map(
                          (value: IRoomAmenitiesCategory) => ({
                            label: value.name,
                            value: value.id?.toString(),
                          })
                        )}
                        fullWidth
                        aria-label="Category"
                        data-testid="category-dropdown"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6} mb={2} mt={3}>
                  <Controller
                    name="icon_path"
                    control={control}
                    render={({
                      field: { onChange, value },
                      fieldState: { error },
                    }) => {
                      return (
                        <>
                          <Box
                            display="flex"
                            alignItems="center"
                            justifyContent="space-between"
                            p={2}
                            border="1px solid"
                            borderColor={error ? "error.main" : "grey.300"}
                            borderRadius={2}
                          >
                            {/* Left side: Icon Display or Select Prompt */}
                            <Box display="flex" alignItems="center" gap={2}>
                              {value ? (
                                <>
                                  <DynamicIcon name={value} size={40} />
                                </>
                              ) : (
                                <Typography color="text.secondary">
                                  Select an icon
                                </Typography>
                              )}
                            </Box>

                            {/* Icon Selector Modal */}
                            <IconSelectorModal
                              search=""
                              selectedIconId={value}
                              path={`/${users?.defaultPropertyId}/room_type`}
                              onSelect={(selectedIconId) =>
                                onChange(selectedIconId)
                              }
                            />
                          </Box>

                          {/* Validation Error */}
                          {error?.message && (
                            <Typography color="error" variant="body2" mt={0.5}>
                              {error.message}
                            </Typography>
                          )}
                        </>
                      );
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="description"
                    control={control}
                    render={({
                      field: { onChange, value },
                      fieldState: { invalid, error },
                    }) => (
                      <CustomTextInput
                        fullWidth
                        value={value}
                        isInvalid={invalid}
                        multiline
                        maxRows={5}
                        label="Description"
                        placeholder="Enter Description"
                        className="mb-7"
                        onChange={onChange}
                        helperText={error?.message ?? ""}
                        inputProps={{ "data-testid": "description-input" }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="additional_charge"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={value}
                            onChange={(e) => onChange(e.target.checked)}
                          />
                        }
                        label="Additional Charge"
                      />
                    )}
                  />
                  {errors.additional_charge && (
                    <Alert severity="error">
                      {errors.additional_charge.message}
                    </Alert>
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="featured"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={value}
                            onChange={(e) => onChange(e.target.checked)}
                          />
                        }
                        label="Featured"
                      />
                    )}
                  />
                  {errors.featured && (
                    <Alert severity="error">{errors.featured.message}</Alert>
                  )}
                </Grid>
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <PrimaryButton
                      label="Back"
                      buttonStyles={{
                        backgroundColor: "#F5F5F5",
                        color: "#000",
                        fontWeight: "bold",
                      }}
                      isLoading={false}
                      type="button"
                      onClick={() =>
                        Navigate("/booking-engine/admin/rooms-settings")
                      }
                    />
                    <PrimaryButton
                      label="Add Amenity"
                      buttonStyles={{
                        backgroundColor: "#32A1AE",
                        color: "#FFFFFF",
                        fontWeight: "bold",
                      }}
                      isLoading={isSubmitLoading}
                      type="submit"
                    />
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </form>
      </FormProvider>
    </MainWrapper>
  );
};

export default AddRoomAmenities;

const MainWrapper = styled(Grid)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  padding: "15px",
  height: "100%",
  marginTop: "10px",
}));
