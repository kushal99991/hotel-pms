import React from "react";
import { Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import UpdateSetting from "./UpdateSetting";

interface UpdateSettingModalProps {
  open: boolean;
  onClose: () => void;
  settingId: number | null;
}

const UpdateSettingModal: React.FC<UpdateSettingModalProps> = ({
  open,
  onClose,
  settingId,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontSize: "1.5rem", fontWeight: "bold", pb: 1 }}>
        Update Event
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: "grey.500",
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {settingId && <UpdateSetting onClose={onClose} settingId={settingId} />}
      </DialogContent>
    </Dialog>
  );
};

export default UpdateSettingModal;
