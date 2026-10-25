import React, { useState, useCallback } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { Box, Button, Grid, Alert } from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import moment from "moment";
import dayjs from "dayjs";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import FormTextField from "components/forms/FormTextField";
import useAuth from "hooks/useAuth";
import { useCreateRatePlanMutation } from "services/roomRateSlice";
import { IRatePlanRequest } from "types/roomRateTypes";

const ratePlanSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  description: yup.string().required("Description is required"),
  property_id: yup.number().required("Property ID is required"),
});

const AddRatePlan: React.FC = () => {
  const { users } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const [createRatePlan, { isLoading: isSubmitLoading }] =
    useCreateRatePlanMutation();

  const methods = useForm<IRatePlanRequest>({
    mode: "all",
    resolver: yupResolver(ratePlanSchema),
    defaultValues: {
      name: "",
      description: "",
      property_id: users?.defaultPropertyId ?? 1,
      start_date: undefined,
      end_date: undefined,
    },
  });

  const {
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = methods;

  const onSubmit = useCallback(
    async (data: IRatePlanRequest) => {
      // Format dates for API
      const formattedData = {
        ...data,
        start_date: data.start_date
          ? moment(data.start_date).format("YYYY-MM-DD")
          : undefined,
        end_date: data.end_date
          ? moment(data.end_date).format("YYYY-MM-DD")
          : undefined,
      };

      const response = await createRatePlan(formattedData);
      if (response.error) {
        setError("root", {
          type: "manual",
          message: response.error as string,
        });
        setSuccessMessage(null);
      } else {
        // Mock successful submission
        setSuccessMessage("Rate Plan Created Successfully!");
        navigate("/booking-engine/revenue-management/rate-plan");
      }
    },
    [navigate, createRatePlan]
  );

  return (
    <FormProvider {...methods}>
      <Box p={3}>
        {errors.root && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.root.message}
          </Alert>
        )}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormTextField
                  name="name"
                  sm={12}
                  label="Name"
                  textFieldProps={{
                    placeholder: "Enter Rate Plan Name",
                    fullWidth: true,
                  }}
                  gridProps={{ mb: 3 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormTextField
                  name="description"
                  sm={12}
                  label="Description"
                  textFieldProps={{
                    placeholder: "Enter Rate Plan Description",
                    fullWidth: true,
                  }}
                  gridProps={{ mb: 3 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="start_date"
                  control={control}
                  render={({
                    field: { onChange, value },
                    fieldState: { error },
                  }) => (
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Start Date"
                        value={value ? dayjs(value) : null}
                        onChange={(date) =>
                          onChange(date ? date.toDate() : null)
                        }
                        slotProps={{
                          textField: {
                            error: !!error?.message,
                            helperText: error?.message,
                            fullWidth: true,
                          },
                        }}
                      />
                    </LocalizationProvider>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="end_date"
                  control={control}
                  render={({
                    field: { onChange, value },
                    fieldState: { error },
                  }) => (
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="End Date"
                        value={value ? dayjs(value) : null}
                        onChange={(date) =>
                          onChange(date ? date.toDate() : null)
                        }
                        slotProps={{
                          textField: {
                            error: !!error?.message,
                            helperText: error?.message,
                            fullWidth: true,
                          },
                        }}
                      />
                    </LocalizationProvider>
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" mt={2} justifyContent="flex-start" gap={2}>
                  <Button
                    variant="outlined"
                    onClick={() =>
                      navigate("/booking-engine/revenue-management/rate-plan")
                    }
                  >
                    Cancel
                  </Button>
                  <PrimaryButton
                    label="Create Rate Plan"
                    isLoading={isSubmitLoading}
                    buttonStyles={{
                      backgroundColor: "#32A1AE",
                      color: "#FFFFFF",
                      fontWeight: "bold",
                    }}
                    onClick={handleSubmit(onSubmit)}
                  />
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </FormProvider>
  );
};

export default AddRatePlan;
