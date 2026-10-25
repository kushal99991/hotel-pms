import React, { useEffect, useState } from "react";
import { CloseOutlined } from "@mui/icons-material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import PrimaryButton from "components/elements/Button/PrimaryButton";

export type FullScreenModalProps = {
  open: boolean;
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
  closeButtonLabel?: string; // Label for the close button
  primaryActionLabel?: string; // Label for the primary action button
  onPrimaryAction?: () => void; // Callback for the primary action
  isPrimaryButtonLoading?: boolean;
};

const FullScreenModal: React.FC<FullScreenModalProps> = ({
  title,
  open,
  onClose,
  closeButtonLabel = "Close",
  primaryActionLabel,
  onPrimaryAction,
  children,
  isPrimaryButtonLoading = false,
}) => {
  const [visible, setVisible] = useState(open);

  const toggleVisibility = (status: boolean) => {
    setVisible(status);
    if (!status) {
      onClose();
    }
  };

  useEffect(() => {
    toggleVisibility(open);
  }, [open]);

  return (
    <Dialog fullScreen open={visible} onClose={() => toggleVisibility(false)}>
      <DialogTitle>
        {title || ""}
        <Button
          onClick={() => toggleVisibility(false)}
          color="primary"
          sx={{ float: "right" }}
        >
          <CloseOutlined />
        </Button>
      </DialogTitle>
      <DialogContent>{children}</DialogContent>
      <DialogActions>
        {onPrimaryAction && (
          <PrimaryButton
            label={primaryActionLabel || "Confirm"}
            buttonStyles={{
              backgroundColor: "#32A1AE",
              color: "#FFFFFF",
              fontWeight: "bold",
            }}
            color="primary"
            isLoading={isPrimaryButtonLoading}
            type="button"
            loadingText="Loading..."
            onClick={onPrimaryAction}
          />
        )}
        <PrimaryButton
          label={closeButtonLabel || "Cancel"}
          buttonStyles={{
            backgroundColor: "#FFFFFF",
            color: "#000",
            fontWeight: "bold",
          }}
          color="primary"
          isLoading={false}
          type="button"
          onClick={() => toggleVisibility(false)}
        />
      </DialogActions>
    </Dialog>
  );
};

export default FullScreenModal;
