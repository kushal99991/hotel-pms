import React, { useCallback, useMemo } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { Alert, Autocomplete, Box, Grid, TextField } from "@mui/material";
import { useAddPropertiesMutation } from "services/propertySlice";
import { IPropertyRequest } from "types/property";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import CancelButton from "components/elements/Button/CancelButton";
import { geoCodeFromAddress } from "utils/helperFunctions/geo";
import { yupResolver } from "@hookform/resolvers/yup";
import { propertySchema } from "utils/validations.utils";
import { useNavigate } from "react-router-dom";
import useAuth from "hooks/useAuth";
import { countries } from "utils/countries";
import FormTextField from "components/forms/FormTextField";
import moment from "moment";
import { useGetOrgByIdQuery } from "services/organizationSlice";
import { skipToken } from "@reduxjs/toolkit/query";

const AddPropertyForm: React.FC = () => {
  const { users } = useAuth();

  const methods = useForm<IPropertyRequest>({
    mode: "all",
    resolver: yupResolver(propertySchema),
    defaultValues: {
      name: "",
      description: "",
      property_type: "HOTEL",
    },
  });

  const {
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = methods;
  const userId = users?.id;
  const { data: organization } = useGetOrgByIdQuery(
    userId ? { id: String(userId) } : skipToken
  );
  const [addProperties, { isLoading }] = useAddPropertiesMutation();
  const Navigate = useNavigate();

  const onSubmit = useCallback(
    async (val: IPropertyRequest) => {
      const address = `${val.address_1} ${val.address_2 || ""} ${val.city} ${val.state} ${val.zip_code}`;
      const geo = await geoCodeFromAddress(address);
      if (geo.length > 0) {
        val.lat = geo[1]; // You can handle lat/lng later if needed
        val.lng = geo[0];
      }
      val.organization_id = organization?.id;

      const response = await addProperties(val);
      if (response.error) {
        setError(
          "root",
          { message: `${response.error}`, type: "deps" },
          { shouldFocus: true }
        );

        return false;
      }
      // Navigate to property details page on success
      Navigate(`/booking-engine/admin/property/detail/${response.data?.id}`);
    },
    [addProperties, Navigate, organization]
  );

  const timezoneOptions = useMemo(() => {
    const allTimezones = moment.tz.names();
    const allowedTimezones = [
      "America/New_York",
      "America/Chicago",
      "America/Denver",
      "America/Los_Angeles",
      "America/Anchorage",
      "America/Adak",
      "Pacific/Honolulu",
      "America/Phoenix",
      "America/Indiana/Indianapolis",
      "America/Indiana/Knox",
      "America/Indiana/Marengo",
      "America/Indiana/Petersburg",
      "America/Indiana/Tell_City",
      "America/Indiana/Vevay",
      "America/Indiana/Vincennes",
      "America/Indiana/Winamac",
      "America/North_Dakota/Beulah",
      "America/North_Dakota/Center",
      "America/North_Dakota/New_Salem",
    ];

    return allTimezones
      .map((tz) => {
        const now = moment().tz(tz);
        const offsetInMinutes = now.utcOffset();
        const sign = offsetInMinutes >= 0 ? "+" : "-";
        const absOffset = Math.abs(offsetInMinutes);
        const hours = Math.floor(absOffset / 60)
          .toString()
          .padStart(2, "0");
        const minutes = (absOffset % 60).toString().padStart(2, "0");
        const formattedOffset = `UTC ${sign}${hours}:${minutes}`;
        const currentDateTime = now.format("DD MMM YYYY hh:mm A");

        return {
          label: `${tz} (${formattedOffset}) - ${currentDateTime}`,
          value: tz,
          isAmerican: tz.startsWith("America/"),
        };
      })
      .sort((a, b) => {
        if (a.isAmerican && !b.isAmerican) return -1;
        if (!a.isAmerican && b.isAmerican) return 1;
        return a.value.localeCompare(b.value);
      })
      .filter((a) => allowedTimezones.includes(a.value));
  }, []);

  const propertyTypeOption = [
    { value: "HOTEL", label: "HOTEL" },
    { value: "RV_CAMP", label: "RV_CAMP" },
    { value: "CASINO", label: "CASINO" },
    { value: "BOAT_SLIP", label: "BOAT_SLIP" },
  ];

  return (
    <FormProvider {...methods}>
      {errors?.root && <Alert severity="error">{errors?.root.message}</Alert>}
      <Grid container spacing={3}>
        <FormTextField
          name="name"
          sm={12}
          label="Property Name"
          textFieldProps={{
            placeholder: "Enter Property Name",
            fullWidth: true,
          }}
        />
        <FormTextField
          name="description"
          sm={12}
          label="Description"
          textFieldProps={{
            fullWidth: true,
            multiline: true,
            rows: 4,
            placeholder: "Enter Property Description",
          }}
        />
        <FormTextField
          name="phone"
          sm={6}
          label="Phone"
          textFieldProps={{
            fullWidth: true,
            placeholder: "Enter Phone",
            type: "phone",
          }}
        />
        <FormTextField
          name="phone_toll_free"
          sm={6}
          label="Toll-Free Phone"
          textFieldProps={{
            fullWidth: true,
            placeholder: "Enter Toll-Free Phone",
            type: "phone",
          }}
        />
        <FormTextField
          name="fax"
          sm={6}
          label="Fax"
          textFieldProps={{
            fullWidth: true,
            placeholder: "Enter Fax",
          }}
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
        />
        <FormTextField
          name="floor_count"
          sm={6}
          label="Floor Count"
          textFieldProps={{
            fullWidth: true,
            placeholder: "Enter Floor Count",
            type: "number",
          }}
        />
        <FormTextField
          name="address_1"
          sm={6}
          label="Address 1"
          textFieldProps={{
            fullWidth: true,
            placeholder: "Enter Address 1",
          }}
        />
        <FormTextField
          name="address_2"
          sm={6}
          label="Address 2"
          textFieldProps={{
            fullWidth: true,
            placeholder: "Enter Address 2",
          }}
        />
        <FormTextField
          name="city"
          sm={6}
          label="City"
          textFieldProps={{
            fullWidth: true,
            placeholder: "Enter City",
          }}
        />
        <FormTextField
          name="state"
          sm={6}
          label="State"
          textFieldProps={{
            fullWidth: true,
            placeholder: "Enter State",
          }}
        />

        <Grid item xs={12} sm={6}>
          <Controller
            name="country"
            control={control}
            render={({
              field: { onChange, value },
              fieldState: { error, invalid },
            }) => {
              const selectedCountry = countries.find((c) => c.value === value);

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
                      label="Country/Region"
                      error={invalid}
                      helperText={error?.message}
                      placeholder="Enter Country/Region"
                    />
                  )}
                  fullWidth
                />
              );
            }}
          />
        </Grid>
        <FormTextField
          name="zip_code"
          sm={6}
          label="Zip Code"
          textFieldProps={{
            fullWidth: true,
            placeholder: "Enter Zip Code",
            type: "tel",
          }}
          mask="99999"
        />
        <Grid item xs={12} sm={6}>
          <Controller
            name="timezone"
            control={control}
            render={({
              field: { onChange, value },
              fieldState: { error, invalid },
            }) => {
              const selectedTimezone = timezoneOptions.find(
                (tz) => tz.value === value
              );

              return (
                <Autocomplete
                  value={selectedTimezone || null}
                  onChange={(_, selectedOption) =>
                    onChange(selectedOption?.value)
                  }
                  options={timezoneOptions}
                  getOptionLabel={(option) => option.label}
                  isOptionEqualToValue={(option, value) =>
                    option.value === value.value
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Timezone"
                      error={invalid}
                      helperText={error?.message}
                      fullWidth
                    />
                  )}
                />
              );
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="property_type"
            control={control}
            render={({
              field: { onChange, value },
              fieldState: { error, invalid },
            }) => {
              const selectedPropertyType = propertyTypeOption.find(
                (c) => c.value === value
              );

              return (
                <Autocomplete
                  value={selectedPropertyType || null}
                  onChange={(_, selectedOption) =>
                    onChange(selectedOption?.value)
                  }
                  options={propertyTypeOption}
                  getOptionLabel={(option) => option.label}
                  isOptionEqualToValue={(option, value) =>
                    option.value === value.value
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Property Type"
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

        <Grid item xs={12}>
          <Box display="flex" justifyContent="flex-start" gap={2}>
            <CancelButton
              onClick={() =>
                Navigate("/booking-engine/admin/property-settings")
              }
            />
            <PrimaryButton
              label="Save"
              onClick={handleSubmit(onSubmit)}
              isLoading={isLoading}
              loadingText="Loading..."
            />
          </Box>
        </Grid>
      </Grid>
    </FormProvider>
  );
};

export default AddPropertyForm;
