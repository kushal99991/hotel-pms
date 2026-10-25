import React, { useState } from "react";
import moment from "moment";
import { appConfig } from "config/app.config";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  TableContainer,
  TableBody,
  Table,
  TableHead,
  TableRow,
  TableCell,
  Typography,
  Alert,
} from "@mui/material";
import { useDeleteChargeMutation } from "services/paymentsSlice";
import { currencyString } from "utils/helperFunctions/numbers";
import { IChargeResponse } from "types/charges";
import { apiAmountToNumber } from "utils/dataFormats";

interface CancelChargeModalProps {
  open: boolean;
  charge?: IChargeResponse;
  onClose: (addSuccess?: boolean) => void;
  refreshData: () => void;
}

const CancelChargeModal: React.FC<CancelChargeModalProps> = ({
  open,
  onClose,
  charge,
  refreshData,
}) => {
  const [deleteCharge, { isLoading: deleteProcessing }] =
    useDeleteChargeMutation();
  const [error, setError] = useState("");

  const handleCancelClick = async () => {
    const chargeResponse = await deleteCharge({
      charge_id: charge?.id || -1,
    });
    if (chargeResponse && !chargeResponse.error) {
      refreshData();
      handleCloseClick();
    } else if (chargeResponse?.error) {
      setError(chargeResponse.error.toString());
    }
  };

  function handleCloseClick(successfulAdd?: boolean) {
    setError("");
    onClose?.(successfulAdd);
  }

  return (
    <Dialog
      open={open}
      onClose={() => handleCloseClick()}
      PaperProps={{ sx: { width: "700px" } }}
    >
      <DialogTitle mb={3}>Cancel Charge</DialogTitle>
      <DialogContent>
        <Box>
          {error && (
            <Alert
              sx={{ mb: 2 }}
              severity="error"
              onClose={() => {
                setError("");
              }}
            >
              {`Error deleting charge: ${error}.`}
            </Alert>
          )}
          <Box>
            <Typography component="span">{`Cancel this charge of `}</Typography>
            <Typography component="span" fontWeight="bold">
              {currencyString(apiAmountToNumber(charge?.amount))}
            </Typography>
            <Typography component="span">?</Typography>
          </Box>
          <TableContainer
            sx={{ backgroundColor: "white", borderRadius: "3px" }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Code/Description</TableCell>
                  <TableCell align="center">Department</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>
                    {moment(charge?.date || "").format(
                      appConfig.displayDateFormat
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      {`${charge?.posting_code.name?.toLocaleUpperCase()} - ${charge?.posting_code?.code}`}
                    </div>
                    <Typography fontSize="0.75rem">
                      {charge?.description}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {charge?.posting_code?.department.name}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </DialogContent>
      <DialogActions
        sx={{ p: 3, display: "flex", justifyContent: "space-between" }}
      >
        <Button
          onClick={() => {
            handleCloseClick();
          }}
          color="primary"
        >
          Close
        </Button>
        <Button
          onClick={handleCancelClick}
          variant="contained"
          disabled={deleteProcessing}
          color="error"
        >
          Cancel Charge
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CancelChargeModal;
