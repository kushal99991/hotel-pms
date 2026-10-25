import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  Typography,
  Alert,
} from "@mui/material";
import CustomDropdown from "components/widgets/CustomDropdown/CustomDropdown";
import { useMoveChargeToFolioMutation } from "services/paymentsSlice";
import { ISimpleFolio } from "types/payments";
import { folioOptions as baseFolioOptions } from "constants/folios";
import { pluralValue } from "utils/helperFunctions/common";
import { ALL_FOLIOS_KEY } from "constants/ui/folios";
import { PaymentParent } from "types/ui/payments";
import { paymentApiIdFromParent } from "utils/payments";

type MoveChargeOption = {
  label: string;
  value: string;
};
interface MoveChargeModalProps {
  open: boolean;
  reservationId: number;
  chargeIds: number[];
  currentFolio: ISimpleFolio;
  folios?: ISimpleFolio[];
  onClose: (addSuccess?: boolean, refreshFolios?: boolean) => void;
  refreshData: () => void;
  parent?: PaymentParent;
}

const MoveChargeModal: React.FC<MoveChargeModalProps> = ({
  open,
  onClose,
  folios,
  chargeIds,
  currentFolio,
  reservationId,
  refreshData,
  parent,
}) => {
  const [moveCharge, { isLoading: moveChargeLoading }] =
    useMoveChargeToFolioMutation();
  const [selectedFolioType, setSelectedFolioType] = useState("");
  const [selectedFolioExists, setSelectedFolioExists] = useState(true);
  const [error, setError] = useState("");

  const handleMoveClick = async () => {
    const moveItems = chargeIds.map((cid) => {
      let item = {
        folio_type_dest: selectedFolioType,
        reservation_id: reservationId,
        charge_id: cid,
        cascade_move: true,
      };
      if (parent) {
        const idBodyPart = paymentApiIdFromParent(parent, {
          sales_group: "group_id",
        });
        item = {
          ...item,
          ...idBodyPart,
        };
      }
      return item;
    });
    const chargeResponse = await moveCharge({
      items: moveItems,
    });
    if (chargeResponse?.data) {
      refreshData();
      handleCloseClick(true);
    } else if (chargeResponse.error) {
      setError(chargeResponse.error.toString());
    }
  };

  function handleCloseClick(successfulAdd?: boolean) {
    const folioRefreshNeeded = !selectedFolioExists;
    setError("");
    setSelectedFolioType("");
    setSelectedFolioExists(true);
    onClose?.(successfulAdd, folioRefreshNeeded);
  }

  function onFolioChange(evt: any) {
    const value = evt.target.value;
    const selectedFolio = (folios ?? []).filter((f) => f.type === value);
    setError("");
    if (selectedFolio.length) {
      setSelectedFolioType(selectedFolio[0].type);
      setSelectedFolioExists(true);
    } else {
      setSelectedFolioType(value);
      setSelectedFolioExists(false);
    }
  }
  function makeOptions() {
    const options = baseFolioOptions.reduce(
      (agg, fo) => {
        const usedFolioIdx = usedFolios.findIndex(
          (usedF) => usedF.type === fo.value
        );
        const folioInUse = usedFolioIdx > -1 ? usedFolios[usedFolioIdx] : null;
        if (folioInUse) {
          agg.existing.push({
            label: `Folio ${fo.value}`,
            value: fo.value,
          });
        } else if (!folioInUse) {
          agg.toBeCreated.push({
            label: `Folio ${fo.value} (created on move)`,
            value: fo.value,
          });
        }
        return agg;
      },
      {
        existing: [] as MoveChargeOption[],
        toBeCreated: [] as MoveChargeOption[],
      }
    );
    return [...options.existing, ...options.toBeCreated];
  }
  function sourceFoliosString() {
    if (currentFolio?.type === ALL_FOLIOS_KEY) {
      return "";
    }
    return ` from Folio ${currentFolio?.type}`;
  }
  const usedFolios = folios ?? [];
  const folioOptions = makeOptions();
  return (
    <Dialog
      open={open}
      onClose={() => handleCloseClick()}
      PaperProps={{ sx: { width: "400px" } }}
    >
      <DialogTitle mb={3}>Move Charge</DialogTitle>
      <DialogContent>
        <Box>
          {error && (
            <Alert
              sx={{ mb: 2 }}
              severity="error"
              onClose={() => {
                setError("");
              }}
            >
              {`Error moving charge: ${error}`}
            </Alert>
          )}
          <Typography>
            {`Move ${pluralValue(chargeIds.length, "charge", "charges")}${sourceFoliosString()} to:`}
          </Typography>
          <CustomDropdown
            label={""}
            placeholder="Choose folio to move to"
            disabled={folioOptions.length < 1}
            options={folioOptions}
            onChange={onFolioChange}
            value={selectedFolioType}
            defaultValue=""
            fullWidth
            aria-label="Select Folio to Move to"
            data-testid="move-charge-dropdown"
          />
          {!selectedFolioExists && (
            <Typography
              fontStyle="italic"
              fontSize="0.8rem"
              sx={{ color: "gray.primary", marginTop: 2 }}
            >
              {
                "When this charge is moved the destination folio will also be created"
              }
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions
        sx={{ p: 3, display: "flex", justifyContent: "space-between" }}
      >
        <Button
          onClick={() => {
            handleCloseClick();
          }}
          color="primary"
        >
          Cancel
        </Button>
        <Button
          onClick={handleMoveClick}
          variant="contained"
          disabled={moveChargeLoading}
        >
          Move Charge
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MoveChargeModal;
