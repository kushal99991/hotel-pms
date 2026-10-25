import React from "react";
import { Box, Button } from "@mui/material";
import SplitButton, {
  SplitButtonOption,
} from "components/elements/SplitButton/SplitButton";

interface TransactionsToolbarProps {
  onApplyPayment?: () => void;
  onUnapplyPayment?: () => void;
  onPostPayment?: () => void;
  onManualPost?: () => void;
  onViewInvoice?: () => void;
  onCreateInvoice?: () => void;
  onOpenMethods?: () => void;
}

const TransactionsToolbar: React.FC<TransactionsToolbarProps> = ({
  onApplyPayment,
  onUnapplyPayment,
  onPostPayment,
  onManualPost,
  onCreateInvoice,
  onOpenMethods,
}) => {
  const paymentOptions: SplitButtonOption[] = [
    {
      text: "Post Payment",
      onClick: onPostPayment,
      isMainOption: true,
      key: "post",
    },
    {
      text: "Apply Payment",
      onClick: onApplyPayment,
      key: "apply",
    },
    {
      text: "Unapply Payment",
      onClick: onUnapplyPayment,
      key: "unapply",
    },
    {
      text: "Manual Posting",
      onClick: onManualPost,
      key: "manual_post",
    },
  ];
  return (
    <Box>
      <Button
        variant="outlined"
        size="small"
        onClick={onOpenMethods}
        sx={{ mr: 2 }}
      >
        Payment Methods
      </Button>
      <Button
        variant="outlined"
        color="secondary"
        size="small"
        onClick={onCreateInvoice}
        sx={{ mr: 2 }}
      >
        Create Invoice
      </Button>
      <SplitButton
        options={paymentOptions}
        buttonGroupProps={{
          variant: "contained",
          color: "secondary",
          size: "small",
          sx: {
            "& .MuiButtonGroup-lastButton": {
              minWidth: "30px",
              padding: "3px",
            },
          },
        }}
      />
    </Box>
  );
};

export default TransactionsToolbar;
