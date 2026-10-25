"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Card,
  CardHeader,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  IconButton,
  TextField,
  InputAdornment,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
// import RemoveIcon from "@mui/icons-material/Remove";
import DefaultEditIcon from "@mui/icons-material/Edit";
import DefaultDeleteIcon from "@mui/icons-material/DeleteForever";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import useCustomStatus from "hooks/useCustomStatus";
import {
  useGetServiceCreditsQuery,
  useUpdateServiceCreditsMutation,
} from "services/houseKeeperSlice";
import {
  useGetSettingByKeyQuery,
  useDeleteSettingMutation,
} from "services/settingSlice";
import useAuth from "hooks/useAuth";
import { IService } from "types/houseKeeperTypes";
import SettingsModal from "./_components/SettingsModal";
import UpdateSettingModal from "./_components/UpdateSettingModal";
import ConfirmationDialog from "components/elements/ConfirmationDialog/ConfirmationDialog";
import useSnackbar from "hooks/useSnackbar";

// Static data for service settings
const serviceSettingsData = {
  stayOver: {
    minLOS: "4 Days +",
    frequency: "Every - 3 Days +",
    maxRefuse: "1 Time(s) +",
  },
  refresh: {
    minLOS: "2 Days +",
    frequency: "Every - 1 Days +",
    maxRefuse: "4 Time(s) +",
  },
};

// Generate custom events data dynamically from all status colors
const defaultIcon = <DefaultEditIcon sx={{ fontSize: 15 }} />;
const defaultDeleteIcon = <DefaultDeleteIcon sx={{ fontSize: 15 }} />;

const HousekeepingSettings: React.FC = () => {
  const { openSnackbar } = useSnackbar();
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedSettingId, setSelectedSettingId] = useState<number | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteSettingId, setDeleteSettingId] = useState<number | null>(null);
  const [deleteSettingName, setDeleteSettingName] = useState<string>("");
  const [editingCredit, setEditingCredit] = useState<{
    serviceId: number;
    value: number;
    originalValue: number;
  } | null>(null);

  const { statuses, isLoading, isError } = useCustomStatus();

  const { users } = useAuth();
  const propertyId = users?.defaultPropertyId ?? 0;

  const { data: serviceList, refetch: refetchServiceCredits } =
    useGetServiceCreditsQuery({
      property_id: propertyId,
    });

  const { data: settingsList, isLoading: isSettingsLoading } =
    useGetSettingByKeyQuery({ key: "ROOMSTATUS" });

  const [deleteSetting] = useDeleteSettingMutation();
  const [updateServiceCredits, { isLoading: isUpdatingCredits }] =
    useUpdateServiceCreditsMutation();

  // Filter settings for ROOMSTATUS type
  const roomStatusSettings =
    settingsList?.filter((setting) => setting.key === "ROOMSTATUS") || [];

  const housekeepingServices = statuses.HousekeepingServices || [];

  // If there's an error, show an error message
  if (isError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Error loading housekeeping settings. Please try again later.
        </Alert>
      </Box>
    );
  }

  const handleOpenSettingsModal = () => {
    setIsSettingsModalOpen(true);
  };

  const handleCloseSettingsModal = () => {
    setIsSettingsModalOpen(false);
  };

  const handleOpenUpdateModal = (id: number) => {
    setSelectedSettingId(id);
    setIsUpdateModalOpen(true);
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedSettingId(null);
  };

  const handleOpenDeleteDialog = (id: number, name: string) => {
    setDeleteSettingId(id);
    setDeleteSettingName(name);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setDeleteSettingId(null);
    setDeleteSettingName("");
  };

  const handleDeleteSetting = async () => {
    if (deleteSettingId) {
      try {
        const response = await deleteSetting({ id: deleteSettingId });
        if (response?.error) {
          openSnackbar(response.error as string, "error");
          return false;
        }
        handleCloseDeleteDialog();
      } catch {
        /** empty catch error */
      }
    }
  };

  const handleCreditChange = (
    serviceId: number,
    currentCredit: number,
    increment: boolean
  ) => {
    const newValue = increment ? currentCredit + 0.25 : currentCredit - 0.25;
    // Ensure we don't go below 0
    const adjustedValue = Math.max(0, newValue);

    setEditingCredit({
      serviceId,
      value: adjustedValue,
      originalValue: currentCredit,
    });
  };

  const handleSaveCredit = async () => {
    if (editingCredit) {
      try {
        await updateServiceCredits({
          id: editingCredit.serviceId,
          credits: editingCredit.value,
        }).unwrap();

        refetchServiceCredits();
        setEditingCredit(null);
      } catch {
        /** empty catch error */
      }
    }
  };

  const handleCancelCreditEdit = () => {
    setEditingCredit(null);
  };

  const getOrganizedServices = () => {
    if (!serviceList || serviceList.length === 0) return {};

    // Group services by service_type
    const servicesByType: Record<
      string,
      Record<string, { credit: string; id: number }>
    > = {};

    serviceList.forEach((service: IService) => {
      // Initialize the service type if it doesn't exist
      if (!servicesByType[service.service_type]) {
        servicesByType[service.service_type] = {};
      }

      // Add the room type and credits - handle possible undefined values
      const roomTypeKey = service?.room_type?.type;
      // Only add if roomTypeKey is a valid string
      if (roomTypeKey && typeof roomTypeKey === "string") {
        servicesByType[service.service_type][roomTypeKey] = {
          credit: service.credits.toFixed(2),
          id: service.id,
        };
      }
    });

    return servicesByType;
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with lodge name and time */}
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h5">Housekeeping Settings</Typography>
      </Box>

      {/* Housekeeping Service Types */}
      <Card sx={{ mb: 4 }}>
        <CardHeader
          title="Housekeeping Service Types"
          sx={{
            backgroundColor: "#f5f5f5",
            "& .MuiCardHeader-title": {
              fontSize: "1rem",
              fontWeight: "bold",
            },
          }}
        />
        <CardContent>
          {isLoading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableCell sx={{ fontWeight: "bold", width: "12%" }}>
                      Service Name
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      Code on boards
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      Description
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {housekeepingServices?.map((service: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>
                        {service.name
                          ?.toLowerCase()
                          .split("_")
                          .map(
                            (word: any) =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(" ")}
                      </TableCell>

                      <TableCell>{service.name}</TableCell>
                      <TableCell>{service.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Credits By Service Type */}
      <Card sx={{ mb: 4 }}>
        <CardHeader
          title="Credits By Service Type"
          sx={{
            backgroundColor: "#f5f5f5",
            "& .MuiCardHeader-title": {
              fontSize: "1rem",
              fontWeight: "bold",
            },
          }}
        />
        <CardContent>
          {isLoading || isUpdatingCredits ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "flex-start",
                gap: 2,
                paddingLeft: { xs: 2, sm: 4, md: 7 },
              }}
            >
              {housekeepingServices.map((service: any, index: number) => {
                // Get organized services data
                const organizedServices = getOrganizedServices();

                // Get credits data for this service type if it exists
                const serviceCredits = organizedServices[service.name];

                // Get available room types for this service
                const availableRoomTypes = serviceCredits
                  ? Object.keys(serviceCredits)
                  : [];

                return (
                  <Box
                    key={index}
                    sx={{
                      width: "calc(25% - 12px)",
                      textAlign: "center",
                      mb: 2,
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      sx={{
                        fontSize: "0.95rem",
                        mb: 1,
                        marginRight: { xs: 5, sm: 10, md: 15 },
                      }}
                    >
                      {service.name}
                    </Typography>

                    {/* Only show room types that have data */}
                    {availableRoomTypes?.map((roomType) => {
                      const serviceData = serviceCredits[roomType];
                      const isEditing =
                        editingCredit &&
                        editingCredit.serviceId === serviceData.id;
                      const displayValue = isEditing
                        ? Number(editingCredit.value).toFixed(2)
                        : Number(serviceData.credit).toFixed(2);

                      const handleIncrement = () => {
                        if (isEditing) {
                          const newValue =
                            Math.round((editingCredit.value + 0.25) * 100) /
                            100;
                          setEditingCredit({
                            ...editingCredit,
                            value: newValue,
                          });
                        } else {
                          handleCreditChange(
                            serviceData.id,
                            parseFloat(serviceData.credit),
                            true
                          );
                        }
                      };

                      const handleDecrement = () => {
                        if (isEditing) {
                          const decrementedValue = editingCredit.value - 0.25;
                          const newValue =
                            Math.round(Math.max(0, decrementedValue) * 100) /
                            100;
                          setEditingCredit({
                            ...editingCredit,
                            value: newValue,
                          });
                        } else {
                          handleCreditChange(
                            serviceData.id,
                            parseFloat(serviceData.credit),
                            false
                          );
                        }
                      };

                      const handleChange = (event: any) => {
                        // Parse as float and ensure we keep 2 decimal places
                        const inputValue = event.target.value;
                        const value = parseFloat(inputValue);

                        if (!isNaN(value) && value >= 0) {
                          // Round to 2 decimal places to avoid floating point issues
                          const roundedValue = Math.round(value * 100) / 100;

                          if (isEditing) {
                            setEditingCredit({
                              ...editingCredit,
                              value: roundedValue,
                            });
                          } else {
                            setEditingCredit({
                              serviceId: serviceData.id,
                              value: roundedValue,
                              originalValue: parseFloat(serviceData.credit),
                            });
                          }
                        }
                      };

                      return (
                        <Box
                          key={roomType}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mb: 0.8,
                            width: "100%",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              width: "100%",
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                width: "70px",
                                textAlign: "left",
                                fontSize: "0.8rem",
                                mr: 3,
                              }}
                            >
                              {roomType}
                            </Typography>

                            <Box
                              sx={{
                                position: "relative",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <TextField
                                value={displayValue}
                                onChange={handleChange}
                                variant="outlined"
                                size="small"
                                type="number"
                                inputProps={{
                                  step: 0.25,
                                  min: 0,
                                  style: {
                                    padding: "2px 8px",
                                    fontSize: "0.8rem",
                                    textAlign: "center",
                                    MozAppearance: "textfield",
                                  },
                                }}
                                sx={{
                                  width: "80px",
                                  "& .MuiOutlinedInput-root": {
                                    height: "27px",
                                  },
                                  "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                                    {
                                      WebkitAppearance: "none",
                                      margin: 0,
                                    },
                                }}
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment
                                      position="end"
                                      sx={{ marginLeft: 0 }}
                                    >
                                      <Box
                                        sx={{
                                          display: "flex",
                                          flexDirection: "column",
                                        }}
                                      >
                                        <IconButton
                                          onClick={handleIncrement}
                                          size="small"
                                          sx={{
                                            padding: 0,
                                            height: "14px",
                                            width: "16px",
                                          }}
                                        >
                                          <KeyboardArrowUpIcon
                                            sx={{ fontSize: "14px" }}
                                          />
                                        </IconButton>
                                        <IconButton
                                          onClick={handleDecrement}
                                          size="small"
                                          sx={{
                                            padding: 0,
                                            height: "14px",
                                            width: "16px",
                                          }}
                                        >
                                          <KeyboardArrowDownIcon
                                            sx={{ fontSize: "14px" }}
                                          />
                                        </IconButton>
                                      </Box>
                                    </InputAdornment>
                                  ),
                                }}
                              />

                              {isEditing && (
                                <Box sx={{ display: "flex", ml: 0.7 }}>
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    sx={{
                                      padding: 0,
                                      minWidth: "20px",
                                      height: "20px",
                                    }}
                                    onClick={handleSaveCredit}
                                  >
                                    <CheckIcon sx={{ fontSize: "0.8rem" }} />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    sx={{
                                      padding: 0,
                                      minWidth: "20px",
                                      height: "20px",
                                    }}
                                    onClick={handleCancelCreditEdit}
                                  >
                                    <CloseIcon sx={{ fontSize: "0.8rem" }} />
                                  </IconButton>
                                </Box>
                              )}
                            </Box>
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                );
              })}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Service Settings */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <Card>
              <CardHeader
                title="Stay Over"
                sx={{
                  backgroundColor: "#f5f5f5",
                  "& .MuiCardHeader-title": {
                    fontSize: "1rem",
                    fontWeight: "bold",
                  },
                }}
              />
              <CardContent>
                <Typography variant="body2">
                  Min LOS: {serviceSettingsData.stayOver.minLOS}
                </Typography>
                <Typography variant="body2">
                  Frequency: {serviceSettingsData.stayOver.frequency}
                </Typography>
                <Typography variant="body2">
                  Max Refuse before Mandatory/wellness:{" "}
                  {serviceSettingsData.stayOver.maxRefuse}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6}>
            <Card>
              <CardHeader
                title="Refresh"
                sx={{
                  backgroundColor: "#f5f5f5",
                  "& .MuiCardHeader-title": {
                    fontSize: "1rem",
                    fontWeight: "bold",
                  },
                }}
              />
              <CardContent>
                <Typography variant="body2">
                  Min LOS: {serviceSettingsData.refresh.minLOS}
                </Typography>
                <Typography variant="body2">
                  Frequency: {serviceSettingsData.refresh.frequency}
                </Typography>
                <Typography variant="body2">
                  Max Refuse before Mandatory/wellness:{" "}
                  {serviceSettingsData.refresh.maxRefuse}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Custom Housekeeping Events */}
      <Card sx={{ mb: 4 }}>
        <CardHeader
          title="Custom Events"
          action={
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              size="small"
              onClick={handleOpenSettingsModal}
            >
              Add Event
            </Button>
          }
          sx={{
            backgroundColor: "#f5f5f5",
            "& .MuiCardHeader-title": {
              fontSize: "1rem",
              fontWeight: "bold",
            },
          }}
        />
        <CardContent>
          {isSettingsLoading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : roomStatusSettings.length === 0 ? (
            <Typography variant="body2" color="text.secondary" align="center">
              No custom events found. Click &quot;Add Event&quot; to create one.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {roomStatusSettings.map((setting, index) => (
                <Grid item xs={3} key={index}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: "20px",
                        height: "20px",
                        bgcolor:
                          typeof setting.rule === "object" &&
                          setting.rule &&
                          "color" in setting.rule
                            ? String(setting.rule.color)
                            : "#cccccc",
                        borderRadius: "4px",
                      }}
                    />
                    <Typography variant="body2">
                      {setting.type || setting.value}
                    </Typography>
                    <span
                      style={{ cursor: "pointer" }}
                      onClick={() => handleOpenUpdateModal(setting.id)}
                    >
                      {defaultIcon}
                    </span>
                    <span
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        handleOpenDeleteDialog(
                          setting.id,
                          setting.type || setting.value
                        )
                      }
                    >
                      {defaultDeleteIcon}
                    </span>
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Settings Modal */}
      <SettingsModal
        open={isSettingsModalOpen}
        onClose={handleCloseSettingsModal}
      />

      {/* Update Settings Modal */}
      <UpdateSettingModal
        open={isUpdateModalOpen}
        onClose={handleCloseUpdateModal}
        settingId={selectedSettingId}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={isDeleteDialogOpen}
        title="Confirm Deletion Eevent"
        description={`Are you sure you want to delete the "${deleteSettingName}" event?`}
        buttons={[
          {
            label: "Cancel",
            onClick: handleCloseDeleteDialog,
          },
          {
            label: "Delete",
            onClick: handleDeleteSetting,
          },
        ]}
        onClose={handleCloseDeleteDialog}
      />
    </Box>
  );
};

export default HousekeepingSettings;
