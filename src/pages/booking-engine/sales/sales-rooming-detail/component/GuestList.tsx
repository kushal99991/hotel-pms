import React from "react";
import { useFieldArray, useFormContext, Controller } from "react-hook-form";
import {
  Box,
  Grid,
  TextField,
  IconButton,
  Typography,
  Button,
  Paper,
} from "@mui/material";
import { Add, Remove } from "@mui/icons-material";

interface GuestListProps {
  name: string;
  maxGuest?: number;
}

const GuestList: React.FC<GuestListProps> = ({ name, maxGuest = 10 }) => {
  const { control, watch, setValue } = useFormContext();

  const {
    fields: guests,
    append,
    remove,
  } = useFieldArray({
    control,
    name,
  });

  const adultCount = watch("stay.0.adults_count");

  function handleAddClick() {
    const currentCount = guests.length;
    append({ first_name: "", last_name: "", email: "" });
    if (currentCount + 1 > adultCount) {
      setValue("stay.0.adults_count", adultCount + 1);
    }
  }
  return (
    <Box mt={2}>
      <Typography variant="h6" mb={1}>
        Guests
      </Typography>

      {guests.map((guest, index) => (
        <Paper
          key={guest.id}
          variant="outlined"
          sx={{ p: 2, mb: 2, borderRadius: 2 }}
        >
          <Grid container spacing={2} alignItems="center">
            {/* Guest title */}
            <Grid item xs={12} md={2}>
              <Typography variant="subtitle1" fontWeight="500">
                Guest {index + 1}
              </Typography>
            </Grid>

            {/* First Name */}
            <Grid item xs={12} md={3}>
              <Controller
                name={`${name}.${index}.first_name`}
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="First Name *"
                    size="small"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    FormHelperTextProps={{
                      sx: { fontSize: "0.6rem", mb: 0.5 },
                    }}
                    fullWidth
                  />
                )}
              />
            </Grid>

            {/* Last Name */}
            <Grid item xs={12} md={3}>
              <Controller
                name={`${name}.${index}.last_name`}
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Last Name *"
                    size="small"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    FormHelperTextProps={{
                      sx: { fontSize: "0.6rem", mb: 0.5 },
                    }}
                    fullWidth
                  />
                )}
              />
            </Grid>

            {/* Email */}
            <Grid item xs={12} md={3}>
              <Controller
                name={`${name}.${index}.email`}
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Email"
                    size="small"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    FormHelperTextProps={{
                      sx: { fontSize: "0.6rem", mb: 0.5 },
                    }}
                    fullWidth
                  />
                )}
              />
            </Grid>

            {/* Delete button (only for > 0) */}
            {index > 0 && (
              <Grid item xs={12} md={1} sx={{ textAlign: "right" }}>
                <IconButton onClick={() => remove(index)} color="error">
                  <Remove />
                </IconButton>
              </Grid>
            )}
          </Grid>
        </Paper>
      ))}

      <Button
        startIcon={<Add />}
        variant="contained"
        onClick={handleAddClick}
        disabled={guests.length >= maxGuest}
      >
        Add Guest
      </Button>
    </Box>
  );
};

export default GuestList;
