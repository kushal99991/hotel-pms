"use client";
import { Controller, FormProvider, useForm } from "react-hook-form";
import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  styled,
  TextField,
  Typography,
} from "@mui/material";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import { useGetPropertiesQuery } from "services/propertySlice";
import { IProperty } from "types/property";
import { useNavigate } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import CustomDropdown from "components/widgets/CustomDropdown/CustomDropdown";
import { ICreateMaintenance } from "types/maintenanceTypes";
import {
  useCreateMaintenanceTicketMutation,
  useGetMaintenanceEnumListQuery,
} from "services/maintenanceSlice";
import {
  useGetRoomListQuery,
  useUpdateRoomStatusMutation,
} from "services/roomSlice";
import FormTextField from "components/forms/FormTextField";
import { createMaintenanceSchema } from "utils/validations.utils";
import CloseIcon from "@mui/icons-material/Close";
import useAuth from "hooks/useAuth";
import useCustomStatus from "hooks/useCustomStatus";
import { useGetSettingByKeyQuery } from "services/settingSlice";
import AddPublicSpaceDialog from "../component/AddPublicSpaceDialog";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment";
import { appConfig } from "config/app.config";

const CreateMaintenance: React.FC = () => {
  const { users } = useAuth();
  const { statuses } = useCustomStatus();
  const [openAssignModal, setOpenAssignModal] = useState<boolean>(false);
  const [frontdeskStatus, setFrontdeskStatus] = useState<string>("");
  const [roomId, setRoomId] = useState<number>();

  const { data: propertyList } = useGetPropertiesQuery();
  const [createMaintenanceTicket, { isLoading: isSubmitLoading }] =
    useCreateMaintenanceTicketMutation();
  const [updateRoomStatus] = useUpdateRoomStatusMutation();
  const propertyID = useMemo(() => {
    return users?.defaultPropertyId ?? 0;
  }, [users?.defaultPropertyId]);
  const defalutProperty = propertyList?.data.find(
    (p: IProperty) => p.id === propertyID
  );
  const { data: enumList } = useGetMaintenanceEnumListQuery();
  const { data: roomList } = useGetRoomListQuery(
    {
      limit: 500,
      offset: 0,
      property_id: users?.defaultPropertyId ?? 1,
    },
    {
      skip: false,
      refetchOnMountOrArgChange: true,
    }
  );
  const { data: pulicSpaceList = [], refetch } = useGetSettingByKeyQuery(
    {
      property_id: users?.defaultPropertyId ?? 1,
      key: "PUBLIC_SPACE",
    },
    {
      skip: false,
      refetchOnMountOrArgChange: true,
    }
  );
  const serviceCodeOptions = useMemo(() => {
    return enumList?.result.service_codes?.map((item) => ({
      id: item,
      label: item,
    }));
  }, [enumList]);
  const roomListOption = useMemo(() => {
    return roomList?.map((item) => ({
      id: item.id,
      label: item.roomNumber,
    }));
  }, [roomList]);

  const frontdeskStatusOptions = [
    { value: "", label: "All" },
    ...Object.keys(statuses.FrontdeskStatusEnum ?? {}).map((key) => ({
      value: key,
      label: statuses.FrontdeskStatusEnum![key],
    })),
  ];

  // Limited room status options for maintenance - filtered from existing options
  const maintenanceRoomStatusOptions = frontdeskStatusOptions.filter((option) =>
    ["OOO", "OOS", "OFF"].includes(option.value)
  );

  const Navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const methods = useForm<ICreateMaintenance>({
    mode: "all",
    resolver: yupResolver(createMaintenanceSchema),
    defaultValues: {
      property_id: propertyID,
      service_request: "",
      service_code: "",
      service_subject: "",
      service_notes: "",
      location: "",
      room_status: "",
      expected_start_date: undefined,
      expected_completion_date: undefined,
    },
  });

  const {
    handleSubmit,
    control,
    setError,
    watch,
    formState: { errors },
    reset,
  } = methods;

  // Watch form values for validation logic
  const watchedRoomId = watch("room_id");
  const watchedStartDate = watch("expected_start_date");

  // Determine if room status is required (only when not today)
  const isRoomStatusRequired = watchedRoomId;

  // Determine if room status should be shown (when room is selected)
  const shouldShowRoomStatus = !!watchedRoomId;

  // Memoize minDate to prevent infinite re-renders
  // const minCompletionDate = useMemo(() => {
  //   return watchedStartDate ? moment(watchedStartDate).add(1, "day") : moment();
  // }, [watchedStartDate]);

  const onSubmit = useCallback(
    async (data: ICreateMaintenance) => {
      // Validate room status requirement
      if (isRoomStatusRequired && !data.room_status) {
        setError(
          "room_status",
          {
            message: "Room status is required!",
          },
          { shouldFocus: true }
        );
        return false;
      }

      setRoomId(data.room_id);
      const response = await createMaintenanceTicket({
        property_id: propertyID,
        service_code: data.service_code,
        service_subject: data.service_subject,
        service_request: data.service_request,
        service_priority: "",
        service_notes: data.service_notes,
        room_id: data.room_id,
        location: data.location,
        assigned_by: null,
        assigned_to: null,
        room_status: data.room_status || "",
        expected_start_date: data.expected_start_date
          ? moment(data.expected_start_date).format(appConfig.dateApiFormat)
          : undefined,
        expected_completion_date: moment(data.expected_completion_date).format(
          appConfig.dateApiFormat
        ),
      });

      if (response.error) {
        setError(
          "root",
          { message: response.error as string },
          { shouldFocus: true }
        );
        setSuccessMessage(null);
        return false;
      }
      // Only show room status modal if room is selected and start date is today
      // and no room status was already selected

      if (data.room_id && !data.room_status) {
        setOpenAssignModal(true);
        setFrontdeskStatus(
          (roomList || [])
            .filter((item) => item.id === data.room_id)
            .map((item) => item.frontdesk_status)[0] || ""
        );
      } else {
        Navigate("/booking-engine/rooms/maintenance");
      }

      setSuccessMessage("Maintenance Ticket Added Successfully!");
    },
    [
      createMaintenanceTicket,
      reset,
      Navigate,
      setError,
      roomList,
      isRoomStatusRequired,
    ]
  );

  const dialogueSubmit = async () => {
    const payload = {
      id: [roomId ? roomId : 0],
      frontdesk_status: frontdeskStatus, // Status from dropdown
    };
    const response = await updateRoomStatus(payload);
    if (!response.error) {
      setSuccessMessage("Room Status update Successfully!");
      Navigate("/booking-engine/rooms/maintenance");
    }
    reset();
    handleCloseAssignModal(); // Close modal after submission
  };

  const handleCloseAssignModal = () => {
    setOpenAssignModal(false);
    Navigate("/booking-engine/rooms/maintenance");
  };

  return (
    <MainWrapper>
      <FormProvider {...methods}>
        <LocalizationProvider dateAdapter={AdapterMoment}>
          <Grid container style={{ height: "100vh" }}>
            <Grid item xs={12} md={12} p={2}>
              {errors?.root && (
                <Alert severity="error">{errors.root.message}</Alert>
              )}
              {successMessage && (
                <Alert severity="success" data-testid="success-message">
                  {successMessage}
                </Alert>
              )}
              <Grid container spacing={2}>
                <Grid item xs={12} md={12} mb={2}>
                  <div>{`${defalutProperty?.name}`}</div>
                </Grid>
                <Grid item xs={12} sm={12} mb={2}>
                  <Controller
                    name="service_code"
                    control={control}
                    render={({
                      field: { onChange, value },
                      fieldState: { error, invalid },
                    }) => (
                      <Autocomplete
                        data-testid="service-code-autocomplete"
                        value={
                          serviceCodeOptions?.find(
                            (option) => option.id === value
                          ) || null
                        }
                        onChange={(_, selectedOption) => {
                          onChange(selectedOption?.id);
                        }}
                        options={serviceCodeOptions || []}
                        getOptionLabel={(option) => option.label}
                        isOptionEqualToValue={(option, value) =>
                          option.id === value.id
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            name="service_code"
                            label="Service Codes"
                            error={invalid}
                            helperText={error?.message}
                            inputProps={{
                              ...params.inputProps,
                              "data-testid": "service-code-input", // Add test id to the input
                            }}
                          />
                        )}
                        fullWidth
                      />
                    )}
                  />
                </Grid>

                <FormTextField
                  name="service_subject"
                  sm={12}
                  label="Service Subject"
                  textFieldProps={{
                    placeholder: "Enter Service Subject",
                    fullWidth: true,
                    autoComplete: "off",
                  }}
                  gridProps={{ mb: 2 }}
                />
                <FormTextField
                  name="service_request"
                  sm={12}
                  label="Service Request"
                  textFieldProps={{
                    fullWidth: true,
                    multiline: true,
                    rows: 3,
                    placeholder: "Enter Service Request",
                  }}
                  gridProps={{ mb: 2 }}
                />

                <Grid item xs={12} sm={12} mb={2}>
                  <Controller
                    name="room_id"
                    control={control}
                    render={({
                      field: { onChange, value },
                      fieldState: { error, invalid },
                    }) => (
                      <Autocomplete
                        value={
                          roomListOption?.find(
                            (option) => option.id === value
                          ) || null
                        }
                        onChange={(_, selectedOption) => {
                          onChange(selectedOption?.id);
                        }}
                        options={roomListOption || []}
                        getOptionLabel={(option) => option.label}
                        isOptionEqualToValue={(option, value) =>
                          option.id === value.id
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            name="room_id"
                            label="Room"
                            error={invalid}
                            helperText={error?.message}
                          />
                        )}
                        fullWidth
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={12} mb={2}>
                  <Controller
                    name="expected_start_date"
                    control={control}
                    render={({
                      field: { value, onChange },
                      fieldState: { error },
                    }) => (
                      <DatePicker
                        label="Expected Start Date"
                        value={value ? moment(value) : null}
                        onChange={(date) => onChange(date?.toDate())}
                        slotProps={{
                          textField: {
                            error: !!error?.message,
                            helperText: error?.message,
                            fullWidth: true,
                          },
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={12} mb={2}>
                  <Controller
                    name="expected_completion_date"
                    control={control}
                    render={({
                      field: { value, onChange },
                      fieldState: { error },
                    }) => (
                      <DatePicker
                        label="Expected Completion Date"
                        value={value ? moment(value) : null}
                        minDate={
                          watchedStartDate
                            ? moment(watchedStartDate)
                            : undefined
                        }
                        onChange={(date) => onChange(date?.toDate())}
                        slotProps={{
                          textField: {
                            error: !!error?.message,
                            helperText: error?.message,
                            fullWidth: true,
                          },
                        }}
                      />
                    )}
                  />
                </Grid>

                {/* Room Status field - shown when room is selected */}
                {shouldShowRoomStatus && (
                  <Grid item xs={12} sm={12} mb={2}>
                    <Controller
                      name="room_status"
                      control={control}
                      render={({
                        field: { onChange, value },
                        fieldState: { error, invalid },
                      }) => (
                        <Autocomplete
                          value={
                            maintenanceRoomStatusOptions?.find(
                              (option) => option.value === value
                            ) || null
                          }
                          onChange={(_, selectedOption) => {
                            onChange(selectedOption?.value || "");
                          }}
                          options={maintenanceRoomStatusOptions || []}
                          getOptionLabel={(option) => option.label}
                          isOptionEqualToValue={(option, value) =>
                            option.value === value.value
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              name="room_status"
                              label={`Room Status`}
                              error={invalid}
                              helperText={error?.message}
                              inputProps={{
                                ...params.inputProps,
                                "data-testid": "room-status-input",
                              }}
                            />
                          )}
                          fullWidth
                          data-testid="room-status-autocomplete"
                        />
                      )}
                    />
                  </Grid>
                )}

                <Grid item xs={12} mb={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Controller
                      name="location"
                      control={control}
                      render={({
                        field: { onChange, value },
                        fieldState: { error, invalid },
                      }) => (
                        <Autocomplete
                          data-testid="service-location"
                          value={
                            pulicSpaceList.find(
                              (option) => option.value === value
                            ) || null
                          }
                          onChange={(_, selectedOption) =>
                            onChange(selectedOption?.value)
                          }
                          options={pulicSpaceList}
                          getOptionLabel={(option) => option.value}
                          isOptionEqualToValue={(option, value) =>
                            option.id === value.id
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              name="location"
                              label="Public Space"
                              error={invalid}
                              helperText={error?.message}
                              fullWidth
                            />
                          )}
                          fullWidth
                        />
                      )}
                    />
                    <AddPublicSpaceDialog onRefresh={() => refetch()} />
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <PrimaryButton
                      label="Back"
                      buttonStyles={{
                        backgroundColor: "#F5F5F5",
                        color: "#000",
                        fontWeight: "bold",
                      }}
                      isLoading={false}
                      type="button"
                      onClick={() =>
                        Navigate("/booking-engine/rooms/maintenance")
                      }
                    />
                    <PrimaryButton
                      label="Create Ticket"
                      buttonStyles={{
                        backgroundColor: "#32A1AE",
                        color: "#FFFFFF",
                        fontWeight: "bold",
                      }}
                      isLoading={isSubmitLoading}
                      onClick={handleSubmit(onSubmit)}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </LocalizationProvider>
      </FormProvider>

      <Dialog
        fullWidth
        maxWidth="sm"
        open={openAssignModal}
        onClose={handleCloseAssignModal}
      >
        <DialogTitle>
          <IconButton
            aria-label="close"
            onClick={handleCloseAssignModal}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
          Set Room Status
        </DialogTitle>
        <Typography sx={{ p: 2 }} gutterBottom>
          Now that you have created a ticket for this room, please take a moment
          to ensure the room status is correct for{" "}
          <Box component="span" sx={{ fontWeight: "bold" }}>
            Room #
            {roomList
              ?.filter((item) => item.id === roomId)
              .map((item) => item.roomNumber)}
          </Box>
        </Typography>

        <DialogContent>
          <Grid container spacing={2} direction="column">
            <Grid item>
              <CustomDropdown
                label="Status"
                placeholder="Status"
                options={maintenanceRoomStatusOptions}
                onChange={(event) => {
                  setFrontdeskStatus(event.target.value as string);
                }}
                value={frontdeskStatus}
                isInvalid={false}
                fullWidth
                aria-label="Room Status"
                data-testid="room-status-modal"
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseAssignModal} color="primary">
            Cancel
          </Button>
          <PrimaryButton
            label="Update"
            // isLoading={isLoading}
            loadingText="Loading...."
            onClick={dialogueSubmit}
          />
        </DialogActions>
      </Dialog>
    </MainWrapper>
  );
};

export default CreateMaintenance;

const MainWrapper = styled(Grid)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  padding: "15px",
  height: "100%",
  marginTop: "10px",
}));
