import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  Typography,
  Divider,
  TextField,
  MenuItem,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import StarIcon from "@mui/icons-material/Star";
import AddIcon from "@mui/icons-material/Add";
import React, { useState } from "react";

interface PaymentMethod {
  id: string;
  type: string;
  label: string;
  expiry?: string;
  isDefault: boolean;
}

interface PostPaymentModalProps {
  open: boolean;
  onClose: () => void;
}

const paymentOptions = [
  "Credit Card",
  "Cash",
  "ACH / Wire Transfer",
  "Check",
  "Money Order",
];

const PostPaymentModal: React.FC<PostPaymentModalProps> = ({
  open,
  onClose,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: "1",
      type: "Credit Card",
      label: "Discover *9424",
      expiry: "2/30",
      isDefault: true,
    },
  ]);

  const handleAddPaymentMethod = () => {
    if (!selectedMethod) return;
    const newMethod: PaymentMethod = {
      id: `${Date.now()}`,
      type: selectedMethod,
      label: selectedMethod,
      expiry: "",
      isDefault: false,
    };
    setPaymentMethods((prev) => [...prev, newMethod]);
    setSelectedMethod("");
  };

  const handleDelete = (id: string) => {
    setPaymentMethods((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Payment Methods
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {paymentMethods.map((method, index) => (
          <React.Fragment key={method.id}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              py={1.5}
            >
              <Box display="flex" alignItems="center" gap={1}>
                {/* Add icon based on method type if needed */}
                <Typography fontWeight="bold">{method.label}</Typography>
                {method.expiry && (
                  <Typography variant="body2" color="text.secondary">
                    Expires {method.expiry}
                  </Typography>
                )}
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                {method.isDefault && (
                  <StarIcon fontSize="small" color="primary" />
                )}
                <IconButton onClick={() => handleDelete(method.id)}>
                  <DeleteIcon color="error" />
                </IconButton>
              </Box>
            </Box>
            {/* Divider only between items, not after the last */}
            {index < paymentMethods.length - 1 && <Divider />}
          </React.Fragment>
        ))}

        <Divider sx={{ my: 2 }} />

        <Box display="flex" gap={2} alignItems="center">
          <TextField
            select
            size="small"
            label="Select Payment Type"
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            sx={{ flex: 1 }}
          >
            {paymentOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddPaymentMethod}
          >
            Add Payment Method
          </Button>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          display: "flex",
          justifyContent: "space-between",
          px: 3,
          py: 2,
        }}
      >
        <Button variant="contained" color="primary">
          Save
        </Button>
        <Button variant="contained" color="success">
          Post Payment
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PostPaymentModal;
