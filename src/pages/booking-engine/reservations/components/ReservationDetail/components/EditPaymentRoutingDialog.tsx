import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
} from "@mui/material";
import { IReservationResponse } from "types/reservationTypes";
import { FolioTypes } from "constants/folios";
import useAuth from "hooks/useAuth";
import {
  useGetPostingCodeDepartmentGroupsQuery,
  useUpdatePaymentRoutingDeptTargetGroupMutation,
} from "services/postingCodeSlice";

interface RoutingOption {
  label: string;
  deptGroupName: string;
  folioType: FolioTypes;
}

const ROUTING_OPTIONS: RoutingOption[] = [
  { label: "Room and Tax - Folio D", deptGroupName: "Room and Tax", folioType: FolioTypes.D },
  { label: "All Charges - Folio D", deptGroupName: "All Charges", folioType: FolioTypes.D },
  { label: "Room and Tax - Folio I", deptGroupName: "Room and Tax", folioType: FolioTypes.I },
  { label: "All Charges - Folio A (default setting)", deptGroupName: "All Charges", folioType: FolioTypes.A },
];

function optionKey(option: RoutingOption): string {
  return `${option.deptGroupName}|${option.folioType}`;
}

function resolveCurrentOptionKey(reservation: IReservationResponse | null): string | null {
  const routing = reservation?.payment_routing;
  if (!routing) return null;
  return `${routing.target_dept_group.name}|${routing.folio}`;
}

interface EditPaymentRoutingDialogProps {
  open: boolean;
  onClose: () => void;
  reservation: IReservationResponse | null;
  onSuccess: () => void;
}

function EditPaymentRoutingDialog({
  open,
  onClose,
  reservation,
  onSuccess,
}: EditPaymentRoutingDialogProps) {
  const { users } = useAuth();
  const { data: departmentGroups } = useGetPostingCodeDepartmentGroupsQuery(
    { property_id: users?.defaultPropertyId },
    { skip: !users?.defaultPropertyId }
  );
  const [updatePaymentRouting, { isLoading }] =
    useUpdatePaymentRoutingDeptTargetGroupMutation();
  const [selectedKey, setSelectedKey] = useState<string | null>(
    resolveCurrentOptionKey(reservation)
  );
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (open) {
      setSelectedKey(resolveCurrentOptionKey(reservation));
      setErrorMessage("");
    }
  }, [open, reservation]);

  function handleSave() {
    const option = ROUTING_OPTIONS.find((o) => optionKey(o) === selectedKey);
    if (!option) return;
    const deptGroup = departmentGroups?.find((g) => g.name === option.deptGroupName);
    if (!deptGroup) return;

    updatePaymentRouting({
      posting_code_department_group_id: deptGroup.id,
      reservation_id: reservation?.id,
      folio_type: option.folioType,
    }).then((resp) => {
      if (!resp.error) {
        onSuccess();
        onClose();
      } else {
        let msg = "Error saving data. Please try again";
        if (resp.error.message) {
          msg = resp.error.message;
        } else if (resp.error) {
          msg = resp.error as string;
        }
        setErrorMessage(msg);
      }
    });
  }

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { minWidth: "400px" } }}>
      <DialogTitle>Edit Charges Routing</DialogTitle>
      <DialogContent>
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}
        <FormControl>
          <RadioGroup
            value={selectedKey ?? ""}
            onChange={(_, val) => setSelectedKey(val)}
          >
            {ROUTING_OPTIONS.map((option) => (
              <FormControlLabel
                key={optionKey(option)}
                value={optionKey(option)}
                control={<Radio />}
                label={option.label}
              />
            ))}
          </RadioGroup>
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ p: 3, justifyContent: "space-between" }}>
        <Button color="primary" variant="outlined" onClick={onClose}>
          Cancel
        </Button>
        <Button
          color="primary"
          variant="contained"
          onClick={handleSave}
          disabled={!selectedKey || isLoading}
        >
          {isLoading ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditPaymentRoutingDialog;
