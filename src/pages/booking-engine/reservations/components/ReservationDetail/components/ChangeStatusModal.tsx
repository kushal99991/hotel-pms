import React, { useMemo, useState, useEffect } from "react";
import {
  Box,
  TextField,
  Autocomplete,
  Alert,
  Typography,
  Button,
} from "@mui/material";
import Modal from "components/widgets/ModalWindows/Modal";
import { IServiceRequestResponse } from "types/serviceRequestTypes";
import useSnackbar from "hooks/useSnackbar";
import { useUpdateServiceRequestByReservationMutation } from "services/serviceRequestSlice";
import AddServiceChargeModal from "./AddServiceChargeModal";
import { useGetFoliosQuery } from "services/paymentsSlice";
import { useReservationDetails } from "contexts/ReservationDetailsContext";
import useAuth from "hooks/useAuth";

interface IStatusOption {
  label: string;
  id: string;
}

interface ChangeStatusModalProps {
  open: boolean;
  onClose: () => void;
  serviceRequest: IServiceRequestResponse | null;
  refetch: () => void;
}

const ChangeStatusModal: React.FC<ChangeStatusModalProps> = ({
  open,
  onClose,
  serviceRequest,
  refetch,
}) => {
  const { openSnackbar } = useSnackbar();
  const { viewState, refreshReservation } = useReservationDetails();
  const { users } = useAuth();
  const [isAddInFolio, setIsAddInFolio] = useState<boolean>(false);
  const [showAddCharge, setShowAddCharge] = useState<boolean>(false);
  const [newStatus, setNewStatus] = useState<IStatusOption | null>(null);
  const [comment, setComment] = useState<string>(""); // New state to handle comment input
  const [updateServiceRequestByReservation, { isLoading }] =
    useUpdateServiceRequestByReservationMutation();
  const { data: reservationFolios } = useGetFoliosQuery({
    reservation_id: viewState.reservation?.id ?? 0,
  });

  const handleCloseStatusModal = () => {
    setNewStatus(null);
    setIsAddInFolio(false);
    setShowAddCharge(false);
    setComment(""); // Reset comment when closing modal
    onClose();
  };

  const handleStatusChange = async () => {
    if (!serviceRequest || !newStatus) {
      openSnackbar("Please select a valid service request and status", "error");
      return;
    }

    let reservationComment = "";
    // Add comment to reservation if comment is provided (optional for all statuses)
    if (comment) {
      const userName =
        `${users?.firstName ?? ""} ${users?.lastName ?? ""}` || "User";
      if (newStatus.id === "UNABLE_TO_COMPLETE") {
        reservationComment = `PMS - Service Req (${serviceRequest?.service_request?.request}) unable to complete, ${userName}: ${comment}`;
      } else {
        reservationComment = `PMS - Service Req (${serviceRequest?.service_request?.request}) status changed to ${newStatus.label}, ${userName}: ${comment}`;
      }
    }

    const response = await updateServiceRequestByReservation({
      id: serviceRequest.id,
      service_request_id: serviceRequest.service_request_id,
      reservation_id: serviceRequest.reservation_id,
      status: newStatus.id,
      comment: reservationComment,
    });
    if (response?.error) {
      openSnackbar(response.error as string, "error");
      return;
    }
    refetch();
    refreshReservation?.();
    openSnackbar("Service Request status updated successfully!", "success");
    handleCloseStatusModal();
  };

  const handleYesClick = () => {
    setShowAddCharge(true);
  };

  const isDisplayAlert = useMemo(() => {
    if (!newStatus || newStatus.id === serviceRequest?.status || isAddInFolio) {
      return false;
    }
    if (newStatus && newStatus.id === "UNABLE_TO_COMPLETE") return false;
    return (
      newStatus.id === "UNABLE_TO_COMPLETE" ||
      (newStatus.id === "COMPLETED" &&
        Number(serviceRequest?.service_request?.rate ?? 0) > 0)
    );
  }, [newStatus, serviceRequest, isAddInFolio]);

  const statusOptions: IStatusOption[] = useMemo(() => {
    if (serviceRequest?.status === "UNABLE_TO_COMPLETE") {
      return [{ label: "Re-Open", id: "PENDING" }];
    }
    if (serviceRequest?.status === "COMPLETED") {
      return [
        { label: "Re-Open", id: "PENDING" },
        { label: "Unable To Complete", id: "UNABLE_TO_COMPLETE" },
      ];
    }
    if (serviceRequest?.status === "CANCEL") {
      return [
        { label: "Re-Open", id: "PENDING" },
        { label: "Unable To Complete", id: "UNABLE_TO_COMPLETE" },
      ];
    }
    return [
      { label: "Pending", id: "PENDING" },
      { label: "Canceled", id: "CANCEL" },
      { label: "Complete", id: "COMPLETED" },
      { label: "Unable To Complete", id: "UNABLE_TO_COMPLETE" },
    ];
  }, [serviceRequest?.status]);

  // Auto-select UNABLE_TO_COMPLETE when modal opens and service request status is COMPLETED
  useEffect(() => {
    if (open && serviceRequest?.status === "COMPLETED" && !newStatus) {
      const unableToCompleteOption = statusOptions.find(
        (option) => option.id === "UNABLE_TO_COMPLETE"
      );
      if (unableToCompleteOption) {
        setNewStatus(unableToCompleteOption);
      }
    }
  }, [open, serviceRequest?.status, statusOptions]);

  return (
    <>
      <Modal
        open={open}
        title="Change Guest Request Status"
        size="xs"
        isHideCloseButton={true}
        onClose={handleCloseStatusModal}
        buttons={[
          { label: "Close", onClick: handleCloseStatusModal },
          {
            label: "Save",
            variant: "contained",
            isLoading: isLoading,
            isDisabled: isDisplayAlert,
            onClick: handleStatusChange,
          },
        ]}
      >
        <Box mt={2}>
          <Autocomplete
            options={statusOptions}
            getOptionLabel={(option) => option.label}
            onChange={(_, newValue) => setNewStatus(newValue)}
            value={newStatus}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select a Request Status"
                variant="outlined"
              />
            )}
          />
        </Box>

        {/* Show comment box for all statuses (optional) */}
        {newStatus && (
          <Box mt={2}>
            <TextField
              label="Enter Reason"
              variant="outlined"
              fullWidth
              multiline
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </Box>
        )}

        {isDisplayAlert && (
          <Box mt={3}>
            <Alert
              severity={newStatus?.id === "COMPLETED" ? "warning" : "info"}
            >
              {newStatus?.id === "COMPLETED" ? (
                <>
                  Changing status to{" "}
                  <Typography component="span" fontWeight="bold">
                    {newStatus.label}
                  </Typography>{" "}
                  will{" "}
                  <Typography component="span" fontWeight="bold" color="error">
                    add a charge to the folios
                  </Typography>
                  {serviceRequest?.service_request?.rate ? (
                    <>
                      {" "}
                      with an amount of{" "}
                      <Typography
                        component="span"
                        fontWeight="bold"
                        color="error"
                      >
                        ${serviceRequest?.service_request?.rate.toFixed(2)}
                      </Typography>
                      .
                    </>
                  ) : (
                    "."
                  )}
                  Please ensure that the charge has been added before
                  proceeding.
                  <Box mt={2} fontWeight="bold">
                    Are you sure you want to add this request to folio?
                  </Box>
                </>
              ) : newStatus?.id === "UNABLE_TO_COMPLETE" ? (
                <>
                  Changing status to{" "}
                  <Typography component="span" fontWeight="bold">
                    {newStatus.label}
                  </Typography>{" "}
                  will finalize this request, and no further changes will be
                  allowed.
                </>
              ) : (
                "You can update the request status here."
              )}
              {newStatus?.id === "COMPLETED" && (
                <Box mt={2} display="flex" justifyContent="center" pr="34px">
                  <Button
                    onClick={() => setNewStatus(null)}
                    variant="outlined"
                    sx={{ mr: 2 }}
                  >
                    No
                  </Button>
                  <Button onClick={handleYesClick} variant="outlined">
                    Yes
                  </Button>
                </Box>
              )}
            </Alert>
          </Box>
        )}

        {isAddInFolio && (
          <Box mt={3}>
            <Alert severity="success">
              Charge successfully added to folio!
            </Alert>
          </Box>
        )}
      </Modal>
      {reservationFolios && reservationFolios?.length > 0 && (
        <AddServiceChargeModal
          folio={reservationFolios}
          reservation={viewState.reservation}
          onClose={() => {
            setShowAddCharge(false);
          }}
          serviceRequest={serviceRequest}
          open={showAddCharge}
          refreshData={() => setIsAddInFolio(true)}
        />
      )}
    </>
  );
};

export default ChangeStatusModal;
