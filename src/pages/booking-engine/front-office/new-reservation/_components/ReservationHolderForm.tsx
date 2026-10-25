import React from "react";
import { Box, Grid, Button } from "@mui/material";
import FormTextField from "components/forms/FormTextField";
import { countries } from "utils/countries";
import { Controller, useFormContext } from "react-hook-form";
import { IFullGuest, IStay } from "types/reservationTypes";
import {
  assignResHolderToStay,
  isReservationHolderReady,
} from "utils/reactHookForms/reservations";
import ComboBox from "components/widgets/Form/ComboBox";

const ReservationHolderForm: React.FC = () => {
  const formContextMethods = useFormContext();
  const { getValues, setValue, clearErrors, control } = formContextMethods;

  async function handleAssignAllClick() {
    const holderValues: IFullGuest = getValues("guest");
    const stays: Array<IStay> = getValues("stays");
    const resHolderReady = isReservationHolderReady(formContextMethods);
    if (resHolderReady) {
      stays.forEach((stay: IStay, stayIdx: number) => {
        assignResHolderToStay(
          stay,
          stayIdx,
          holderValues,
          setValue,
          clearErrors
        );
      });
    }
  }
  return (
    <Box mt={6} mb={4}>
      <Grid container spacing={2} rowGap={2}>
        <FormTextField name="guest.first_name" label="First Name" required />
        <FormTextField name="guest.last_name" label="Last Name" required />
        <FormTextField name="guest.email" label="Email address" required />
        <FormTextField name="guest.phone" label="Phone" />

        <Grid item xs={6}>
          <Controller
            name="guest.country" // The form field name
            control={control} // React Hook Form's control
            render={({ field: { onChange, value } }) => {
              // Find the selected country object using the value (country code)
              const selectedCountry = countries.find((c) => c.value === value);

              // Construct the expected ComboBox value
              const comboBoxValue = selectedCountry
                ? { id: selectedCountry.value, label: selectedCountry.label }
                : null; // If no country is selected, set it to null

              return (
                <ComboBox
                  label="Country/Region"
                  value={comboBoxValue} // Display selected country or null
                  items={countries.map((country) => ({
                    id: country.value, // Country code as ID
                    label: country.label, // Country name
                  }))}
                  onChange={
                    (event, selectedOption) => onChange(selectedOption?.id) // Save the country code (value)
                  }
                  width="100%"
                />
              );
            }}
          />
        </Grid>
      </Grid>
      <Box mt={3} justifyContent="end" display="flex">
        <Button
          data-test-id="assign-holder-button"
          variant="outlined"
          size="small"
          color="secondary"
          onClick={handleAssignAllClick}
        >
          Assign To All Reservations
        </Button>
      </Box>
    </Box>
  );
};

export default ReservationHolderForm;
