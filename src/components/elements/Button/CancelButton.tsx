import React from "react";
import Button from "@mui/material/Button";
import CancelIcon from "@mui/icons-material/Cancel";

interface CancelButtonProps {
  onClick: () => void;
}

const CancelButton: React.FC<CancelButtonProps> = ({ onClick }) => {
  return (
    <Button
      variant="outlined"
      color="error"
      startIcon={<CancelIcon />}
      onClick={onClick}
    >
      Cancel
    </Button>
  );
};

export default CancelButton;
