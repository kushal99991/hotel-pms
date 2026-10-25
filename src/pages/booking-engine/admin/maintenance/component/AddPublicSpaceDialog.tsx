import React, { useCallback, useEffect, useState, useMemo } from "react";
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import {
  useCreateSettingMutation,
  useLazyGetSettingByKeyQuery,
} from "services/settingSlice";
import useSnackbar from "hooks/useSnackbar";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import useAuth from "hooks/useAuth";

interface AddPublicSpaceDialogProps {
  onRefresh?: () => void;
}

const AddPublicSpaceDialog: React.FC<AddPublicSpaceDialogProps> = ({
  onRefresh,
}) => {
  const [open, setOpen] = useState(false);
  const [newPublicSpace, setNewPublicSpace] = useState("");

  const { openSnackbar } = useSnackbar();
  const { users } = useAuth();
  const propertyID = useMemo(() => {
    return users?.defaultPropertyId ?? 0;
  }, [users?.defaultPropertyId]);

  const [fetchSpaces, { data: publicSpaces }] = useLazyGetSettingByKeyQuery();
  const [createSetting, { isLoading }] = useCreateSettingMutation();

  useEffect(() => {
    if (open) {
      fetchSpaces({ key: "PUBLIC_SPACE", property_id: propertyID });
    }
  }, [open]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setNewPublicSpace("");
  };

  const handleCreateSetting = useCallback(async () => {
    const trimmedValue = newPublicSpace.trim();

    if (!trimmedValue) {
      openSnackbar("Please enter a public space name.", "warning");
      return;
    }

    const exists = publicSpaces?.some(
      (space) => space.value.toLowerCase() === trimmedValue.toLowerCase()
    );

    if (exists) {
      openSnackbar(`"${trimmedValue}" already exists.`, "error");
      return;
    }

    const response = await createSetting({
      key: "PUBLIC_SPACE",
      value: trimmedValue,
      info: `Public Space: ${trimmedValue}`,
      property_id: propertyID,
      is_public: true,
      type: "SELECTION",
    });

    if (response?.error) {
      openSnackbar(response.error as string, "error");
      return;
    }

    openSnackbar(`"${trimmedValue}" added successfully!`, "success");
    onRefresh?.();
    handleClose();
  }, [newPublicSpace, publicSpaces]);

  return (
    <>
      <IconButton
        aria-label="add-public-space"
        size="small"
        sx={{ mt: "4px" }}
        onClick={handleOpen}
      >
        <AddIcon fontSize="small" />
      </IconButton>

      <Dialog fullWidth maxWidth="xs" open={open} onClose={handleClose}>
        <DialogTitle>Add New Public Space</DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <TextField
              label="Public Space Name"
              fullWidth
              value={newPublicSpace}
              onChange={(e) => setNewPublicSpace(e.target.value)}
              placeholder="e.g., Lobby, Entry"
              autoFocus
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <PrimaryButton
            label="Add"
            onClick={handleCreateSetting}
            isLoading={isLoading}
          />
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddPublicSpaceDialog;
