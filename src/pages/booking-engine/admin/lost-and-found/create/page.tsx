"use client";
import { Controller, FormProvider, useForm } from "react-hook-form";
import React, { useCallback, useState, useMemo } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Checkbox,
  FormControlLabel,
  Grid,
  styled,
  TextField,
  Typography,
} from "@mui/material";
import {
  DatePicker,
  DateTimePicker,
  LocalizationProvider,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import FormTextField from "components/forms/FormTextField";
import {
  ICreateLostAndFoundForm,
  ICreateLostAndFoundItem,
} from "types/lostAndFoundTypes";
import useAuth from "hooks/useAuth";
import { createLostAndFoundSchema } from "utils/validations.utils";
import { useUsersQuery } from "services/userSlice";
import { useCreateLostItemMutation } from "services/houseKeeperSlice";

const CreateLostAndFound: React.FC = () => {
  const Navigate = useNavigate();
  const { users } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch users from API
  const { data: userList, isLoading: isUsersLoading } = useUsersQuery();

  // Lost & Found API mutation
  const [createLostItem, { isLoading: isCreating }] =
    useCreateLostItemMutation();

  // Transform user data for autocomplete dropdowns
  const userOptions = useMemo(() => {
    if (!userList) return [];
    return userList.map((user) => ({
      id: user.id.toString(),
      label: `${user.firstName} ${user.lastName}`,
      user: user,
    }));
  }, [userList]);

  const foundByOptions = userOptions;
  const loggedByOptions = userOptions;

  const releaseArchiveOptions = [
    { id: "window_closed", label: "Window closed, Discarded - Archive" },
    { id: "guest_claimed", label: "Guest Claimed - Archive" },
    { id: "founder_claimed", label: "Founder Claimed - Archive" },
    { id: "document_shredded", label: "Document Shredded - Archive" },
    { id: "turned_local_auth", label: "Turned-in to local Auth - Archive" },
    { id: "donated", label: "Donated - Archive" },
    { id: "extend_hold", label: "Extend Hold - High Value Item" },
  ];

  const methods = useForm<ICreateLostAndFoundForm>({
    mode: "all",
    resolver: yupResolver(createLostAndFoundSchema),
    defaultValues: {
      location_found: "",
      datetime_found: undefined,
      reservation_id: null,
      guest_name: "",
      departure_date: undefined,
      item_name: "",
      item_description: "",
      found_by_name: "",
      item_value_over_100: false,
      guest_contacted: false,
      guest_contacted_date: undefined,
      release_date: undefined,
      release_notes: "",
      notes: "",
      user_id: undefined,
      returned_by_user_id: undefined,
      returned_to: "",
    },
  });

  const {
    handleSubmit,
    control,
    setError,
    formState: { errors },
    reset,
  } = methods;

  const onSubmit = useCallback(
    async (data: ICreateLostAndFoundForm) => {
      try {
        const payload: ICreateLostAndFoundItem = {
          property_id: users?.defaultPropertyId ?? 1,
          user_id: Number(data.user_id),
          returned_by_user_id: data.returned_by_user_id
            ? Number(data.returned_by_user_id)
            : undefined,
          location_found: data.location_found,
          datetime_found: data.datetime_found
            ? moment(data.datetime_found).format("YYYY-MM-DD HH:mm:ss")
            : "",
          item_description: data.item_description,
          found_by_name: data.found_by_name,
          item_name: data.item_name,
          reservation_id: data.reservation_id
            ? Number(data.reservation_id)
            : null,
          guest_name: data.guest_name,
          item_value_over_100: data.item_value_over_100,
          guest_contacted: data.guest_contacted,
          notes: data.notes,
          // Additional fields that were missing
          item_category: data.item_category,
          item_attributes: data.item_attributes,
          item_storage_location: data.item_storage_location,
          guest_contact: data.guest_contact,
          guest_room_number: data.guest_room_number,
          release_notes: data.release_notes,
          return_date: data.release_date
            ? moment(data.release_date).format("YYYY-MM-DD HH:mm:ss")
            : null,
          returned_to: data.returned_to || undefined,
        };

        // Call API to create lost item
        const response = await createLostItem(payload).unwrap();

        console.log("Lost & Found Item created successfully:", response);
        setSuccessMessage("Lost & Found Item logged successfully!");
        reset(); // Reset form after successful submission
        setTimeout(() => {
          Navigate("/booking-engine/rooms/lost-and-found");
        }, 1500);
      } catch (error: any) {
        console.error("Failed to create lost & found item:", error);
        setError("root", {
          message: error?.data?.message || "Failed to create lost & found item",
        });
        setSuccessMessage(null);
      }
    },
    [Navigate, setError, users, reset, createLostItem]
  );

  return (
    <MainWrapper>
      <FormProvider {...methods}>
        <Grid container>
          <Grid item xs={12} p={2}>
            {/* Header */}

            {/* Alerts */}
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

            {/* Form */}
            <Grid container spacing={3}>
              {/* Item Discovery Section */}

              {/* Location Found */}
              <FormTextField
                name="location_found"
                sm={6}
                label="Location Found *"
                textFieldProps={{
                  placeholder: "e.g., Guest Room, Lobby, Restaurant",
                  fullWidth: true,
                  size: "small",
                }}
              />

              {/* Date & Time Found */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="datetime_found"
                  control={control}
                  render={({
                    field: { value, onChange },
                    fieldState: { error },
                  }) => (
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DateTimePicker
                        label="Date & Time Found *"
                        value={value}
                        onChange={onChange}
                        format="YYYY-MM-DD HH:mm"
                        ampm={false}
                        slotProps={{
                          textField: {
                            error: !!error?.message,
                            helperText: error?.message,
                            fullWidth: true,
                            size: "small",
                          },
                        }}
                      />
                    </LocalizationProvider>
                  )}
                />
              </Grid>

              {/* Guest Information Section */}
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  color="text.secondary"
                  gutterBottom
                  // sx={{ mt: 2, mb: 2 }}
                >
                  Guest Information
                </Typography>
              </Grid>

              <FormTextField
                name="guest_room_number"
                sm={6}
                label="Room Number"
                textFieldProps={{
                  placeholder: "Enter Room Number",
                  fullWidth: true,
                  size: "small",
                  type: "number",
                }}
              />

              {/* Folio Number */}
              <FormTextField
                name="reservation_id"
                sm={6}
                label="Folio Number"
                textFieldProps={{
                  placeholder: "Enter folio/reservation number if applicable",
                  fullWidth: true,
                  size: "small",
                  type: "number",
                }}
              />

              {/* Guest Name */}
              <FormTextField
                name="guest_name"
                sm={6}
                label="Guest Name"
                textFieldProps={{
                  placeholder: "Enter guest name if known",
                  fullWidth: true,
                  size: "small",
                }}
              />

              {/* Departure Date */}
              {/* <Grid item xs={12} sm={6}>
                <Controller
                  name="departure_date"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Departure Date"
                        value={value}
                        onChange={onChange}
                        format="YYYY-MM-DD"
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: "small",
                          },
                        }}
                      />
                    </LocalizationProvider>
                  )}
                />
              </Grid> */}

              {/* Item Details Section */}
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  color="text.secondary"
                  gutterBottom
                  // sx={{ mt: 2, mb: 2 }}
                >
                  Item Details
                </Typography>
              </Grid>

              {/* Item Found */}
              <FormTextField
                name="item_name"
                sm={6}
                label="Item Found"
                textFieldProps={{
                  placeholder: "e.g., Phone Charger, Purse, Jewelry",
                  fullWidth: true,
                  size: "small",
                }}
              />

              {/* Estimate Value & Guest Contacted */}
              <Grid item xs={12} sm={6}>
                <Box
                  display="flex"
                  alignItems="center"
                  gap={4}
                  flexWrap="wrap"
                  mt={1}
                >
                  <Controller
                    name="item_value_over_100"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={value}
                            onChange={(e) => onChange(e.target.checked)}
                          />
                        }
                        label="Estimate value over $100"
                      />
                    )}
                  />

                  <Controller
                    name="guest_contacted"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={!!value}
                            onChange={(e) => onChange(e.target.checked)}
                          />
                        }
                        label="Guest Contacted"
                      />
                    )}
                  />
                </Box>
              </Grid>

              {/* Item Description */}
              <FormTextField
                name="item_description"
                sm={12}
                label="Item Description *"
                textFieldProps={{
                  placeholder:
                    "Enter detailed description including color, brand, condition, etc.",
                  fullWidth: true,
                  size: "small",
                  multiline: true,
                  rows: 3,
                }}
              />

              {/* Staff Information Section */}
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  color="text.secondary"
                  gutterBottom
                  // sx={{ mt: 2, mb: 2 }}
                >
                  Staff Information
                </Typography>
              </Grid>

              {/* Founded By */}
              <Grid item xs={12} sm={4}>
                <Controller
                  name="found_by_name"
                  control={control}
                  render={({
                    field: { onChange, value },
                    fieldState: { error, invalid },
                  }) => (
                    <Autocomplete
                      freeSolo
                      value={
                        foundByOptions.find(
                          (option) =>
                            typeof option !== "string" && option.label === value
                        ) || null
                      }
                      onChange={(_, selectedOption) => {
                        if (typeof selectedOption === "string") {
                          onChange(selectedOption);
                        } else {
                          onChange(selectedOption?.label || "");
                        }
                      }}
                      onInputChange={(_, inputValue) => {
                        onChange(inputValue || "");
                      }}
                      loading={isUsersLoading}
                      options={foundByOptions}
                      getOptionLabel={(option) =>
                        typeof option === "string" ? option : option.label
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Founded By"
                          placeholder={
                            isUsersLoading
                              ? "Loading users..."
                              : "Select staff or write name found by"
                          }
                          error={invalid}
                          helperText={error?.message}
                          size="small"
                          fullWidth
                          disabled={isUsersLoading}
                        />
                      )}
                    />
                  )}
                />
              </Grid>
              {/* Logged By */}
              <Grid item xs={12} sm={4}>
                <Controller
                  name="user_id"
                  control={control}
                  render={({
                    field: { onChange, value },
                    fieldState: { error, invalid },
                  }) => (
                    <Autocomplete
                      value={
                        loggedByOptions.find(
                          (option) => option.id === (value ?? "").toString()
                        ) || null
                      }
                      onChange={(_, selectedOption) => {
                        onChange(selectedOption?.id || "");
                      }}
                      loading={isUsersLoading}
                      options={loggedByOptions}
                      getOptionLabel={(option) =>
                        typeof option === "string" ? option : option.label
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Logged By"
                          placeholder={
                            isUsersLoading
                              ? "Loading users..."
                              : "Select staff who logged the item"
                          }
                          error={invalid}
                          helperText={error?.message}
                          size="small"
                          fullWidth
                          disabled={isUsersLoading}
                        />
                      )}
                    />
                  )}
                />
              </Grid>

              {/* Returned By */}
              <Grid item xs={12} sm={4}>
                <Controller
                  name="returned_by_user_id"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Autocomplete
                      value={
                        loggedByOptions.find(
                          (option) => option.id === value?.toString()
                        ) || null
                      }
                      onChange={(_, selectedOption) => {
                        onChange(selectedOption?.id || "");
                      }}
                      loading={isUsersLoading}
                      options={loggedByOptions}
                      getOptionLabel={(option) =>
                        typeof option === "string" ? option : option.label
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Returned By"
                          placeholder={
                            isUsersLoading
                              ? "Loading users..."
                              : "Staff logging this item"
                          }
                          size="small"
                          fullWidth
                          disabled={isUsersLoading}
                        />
                      )}
                    />
                  )}
                />
              </Grid>

              {/* Processing Information Section */}
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  color="text.secondary"
                  gutterBottom
                  // sx={{ mt: 2, mb: 2 }}
                >
                  Processing Information
                </Typography>
              </Grid>

              {/* Guest Contacted Date */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="guest_contacted_date"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Guest Contacted Date"
                        value={value}
                        onChange={onChange}
                        format="YYYY-MM-DD"
                        // maxDate={dayjs()}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: "small",
                            placeholder: "When was guest notified",
                          },
                        }}
                      />
                    </LocalizationProvider>
                  )}
                />
              </Grid>

              {/* Release Date & Time */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="release_date"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DateTimePicker
                        label="Release Date & Time"
                        value={value}
                        onChange={onChange}
                        format="YYYY-MM-DD HH:mm"
                        ampm={false}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: "small",
                            placeholder: "When was item released",
                          },
                        }}
                      />
                    </LocalizationProvider>
                  )}
                />
              </Grid>

              {/* Release & Archive Dropdown */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="release_notes"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Autocomplete
                      value={
                        releaseArchiveOptions.find(
                          (option) => option.id === value
                        ) || null
                      }
                      onChange={(_, selectedOption) => {
                        onChange(selectedOption?.id || "");
                      }}
                      options={releaseArchiveOptions}
                      getOptionLabel={(option) => option.label}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Release and Archive"
                          placeholder="Select disposition of item"
                          size="small"
                          fullWidth
                        />
                      )}
                    />
                  )}
                />
              </Grid>

              {/* Returned To */}
              <FormTextField
                name="returned_to"
                sm={6}
                label="Returned To"
                textFieldProps={{
                  placeholder:
                    "Enter person or entity to whom item was returned",
                  fullWidth: true,
                  size: "small",
                }}
              />

              {/* Additional Information Section */}
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  color="text.secondary"
                  gutterBottom
                  // sx={{ mt: 2, mb: 2 }}
                >
                  Additional Information
                </Typography>
              </Grid>

              {/* Notes */}
              <FormTextField
                name="notes"
                sm={12}
                label="Notes"
                textFieldProps={{
                  placeholder:
                    "Enter any additional notes, special instructions, or comments about this item",
                  fullWidth: true,
                  size: "small",
                  multiline: true,
                  rows: 3,
                }}
              />

              {/* Action Buttons */}
              <Grid item xs={12}>
                <Box display="flex" alignItems="center" gap={2} mt={2}>
                  <PrimaryButton
                    label="Cancel"
                    buttonStyles={{
                      backgroundColor: "#F5F5F5",
                      color: "#000",
                      fontWeight: "bold",
                    }}
                    onClick={() =>
                      Navigate("/booking-engine/rooms/lost-and-found")
                    }
                  />
                  <PrimaryButton
                    label="Log Lost & Found"
                    buttonStyles={{
                      backgroundColor: "#32A1AE",
                      color: "#FFFFFF",
                      fontWeight: "bold",
                    }}
                    onClick={handleSubmit(onSubmit)}
                    isLoading={isCreating}
                    disabled={isCreating}
                  />
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </FormProvider>
    </MainWrapper>
  );
};

export default CreateLostAndFound;

const MainWrapper = styled(Grid)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  padding: "20px",
  height: "100%",
  marginTop: "10px",
  borderRadius: "8px",
  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.05)",
}));
