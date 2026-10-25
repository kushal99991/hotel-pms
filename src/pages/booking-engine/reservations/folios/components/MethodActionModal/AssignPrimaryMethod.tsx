import React, { useState } from "react";
import { Alert, Button, Box, DialogActions, Typography } from "@mui/material";
import CustomDropdown from "components/widgets/CustomDropdown/CustomDropdown";
import { useUpdateFolioMutation } from "services/paymentsSlice";
import { folioOptions } from "constants/folios";
import { ISimpleFolio } from "types/payments";
import { IPaymentMethodResponse } from "types/reservationTypes";
import { PaymentParent } from "types/ui/payments";
import { paymentApiIdFromParent } from "utils/payments";

interface AssignPrimaryMethodProps {
  reservationId: number;
  folios?: ISimpleFolio[];
  currentFolioId: number;
  paymentMethod?: IPaymentMethodResponse;
  refreshFolios?: () => void;
  createLabel?: (folioLabel: string, isSelected: boolean) => string;
  onClose: () => void;
  closeButtonText?: string;
  parent?: PaymentParent;
}

const AssignPrimaryMethod: React.FC<AssignPrimaryMethodProps> = ({
  reservationId,
  paymentMethod,
  currentFolioId,
  folios,
  refreshFolios,
  createLabel,
  onClose,
  closeButtonText,
  parent,
}) => {
  const fullCurrentFolio = folios?.find((f) => f.id === currentFolioId);
  const [selectedFolio, setSelectedFolio] = useState<string>(
    fullCurrentFolio?.type ?? ""
  );
  const [updateFolioError, setUpdateFolioError] = useState("");
  const [updateFolio] = useUpdateFolioMutation();

  async function onUpdateFolio() {
    const fullSelectedFolio = folios?.find((f) => f.type === selectedFolio);
    if (!fullSelectedFolio) {
      return;
    }
    let updateBody = {
      folio_id: fullSelectedFolio?.id ?? -1,
      reservation_id:
        reservationId && reservationId > 0 ? reservationId : undefined,
      primary_payment_method_id: paymentMethod?.id ?? -1,
    };
    if (parent) {
      const idBodyPart = paymentApiIdFromParent(parent);
      updateBody = {
        ...updateBody,
        ...idBodyPart,
      };
    }
    const updateFolioResponse = await updateFolio(updateBody);
    if (updateFolioResponse.data) {
      refreshFolios?.();
      onClose();
    } else if (updateFolioResponse.error) {
      setUpdateFolioError(updateFolioResponse.error.toString());
    }
  }
  function getFolioOptions() {
    const createdFolioTypes = folios?.map((f) => f.type);
    const availableFolios = folioOptions.reduce((available: any[], ft: any) => {
      if (createdFolioTypes?.includes(ft.value)) {
        let typeLabel = ft.label;
        const isSelectedFolio = fullCurrentFolio?.type === ft.value;
        if (createLabel) {
          typeLabel = createLabel(ft.label, isSelectedFolio);
        }
        available.push({
          ...ft,
          label: typeLabel,
        });
      }
      return available;
    }, []);
    return availableFolios;
  }
  function handleSelection(evt: any) {
    setSelectedFolio(evt.target.value);
  }
  function handleCloseClick() {
    setUpdateFolioError("");
    onClose();
  }
  const opts = getFolioOptions();
  return (
    <Box>
      {updateFolioError && (
        <Alert
          sx={{ mb: 2 }}
          severity="error"
          onClose={() => {
            setUpdateFolioError("");
          }}
        >
          {`Error making card primary method for folio: ${updateFolioError}.`}
        </Alert>
      )}
      {opts.length === 1 && (
        <Box mb={2}>
          <Typography mb={1}>
            {`Make this payment method the primary method for Folio ${fullCurrentFolio?.type}?`}
          </Typography>
        </Box>
      )}
      {opts.length > 1 && (
        <Box mb={2}>
          <Typography mb={1}>
            Select a folio to make this card the primary method for:
          </Typography>
          <CustomDropdown
            defaultValue=""
            label=""
            options={getFolioOptions()}
            onChange={handleSelection}
            value={selectedFolio}
            fullWidth
          />
        </Box>
      )}
      <DialogActions>
        <Button variant="outlined" onClick={handleCloseClick}>
          {closeButtonText ?? "Close"}
        </Button>
        <Button
          variant="contained"
          onClick={onUpdateFolio}
          disabled={!selectedFolio}
        >
          Update
        </Button>
      </DialogActions>
    </Box>
  );
};

export default AssignPrimaryMethod;
