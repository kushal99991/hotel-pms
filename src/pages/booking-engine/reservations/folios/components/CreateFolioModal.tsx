import React, { useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import CustomDropdown from "components/widgets/CustomDropdown/CustomDropdown";
import { useMakeFolioMutation } from "services/paymentsSlice";
import { folioOptions } from "constants/folios";
import { ISimpleFolio } from "types/payments";

interface CreateFolioModalProps {
  reservationId: number;
  folios?: ISimpleFolio[];
  open: boolean;
  onClose: () => void;
}

const CreateFolioModal: React.FC<CreateFolioModalProps> = ({
  reservationId,
  folios,
  open,
  onClose,
}) => {
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [makeFolioError, setMakeFolioError] = useState("");
  const [makeFolio] = useMakeFolioMutation();

  async function onAddFolio() {
    const makeFolioResponse = await makeFolio({
      type: selectedOption,
      reservation_id: reservationId,
    });
    if (makeFolioResponse.data) {
      window.location.reload();
    } else if (makeFolioResponse.error) {
      setMakeFolioError(makeFolioResponse.error.toString());
    }
  }
  function getFolioOptions() {
    if (!folios) {
      return [];
    }
    const inUseFolios = folios.map((f) => f.type);
    const availableFolios = folioOptions.filter(
      (ft) => !inUseFolios.includes(ft.value)
    );
    return availableFolios;
  }
  function handleSelection(evt: any) {
    setSelectedOption(evt.target.value);
  }
  function handleMakeFolioClose() {
    setMakeFolioError("");
    onClose();
  }
  return (
    <Dialog
      open={open}
      onClose={handleMakeFolioClose}
      PaperProps={{
        sx: {
          width: "350px",
        },
      }}
    >
      <DialogTitle>Create Folio</DialogTitle>
      {makeFolioError && (
        <Alert
          sx={{ mb: 2 }}
          severity="error"
          onClose={() => {
            setMakeFolioError("");
          }}
        >
          {`Error creating folio: ${makeFolioError}.`}
        </Alert>
      )}
      <DialogContent>
        <CustomDropdown
          defaultValue=""
          label="Select a folio to create"
          options={getFolioOptions()}
          onChange={handleSelection}
          value={selectedOption}
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={handleMakeFolioClose}>
          Close
        </Button>
        <Button
          variant="contained"
          onClick={onAddFolio}
          disabled={!selectedOption}
        >
          Create Folio
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateFolioModal;
