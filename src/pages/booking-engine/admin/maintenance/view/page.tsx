import React, { useState, useMemo, useEffect } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import {
  useAssignMaintenanceTicketMutation,
  useCompleteMaintenanceTicketMutation,
  useGetMaintenanceEnumListQuery,
  useGetMaintenanceTicketByidMutation,
  useUpdateMaintenanceDiscussionMutation,
  useUpdateMaintenanceTicketMutation,
} from "services/maintenanceSlice";
import { useGetRoomListQuery } from "services/roomSlice";
import { IProperty } from "types/property";
import { useGetPropertiesQuery } from "services/propertySlice";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns"; // Optional, for date formatting
import { styled } from "@mui/system";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import { useUsersQuery } from "services/userSlice";
import useCustomStatus from "hooks/useCustomStatus";
import useAuth from "hooks/useAuth";
import { appConfig } from "config/app.config";
import { useNotification } from "hooks/useNotification";
import { ISendNotificationRequest } from "types/serviceSocket";
import { SERVICE_PRIORITY_MAP } from "hooks/useRoomReports";
import AddPublicSpaceDialog from "../component/AddPublicSpaceDialog";
import { useGetSettingByKeyQuery } from "services/settingSlice";
import { convertUtcToTimezone } from "utils/helperFunctions/common";

interface FormState {
  property_id: string;
  service_code: string;
  service_subject: string;
  subject: string;
  message: string;
  service_request: string;
  location: string;
  service_notes: string;

  service_discussion: string;
  room_id: number;
}

interface DetailRowProps {
  label: string;
  textValue?: string;
  renderValue?: () => React.ReactNode;
}

const ViewMaintenance: React.FC = () => {
  const params = useParams();
  const Navigate = useNavigate();
  const { statuses } = useCustomStatus();
  const { users, currentTimeZone } = useAuth();
  const { sendNotification } = useNotification();

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [openStatusModal, setOpenStatusModal] = useState<boolean>(false);

  const [getTicketByid, { data: ticketDetails }] =
    useGetMaintenanceTicketByidMutation();
  const { data: publicSpaceList = [], refetch } = useGetSettingByKeyQuery(
    {
      property_id: users?.defaultPropertyId ?? 1,
      key: "PUBLIC_SPACE",
    },
    {
      skip: false,
      refetchOnMountOrArgChange: true,
    }
  );
  const [frontdeskStatus, setFrontdeskStatus] = useState<string>("");
  const [serviceNotes, setServiceNotes] = useState<string>("");
  const [userId, setUserId] = useState<number | null>(null);
  const [roomError, setRoomError] = useState<string>("");

  const [formState, setFormState] = useState<FormState>({
    property_id: "",
    service_code: "",
    service_subject: "",

    subject: "",
    message: "",
    service_request: "",
    location: "",
    service_notes: "",
    service_discussion: "",
    room_id: 1,
  });

  const [editableFields, setEditableFields] = useState<{
    [key: string]: boolean;
  }>({});

  const { data: propertyList } = useGetPropertiesQuery();

  const { data: enumList } = useGetMaintenanceEnumListQuery();
  const { data: roomList } = useGetRoomListQuery({
    limit: 500,
    offset: 0,
    property_id: users?.defaultPropertyId ?? 1,
  });

  const [updateMaintenanceTicket] = useUpdateMaintenanceTicketMutation();
  const [updateMaintenanceDiscussion] =
    useUpdateMaintenanceDiscussionMutation();
  const { data: userList } = useUsersQuery();
  const [assignMaintenanceTicket] = useAssignMaintenanceTicketMutation();
  const [completeMaintenanceTicke] = useCompleteMaintenanceTicketMutation();

  // Detail Row component
  const DetailRow: React.FC<DetailRowProps> = ({
    label,
    textValue,
    renderValue,
  }) => (
    <Box display="flex" flexDirection="column" width="100%" flexWrap="wrap">
      <Typography variant="body1" fontWeight="bold">
        {label}:
      </Typography>
      {textValue && <Typography variant="body2">{textValue}</Typography>}
      {renderValue?.()}
    </Box>
  );

  // Fetch ticket details when id param is available
  const ticketId = params.id;
  useEffect(() => {
    if (ticketId) {
      getTicketByid({ id: ticketId });
    }
  }, [ticketId, getTicketByid]);

  // Populate formState when ticketDetails load
  useEffect(() => {
    if (ticketDetails) {
      setFormState({
        property_id: String(ticketDetails.property_id ?? ""),
        service_code: ticketDetails.service_code ?? "",
        service_subject: ticketDetails.service_subject ?? "",
        subject: "",
        message: "",
        service_request: ticketDetails.service_request ?? "",
        location: ticketDetails.location ?? "",
        service_notes: ticketDetails.service_notes ?? "",
        service_discussion: "",
        room_id: ticketDetails.room_id ?? 0,
      });
      if (ticketDetails.assigned_to) {
        setUserId(ticketDetails.assigned_to);
      }
      if (ticketDetails.room?.frontdesk_status) {
        setFrontdeskStatus(ticketDetails.room.frontdesk_status);
      }
    }
  }, [ticketDetails]);

  // Field change handler
  const handleFieldChange = (field: keyof FormState, value: any) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (field === "room_id" && value) {
      setRoomError("");
    }
  };

  // Toggle edit state
  const handleEdit = (field: keyof FormState) => {
    setEditableFields((prev) => ({
      ...prev,
      [field]: true,
    }));
  };

  // Cancel edit state and reset field value from ticketDetails
  const handleCancel = (field: keyof FormState) => {
    setEditableFields((prev) => ({
      ...prev,
      [field]: false,
    }));
    if (ticketDetails) {
      setFormState((prev) => ({
        ...prev,
        [field]: (ticketDetails as any)[field] ?? "",
      }));
    }
  };

  // Save single editable attribute
  const handleSave = async (field: keyof FormState) => {
    if (!ticketId) return;
    const value = formState[field];
    try {
      const res = await updateMaintenanceTicket({
        id: ticketId,
        key: field,
        value: String(value ?? ""),
      });
      if (!res.error) {
        setSuccessMessage(`${field.replace(/_/g, " ")} updated successfully!`);
        setEditableFields((prev) => ({ ...prev, [field]: false }));
        getTicketByid({ id: ticketId });
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch {
      // ignore
    }
  };

  // Assign user to maintenance ticket
  const handleAssignUser = async (selectedOption: any) => {
    if (!ticketId) return;
    const assignedUserId = selectedOption ? Number(selectedOption.id) : null;
    setUserId(assignedUserId);
    try {
      const res = await assignMaintenanceTicket({
        id: ticketId,
        userId: assignedUserId ? String(assignedUserId) : "",
      });
      if (!res.error) {
        setSuccessMessage("User assigned successfully!");
        getTicketByid({ id: ticketId });
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch {
      // ignore
    }
  };

  // Add discussion / comment
  const handleAddComment = async () => {
    if (!ticketId) return;
    if (!formState.subject.trim() && !formState.message.trim()) return;

    try {
      const res = await updateMaintenanceDiscussion({
        id: ticketId,
        subject: formState.subject,
        message: formState.message,
      });
      if (!res.error) {
        setSuccessMessage("Comment added successfully!");
        setFormState((prev) => ({
          ...prev,
          subject: "",
          message: "",
        }));
        getTicketByid({ id: ticketId });
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch {
      // ignore
    }
  };

  // Close status modal
  const handleCloseStatusModal = () => {
    setOpenStatusModal(false);
  };

  // Complete maintenance ticket
  const dialogueComplete = async () => {
    if (!ticketId) return;
    try {
      const res = await completeMaintenanceTicke({
        id: ticketId,
        frontdesk_status: frontdeskStatus,
        service_notes: serviceNotes,
      });
      if (!res.error) {
        setSuccessMessage("Ticket marked as completed successfully!");
        setOpenStatusModal(false);
        getTicketByid({ id: ticketId });
        setTimeout(() => {
          setSuccessMessage(null);
          Navigate("/booking-engine/rooms/maintenance");
        }, 1500);
      }
    } catch {
      // ignore
    }
  };

  // Options & Dropdown mappings
  const departmentOptions = useMemo(() => {
    return [
      { id: "", label: "All Departments" },
      ...allDepartments.map((dept) => ({ id: dept, label: dept })),
    ];
  }, [allDepartments]);

  const filteredUserOptions = useMemo(() => {
    let filtered = userList || [];
    if (departmentFilter) {
      filtered = filtered.filter((u) =>
        u.departments?.some(
          (d) =>
            d.department_name === departmentFilter ||
            d.department_slug === departmentFilter
        )
      );
    }
    return filtered.map((u) => ({
      id: u.id,
      label: `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() || u.email,
      departments:
        u.departments?.map((d) => d.department_name || d.department_slug) || [],
    }));
  }, [userList, departmentFilter]);

  const propertyOptionList = useMemo(() => {
    return (
      propertyList?.data?.map((p: IProperty) => ({
        id: String(p.id),
        label: p.name,
      })) || []
    );
  }, [propertyList]);

  const serviceCodeOptions = useMemo(() => {
    return (
      enumList?.result?.service_codes?.map((code) => ({
        id: code,
        label: code,
      })) || []
    );
  }, [enumList]);

  const roomListOptions = useMemo(() => {
    return (
      roomList?.map((room) => ({
        id: room.id,
        label: room.roomNumber,
      })) || []
    );
  }, [roomList]);

  const frontdeskStatusOptions = useMemo(() => {
    const defaultStatuses = [
      { id: "VAC", label: "Vacant" },
      { id: "OCC", label: "Occupied" },
      { id: "OOO", label: "Out of Order" },
      { id: "OOS", label: "Out of Service" },
      { id: "OFF", label: "Offline" },
    ];
    if (statuses?.FrontdeskStatusEnum) {
      return Object.keys(statuses.FrontdeskStatusEnum).map((key) => ({
        id: key,
        label: statuses.FrontdeskStatusEnum![key],
      }));
    }
    return defaultStatuses;
  }, [statuses]);

  // Form field configurations
  const textFields = [
    { label: "Subject", field: "service_subject", multiline: false },
    { label: "Request", field: "service_request", multiline: true },
    { label: "Location", field: "location", multiline: false },
    { label: "Notes", field: "service_notes", multiline: true },
  ];

  const commentFields = [
    { label: "Subject", field: "subject", multiline: false },
    { label: "Message", field: "message", multiline: true },
  ];
    <MainWrapper>
      {successMessage && (
        <Alert severity="success" data-testid="success-message" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}
      <Box sx={{ mb: 3 }}>
        {/* Info box with 5 columns */}
        <Grid
          container
          spacing={0}
          marginLeft={0}
          sx={{
            backgroundColor: "#f9f9f9",
            mb: 3,
            mt: 1,
            mx: 0,
            borderRadius: 1,
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.05)",
          }}
        >
          <Col item xs={12} sm={6} md={2.4} lg={2.4} padding={2}>
            <DetailRow label="Ticket" textValue={`#${ticketDetails?.id}`} />
          </Col>

          <Col item xs={12} sm={6} md={2.4} lg={2.4} padding={2}>
            <DetailRow
              label="Created"
              textValue={
                ticketDetails?.created_at
                  ? convertUtcToTimezone(
                    ticketDetails.created_at,
                    currentTimeZone
                  ).format(appConfig.displayDateWithTimeFormat)
                  : ""
              }
            />
          </Col>

          <Col item xs={12} sm={6} md={2.4} lg={2.4} padding={2}>
            <DetailRow
              label="Created By"
              renderValue={() => (
                <>
                  <Typography variant="body2">
                    {`${ticketDetails?.assigned_by_user?.first_name ?? ""} ${ticketDetails?.assigned_by_user?.last_name?.slice(0, 1) ??
                      ""
                      }`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {ticketDetails?.assigned_by_user?.email ?? ""}
                  </Typography>
                </>
              )}
            />
          </Col>

          <Col item xs={12} sm={6} md={2.4} lg={2.4} padding={2}>
            <DetailRow
              label="Closed"
              textValue={
                ticketDetails?.closed_at
                  ? format(
                    new Date(ticketDetails?.closed_at),
                    "yyyy-MM-dd HH:mm"
                  )
                  : ""
              }
            />
          </Col>

          <Col
            item
            xs={12}
            sm={6}
            md={2.4}
            lg={2.4}
            padding={2}
            borderRight={0}
          >
            <DetailRow
              label="Closed By"
              renderValue={() => (
                <>
                  <Typography variant="body2">
                    {`${ticketDetails?.closed_by_user?.first_name ?? ""} ${ticketDetails?.closed_by_user?.last_name?.slice(0, 1) ??
                      ""
                      }`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {ticketDetails?.closed_by_user?.email ?? ""}
                  </Typography>
                </>
              )}
            />
          </Col>
        </Grid>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={12}>
          <Box
            sx={{
              position: "relative",
              borderWidth: 1,
              borderStyle: "solid",
              borderColor: "black",
              borderRadius: 1,
              padding: 3,
              paddingTop: 4,
              marginBottom: 3,
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.05)",
            }}
          >
            {/* Top-left label */}
            <Typography
              variant="body1"
              sx={{
                position: "absolute",
                top: -12,
                left: 10,
                background: "white",
                paddingX: 0.8,
                color: "black",
              }}
              fontStyle="normal"
              fontWeight="bold"
            >
              Assigned to User
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Autocomplete
                  value={
                    departmentOptions.find(
                      (opt) => opt.id === departmentFilter
                    ) || null
                  }
                  onChange={(_, selectedOption) =>
                    setDepartmentFilter(selectedOption?.id || "")
                  }
                  options={departmentOptions}
                  getOptionLabel={(option) => option.label}
                  isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Filter by Department"
                      placeholder="All"
                      size="small"
                      fullWidth
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Autocomplete
                  value={
                    filteredUserOptions?.find(
                      (opt) => Number(opt?.id) === userId
                    ) || null
                  }
                  onChange={async (_, selectedOption) => {
                    handleAssignUser(selectedOption);
                  }}
                  options={filteredUserOptions || []}
                  getOptionLabel={(option) => option.label}
                  renderOption={(props, option) => (
                    <li {...props}>
                      <Box>
                        <Typography>{option.label}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.departments.join(", ")}
                        </Typography>
                      </Box>
                    </li>
                  )}
                  isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Select user to assign"
                      size="small"
                      fullWidth
                      label="Assign User"
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        </Grid>
        {/* Editable Dropdowns */}
        <Grid item xs={12} md={4} sx={{ mb: 1 }}>
          <Autocomplete
            value={
              propertyOptionList.find(
                (opt) => opt.id === formState.property_id
              ) || null
            }
            onChange={(_, selectedOption) =>
              handleFieldChange("property_id", selectedOption?.id || "")
            }
            options={propertyOptionList}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Property List"
                placeholder="Select Property"
                size="small"
                fullWidth
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={4} sx={{ mb: 1 }}>
          <Autocomplete
            value={
              serviceCodeOptions.find(
                (opt) => opt.id === formState.service_code
              ) || null
            }
            onChange={(_, selectedOption) =>
              handleFieldChange("service_code", selectedOption?.id || "")
            }
            options={serviceCodeOptions}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Service Code"
                placeholder="Select service code"
                size="small"
                fullWidth
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={4} sx={{ mb: 1 }}>
          <Autocomplete
            value={
              roomListOptions.find((opt) => opt.id === formState.room_id) ||
              null
            }
            onChange={(_, selectedOption) =>
              handleFieldChange("room_id", selectedOption?.id || 0)
            }
            options={roomListOptions}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Room"
                placeholder="Select room"
                size="small"
                fullWidth
                error={!!roomError}
                helperText={roomError}
              />
            )}
          />
        </Grid>

        {/* Editable Text Fields */}
        {textFields.map(({ label, field, multiline = false }, index) => (
          <Grid item xs={12} md={12} key={index} sx={{ mb: 2 }}>
            <Box display="flex" alignItems="center" gap={1}>
              {!(field === "location" && editableFields[field]) && (
                <TextField
                  value={formState[field as keyof FormState]}
                  disabled={!editableFields[field]}
                  placeholder={`Enter ${label}`}
                  onChange={(e) =>
                    handleFieldChange(field as keyof FormState, e.target.value)
                  }
                  size="small"
                  label={label}
                  fullWidth
                  multiline={multiline}
                  rows={multiline ? 3 : undefined}
                />
              )}

              {field === "location" && editableFields[field] ? (
                <>
                  <Autocomplete
                    value={
                      publicSpaceList.find(
                        (option) => option.value === formState[field]
                      ) || null
                    }
                    onChange={(_, selectedOption) =>
                      handleFieldChange(
                        field as keyof FormState,
                        selectedOption?.value || ""
                      )
                    }
                    options={publicSpaceList}
                    getOptionLabel={(option) => option.value}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        placeholder={`Select ${label}`}
                        fullWidth
                      />
                    )}
                    fullWidth
                  />
                  <AddPublicSpaceDialog onRefresh={() => refetch()} />
                  <IconButton onClick={() => handleSave(field)} color="primary">
                    <CheckIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleCancel(field)}
                    color="secondary"
                  >
                    <CloseIcon />
                  </IconButton>
                </>
              ) : editableFields[field] ? (
                <>
                  <IconButton
                    onClick={() => handleSave(field as keyof FormState)}
                    color="primary"
                  >
                    <CheckIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleCancel(field as keyof FormState)}
                    color="secondary"
                  >
                    <CloseIcon />
                  </IconButton>
                </>
              ) : (
                <IconButton
                  onClick={() => handleEdit(field as keyof FormState)}
                  color="primary"
                >
                  <EditIcon />
                </IconButton>
              )}
            </Box>
          </Grid>
        ))}

        {ticketDetails?.service_discussion &&
          ticketDetails.service_discussion.length > 0 && (
            <Grid container spacing={2} sx={{ mt: 1, mb: 3, px: 1 }}>
              {/* Main Title */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Comments
                </Typography>
                <Divider />
              </Grid>

              {ticketDetails?.service_discussion?.map((item, index) => (
                <Grid item xs={12} key={index} sx={{ mt: 1, mb: 1 }}>
                  {/* Username and Created At Section */}
                  <Box display="flex" alignItems="center" mb={1} gap={2}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {item.user_name}
                    </Typography>
                    <Typography variant="body2">
                      {item?.created_at
                        ? convertUtcToTimezone(
                          item.created_at,
                          currentTimeZone
                        ).format(appConfig.displayDateWithTimeFormat)
                        : ""}
                    </Typography>
                  </Box>

                  {/* Subject Section */}
                  <Box display="flex" alignItems="center" mb={1} gap={2}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      Subject:
                    </Typography>
                    <Typography variant="body2">{item.subject}</Typography>
                  </Box>

                  {/* Message Section */}
                  <Box>
                    <Typography variant="body2">
                      {item.message ?? ""}
                    </Typography>
                  </Box>
                </Grid>
              ))}

              {/* Divider after all comments */}
              <Grid item xs={12}>
                <Divider
                  sx={{
                    mt: 2,
                    height: "2px", // Thickness of the divider
                    backgroundColor: "black", // Bold color
                  }}
                />
              </Grid>
            </Grid>
          )}

        {commentFields.map(({ label, field, multiline = false }, index) => (
          <Grid item xs={12} md={12} key={index} sx={{ mb: 2 }}>
            <Box display="flex" alignItems="center" gap={1}>
              <TextField
                value={formState[field as keyof FormState]}
                placeholder={`Enter Comment ${label}`}
                onChange={(e) =>
                  handleFieldChange(field as keyof FormState, e.target.value)
                }
                size="small"
                label={label}
                fullWidth
                multiline={multiline}
                rows={multiline ? 3 : undefined}
              />
            </Box>
          </Grid>
        ))}
        <Grid item xs={12} md={10}></Grid>
        <Grid item xs={12} md={2} sx={{ mb: 3 }}>
          <Box display="flex" alignItems="center" gap={2}>
            <PrimaryButton
              label="Add Comment"
              buttonStyles={{
                backgroundColor: "#32A1AE",
                color: "#FFFFFF",
                fontWeight: "bold",
              }}
              onClick={() => {
                handleAddComment();
              }}
            />
          </Box>
        </Grid>
        <Grid item xs={12} sx={{ mt: 1, mb: 3 }}>
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
              onClick={() => Navigate("/booking-engine/rooms/maintenance")}
            />
            <PrimaryButton
              label="Complete Ticket"
              buttonStyles={{
                backgroundColor: "#32A1AE",
                color: "#FFFFFF",
                fontWeight: "bold",
              }}
              onClick={() => {
                if (!formState.room_id) {
                  setRoomError("Room is required!");
                  return;
                }
                setOpenStatusModal(true);
              }}
            />
          </Box>
        </Grid>
      </Grid>

      <Dialog
        fullWidth
        maxWidth="md"
        open={openStatusModal}
        onClose={handleCloseStatusModal}
        PaperProps={{
          sx: {
            borderRadius: 1,
            padding: 1,
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <IconButton
            aria-label="close"
            onClick={handleCloseStatusModal}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" fontWeight="bold">
            Complete Ticket
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={3} direction="column">
            <Grid item xs={12} md={9}>
              <Typography sx={{ pb: 1 }} gutterBottom>
                Please take a moment to ensure the room status is correct for{" "}
                <Box component="span" sx={{ fontWeight: "bold" }}>
                  Room #
                  {roomList
                    ?.filter((item) => item.id === ticketDetails?.room_id)
                    .map((item) => item.roomNumber)}
                </Box>
              </Typography>
              <Autocomplete
                value={
                  frontdeskStatusOptions.find(
                    (opt) => opt.id === frontdeskStatus
                  ) || null
                }
                onChange={(_, selectedOption) =>
                  setFrontdeskStatus(selectedOption?.id || "")
                }
                options={frontdeskStatusOptions}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Status"
                    placeholder="Select status"
                    size="small"
                    fullWidth
                    data-testid="room-number"
                  />
                )}
              />
            </Grid>
            <Grid item mt={1}>
              <TextField
                value={serviceNotes}
                placeholder={`Enter service notes`}
                label="Ticket Notes"
                size="small"
                rows={4}
                onChange={(e) => setServiceNotes(e.target.value as string)}
                fullWidth
                multiline={true}
                helperText="Please take a second to write a note about the services required to close this task."
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
          <PrimaryButton
            label="Complete Ticket"
            loadingText="Loading...."
            onClick={dialogueComplete}
            buttonStyles={{
              backgroundColor: "#32A1AE",
              color: "#FFFFFF",
              fontWeight: "bold",
            }}
          />
        </DialogActions>
      </Dialog>
    </MainWrapper>
  );
};

export default ViewMaintenance;

const MainWrapper = styled(Grid)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  padding: "20px",
  height: "100%",
  marginTop: "10px",
  borderRadius: "4px",
  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.05)",
}));

const Col = styled(Grid)(() => ({
  border: "1px solid #ccc",
  marginTop: "-1px",
  marginLeft: "-1px",
}));
