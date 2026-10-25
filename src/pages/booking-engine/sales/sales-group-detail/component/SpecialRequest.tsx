import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Button,
  styled,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from "@mui/material";
import { useSalesDashboardContext } from "contexts/SalesDashboardContext";
import { useUpdateSalesAccountGroupMutation } from "services/salesSlice";

const TextButton = styled(Button)({
  textTransform: "none",
  textDecoration: "underline",
  color: "#32A1AE",
});

const SpecialRequest: React.FC = () => {
  const { selectedGroup, setSelectedGroup } = useSalesDashboardContext();
  const [updateSalesAccountGroup, { isLoading }] = useUpdateSalesAccountGroupMutation();
  const [showEditModal, setShowEditModal] = useState(false);
  const [notesText, setNotesText] = useState(selectedGroup?.notes ?? "");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setNotesText(selectedGroup?.notes ?? "");
  }, [selectedGroup]);

  function handleEditClick() {
    setShowEditModal(true);
  }

  function handleCloseModal() {
    setNotesText(selectedGroup?.notes ?? "");
    setErrorMessage("");
    setShowEditModal(false);
  }

  function handleSaveClick() {
    if (!selectedGroup?.id) return;
    updateSalesAccountGroup({
      group_id: selectedGroup.id,
      notes: notesText,
    }).then((resp) => {
      if (!resp.error) {
        setSelectedGroup({ ...selectedGroup, notes: notesText });
        setShowEditModal(false);
      } else {
        setErrorMessage("Error saving notes. Please try again");
      }
    });
  }

  return (
    <Box display="flex" alignItems="center" justifyContent="space-between">
      <Typography variant="body1">
        {selectedGroup?.notes || "No notes specified"}
      </Typography>
      <TextButton onClick={handleEditClick}>Edit</TextButton>
      <Dialog
        open={showEditModal}
        onClose={handleCloseModal}
        PaperProps={{ sx: { width: 400 } }}
      >
        <DialogTitle>Edit Notes</DialogTitle>
        <DialogContent>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}
          <TextField
            value={notesText}
            onChange={(e) => setNotesText(e.target.value)}
            inputRef={(input) => input && input.focus()}
            onFocus={(e) =>
              e.currentTarget.setSelectionRange(
                e.currentTarget.value.length,
                e.currentTarget.value.length
              )
            }
            InputProps={{ sx: { minHeight: "100px", alignItems: "flex-start" } }}
            multiline
            fullWidth
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button color="primary" variant="outlined" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button color="primary" variant="contained" onClick={handleSaveClick} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SpecialRequest;
