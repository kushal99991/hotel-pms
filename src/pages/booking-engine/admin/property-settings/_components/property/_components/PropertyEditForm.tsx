import React, { useCallback, useMemo, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { Autocomplete, Box, Grid, TextField } from "@mui/material";
import { useUpdatePropertyByIdMutation } from "services/propertySlice";
import { IPropertyBaseValues } from "types/property";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import CancelButton from "components/elements/Button/CancelButton";
import { geoCodeFromAddress } from "utils/helperFunctions/geo";
import { yupResolver } from "@hookform/resolvers/yup";
import { updatePropertySchema } from "utils/validations.utils";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import moment from "moment";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { appConfig } from "config/app.config";
import FormTextField from "components/forms/FormTextField";
import { countries } from "utils/countries";

interface PropertyEditFormProps {
  property: IPropertyBaseValues;
  handleCancelClick: () => void;
}

const PropertyEditForm: React.FC<PropertyEditFormProps> = ({
  property,
  handleCancelClick,
}) => {
  const [notification, setNotification] = useState({
    message: "",
    type: "success",
  });

  const methods = useForm<IPropertyBaseValues>({
    mode: "onChange",
    defaultValues: {
      ...property,
    },
    resolver: yupResolver(updatePropertySchema),
  });
  const { handleSubmit, control } = methods;
  const [updatePropertyById, { isLoading }] = useUpdatePropertyByIdMutation();

  const onSubmit = useCallback(
    async (val: IPropertyBaseValues) => {
      const address = `${val.address_1} ${val.address_2} ${val.city} ${val.state} ${val.zip_code}`;
      const geo = await geoCodeFromAddress(address);
      if (geo.length > 0) {
        val.lat = geo[1];
        val.lng = geo[0];
      }
      const payload = {
        name: val.name,
        description: val.description,
        phone: val.phone,
        phone_toll_free: val.phone_toll_free,
        fax: val.fax,
        email: val.email,
        address_1: val.address_1,
        address_2: val.address_2,
        city: val.city,
        state: val.state,
        country: val.country,
        zip_code: val.zip_code,
        lat: val.lat,
        lng: val.lng,
        checkin_time: moment(val.checkin_time, moment.ISO_8601, true).isValid()
          ? moment(val.checkin_time).format(appConfig.dateTimeOfDayFormat)
          : val.checkin_time,
        checkout_time: moment(
          val.checkout_time,
          moment.ISO_8601,
          true
        ).isValid()
          ? moment(val.checkout_time).format(appConfig.dateTimeOfDayFormat)
          : val.checkout_time,
        timezone: val.timezone,
        property_type: val?.property_type ?? "HOTEL",
      };
      const rsp = await updatePropertyById({
        id: `${property?.id}`,
        data: payload,
      });
      if (rsp.error) {
        setNotification({
          message: `${rsp.error}`,
          type: "error",
        });
        return false;
      }
      handleCancelClick();
    },
    [handleCancelClick, property.id, updatePropertyById]
  );

  const timezoneOptions = useMemo(() => {
    const allTimezones = moment.tz.names();

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
      });
  }, []);

  const propertyTypeOption = [
    { value: "HOTEL", label: "HOTEL" },
    { value: "RV_CAMP", label: "RV_CAMP" },
    { value: "CASINO", label: "CASINO" },
    { value: "BOAT_SLIP", label: "BOAT_SLIP" },
  ];

  return (
    <FormProvider {...methods}>
      {notification.message}

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
        <Grid item xs={12} sm={6} md={6}>
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <Box mb={3}>
              <Controller
                name="checkin_time"
                control={control}
                render={({ field }) => (
                  <TimePicker
                    label="Check-In Time"
                    value={field.value ? moment(field.value, "hh:mm A") : null}
                    onChange={(value) => {
                      // Only update if the selected time is valid
                      if (moment(value).isValid()) {
                        field.onChange(moment(value).format("h:mm A"));
                        // Set to desired format
                      }
                    }}
                    slotProps={{
                      textField: { fullWidth: true }, // Ensures the input field occupies full width
                    }}
                  />
                )}
              />
            </Box>
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} sm={6} md={6}>
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <Box mb={3}>
              <Controller
                name="checkout_time"
                control={control}
                render={({ field }) => (
                  <TimePicker
                    label="Check-Out Time"
                    value={field.value ? moment(field.value, "hh:mm A") : null}
                    onChange={(value) => {
                      // Only update if the selected time is valid
                      if (moment(value).isValid()) {
                        field.onChange(moment(value).format("h:mm A")); // Set to desired format
                      }
                    }}
                    slotProps={{
                      textField: { fullWidth: true }, // Ensures the input field occupies full width
                    }}
                  />
                )}
              />
            </Box>
          </LocalizationProvider>
        </Grid>
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
            <CancelButton onClick={handleCancelClick} />
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

export default PropertyEditForm;
