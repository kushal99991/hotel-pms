import React, { FocusEvent } from "react";
import {
  Box,
  Grid,
  TextField,
  IconButton,
  styled,
  Radio,
  FormControlLabel,
} from "@mui/material";
import {
  useFormContext,
  Controller,
  useWatch,
  UseFieldArrayRemove,
} from "react-hook-form";
import { Remove } from "@mui/icons-material";
import { guestIsHolder } from "utils/helperFunctions/data";
import { SET_VALUE_OPTIONS } from "constants/forms";
import { IGuest } from "types/reservationTypes";

const StyledReservationHolderIndicator = styled(Box)(() => ({
  padding: "0.25rem 1rem",
  border: "1px solid",
  borderTopLeftRadius: "8px",
  borderTopRightRadius: "8px",
  borderBottom: "none",
  background: "#f7f7fa",
  fontSize: "0.75rem",
}));

interface GuestRowProps {
  guestIndex: number;
  stayIndex: number;
  fieldArrayRemove: UseFieldArrayRemove;
}

const GuestRow: React.FC<GuestRowProps> = ({
  guestIndex,
  stayIndex,
  fieldArrayRemove,
}) => {
  const reservationCheckboxActive = true;

  const isGuestReservationHolder = () => {
    const guest = getValues(`stays.${stayIndex}.guests.${guestIndex}`);
    return !!guest?.isHolder;
  };

  const updateAssignHolderCheckbox = (guestNowHolder: boolean) => {
    setValue(`stays.${stayIndex}.guests.${guestIndex}.isHolder`, guestNowHolder, SET_VALUE_OPTIONS);
  };

  const handleContactInputBlur = (fieldOnBlur: any) => {
    return (e: FocusEvent<HTMLElement>) => {
      const guestNowHolder = isGuestReservationHolder();
      updateAssignHolderCheckbox(guestNowHolder);
      fieldOnBlur(e);
    };
  };

  function shouldShowIndicator() {
    if (!reservationCheckboxActive) {
      return false;
    }
    return isGuestReservationHolder();
  }

  function handlePrimaryGuestChange() {
    setValue(`stays.${stayIndex}.guests.${guestIndex}.primaryGuest`, true, SET_VALUE_OPTIONS);
  }

  const onGuestRemove = (index: number) => {
    fieldArrayRemove(index);
  };

  const { getValues, setValue, control } = useFormContext();

  return (
    <Box display="flex" flexDirection="column">
      {shouldShowIndicator() && (
        <Grid container justifyContent="flex-end" pr={2}>
          <StyledReservationHolderIndicator>
            Booker
          </StyledReservationHolderIndicator>
        </Grid>
      )}
      <Box
        marginBottom={2}
        paddingX={2}
        paddingY={3}
        border={1}
        borderRadius={2}
        display="flex"
        alignItems="center"
        gap={2}
      >
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          minWidth="90px"
          marginRight={2}
          sx={{
            borderRadius: 1,
            padding: 1,
            backgroundColor: "grey.50",
            border: "1px solid",
            borderColor: "grey.200",
          }}
        >
          <Controller
            name={`stays.${stayIndex}.guests.${guestIndex}.primaryGuest`}
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Radio
                    checked={field.value || false}
                    onChange={handlePrimaryGuestChange}
                    size="small"
                    sx={{
                      "& .MuiSvgIcon-root": { fontSize: 16 },
                      padding: "2px",
                    }}
                  />
                }
                label="Primary"
                sx={{
                  margin: 0,
                  justifyContent: "center",
                  "& .MuiFormControlLabel-label": {
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    color: field.value ? "primary.main" : "text.secondary",
                  },
                }}
              />
            )}
          />
        </Box>
        <Box display="flex" flexDirection="row" gap={2} flexGrow={1}>
          <Controller
            name={`stays.${stayIndex}.guests.${guestIndex}.firstName`}
            control={control}
            render={({ field, fieldState: { error } }) => {
              return (
                <TextField
                  key={`stay_${stayIndex}-guest-${guestIndex}.firstname`}
                  {...field}
                  onBlur={handleContactInputBlur(field.onBlur)}
                  label="First Name"
                  error={!!error?.message}
                  helperText={error?.message ?? ""}
                  required
                  fullWidth
                />
              );
            }}
          />
          <Controller
            name={`stays.${stayIndex}.guests.${guestIndex}.lastName`}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                key={`stay_${stayIndex}-guest-${guestIndex}.lastname`}
                {...field}
                onBlur={handleContactInputBlur(field.onBlur)}
                label="Last Name"
                error={!!error?.message}
                helperText={error?.message ?? ""}
                fullWidth
                required
              />
            )}
          />
          <Controller
            name={`stays.${stayIndex}.guests.${guestIndex}.email`}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                key={`stay_${stayIndex}-guest-${guestIndex}.email`}
                {...field}
                onBlur={handleContactInputBlur(field.onBlur)}
                label="Email"
                type="email"
                error={!!error?.message}
                helperText={error?.message ?? ""}
                fullWidth
              />
            )}
          />
        </Box>
        {guestIndex !== 0 && (
          <IconButton
            data-testid="remove-guest-button"
            onClick={() => onGuestRemove(guestIndex)}
            color="error"
          >
            <Remove />
          </IconButton>
        )}
      </Box>
    </Box>
  );
};

export default GuestRow;
