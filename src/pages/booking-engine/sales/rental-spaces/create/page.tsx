import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  TextField,
  // Autocomplete,
  Button,
  Paper,
  IconButton,
  Checkbox,
  FormControlLabel,
  Alert,
  Chip,
  Switch,
  Divider,
} from "@mui/material";
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  Resolver,
} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
// import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { createRentalSpaceSchema } from "utils/validations.utils";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import FormTextField from "components/forms/FormTextField";
import { IRentalSpaceSection } from "types/rentalSpaceTypes";
import { useCreateConferenceRoomMutation } from "services/salesSlice";

interface IRentalSpaceForm {
  name: string;
  room_type_id: number;
  description: string;
  max_adults?: number;
  size_area: string;
  sections: IRentalSpaceSection[];
  adjacent_rooms: number[][];
}

const CreateRentalSpace: React.FC = () => {
  const navigate = useNavigate();
  const [hasBreakOut, setHasBreakOut] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createConferenceRoom, { isLoading: isSubmitting }] =
    useCreateConferenceRoomMutation();

  const methods = useForm<IRentalSpaceForm>({
    resolver: yupResolver(
      createRentalSpaceSchema
    ) as Resolver<IRentalSpaceForm>,
    mode: "all",
    defaultValues: {
      name: "",
      room_type_id: 4,
      description: "",
      size_area: "",
      sections: [],
      adjacent_rooms: [],
    },
  });

  const {
    control,
    handleSubmit,
    // formState: { errors },
    reset,
  } = methods;

  const {
    fields: sectionFields,
    append: appendSection,
    remove: removeSection,
  } = useFieldArray({
    control,
    name: "sections",
  });

  useEffect(() => {
    if (!hasBreakOut) {
      // Clear sections if Break Out is unchecked
      reset((prev) => ({ ...prev, sections: [] }));
    }
  }, [hasBreakOut, reset]);

  const onSubmit = async (data: IRentalSpaceForm) => {
    try {
      // Transform data to match API payload
      const payload = {
        name: data.name,
        room_type_id: data.room_type_id,
        description: data.description,
        max_adults: data.max_adults,
        size_area: data.size_area,
        sections: data.sections,
        adjacent_rooms: data.adjacent_rooms,
      };

      console.log("Create Rental Space Payload:", payload);
      await createConferenceRoom(payload).unwrap();

      setSuccessMessage("Rental space created successfully!");
      setErrorMessage(null);

      // Navigate back to list after a short delay
      setTimeout(() => {
        navigate("/booking-engine/sales/rental-spaces");
      }, 1500);
    } catch (error) {
      console.error("Failed to create rental space:", error);
      setErrorMessage("Failed to create rental space. Please try again.");
      setSuccessMessage(null);
    }
  };

  const handleCancel = () => {
    navigate("/booking-engine/sales/rental-spaces");
  };

  return (
    <FormProvider {...methods}>
      <Box sx={{ p: 1 }}>
        {/* Header */}

        {/* Success/Error Messages */}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMessage}
          </Alert>
        )}
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errorMessage}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
            <Grid container columnSpacing={2} rowSpacing={2}>
              {/* Row 1: Space Name and Overall Room Size */}
              <FormTextField
                gridProps={{ xs: 12, md: 6 }}
                name="name"
                label="Space Name"
                textFieldProps={{
                  placeholder: "Enter space name",
                  required: true,
                  fullWidth: true,
                }}
              />
              <FormTextField
                gridProps={{ xs: 12, md: 6 }}
                name="size_area"
                label="Overall Room Size - Sqft"
                textFieldProps={{
                  placeholder: "e.g., 1000 Sqft",
                  fullWidth: true,
                }}
              />

              {/* Row 2: Space Max Capacity */}
              <FormTextField
                gridProps={{ xs: 12 }}
                name="max_adults"
                label="Space Max Capacity Fire code"
                textFieldProps={{
                  placeholder: "Enter max capacity",
                  type: "number",
                }}
              />

              {/* Row 3: Rates and Status */}
              <Grid item xs={12} md={3}>
                <TextField
                  label="Daily Rate"
                  placeholder="Coming soon"
                  fullWidth
                  disabled
                  size="medium"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  label="Hourly Rate"
                  placeholder="Coming soon"
                  fullWidth
                  disabled
                  size="medium"
                />
              </Grid>

              {/* Row 4: Description */}
              <FormTextField
                gridProps={{ xs: 12 }}
                name="description"
                label="Description appear on the website"
                textFieldProps={{
                  placeholder: "Enter description",
                  multiline: true,
                  rows: 3,
                }}
              />
              <Grid item xs={12} md={6}>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="flex-end"
                  height="100%"
                  gap={1}
                >
                  <Chip label="Available" color="success" variant="outlined" />
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label=""
                  />
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Break Out Section */}
          <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              mb={2}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={hasBreakOut}
                    onChange={(e) => setHasBreakOut(e.target.checked)}
                  />
                }
                label={
                  <Typography variant="h6" fontWeight="600">
                    Break Out
                  </Typography>
                }
              />
              {hasBreakOut && (
                <Box display="flex" alignItems="center" gap={1}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() =>
                      appendSection({
                        name: "",
                        description: "",
                        max_adults: 0,
                        size_area: "",
                      })
                    }
                  >
                    Add Section
                  </Button>
                  <Chip
                    label={`${sectionFields.length} ${
                      sectionFields.length === 1 ? "Section" : "Sections"
                    }`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              )}
            </Box>

            {hasBreakOut && sectionFields.length === 0 && (
              <Box
                sx={{
                  textAlign: "center",
                  py: 4,
                  color: "text.secondary",
                }}
              >
                <Typography variant="body2">no section.</Typography>
              </Box>
            )}

            {/* Dynamic Sections */}
            {hasBreakOut &&
              sectionFields.map((field, index) => (
                <Box key={field.id} sx={{ mb: 3 }}>
                  {index > 0 && <Divider sx={{ mb: 3 }} />}
                  <Paper
                    variant="outlined"
                    sx={{ p: 3, backgroundColor: "#f9f9f9" }}
                  >
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={3}
                    >
                      <Typography
                        variant="subtitle1"
                        fontWeight="600"
                        color="primary"
                      >
                        Room Break Out #{index + 1}
                      </Typography>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => removeSection(index)}
                      >
                        <RemoveIcon />
                      </IconButton>
                    </Box>

                    <Grid container spacing={3}>
                      {/* Row 1: Section Name and Size */}
                      <Grid item xs={12} md={6}>
                        <Controller
                          name={`sections.${index}.name`}
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <TextField
                              {...field}
                              label="Space Name"
                              placeholder="Enter section name"
                              fullWidth
                              required
                              error={!!error}
                              helperText={error?.message}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Controller
                          name={`sections.${index}.size_area`}
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <TextField
                              {...field}
                              label="Space Size - Sqft"
                              placeholder="e.g., 285 Sqft"
                              fullWidth
                              error={!!error}
                              helperText={error?.message}
                            />
                          )}
                        />
                      </Grid>

                      {/* Row 2: Capacity, Daily Rate, Hourly Rate */}
                      <Grid item xs={12} md={6}>
                        <Controller
                          name={`sections.${index}.max_adults`}
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <TextField
                              {...field}
                              label="Space Max Capacity Fire code"
                              placeholder="Enter max capacity"
                              type="number"
                              fullWidth
                              error={!!error}
                              helperText={error?.message}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          label="Daily Rate"
                          placeholder="Coming soon"
                          fullWidth
                          disabled
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          label="Hourly Rate"
                          placeholder="Coming soon"
                          fullWidth
                          disabled
                        />
                      </Grid>

                      {/* Row 3: Description and Availability */}
                      <Grid item xs={12} md={6}>
                        <Controller
                          name={`sections.${index}.description`}
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <TextField
                              {...field}
                              label="Description appear on the website"
                              placeholder="Enter description"
                              fullWidth
                              multiline
                              rows={3}
                              error={!!error}
                              helperText={error?.message}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Box
                          display="flex"
                          alignItems="center"
                          justifyContent="flex-end"
                          height="100%"
                          gap={1}
                        >
                          <Chip
                            label="Available"
                            color="success"
                            variant="outlined"
                          />
                          <FormControlLabel
                            control={<Switch defaultChecked />}
                            label=""
                          />
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </Box>
              ))}
          </Paper>

          {/* Action Buttons */}
          <Box display="flex" gap={2} justifyContent="flex-start">
            <Button
              variant="outlined"
              onClick={handleCancel}
              sx={{ minWidth: 120, textTransform: "uppercase" }}
            >
              Cancel
            </Button>
            <PrimaryButton
              label={isSubmitting ? "SAVING..." : "SAVE"}
              type="submit"
              disabled={isSubmitting}
            />
          </Box>
        </Box>
      </Box>
    </FormProvider>
  );
};

export default CreateRentalSpace;
