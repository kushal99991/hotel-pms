import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Alert,
  Box,
  DialogContent,
  Typography,
  Button,
  DialogActions,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SimpleFoliosTable from "./SimpleFoliosTable";

import { useCreateInvoiceMutation } from "services/paymentsSlice";

import { AccountModalViewProps } from "types/ui/accounting";
import { GridRowSelectionModel } from "@mui/x-data-grid";
import { ICreateInvoiceBody } from "types/payments";
import { CreateInvoiceMethod, SMALLER_ROW_HEIGHT } from "constants/accounting";
import { apiAmountToNumber } from "utils/dataFormats";

const CreateInvoiceView: React.FC<AccountModalViewProps> = ({
  account,
  onClose,
  additionalProps,
}) => {
  const theme = useTheme();
  const [selectedView] = useState<"date" | "list">("list");
  const [resIds, setResIds] = useState<GridRowSelectionModel>([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [
    createInvoice,
    { data: createdInvoice, isLoading: createLoading, error },
  ] = useCreateInvoiceMutation();

  async function handleCreateInvoice() {
    if (!account?.folios?.length) {
      console.warn("No folio information provided in account.");
      return;
    }
    const folioIds = account.folios.reduce((ids: number[], folio) => {
      if (!folio.amount_needed_to_settle) {
        return ids;
      }
      if (apiAmountToNumber(folio.amount_needed_to_settle) <= 0) {
        // don't need to include any zero'd out folios
        return ids;
      }
      const folioResId = folio.payments?.[0]?.reservation_id;
      if (folioResId) {
        const isInSelectedRes = resIds.includes(folioResId);
        if (isInSelectedRes) {
          ids.push(folio.id);
        }
      }
      return ids;
    }, [] as number[]);
    if (folioIds.length !== resIds.length) {
      console.warn("Unmatched folios to reservations.");
      return;
    }
    const createInvoiceBody: ICreateInvoiceBody = {
      direct_billing_account_id: account?.id ?? -1,
      generation_method:
        selectedView === "date"
          ? CreateInvoiceMethod.RANGE
          : CreateInvoiceMethod.MANUAL,
    };
    if (selectedView === "list") {
      createInvoiceBody.folio_ids = folioIds;
    }
    const response = await createInvoice(createInvoiceBody);
    if (response.data) {
      setSuccessMessage(
        `Invoice ${response.data.id} successfully created! Click below to close.`
      );
    }
  }

  function handleFolioSelect(newIds: GridRowSelectionModel) {
    setResIds(newIds);
  }

  function handleCreateClick() {
    if (successMessage) {
      onClose?.(true);
      return;
    }
    handleCreateInvoice();
  }

  function getActionButtonText() {
    if (successMessage) {
      return "Close";
    }
    if (createLoading) {
      return "Creating... ";
    }
    return "Create Invoice";
  }

  const transactions = account?.lc_payments ?? [];
  return (
    <DialogContent {...additionalProps}>
      <Box textAlign="center">
        <Typography sx={{ my: 3 }}>
          Select folios to include in the invoice
        </Typography>
        <SimpleFoliosTable
          lcPayments={transactions}
          headerHeight={SMALLER_ROW_HEIGHT}
          rowHeight={SMALLER_ROW_HEIGHT}
          maxHeight={SMALLER_ROW_HEIGHT * 12}
          allowCheckboxSelect
          onRowSelected={handleFolioSelect}
          selectedIds={resIds}
          rowFilter={(row) => !!(row.balance && row.balance > 0)}
        />
      </Box>
      <Box mt={2} display="flex" justifyContent="flex-end">
        {successMessage && <Alert severity="success">{successMessage}</Alert>}
        {error && (
          <Alert severity="error">{error.message ?? error.toString()}</Alert>
        )}
      </Box>
      {successMessage && (
        <Box mt={0.5} textAlign="right">
          <Link
            to={`/booking-engine/accounting/invoices/${createdInvoice?.id}`}
            style={{
              textDecoration: "underline",
              color: theme.palette.secondary.main,
              fontSize: "0.875rem",
              marginTop: "8px",
            }}
          >
            {`View created invoice`}
          </Link>
        </Box>
      )}
      <DialogActions sx={{ justifyContent: "flex-end", mt: 3 }}>
        <Button variant="outlined" onClick={() => onClose?.(false)}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color={successMessage ? "primary" : "secondary"}
          onClick={handleCreateClick}
          disabled={resIds.length < 1 || createLoading}
        >
          {getActionButtonText()}
        </Button>
      </DialogActions>
    </DialogContent>
  );
};

export default CreateInvoiceView;
