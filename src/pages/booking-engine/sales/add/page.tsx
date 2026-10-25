import { Controller, FormProvider, useForm, useWatch } from "react-hook-form";
import React, { useCallback, useState, useEffect } from "react";
import {
  Alert,
  Button,
  Grid,
  Autocomplete,
  TextField,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Box,
} from "@mui/material";
import { yupResolver } from "@hookform/resolvers/yup";

import FormTextField from "components/forms/FormTextField";
import { useNavigate } from "react-router-dom";
import { addSaleAccountSchema } from "utils/validations.utils";
import { IAccountRequest } from "types/salesTypes";
import { countries } from "utils/countries";
import { useCreateContactAccountMutation } from "services/salesSlice";
import useAuth from "hooks/useAuth";

// Market Segment options for Sales Contact
const marketSegmentOptions = [
  { label: "Group", value: "GROUP" },
  { label: "Corporate", value: "CORPORATE" },
  { label: "Contract", value: "CONTRACT" },
];

// Sales Distribution options (Group Distribution)
const salesDistributionOptions = [
  { label: "Wedding Blocks", value: "WEDDING_BLOCKS" },
  { label: "GOH", value: "GOH" },
  { label: "SMERF", value: "SMERF" },
  { label: "Corporate", value: "CORPORATE" },
  { label: "Banquet and Catering", value: "BANQUET_CATERING" },
];

const AddSaleAccount: React.FC = () => {
  const navigate = useNavigate();
  const { users } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [sameAsMainContact, setSameAsMainContact] = useState(false);
  const [createAccount, { isLoading }] = useCreateContactAccountMutation();

  const methods = useForm<IAccountRequest>({
    mode: "all",
    resolver: yupResolver(addSaleAccountSchema),
    defaultValues: {
      property_id: users?.defaultPropertyId,
      first_name: "",
      last_name: "",
      phone: "",
      phone_extension: "",
      cell_phone: "",
      email: "",
      country: countries[0].value,
      address: "",
      billing_name: "",
      billing_phone: "",
      billing_phone_ext: "",
      billing_fax: "",
      billing_email: "",
      billing_address: "",
      billing_city: "",
      billing_state: "",
      billing_zip: "",
      billing_country: countries[0].value,
      role: "",
      notes: "",
    },
  });

  const {
    handleSubmit,
    control,
    setError,
    clearErrors,
    setValue,
    getValues,
    formState: { errors },
    reset,
  } = methods;

  // Watch the main contact fields for auto-fill
  const firstName = useWatch({ control, name: "first_name" });
  const lastName = useWatch({ control, name: "last_name" });
  const phone = useWatch({ control, name: "phone" });
  const phoneExtension = useWatch({ control, name: "phone_extension" });
  const email = useWatch({ control, name: "email" });
  const address = useWatch({ control, name: "address" });

  // Handle "Same as Main Group contact" checkbox
  const handleSameAsMainContact = (checked: boolean) => {
    setSameAsMainContact(checked);

    if (checked) {
      // Validate required fields
      const currentFirstName = getValues("first_name");
      const currentLastName = getValues("last_name");
      const currentPhone = getValues("phone");
      const currentEmail = getValues("email");

      let hasErrors = false;

      // Clear previous errors for these fields
      clearErrors(["first_name", "last_name", "phone", "email"]);

      // Check required fields and set errors if missing
      if (!currentFirstName?.trim()) {
        setError("first_name", {
          type: "manual",
          message: "First Name is required",
        });
        hasErrors = true;
      }
      if (!currentLastName?.trim()) {
        setError("last_name", {
          type: "manual",
          message: "Last Name is required",
        });
        hasErrors = true;
      }
      if (!currentPhone?.trim()) {
        setError("phone", { type: "manual", message: "Phone is required" });
        hasErrors = true;
      }
      if (!currentEmail?.trim()) {
        setError("email", { type: "manual", message: "Email is required" });
        hasErrors = true;
      }

      // If validation fails, don't populate billing fields
      if (hasErrors) {
        setSameAsMainContact(false);
        return;
      }

      // Populate billing fields
      setValue("billing_phone", currentPhone);
      setValue("billing_phone_ext", getValues("phone_extension") || "");
      setValue("billing_email", currentEmail);
      setValue("billing_address", getValues("address") || "");
    }
  };

  // Keep billing fields in sync when checkbox is checked
  useEffect(() => {
    if (sameAsMainContact) {
      setValue("billing_phone", phone || "");
      setValue("billing_phone_ext", phoneExtension || "");
      setValue("billing_email", email || "");
      setValue("billing_address", address || "");
    }
  }, [
    sameAsMainContact,
    firstName,
    lastName,
    phone,
    phoneExtension,
    email,
    address,
    setValue,
  ]);

  const onSubmit = useCallback(
    async (data: IAccountRequest) => {
      data.property_id = users?.defaultPropertyId;
      const response = await createAccount(data);
      if (response.error) {
        setError(
          "root",
          { message: response.error as string },
          { shouldFocus: true }
        );
        return false;
      }
      reset();
      setSuccessMessage("Account added successfully!");
      setTimeout(() => {
        navigate("/booking-engine/sales");
      }, 1000);
    },
    [reset, navigate, setError, users?.defaultPropertyId, createAccount]
  );

  return (
    <FormProvider {...methods}>
      <Grid container style={{ height: "100vh" }}>
        <Grid item xs={12} md={10} p={2}>
          {/* Error and Success Alerts */}
          {errors?.root && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.root.message}
            </Alert>
          )}
          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          )}

          <Grid container spacing={2}>
            {/* Row 1: First Name, Last Name, Phone */}
            <FormTextField
              name="first_name"
              sm={3}
              label="First Name"
              textFieldProps={{
                fullWidth: true,
                placeholder: "Enter First Name",
              }}
              required
              gridProps={{ mb: 2 }}
            />
            <FormTextField
              name="last_name"
              sm={3}
              label="Last Name"
              textFieldProps={{
                fullWidth: true,
                placeholder: "Enter Last Name",
              }}
              required
              gridProps={{ mb: 2 }}
            />
            <FormTextField
              name="phone"
              sm={6}
              label="Phone"
              textFieldProps={{
                fullWidth: true,
                placeholder: "Enter Phone Number",
              }}
              required
              gridProps={{ mb: 2 }}
            />

            {/* Row 2: Phone Extension, Email */}
            <FormTextField
              name="phone_extension"
              sm={6}
              label="Phone Extension"
              textFieldProps={{
                fullWidth: true,
                placeholder: "Enter Phone Extension",
              }}
              gridProps={{ mb: 2 }}
            />
            <FormTextField
              name="email"
              sm={6}
              label="Email"
              textFieldProps={{
                fullWidth: true,
                placeholder: "Enter Email",
                type: "email",
              }}
              required
              gridProps={{ mb: 2 }}
            />

            {/* Row 3: Role, Organization/Company (using cell_phone field for now) */}
            <FormTextField
              name="role"
              sm={6}
              label="Role"
              textFieldProps={{
                fullWidth: true,
                placeholder: "Enter Role",
              }}
              gridProps={{ mb: 2 }}
            />
            <FormTextField
              name="billing_name"
              sm={6}
              label="Organization / Company"
              textFieldProps={{
                fullWidth: true,
                placeholder: "Enter Organization / Company",
              }}
              gridProps={{ mb: 2 }}
            />

            {/* 
              NOTE: Market Segment, Group Distribution, and Account Receivable 
              are NOT IMPLEMENTED per Jira ticket instructions.
              Uncomment when ready to implement.
            */}
            {/* <Grid item xs={12} sm={4} mb={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Market Segment</InputLabel>
                <Select
                  label="Market Segment"
                  defaultValue=""
                >
                  <MenuItem value="">
                    <em>Select Market Segment</em>
                  </MenuItem>
                  {marketSegmentOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4} mb={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Group Distribution</InputLabel>
                <Select
                  label="Group Distribution"
                  defaultValue=""
                >
                  <MenuItem value="">
                    <em>Select Group Distribution</em>
                  </MenuItem>
                  {salesDistributionOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4} mb={2}>
              <TextField
                label="Account Receivable"
                fullWidth
                disabled
                placeholder="Search..."
                size="small"
                helperText="Not implemented yet"
              />
            </Grid> */}

            {/* Address Field - in main contact section for checkbox copy to work */}
            <FormTextField
              name="address"
              sm={12}
              label="Address"
              textFieldProps={{
                fullWidth: true,
                placeholder: "Enter Address",
              }}
              gridProps={{ mb: 2 }}
            />

            {/* Account Notes */}
            <FormTextField
              name="notes"
              sm={12}
              label="Account Notes"
              textFieldProps={{
                fullWidth: true,
                multiline: true,
                rows: 3,
                placeholder: "Enter Notes",
              }}
              gridProps={{ mb: 2 }}
            />

            {/* Same as Main Group contact checkbox */}
            <Grid item xs={12} mb={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={sameAsMainContact}
                    onChange={(e) => handleSameAsMainContact(e.target.checked)}
                  />
                }
                label="Same as Main Group contact"
              />
            </Grid>

            {/* Billing Fields */}
            <FormTextField
              name="billing_name"
              sm={6}
              label="Billing Name"
              textFieldProps={{
                fullWidth: true,
                placeholder: "Enter Billing Name",
                disabled: sameAsMainContact,
              }}
              required
              gridProps={{ mb: 2 }}
            />
            <FormTextField
              name="billing_phone"
              sm={6}
              label="Billing Phone"
              textFieldProps={{
                fullWidth: true,
                placeholder: "Enter Billing Phone",
                disabled: sameAsMainContact,
              }}
              required
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
              name="billing_phone_ext"
              sm={6}
              label="Billing Phone Extension"
              textFieldProps={{
                fullWidth: true,
                placeholder: "Enter Billing Phone Extension",
                disabled: sameAsMainContact,
              }}
              gridProps={{ mb: 2 }}
            />
            <FormTextField
              name="billing_email"
              sm={12}
              label="Billing Email"
              textFieldProps={{
                fullWidth: true,
                placeholder: "Enter Billing Email",
                type: "email",
                disabled: sameAsMainContact,
              }}
              required
              gridProps={{ mb: 2 }}
            />
            <FormTextField
              name="billing_address"
              sm={12}
              label="Billing Address"
              textFieldProps={{
                fullWidth: true,
                placeholder: "Enter Billing Address",
                disabled: sameAsMainContact,
              }}
              required
              gridProps={{ mb: 2 }}
            />
            <FormTextField
              name="billing_city"
              sm={6}
              label="Billing City"
              textFieldProps={{
                fullWidth: true,
                placeholder: "Enter Billing City",
              }}
              required
              gridProps={{ mb: 2 }}
            />
            <FormTextField
              name="billing_state"
              sm={6}
              label="Billing State"
              textFieldProps={{
                fullWidth: true,
                placeholder: "Enter Billing State",
              }}
              required
              gridProps={{ mb: 2 }}
            />

            {/* Billing Country */}
            <Grid item xs={12} sm={6} mb={2}>
              <Controller
                name="billing_country"
                control={control}
                render={({
                  field: { onChange, value },
                  fieldState: { error, invalid },
                }) => {
                  const selectedCountry = countries.find(
                    (c) => c.value === value
                  );
                  return (
                    <Autocomplete
                      value={selectedCountry || null}
                      onChange={(_, selectedOption) =>
                        onChange(selectedOption?.value)
                      }
                      options={countries}
                      getOptionLabel={(option) => option.label}
                      isOptionEqualToValue={(option, value) =>
                        option.value === value.value
                      }
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
                  );
                }}
              />
            </Grid>
            <FormTextField
              name="billing_zip"
              sm={6}
              label="Billing Zip"
              textFieldProps={{
                fullWidth: true,
                placeholder: "Enter Billing Zip",
              }}
              required
              gridProps={{ mb: 2 }}
            />

            {/* Country */}
            <Grid item xs={12} sm={6} mb={2}>
              <Controller
                name="country"
                control={control}
                render={({
                  field: { onChange, value },
                  fieldState: { error, invalid },
                }) => {
                  const selectedCountry = countries.find(
                    (c) => c.value === value
                  );
                  return (
                    <Autocomplete
                      value={selectedCountry || null}
                      onChange={(_, selectedOption) =>
                        onChange(selectedOption?.value)
                      }
                      options={countries}
                      getOptionLabel={(option) => option.label}
                      isOptionEqualToValue={(option, value) =>
                        option.value === value.value
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Country"
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

            {/* Action Buttons */}
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" gap={2}>
                <Button
                  type="button"
                  size="large"
                  variant="outlined"
                  onClick={() => navigate("/booking-engine/sales")}
                >
                  Cancel
                </Button>
                <Button
                  size="large"
                  variant="contained"
                  disabled={isLoading}
                  onClick={handleSubmit(onSubmit)}
                >
                  {isLoading ? "Saving..." : "Save"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </FormProvider>
  );
};

export default AddSaleAccount;
