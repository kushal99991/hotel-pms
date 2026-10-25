"use client";

import { Controller, FormProvider, useForm } from "react-hook-form";
import React, { useState, useCallback, useEffect } from "react";
import {
  Box,
  Button,
  Grid,
  Checkbox,
  FormControlLabel,
  Alert,
} from "@mui/material";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import {
  useGetRatePlansMutation,
  useGetRatesRateCodebyIdMutation,
  useGetRatesRateCodeMutation,
  useUpdateBaseRateByidMutation,
  useUpdateRateCodeMutation,
} from "services/roomRateSlice";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate, useParams } from "react-router-dom";
import {
  IAddRateCodeFormRequest,
  IRateCodeListResponse,
  IRatePlanResponse,
} from "types/roomRateTypes";
import { createRateCodeSchema } from "utils/validations.utils";
import FormTextField from "components/forms/FormTextField";
import useAuth from "hooks/useAuth";
import CustomDropdown from "components/widgets/CustomDropdown/CustomDropdown";
import BaseRateSection from "./component/BaseRateSection";

const UpdateRateCode: React.FC = () => {
  const { users } = useAuth();
  const params = useParams();

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [roomTypeRateMap, setRoomTypeRateMap] = useState<{
    [room_type_id: number]: {
      id?: number;
      rate_code_id: number;
      room_type_id: number;
      rate: number;
      date: string;
      type: "CREATE" | "UPDATE";
    };
  }>({});

  const navigate = useNavigate();

  const [getRatesRateCode, { data: roomRateCode }] =
    useGetRatesRateCodeMutation();

  const [updateRateCode, { isLoading: isSubmitLoading }] =
    useUpdateRateCodeMutation();
  const [getRatesRateCodebyId] = useGetRatesRateCodebyIdMutation();
  const [getRatePlans, { data: ratePlans = [] }] = useGetRatePlansMutation();
  const [updateBaseRateByid, { isLoading: isCreateLoading }] =
    useUpdateBaseRateByidMutation();

  useEffect(() => {
    if (params?.id) {
      onRefresh();
    }
  }, [params?.id]);

  const methods = useForm<IAddRateCodeFormRequest>({
    mode: "all",
    resolver: yupResolver(createRateCodeSchema),
    defaultValues: {
      name: "",
      type: "",
      description: "",
      suppressed: false,
      property_id: users?.defaultPropertyId ?? 1,
      parent_rate_code_id: "",
      rate_plan_id: "",
      base_rate: 0,
      active: false,
    },
  });

  const {
    handleSubmit,
    control,
    setError,
    formState: { errors },
    setValue,
  } = methods;

  const onRefresh = async () => {
    await getRatesRateCode({ property_id: users?.defaultPropertyId ?? 1 });
    await getRatePlans({ property_id: users?.defaultPropertyId ?? 1 });
    if (params?.id) {
      const response = await getRatesRateCodebyId({
        id: Number(params.id),
      });
      if (response?.error) {
        return false;
      }
      const RateCodeDetail = response.data;
      if (RateCodeDetail) {
        setValue("name", RateCodeDetail.name, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });
        setValue("description", RateCodeDetail.description, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });
        setValue("suppressed", RateCodeDetail.suppressed, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });
        setValue("active", RateCodeDetail.active, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });
        setValue("type", RateCodeDetail.type, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });

        setValue("parent_rate_code_id", RateCodeDetail?.parent_rate_code_id, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });
        setValue("rate_plan_id", RateCodeDetail?.rate_plan?.id?.toString(), {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });
      }
    }
  };
  const onSubmit = useCallback(
    async (data: IAddRateCodeFormRequest) => {
      const payload = {
        id: Number(params.id),
        active: data.active,
        ...data,
      };
      const response = await updateRateCode(payload);
      if (response.error) {
        setError("root", {
          type: "manual",
          message: response.error as string,
        });
        setSuccessMessage(null);
        return;
      }
      const rate_code_id = response?.data?.id;
      const entries = Object.values(roomTypeRateMap);
      const base_rate = entries.map((a) => ({
        room_type_id: a.room_type_id,
        rate: a.rate,
      }));
      const ratesProcessed = await updateBaseRateByid({
        rate_code_id,
        base_rates: base_rate,
      });
      if (ratesProcessed?.error) {
        setError("root", {
          type: "manual",
          message: ratesProcessed.error as string,
        });
        setSuccessMessage(null);
        return;
      }
      setSuccessMessage("Rate Code Created Successfully!");
      navigate("/booking-engine/revenue-management/rate-code");
    },
    [updateRateCode, roomTypeRateMap, navigate]
  );

  const onAddUpdateRate = useCallback(
    (payload: {
      id?: number;
      rate_code_id: number;
      room_type_id: number;
      rate: number;
      date: string;
      type: "CREATE" | "UPDATE";
    }) => {
      setRoomTypeRateMap((prev) => ({
        ...prev,
        [payload.room_type_id]: payload,
      }));
    },
    []
  );

  return (
    <FormProvider {...methods}>
      {errors.root && <Alert severity="error">{errors.root.message}</Alert>}
      {successMessage && <Alert severity="success">{successMessage}</Alert>}

      <Grid container spacing={2} style={{ padding: "20px" }}>
        <Grid item xs={12} md={6}>
          <FormTextField
            name="name"
            sm={12}
            label="Name"
            textFieldProps={{
              placeholder: "Enter Rate Code Name",
              fullWidth: true,
            }}
            gridProps={{ mb: 2 }}
          />

          <Grid item xs={12} mb={3}>
            <Controller
              name="type"
              control={control}
              render={({
                field: { onChange, value },
                fieldState: { invalid, error },
              }) => (
                <CustomDropdown
                  label="Select Type"
                  placeholder="Select"
                  onChange={onChange}
                  value={value}
                  isInvalid={invalid}
                  helperText={error?.message ?? ""}
                  options={[
                    { label: "INDIVIDUAL", value: "INDIVIDUAL" },
                    { label: "GROUP", value: "GROUP" },
                  ]}
                  fullWidth
                  aria-label="Property"
                  data-testid="property"
                />
              )}
            />
          </Grid>

          <Grid item xs={12} mb={2}>
            <Controller
              name="parent_rate_code_id"
              control={control}
              render={({
                field: { onChange, value },
                fieldState: { invalid, error },
              }) => {
                return (
                  <CustomDropdown
                    label="Parent Rate Code"
                    placeholder="Select"
                    onChange={onChange}
                    value={value}
                    isInvalid={invalid}
                    helperText={error?.message ?? ""}
                    options={(roomRateCode ?? [])
                      .filter(
                        (rate) =>
                          rate.id !== Number(params?.id) &&
                          Number(params?.id) !==
                            Number(rate.parent_rate_code_id)
                      )
                      .map((rate: IRateCodeListResponse) => ({
                        label: rate?.name,
                        value: rate?.id?.toString(),
                      }))}
                    fullWidth
                    aria-label="Property"
                    data-testid="property"
                  />
                );
              }}
            />
          </Grid>

          <Grid item xs={12} mb={2}>
            <Controller
              name="rate_plan_id"
              control={control}
              render={({
                field: { onChange, value },
                fieldState: { invalid, error },
              }) => (
                <CustomDropdown
                  label="Rate Plan"
                  placeholder="Select"
                  onChange={onChange}
                  value={value}
                  isInvalid={invalid}
                  helperText={error?.message ?? ""}
                  options={(ratePlans ?? [])
                    .filter((rate: IRatePlanResponse) => rate?.active === true)
                    .map((rate: IRatePlanResponse) => ({
                      label: rate?.name,
                      value: rate?.id?.toString(),
                    }))}
                  fullWidth
                  aria-label="Property"
                  data-testid="property"
                />
              )}
            />
          </Grid>

          <FormTextField
            name="description"
            sm={12}
            label="Description"
            textFieldProps={{
              placeholder: "Enter Rate Code Description",
              fullWidth: true,
              multiline: true,
              rows: 3,
            }}
            gridProps={{ mb: 2 }}
          />

          <Grid item xs={12}>
            <Controller
              name="suppressed"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} checked={field.value} />}
                  label="Suppressed"
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="active"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} checked={field.value} />}
                  label="Active Rate"
                />
              )}
            />
          </Grid>
        </Grid>
        <Grid item xs={12} md={6}>
          <BaseRateSection
            rate_code_id={Number(params?.id ?? "0")}
            onAddUpdateRate={onAddUpdateRate}
          />
        </Grid>

        <Grid item xs={12}>
          <Box display="flex" mt={2} justifyContent="flex-start" gap={2}>
            <Button
              variant="outlined"
              onClick={() =>
                navigate("/booking-engine/revenue-management/rate-code")
              }
            >
              Cancel
            </Button>
            <PrimaryButton
              label="Update Rate Code"
              buttonStyles={{
                backgroundColor: "#32A1AE",
                color: "#FFFFFF",
                fontWeight: "bold",
              }}
              isLoading={isSubmitLoading || isCreateLoading}
              onClick={handleSubmit(onSubmit)}
            />
          </Box>
        </Grid>
      </Grid>
    </FormProvider>
  );
};

export default UpdateRateCode;
