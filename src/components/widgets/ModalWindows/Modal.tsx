import React, { useEffect, useState } from "react";
import { CloseOutlined } from "@mui/icons-material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  IconButton,
  ButtonPropsVariantOverrides,
  CircularProgress,
  SxProps,
  Theme,
} from "@mui/material";
import { OverridableStringUnion } from "@mui/types";

interface DialogButton {
  label: string;
  variant?: OverridableStringUnion<
    "text" | "outlined" | "contained",
    ButtonPropsVariantOverrides
  >;
  isLoading?: boolean;
  isDisabled?: boolean;
  onClick: () => void;
}

export type TModalProps = {
  open: boolean;
  title?: string;
  children: React.ReactNode;
  size: "xs" | "sm" | "md" | "lg" | "xl";
  onClose: () => void;
  buttons?: DialogButton[];
  isHideCloseButton?: boolean;
  style?: SxProps<Theme>;
};

const Modal: React.FC<TModalProps> = (props) => {
  const {
    title,
    open,
    onClose,
    size,
    buttons = [],
    isHideCloseButton = false,
    style,
  } = props;
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
    <Dialog
      maxWidth={size}
      fullWidth
      open={visible}
      onClose={() => toggleVisibility(false)}
      sx={style}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <span>{title || ""}</span>
          <IconButton onClick={() => toggleVisibility(false)} color="primary">
            <CloseOutlined />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>{props.children}</DialogContent>
      <DialogActions>
        {buttons.map((button, index) => (
          <Button
            key={index}
            variant={button?.variant}
            onClick={button.onClick}
            disabled={button?.isLoading || button?.isDisabled || false}
          >
            {button.isLoading ? <CircularProgress size={20} /> : button.label}
          </Button>
        ))}
        {!isHideCloseButton && (
          <Button onClick={() => toggleVisibility(false)} color="primary">
            Close
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default Modal;
