import React, { useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
  Chip,
  IconButton,
  FormHelperText,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { Event } from "types/salesTypes";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

// ----------------------
// Yup Schema Definition
// ----------------------
const eventSchema = yup.object().shape({
  name: yup.string().required("Event name is required"),
  startDate: yup.string().required("Start date is required"),
  endDate: yup.string().required("End date is required"),
  startTime: yup.string().required("Start time is required"),
  endTime: yup.string().required("End time is required"),
  booker: yup.string().required("Booker name is required"),
  organization: yup.string().required("Organization is required"),
  phone: yup.string().required("Phone is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  payment: yup
    .mixed<"Paid" | "Pending" | "Cancelled">()
    .oneOf(["Paid", "Pending", "Cancelled"], "Invalid payment status")
    .required("Payment status is required"),

  attendees: yup.number().min(0).required(),
  sittingArrangement: yup.string().required("Required"),
  meetingSpace: yup.string().required("Meeting space is required"),
  notes: yup.string().required("Notes are required"),
  // location: yup.string().required("Location is required"),
  // menu: yup.string().required("Menu is required"),
  // beo: yup.string().required("BEO is required"),
});

type EventFormValues = Omit<Event, "id" | "color">;

interface AddEventModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (event: Event) => void;
}

const AddEventModal: React.FC<AddEventModalProps> = ({
  open,
  onClose,
  onSave,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EventFormValues>({
    defaultValues: {
      name: "",
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
      booker: "",
      organization: "",
      phone: "",
      email: "",
      payment: "Pending",
      attendees: 0,
      sittingArrangement: "",
      meetingSpace: "",
      notes: "",
      // location: "",
      // menu: "",
      // beo: "",
    },
    resolver: yupResolver(eventSchema),
  });

  const watchedMeetingSpace = watch("meetingSpace");

  const eventTypes = [
    "Meeting Room",
    "Ballroom",
    "Boardroom",
    "Catering",
    "Venue",
    "Other Events",
  ];

  const formFields = [
    { label: "Event Name", key: "name", type: "text" },
    { label: "Start From", key: "startDate", type: "date" },
    { label: "End On", key: "endDate", type: "date" },
    { label: "Start Time", key: "startTime", type: "time" },
    { label: "End Time", key: "endTime", type: "time" },
    { label: "Event Booker", key: "booker", type: "text" },
    { label: "Organization", key: "organization", type: "text" },
    { label: "Phone", key: "phone", type: "text" },
    {
      label: "Payment",
      key: "payment",
      type: "select",
      options: ["Paid", "Pending", "Cancelled"],
    },
    { label: "Email", key: "email", type: "email" },
    { label: "Attendees Count", key: "attendees", type: "counter" },
    { label: "Sitting Arrangement", key: "sittingArrangement", type: "text" },
    {
      label: "Meeting Space",
      key: "meetingSpace",
      type: "select",
      options: [
        "Conference Room A",
        "Conference Room B",
        "Ballroom",
        "Garden Area",
      ],
    },
    { label: "Notes", key: "notes", type: "textarea" },
  ];

  const getErrorMessage = (error: any) =>
    typeof error === "object" && error !== null && "message" in error
      ? error.message
      : "";

  const onSubmit = (data: EventFormValues) => {
    const newEvent: Event = {
      id: Date.now().toString(),
      ...data,
      color: "#1976d2",
    } as Event;

    onSave(newEvent);
    onClose();
    reset();
  };

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      PaperProps={{ sx: { minHeight: "80vh" } }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          py: 2,
        }}
      >
        <Typography variant="h6" sx={{ color: "#666" }}>
          Add Event
        </Typography>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, mt: 2 }}>
        {/* Event Type Chips */}
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 3 }}>
          {eventTypes.map((type) => (
            <Chip
              key={type}
              label={type}
              size="small"
              variant={watchedMeetingSpace === type ? "filled" : "outlined"}
              color={watchedMeetingSpace === type ? "primary" : "default"}
              onClick={() => setValue("meetingSpace", type)}
            />
          ))}
        </Box>

        <Grid container spacing={3}>
          {formFields.map((field, index) => {
            const isHalfWidth =
              field.type !== "textarea" && field.type !== "counter";

            return (
              <Grid item xs={12} md={isHalfWidth ? 6 : 12} key={index}>
                <Controller
                  name={field.key as keyof EventFormValues}
                  control={control}
                  render={({ field: controllerField }) => {
                    const fieldError =
                      errors[field.key as keyof EventFormValues];

                    switch (field.type) {
                      case "date":
                        return (
                          <DatePicker
                            label={field.label}
                            value={
                              controllerField.value
                                ? dayjs(controllerField.value as string)
                                : null
                            }
                            onChange={(date) =>
                              controllerField.onChange(
                                date?.format("YYYY-MM-DD") || ""
                              )
                            }
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                error: !!fieldError,
                                helperText: getErrorMessage(fieldError),
                              },
                            }}
                          />
                        );

                      case "time":
                        return (
                          <TimePicker
                            label={field.label}
                            value={
                              controllerField.value
                                ? dayjs(
                                    controllerField.value as string,
                                    "HH:mm"
                                  )
                                : null
                            }
                            onChange={(time) =>
                              controllerField.onChange(
                                time?.format("HH:mm") || ""
                              )
                            }
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                error: !!fieldError,
                                helperText: getErrorMessage(fieldError),
                              },
                            }}
                          />
                        );

                      case "select":
                        return (
                          <FormControl fullWidth error={!!fieldError}>
                            <InputLabel>{field.label}</InputLabel>
                            <Select
                              label={field.label}
                              value={controllerField.value || ""}
                              onChange={(e) =>
                                controllerField.onChange(e.target.value)
                              }
                            >
                              {field.options?.map((opt) => (
                                <MenuItem key={opt} value={opt}>
                                  {opt}
                                </MenuItem>
                              ))}
                            </Select>
                            {fieldError && (
                              <FormHelperText>
                                {getErrorMessage(fieldError)}
                              </FormHelperText>
                            )}
                          </FormControl>
                        );

                      case "counter":
                        return (
                          <Box
                            display="flex"
                            alignItems="center"
                            gap={2}
                            sx={{ mt: 1 }}
                          >
                            <Typography variant="subtitle1">
                              {field.label}:
                            </Typography>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() =>
                                controllerField.onChange(
                                  Math.max(0, Number(controllerField.value) - 1)
                                )
                              }
                            >
                              −
                            </Button>
                            <Typography>{controllerField.value}</Typography>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() =>
                                controllerField.onChange(
                                  Number(controllerField.value) + 1
                                )
                              }
                            >
                              +
                            </Button>
                          </Box>
                        );

                      case "textarea":
                        return (
                          <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label={field.label}
                            value={controllerField.value || ""}
                            onChange={controllerField.onChange}
                            error={!!fieldError}
                            helperText={getErrorMessage(fieldError)}
                          />
                        );

                      default:
                        return (
                          <TextField
                            fullWidth
                            label={field.label}
                            type={field.type}
                            value={controllerField.value || ""}
                            onChange={controllerField.onChange}
                            error={!!fieldError}
                            helperText={getErrorMessage(fieldError)}
                          />
                        );
                    }
                  }}
                />
              </Grid>
            );
          })}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, justifyContent: "flex-end", gap: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSubmit(onSubmit)} variant="contained">
          Save Event
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddEventModal;
