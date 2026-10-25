import React from "react";
import { Box, Button, Dialog, DialogContent, Typography } from "@mui/material";
import KeyIcon from "@mui/icons-material/Key";
import CountdownSeconds from "components/elements/CountdownSeconds/CountdownSeconds";

interface GenerateCardModalProps {
  open: boolean;
  onCloseModal: (refreshData: boolean) => void;
}

const GenerateCardModal: React.FC<GenerateCardModalProps> = ({
  open,
  onCloseModal,
}) => {
  function handleCloseClick() {
    onCloseModal?.(false);
  }

  return (
    <Dialog open={open} onClose={handleCloseClick}>
      <DialogContent>
        <Box display="flex" flexDirection="column" alignItems="center">
          <KeyIcon sx={{ fontSize: "11rem", color: "secondary.main" }} />
          <Box
            display="flex"
            justifyContent="center"
            textAlign="center"
            width="80%"
            mb={3}
          >
            <Typography variant="h6" fontWeight="bold" component="div">
              Now that the guest has been checked in, generate a key card for
              them
            </Typography>
          </Box>
          <Typography
            variant="caption"
            fontStyle="italic"
            component="div"
            sx={{ color: "gray.main", display: "inline-flex" }}
          >
            Message will close in&nbsp;
            <CountdownSeconds
              duration={10}
              onCountdownComplete={handleCloseClick}
            />
          </Typography>
          <Button
            onClick={handleCloseClick}
            variant="outlined"
            sx={{ marginTop: 1 }}
          >
            Dismiss
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default GenerateCardModal;
