import React from "react";
import {
  Typography,
  Grid,
  Button,
  Divider,
  Box,
  Link,
  styled,
} from "@mui/material";
import Label from "components/elements/Label/Label";
import { FolioTypes } from "constants/folios";
import { ISalesGroupDetail } from "types/salesTypes";

const TextButton = styled(Button)({
  textTransform: "none",
  textDecoration: "underline",
  color: "#32A1AE",
});

function getFolioLabel(folio: string | null | undefined): string {
  if (folio === FolioTypes.D) return "Direct Billing";
  if (folio === FolioTypes.A) return "IPO";
  return "--";
}

interface PaymentAndChargesProps {
  selectedGroup: ISalesGroupDetail | null;
}

const PaymentAndCharges: React.FC<PaymentAndChargesProps> = ({
  selectedGroup,
}) => {
  const paymentRouting = selectedGroup?.payment_routing ?? null;

  const paymentRoutingDisplay = paymentRouting
    ? `${getFolioLabel(paymentRouting.folio)} / ${paymentRouting.target_dept_group?.name ?? "--"}`
    : "--";

  return (
    <Grid container alignItems="stretch">
      {/* Left - Payment Section */}
      <Grid item xs={12} md={4} padding={2}>
        <Typography variant="subtitle1" fontWeight="bold" mb={1}>
          Payment
        </Typography>
        <Box display="flex" alignItems="center" mb={0.5}>
          <Label style={{ minWidth: 140, marginBottom: 0 }}>Card:</Label>
          <Typography>None</Typography>
        </Box>
        <Box display="flex" alignItems="center" mb={0.5}>
          <Label style={{ minWidth: 140, marginBottom: 0 }}>Exp Date:</Label>
          <Typography>--</Typography>
        </Box>
        <Box display="flex" alignItems="center" mb={0.5}>
          <Label style={{ minWidth: 140, marginBottom: 0 }}>
            Total Authorized:
          </Label>
          <Typography>--</Typography>
        </Box>

        <Box mt={2} display="flex" gap={1}>
          <Button variant="outlined" size="small">
            Collect Payment
          </Button>
          <TextButton size="small">Edit</TextButton>
        </Box>
      </Grid>

      {/* Middle - Group Payment & Routing */}
      <Grid item xs={12} md={3} padding={2}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
          <Typography variant="subtitle1" fontWeight="bold">
            Payment Routing
          </Typography>
          <TextButton size="small">Edit</TextButton>
        </Box>
        <Typography>{paymentRoutingDisplay}</Typography>
      </Grid>

      {/* Right - Charges Section */}
      <Grid
        item
        xs={12}
        md={5}
        padding={2}
        sx={{ borderLeft: { md: "1px solid #D6D6D6" } }}
      >
        <Typography variant="subtitle1" fontWeight="bold" mb={1}>
          Charges
        </Typography>

        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={0.5}
        >
          <Link href="#" underline="hover">
            Current Charges
          </Link>
          <Typography>--</Typography>
        </Box>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={0.5}
        >
          <Typography>Payment / Deposits:</Typography>
          <Typography>--</Typography>
        </Box>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={0.5}
        >
          <Typography>Refund Amt.:</Typography>
          <Typography>--</Typography>
        </Box>

        <Divider sx={{ my: 1 }} />

        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography fontWeight="bold">Current Balance</Typography>
          <Typography fontWeight="bold" color="error">
            --
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
};

export default PaymentAndCharges;
