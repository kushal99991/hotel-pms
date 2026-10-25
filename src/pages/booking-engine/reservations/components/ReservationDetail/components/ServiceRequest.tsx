import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Grid,
  IconButton,
  TextField,
  Autocomplete,
  Alert,
  Skeleton,
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import {
  IServiceRequest,
  IServiceRequestResponse,
} from "types/serviceRequestTypes";
import ConfirmationDialog from "components/elements/ConfirmationDialog/ConfirmationDialog";
import Modal from "components/widgets/ModalWindows/Modal";
import {
  useAddServiceRequestByReservationMutation,
  useDeleteServiceRequestByReservationMutation,
  useGetServiceRequestByReservationQuery,
  useServiceRequestQuery,
  useUpdateServiceRequestByReservationMutation,
} from "services/serviceRequestSlice";
import { useLazyGetPostingcodeListQueryQuery } from "services/financeSlice";
import useSnackbar from "hooks/useSnackbar";
import { useReservationDetails } from "contexts/ReservationDetailsContext";
import ReservationDetailBox from "./ReservationDetailBox";
import ChangeStatusModal from "./ChangeStatusModal";
import { useGetFoliosQuery } from "services/paymentsSlice";
import AddServiceChargeModal from "./AddServiceChargeModal";
import useAuth from "hooks/useAuth";

const ServiceRequest: React.FC = () => {
  const { openSnackbar } = useSnackbar();
  const { users } = useAuth();
  const { viewState, refreshReservation } = useReservationDetails();
  const [openDeleteServiceRequestDialog, setOpenDeleteServiceRequestDialog] =
    useState<boolean>(false);
  const [openServiceRequestModal, setOpenServiceRequestModal] =
    useState<boolean>(false);
  const [openAddServiceRequestModal, setOpenAddServiceRequestModal] =
    useState<boolean>(false);
  const [openStatusModal, setOpenStatusModal] = useState<boolean>(false);
  const [showAddCharge, setShowAddCharge] = useState<boolean>(false);
  const [selectedService, setSelectedService] =
    useState<IServiceRequestResponse | null>(null);
  const [newServiceRequest, setNewServiceRequest] =
    useState<IServiceRequest | null>(null);

  const { data: reservationFolios } = useGetFoliosQuery({
    reservation_id: viewState.reservation?.id ?? 0,
  });
  const { data: serivceRequestList } = useServiceRequestQuery({
    property_id: users?.defaultPropertyId,
  });
  const {
    data: serviceRequests,
    isLoading,
    refetch,
  } = useGetServiceRequestByReservationQuery({
    reservation_id: viewState?.reservation?.id,
  });
  const [getPostingcodeListQuery, { data: postingCodes }] =
    useLazyGetPostingcodeListQueryQuery();
  const [updateServiceRequestByReservation, { isLoading: isUpdating }] =
    useUpdateServiceRequestByReservationMutation();
  const [addServiceRequestByReservation, { isLoading: isAdding }] =
    useAddServiceRequestByReservationMutation();
  const [deleteServiceRequestByReservation, { isLoading: isDeleting }] =
    useDeleteServiceRequestByReservationMutation();

  useEffect(() => {
    getPostingcodeListQuery({});
  }, []);

  const handleCloseDeleteServiceRequestDialog = () => {
    setOpenDeleteServiceRequestDialog(false);
  };

  const deleteServiceRequest = async () => {
    if (selectedService === null) {
      openSnackbar(`Please select service request`, "error");
      return false;
    }
    const response = await deleteServiceRequestByReservation({
      id: selectedService?.id,
    });
    if (response?.error) {
      openSnackbar(response.error as string, "error");
      return false;
    }
    openSnackbar(`Service Request has been deleted successfully!`, "success");
    refetch();
    setOpenDeleteServiceRequestDialog(false);
  };

  const handleOpenDeleteModal = (service: IServiceRequestResponse) => {
    setSelectedService(service);
    setOpenDeleteServiceRequestDialog(true);
  };

  const handleCloseServiceRequestModal = () => {
    setOpenServiceRequestModal(false);
    setSelectedService(null);
    setNewServiceRequest(null);
  };

  const handleOpenStatusModal = (service: IServiceRequestResponse) => {
    setSelectedService(service);
    setOpenStatusModal(true);
  };

  const handleSave = async () => {
    if (newServiceRequest === null || selectedService === null) {
      openSnackbar(`Please select service request`, "error");
      return false;
    }
    const response = await updateServiceRequestByReservation({
      id: selectedService.id,
      service_request_id: newServiceRequest.id,
      reservation_id: viewState?.reservation?.id ?? 0,
    });
    if (response?.error) {
      openSnackbar(response.error as string, "error");
      return false;
    }
    refetch();
    refreshReservation?.();
    handleCloseServiceRequestModal();
  };

  const handleNewSave = async () => {
    if (newServiceRequest === null) {
      openSnackbar(`Please select service request`, "error");
      return false;
    }
    const response = await addServiceRequestByReservation({
      service_request_id: newServiceRequest.id,
      reservation_id: viewState?.reservation?.id ?? 0,
    });
    if (response?.error) {
      openSnackbar(response.error as string, "error");
      return false;
    }
    refetch();
    refreshReservation?.();
    handleCloseServiceRequestModal();
    setOpenAddServiceRequestModal(false);
  };

  const handleOpenNewServiceModal = () => {
    setOpenAddServiceRequestModal(true);
  };

  const handleCloseStatusModal = () => {
    setOpenStatusModal(false);
    setSelectedService(null);
  };

  const handleUpdateStatus = async (service: IServiceRequestResponse) => {
    let status = "PENDING";
    if (service.status === "PENDING") {
      status = "COMPLETED";
    }
    if (service.status === "COMPLETED") {
      status = "UNABLE_TO_COMPLETE";
    }
    if (status === "UNABLE_TO_COMPLETE") {
      setSelectedService(service);
      setOpenStatusModal(true);
      return false;
    }
    if (status === "COMPLETED" && service.service_request.rate > 0) {
      setSelectedService(service);
      setShowAddCharge(true);
      return false;
    }
    const response = await updateServiceRequestByReservation({
      id: service.id,
      service_request_id: service.service_request_id,
      reservation_id: service.reservation_id,
      status: status,
    });
    if (response?.error) {
      openSnackbar(response.error as string, "error");
      return false;
    }
    refetch();
  };

  const handleCompletedCharge = async (
    service: IServiceRequestResponse | null
  ) => {
    if (!service) return false;
    const response = await updateServiceRequestByReservation({
      id: service.id,
      service_request_id: service.service_request_id,
      reservation_id: service.reservation_id,
      status: "COMPLETED",
    });
    if (response?.error) {
      openSnackbar(response.error as string, "error");
      return false;
    }
    refetch();
    refreshReservation?.();
  };

  const serivceRequestListOption = useMemo(() => {
    return (serivceRequestList ?? []).map((option) => ({
      ...option,
      label: serviceRequests?.some(
        (req) => req.service_request.id === option.id
      )
        ? `${option.request} - $${option.rate}`
        : `${option.request} - $${option.rate}`,
    }));
  }, [serivceRequestList, serviceRequests]);

  return (
    <ReservationDetailBox
      label="Guest Request"
      isContentRemovePending={true}
      isLoading={isLoading}
      actions={[
        {
          label: "Add",
          onClick: handleOpenNewServiceModal,
        },
      ]}
    >
      <Grid container spacing={2} p={2}>
        {isLoading ? (
          Array.from(new Array(3)).map((_, index) => (
            <Grid item xs={12} key={index}>
              <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
                <CardContent>
                  <Skeleton variant="text" width="80%" height={24} />
                  <Skeleton variant="text" width="60%" height={20} />
                  <Skeleton variant="rectangular" width="100%" height={40} />
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : serviceRequests && serviceRequests.length > 0 ? (
          (serviceRequests ?? []).map(
            (request: IServiceRequestResponse, index) => {
              const selectedPostingCode = (postingCodes ?? []).find(
                (a) => a.id === request.service_request.posting_code_id
              );

              return (
                <Grid item xs={12} key={index}>
                  <Card sx={{ boxShadow: 3, borderRadius: 2, padding: "7px" }}>
                    <CardContent>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography variant="body1">
                          <strong>{request.service_request?.request}</strong> -
                          ${request.service_request.rate}
                        </Typography>
                        <Box display="flex" gap={0}>
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenStatusModal(request)}
                            sx={{ padding: "4px" }}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            color="error"
                            aria-label="delete"
                            onClick={() => handleOpenDeleteModal(request)}
                            sx={{ padding: "4px" }}
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </Box>

                      <Typography variant="body2" color="text.secondary">
                        {`${selectedPostingCode?.code} - ${selectedPostingCode?.name}`}{" "}
                        <span style={{ float: "right" }}>
                          <Chip
                            label={
                              request.status === "UNABLE_TO_COMPLETE"
                                ? "UNABLE TO COMPLETE"
                                : request.status
                            }
                            onClick={() => handleUpdateStatus(request)}
                            color={
                              request.status === "PENDING"
                                ? "warning"
                                : request.status === "COMPLETED"
                                  ? "success"
                                  : request.status === "UNABLE_TO_COMPLETE"
                                    ? "error"
                                    : request.status === "CANCEL"
                                      ? "default"
                                      : "info"
                            }
                            size="small"
                          />
                        </span>
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            }
          )
        ) : (
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary" align="center">
              No service requests found.
            </Typography>
          </Grid>
        )}
      </Grid>
      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        open={openDeleteServiceRequestDialog}
        title="Confirm Deletion"
        description="Are you sure you want to unlink this guest request?"
        buttons={[
          { label: "No", onClick: handleCloseDeleteServiceRequestDialog },
          {
            label: isDeleting ? "Loading..." : "Yes",
            onClick: () => !isDeleting && deleteServiceRequest(),
          },
        ]}
        onClose={handleCloseDeleteServiceRequestDialog}
      />

      {/* Change Guest Request Modal */}
      <Modal
        open={openServiceRequestModal}
        title={`Change Guest Request`}
        size="xs"
        onClose={handleCloseServiceRequestModal}
        isHideCloseButton={true}
        buttons={[
          {
            label: "Change",
            variant: "contained",
            isLoading: isUpdating,
            onClick: handleSave,
          },
          {
            label: "Close",
            onClick: handleCloseServiceRequestModal,
          },
        ]}
      >
        {/** Change Guest Request Dropdown */}
        <Box mt={2}>
          <Autocomplete
            options={serivceRequestListOption}
            getOptionLabel={(option) => option.label}
            getOptionDisabled={(option) =>
              (serviceRequests ?? []).some(
                (a) => a.service_request.id === option.id
              )
            }
            onChange={(_, newValue) => setNewServiceRequest(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select a Guest Request"
                variant="outlined"
              />
            )}
          />
        </Box>
      </Modal>

      {/* Add New Guest Request Modal */}
      <Modal
        open={openAddServiceRequestModal}
        title={`Add New Guest Request`}
        size="xs"
        onClose={() => setOpenAddServiceRequestModal(false)}
        isHideCloseButton={true}
        buttons={[
          {
            label: "Close",
            onClick: () => setOpenAddServiceRequestModal(false),
          },
          {
            label: "Add",
            variant: "contained",
            onClick: handleNewSave,
            isLoading: isAdding,
          },
        ]}
      >
        {/** Add New Service Request Dropdown */}
        <Box mt={2}>
          {/* Conditional Note */}
          {serivceRequestListOption.length === 0 &&
            (serivceRequestList ?? []).length > 0 && (
              <Alert severity="info">
                You have already added all service request.
              </Alert>
            )}
          <Autocomplete
            options={serivceRequestListOption}
            getOptionLabel={(option) => option.label}
            onChange={(_, newValue) => setNewServiceRequest(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select a Service Request"
                variant="outlined"
              />
            )}
          />
        </Box>
      </Modal>

      {/* Change Status Modal */}
      <ChangeStatusModal
        onClose={handleCloseStatusModal}
        open={openStatusModal}
        refetch={() => refetch()}
        serviceRequest={selectedService}
        key={"serviceRequest"}
      />

      {reservationFolios && reservationFolios?.length > 0 && (
        <AddServiceChargeModal
          folio={reservationFolios}
          reservation={viewState.reservation}
          onClose={() => {
            setShowAddCharge(false);
          }}
          serviceRequest={selectedService}
          open={showAddCharge}
          refreshData={() => handleCompletedCharge(selectedService)}
        />
      )}
    </ReservationDetailBox>
  );
};

export default ServiceRequest;
