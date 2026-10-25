import { Controller, FormProvider, useForm } from "react-hook-form";
import React, { useCallback, useMemo, useState, useEffect } from "react";
import {
  Alert,
  Box,
  Button,
  Grid,
  Autocomplete,
  TextField,
} from "@mui/material";
import { yupResolver } from "@hookform/resolvers/yup";

import EditFormSkeleton from "./EditFormSkeleton";
import FormTextField from "components/forms/FormTextField";
import { useNavigate, useParams } from "react-router-dom";
import { addDirectBillingAccountSchema } from "utils/validations.utils";
import { countries } from "utils/countries";
import { useGetGuestsQuery } from "services/guestSlice";
import useAuth from "hooks/useAuth";
import {
  useEditDBAccountMutation,
  useLazyGetDirectBillingAccountQuery,
} from "services/paymentsSlice";
import { IAddDirectBillingAccountRequest } from "types/payments";

const Page: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams();
  const { users: currentUser } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { data: guestList } = useGetGuestsQuery();
  const [
    getDirectBillingAccount,
    {
      isLoading: accountLoading,
      data: accountDetailsList,
      error: accountError,
    },
  ] = useLazyGetDirectBillingAccountQuery();
  const [updateAccount, { isLoading }] = useEditDBAccountMutation();

  function phoneStringToNumericString(phoneString?: string) {
    if (!phoneString) {
      return "";
    }
    const digitsOnly = phoneString.replace(/\D/g, "");
    return digitsOnly;
  }

  useEffect(() => {
    if (params.id && currentUser?.defaultPropertyId) {
      getDirectBillingAccount({
        id: Number(params.id),
        property_id: currentUser.defaultPropertyId,
      });
    }
  }, [params.id, currentUser?.defaultPropertyId, getDirectBillingAccount]);

  const methods = useForm<IAddDirectBillingAccountRequest>({
    mode: "all",
    resolver: yupResolver(addDirectBillingAccountSchema),
    defaultValues: {
      guest_id: 0,
      credit_limit: 0,
      billing_name: "",
      billing_phone: "",
      // billing_phone_ext: "",
      billing_fax: "",
      billing_email: "",
      billing_address: "",
      billing_city: "",
      billing_state: "",
      billing_zip: "",
      billing_country: countries[0].value,
    },
  });

  const {
    handleSubmit,
    control,
    setError,
    clearErrors,
    formState: { errors },
    reset,
  } = methods;

  useEffect(() => {
    if (accountDetailsList?.[0]) {
      reset({
        ...accountDetailsList[0],
        billing_fax: accountDetailsList[0].billing_fax ?? "",
        billing_phone_ext: accountDetailsList[0].billing_phone_ext ?? "",
        billing_phone: phoneStringToNumericString(
          accountDetailsList[0]?.billing_phone
        ),
      });
    }
  }, [accountDetailsList, reset]);

  const onSubmit = useCallback(
    async (data: IAddDirectBillingAccountRequest) => {
      const accountDetails = accountDetailsList?.[0];
      data.property_id = currentUser?.defaultPropertyId;
      const response = await updateAccount({
        id: accountDetails?.id ?? -1,
        body: data,
      });
      if ("error" in response) {
        setError(
          "root",
          { message: response.error as string },
          { shouldFocus: true }
        );
        return;
      }
      setSuccessMessage("Account added successfully!");
      setTimeout(() => {
        navigate(`/booking-engine/accounting/account/${accountDetails?.id}`);
      }, 500);
    },
    [
      navigate,
      setError,
      updateAccount,
      currentUser?.defaultPropertyId,
      accountDetailsList,
    ]
  );

  const guestOptions = useMemo(() => {
    return (guestList ?? []).map((a) => ({
      label: `${a.first_name} ${a.last_name}`,
      id: a.id,
    }));
  }, [guestList]);

  function handleErrorClose() {
    clearErrors();
  }

  if (accountLoading) {
    return <EditFormSkeleton />;
  }
  return (
    <FormProvider {...methods}>
      {accountError && (
        <Box mb={2}>
          <Alert severity="error" onClose={handleErrorClose}>
            {accountError.message}
          </Alert>
        </Box>
      )}
      {errors?.root && (
        <Box mb={2}>
          <Alert severity="error" onClose={handleErrorClose}>
            {errors.root.message}
          </Alert>
        </Box>
      )}
      {successMessage && (
        <Box mb={2}>
          <Alert severity="success">{successMessage}</Alert>
        </Box>
      )}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} mb={2}>
          <Controller
            name="guest_id"
            control={control}
            render={({
              field: { onChange, value },
              fieldState: { error, invalid },
            }) => {
              const selectedGuest = guestOptions.find((c) => c.id === value);
              return (
                <Autocomplete
                  value={selectedGuest || null}
                  onChange={(_, selectedOption) => onChange(selectedOption?.id)}
                  options={guestOptions}
                  getOptionLabel={(option) => option.label}
                  isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Guest"
                      error={invalid}
                      helperText={error?.message}
                    />
                  )}
                  fullWidth
                />
              );
            }}
          />
        </Grid>

        <FormTextField
          name="credit_limit"
          sm={6}
          label="Credit Limit"
          required
          textFieldProps={{
            fullWidth: true,
            placeholder: "Enter Credit Limit",
            type: "number",
          }}
          gridProps={{ mb: 2 }}
        />

        <FormTextField
          name="billing_name"
          sm={6}
          label="Billing Name"
          required
          textFieldProps={{
            fullWidth: true,
            placeholder: "Enter Billing Name",
          }}
          gridProps={{ mb: 2 }}
        />
        <FormTextField
          name="billing_phone"
          sm={6}
          label="Billing Phone"
          required
          textFieldProps={{
            fullWidth: true,
            placeholder: "Enter Billing Phone",
            type: "tel",
          }}
          gridProps={{ mb: 2 }}
        />
        <FormTextField
          name="billing_phone_ext"
          sm={6}
          label="Billing Phone Extension"
          textFieldProps={{
            fullWidth: true,
            placeholder: "Enter Phone Extension",
            type: "tel",
          }}
          gridProps={{ mb: 2 }}
        />
        <FormTextField
          name="billing_fax"
          sm={6}
          label="Billing Fax"
          textFieldProps={{
            fullWidth: true,
            placeholder: "Enter Billing Fax",
          }}
          gridProps={{ mb: 2 }}
        />
        <FormTextField
          name="billing_email"
          sm={6}
          label="Billing Email"
          required
          textFieldProps={{
            fullWidth: true,
            placeholder: "Enter Billing Email",
            type: "email",
          }}
          gridProps={{ mb: 2 }}
        />
        <FormTextField
          name="billing_city"
          sm={6}
          label="Billing City"
          required
          textFieldProps={{
            fullWidth: true,
            placeholder: "Enter Billing City",
          }}
          gridProps={{ mb: 2 }}
        />
        <FormTextField
          name="billing_state"
          sm={6}
          label="Billing State"
          required
          textFieldProps={{
            fullWidth: true,
            placeholder: "Enter Billing State",
          }}
          gridProps={{ mb: 2 }}
        />
        <Grid item xs={12} sm={6} mb={2}>
          <Controller
            name="billing_country"
            control={control}
            render={({
              field: { onChange, value },
              fieldState: { error, invalid },
            }) => (
              <Autocomplete
                value={countries.find((c) => c.value === value) || null}
                onChange={(_, selectedOption) =>
                  onChange(selectedOption?.value)
                }
                options={countries}
                getOptionLabel={(option) => option.label}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Billing Country"
                    error={invalid}
                    helperText={error?.message}
                  />
                )}
                fullWidth
              />
            )}
          />
        </Grid>
        <FormTextField
          name="billing_zip"
          sm={6}
          label="Billing Zip"
          required
          textFieldProps={{
            fullWidth: true,
            placeholder: "Enter Billing Zip",
            type: "tel",
          }}
          gridProps={{ mb: 2 }}
          mask="999999"
        />
        <FormTextField
          name="billing_address"
          sm={12}
          label="Billing Address"
          required
          textFieldProps={{
            fullWidth: true,
            rows: 1,
            placeholder: "Enter Billing Address",
          }}
          gridProps={{ mb: 2 }}
        />
        <Grid item xs={12}>
          <Box display="flex" alignItems="center" gap={2}>
            <Button
              variant="outlined"
              onClick={() => navigate("/booking-engine/accounting/accounts")}
              size="large"
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              disabled={isLoading}
              onClick={handleSubmit(onSubmit)}
              size="large"
            >
              Save
            </Button>
          </Box>
        </Grid>
      </Grid>
    </FormProvider>
  );
};

export default Page;
