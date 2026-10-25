import React, { useState, useMemo } from "react";
import { Controller, useFormContext } from "react-hook-form";
import {
  Autocomplete,
  Box,
  CircularProgress,
  Grid,
  TextField,
  Typography,
  Paper,
} from "@mui/material";
import useAuth from "hooks/useAuth";
import { useSalesAccountsQuery } from "services/salesSlice";
import { GroupReservationFormData } from "forms/schemas/salesGroup.validations";
import { salesDistributionOptions } from "constants/sales";
import FormCustomDropdown from "components/forms/FormCustomDropdown";
import FormTextField from "components/forms/FormTextField";
import ComboBox from "components/widgets/Form/ComboBox";
import {
  bookingChannelList,
  marketOptionList,
} from "config/tables/reservations";
import { countries } from "utils/countries";
import { SET_VALUE_OPTIONS } from "constants/forms";

type SalesContactOption = {
  name: string;
  id: number;
  role?: string;
  org?: string;
};

export const CustomerDetailsSection: React.FC = () => {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<GroupReservationFormData>();
  const { currentProperty } = useAuth();
  const [valFromSearch, setValFromSearch] = useState<SalesContactOption | null>(
    null
  );
  const [searchText, setSearchText] = useState("");
  const {
    isLoading: contactsLoading,
    data: contacts,
    refetch,
  } = useSalesAccountsQuery(
    {
      property_id: currentProperty?.id ?? 0,
    },
    { skip: !currentProperty?.id }
  );

  const contactOptions = useMemo<SalesContactOption[]>(() => {
    if (!contacts) {
      return [];
    }
    return contacts.map((acc) => ({
      name: `${acc.first_name} ${acc.last_name}`,
      role: acc.role,
      org: acc.billing_name,
      id: acc.id,
    }));
  }, [valFromSearch, searchText, contacts]);

  function handleContactSelect(contact: SalesContactOption | null) {
    if (!contact) {
      setValue("sales_contact", undefined);
      setValue("sales_contact_id", undefined);
      setValue("first_name", "", { shouldDirty: true, shouldTouch: true });
      setValue("last_name", "", { shouldDirty: true, shouldTouch: true });
      setValue("email", "", { shouldDirty: true, shouldTouch: true });
      setValue("phone", undefined, SET_VALUE_OPTIONS);
      setValue("cell_phone", undefined, SET_VALUE_OPTIONS);
      setValue("address", undefined, SET_VALUE_OPTIONS);
      setValue("phone_extension", undefined, SET_VALUE_OPTIONS);
      setValue("country", undefined, SET_VALUE_OPTIONS);
    }
    const selectedContact = contacts?.find((c) => c.id === contact?.id);
    if (selectedContact) {
      setValue("sales_contact", selectedContact);
      setValue("sales_contact_id", selectedContact.id, SET_VALUE_OPTIONS);
      setValue("first_name", selectedContact.first_name, SET_VALUE_OPTIONS);
      setValue("last_name", selectedContact.last_name, SET_VALUE_OPTIONS);
      setValue("email", selectedContact?.email ?? "", SET_VALUE_OPTIONS);
      setValue("phone", selectedContact.phone, SET_VALUE_OPTIONS);
      setValue(
        "cell_phone",
        selectedContact.cell_phone ?? "",
        SET_VALUE_OPTIONS
      );
      setValue("address", selectedContact.address, SET_VALUE_OPTIONS);
      setValue(
        "phone_extension",
        selectedContact.phone_extension,
        SET_VALUE_OPTIONS
      );
      setValue("country", selectedContact.country, SET_VALUE_OPTIONS);
    }
  }
  const disableContactInput = !!valFromSearch;
  return (
    <Paper sx={{ p: 3, my: 3 }}>
      <Typography variant="h6" gutterBottom>
        Group Details
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <FormCustomDropdown
          name="market_segment"
          label="Market Segment"
          options={marketOptionList}
          defaultValue="GROUP"
          gridProps={{
            sm: 4,
          }}
          fullWidth
          hideTopLabel
        />
        <FormCustomDropdown
          name="booking_channel"
          label="Booking Channel"
          options={bookingChannelList}
          defaultValue="GROUPS"
          gridProps={{
            sm: 4,
          }}
          fullWidth
          hideTopLabel
        />
        <FormCustomDropdown
          name="sales_distribution"
          placeholder="Sales Distribution"
          label="Sales Distribution"
          options={salesDistributionOptions}
          defaultValue=""
          hideTopLabel
          fullWidth
          gridProps={{ sm: 4 }}
        />
      </Grid>

      {/* Group Information */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <FormTextField
          name="group_name"
          sm={6}
          label="Group Name"
          required
          textFieldProps={{ fullWidth: true }}
        />
        <FormTextField
          name="group_code"
          sm={6}
          label="Group Code"
          textFieldProps={{ fullWidth: true }}
        />
      </Grid>
      <Typography variant="h6" gutterBottom>
        Contact Information
      </Typography>
      {/* Contact Information */}
      <Box display="flex" mt={2} mb={4}>
        <Autocomplete
          id="sales-contact-search"
          sx={{ width: 500 }}
          getOptionLabel={(option) =>
            `${option.name}${option.role ? `, ${option.role}` : ""}${option.org ? ` (${option.org})` : ""}`
          }
          loading={contactsLoading}
          options={contactOptions}
          autoComplete
          includeInputInList
          filterSelectedOptions
          value={valFromSearch}
          noOptionsText={searchText ? "No matches" : "Start typing to search"}
          onChange={(_, newValue: SalesContactOption | null) => {
            setValFromSearch(newValue);
            handleContactSelect(newValue);
            // setErrors({ ...errors, name: false, number: false });
          }}
          onInputChange={(_, newInputValue) => {
            setSearchText(newInputValue);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Use saved contact"
              fullWidth
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {contactsLoading ? (
                      <CircularProgress color="inherit" size={20} />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
      </Box>
      <Grid container spacing={2}>
        <FormTextField
          name="first_name"
          sm={6}
          label="First Name"
          required
          textFieldProps={{ fullWidth: true, disabled: disableContactInput }}
        />
        <FormTextField
          name="last_name"
          sm={6}
          label="Last Name"
          required
          textFieldProps={{ fullWidth: true, disabled: disableContactInput }}
        />
        <FormTextField
          name="email"
          sm={6}
          label="Email address"
          required
          textFieldProps={{
            fullWidth: true,
            type: "email",
            disabled: disableContactInput,
          }}
        />
        <FormTextField
          name="phone"
          sm={6}
          label="Phone"
          textFieldProps={{
            fullWidth: true,
            type: "tel",
            disabled: disableContactInput,
          }}
        />
        <FormTextField
          name="cell_phone"
          sm={6}
          label="Cell Phone"
          textFieldProps={{
            fullWidth: true,
            type: "tel",
            disabled: disableContactInput,
          }}
        />
        <FormTextField
          name="phone_extension"
          sm={6}
          label="Phone Extension"
          textFieldProps={{ fullWidth: true, disabled: disableContactInput }}
        />
        <FormTextField
          name="address"
          sm={12}
          label="Address"
          textFieldProps={{ fullWidth: true, disabled: disableContactInput }}
        />
        <Grid item xs={12} md={6}>
          <Controller
            name="country"
            control={control}
            render={({ field: { onChange, value } }) => {
              // Find the selected country object using the value (country code)
              const selectedCountry = countries.find((c) => c.value === value);

              // Construct the expected ComboBox value
              const comboBoxValue = selectedCountry
                ? { id: selectedCountry.value, label: selectedCountry.label }
                : null;

              return (
                <ComboBox
                  label="Country/Region"
                  value={comboBoxValue}
                  items={countries.map((country) => ({
                    id: country.value, // Country code as ID
                    label: country.label, // Country name
                  }))}
                  onChange={(event, selectedOption) =>
                    onChange(selectedOption?.id)
                  }
                  size="medium"
                  width="100%"
                  disabled={disableContactInput}
                />
              );
            }}
          />
        </Grid>
        <FormTextField
          name="notes"
          sm={12}
          label="Notes"
          textFieldProps={{ fullWidth: true, multiline: true, rows: 4 }}
        />
      </Grid>
    </Paper>
  );
};
