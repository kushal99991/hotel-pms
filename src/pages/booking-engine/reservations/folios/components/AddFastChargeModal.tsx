import React, { useState } from "react";
import { Moment } from "moment";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  Alert,
  Typography,
  Grid,
  Paper,
  TextField,
  InputAdornment,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CustomDropdown from "components/widgets/CustomDropdown/CustomDropdown";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import useAuth from "hooks/useAuth";
import { useGetFastChargesListQuery } from "services/fastChargeSlice";
import { ISimpleFolio } from "types/payments";
import { useMakeChargeMutation } from "services/paymentsSlice";
import { appConfig } from "config/app.config";
import { IPostingCode } from "types/financialSettingTypes";
import AddChargeIntendedDate from "./AddChargeIntendedDate";
import { IReservationResponse } from "types/reservationTypes";
import { getMoment } from "utils/helperFunctions/common";
import { ALL_FOLIOS_ID } from "constants/ui/folios";
import { apiAmountToNumber } from "utils/dataFormats";
import { PaymentParent } from "types/ui/payments";
import { PaymentParentEnum } from "constants/ui/payments";
import { paymentApiIdFromParent } from "utils/payments";

interface FastCharge {
  id: number;
  name: string;
  amount: number;
  posting_code: IPostingCode | null;
  description: string;
  max_qty: number;
}

interface LineItem {
  id: number;
  name: string;
  quantity: number;
  unitAmount: number;
  totalAmount: number;
  description: string;
  max_qty: number;
}

interface AddFastChargeModalProps {
  open: boolean;
  reservationId: number;
  reservation?: IReservationResponse;
  folio: ISimpleFolio;
  onClose: (addSuccess?: boolean) => void;
  refreshData: (refreshReservation?: boolean) => void;
  parent?: PaymentParent;
}

const AddFastChargeModal: React.FC<AddFastChargeModalProps> = ({
  open,
  onClose,
  reservationId,
  reservation,
  folio,
  refreshData,
  parent,
}) => {
  const { users, currentTimeZone } = useAuth();
  const [selectedId, setSelectedId] = useState(-1);
  const [error, setError] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [dateFromPicker, setDateFromPicker] = useState<Moment | undefined>(
    undefined
  );
  const { data: fastCharges } = useGetFastChargesListQuery(
    {
      limit: 10,
      page: 0,
      property_id: users?.defaultPropertyId,
    },
    {
      refetchOnMountOrArgChange: true,
      skip: false,
    }
  );
  const [makeCharge, { isLoading: chargeLoading }] = useMakeChargeMutation();
  const showSelectFolio = folio?.id === ALL_FOLIOS_ID;
  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + item.totalAmount, 0);
  const taxRate = 0.0; // Example tax rate of 32.5% based on the screenshot
  const taxes = subtotal * taxRate;
  const total = subtotal + taxes;

  const handleCloseClick = (successfulAdd?: boolean) => {
    setError("");
    setDateFromPicker(undefined);
    setLineItems([]);
    onClose?.(successfulAdd);
  };

  const handleAddItem = (fastCharge: FastCharge) => {
    // Find if the item already exists in the line items
    const existingItemIndex = lineItems.findIndex(
      (item) => item.id === fastCharge.id
    );

    if (existingItemIndex >= 0) {
      // Item exists, check if we can increment quantity
      const existingItem = lineItems[existingItemIndex];

      if (existingItem.quantity < fastCharge.max_qty) {
        // Can increment quantity
        const updatedLineItems = [...lineItems];
        updatedLineItems[existingItemIndex] = {
          ...existingItem,
          quantity: existingItem.quantity + 1,
          totalAmount: (existingItem.quantity + 1) * existingItem.unitAmount,
        };
        setLineItems(updatedLineItems);
      }
    } else {
      // Item doesn't exist, add it
      setLineItems([
        ...lineItems,
        {
          id: fastCharge.id,
          name: fastCharge.name,
          quantity: 1,
          unitAmount: apiAmountToNumber(fastCharge.amount),
          totalAmount: apiAmountToNumber(fastCharge.amount),
          description: fastCharge.description,
          max_qty: fastCharge.max_qty,
        },
      ]);
    }
  };

  const handleRemoveItem = (itemId: number) => {
    setLineItems(lineItems.filter((item) => item.id !== itemId));
  };

  // New function to increment quantity
  const handleIncrementQuantity = (itemId: number) => {
    const updatedLineItems = lineItems.map((item) => {
      if (item.id === itemId && item.quantity < item.max_qty) {
        const newQuantity = item.quantity + 1;
        return {
          ...item,
          quantity: newQuantity,
          totalAmount: newQuantity * item.unitAmount,
        };
      }
      return item;
    });
    setLineItems(updatedLineItems);
  };

  // New function to decrement quantity
  const handleDecrementQuantity = (itemId: number) => {
    const updatedLineItems = lineItems.map((item) => {
      if (item.id === itemId && item.quantity > 1) {
        const newQuantity = item.quantity - 1;
        return {
          ...item,
          quantity: newQuantity,
          totalAmount: newQuantity * item.unitAmount,
        };
      }
      return item;
    });
    setLineItems(updatedLineItems);
  };

  const handleSubmit = async () => {
    if (lineItems.length === 0) {
      setError("Please select at least one charge");
      return;
    } else if (showSelectFolio && selectedId === -1) {
      setError("Please select a folio to attach the charge(s) to");
      return;
    }

    let hasError = false;
    let errorMessage = "";

    // Process each line item
    for (const item of lineItems) {
      // Find the original fast charge to get the posting_code_id
      const fastCharge = fastCharges?.find((fc) => fc.id === item.id);

      if (!fastCharge) {
        hasError = true;
        errorMessage = "Failed to find posting code for charge";
        break;
      }
      // ensure date sending is between start date and end date - 1
      const todayMoment = getMoment("", currentTimeZone);
      let intendedDate = todayMoment;
      if (parent?.type === PaymentParentEnum.RESERVATION || !!reservation) {
        if (dateFromPicker) {
          intendedDate = dateFromPicker;
        } else {
          const startMoment = getMoment(
            `${reservation!.start_date}T00:00`,
            currentTimeZone,
            true
          );
          const endMoment = getMoment(
            `${reservation?.end_date}T23:59`,
            currentTimeZone,
            true
          );
          if (todayMoment.isBefore(startMoment, "day")) {
            intendedDate = startMoment;
          } else if (todayMoment.isSameOrAfter(endMoment, "day")) {
            intendedDate = endMoment.subtract(1, "day");
          }
        }
      }
      const fId = showSelectFolio ? selectedId : folio.id;
      let makeChargeBody = {
        description: item.description,
        folio_id: fId,
        reservation_id:
          reservationId && reservationId > 0 ? reservationId : undefined,
        amount: item.totalAmount, // Total amount (quantity * unit price)
        posting_code_id: Number(fastCharge.posting_code?.id), // The posting code ID from the original fast charge
        date: intendedDate.format(appConfig.dateApiFormat),
      };
      if (parent) {
        const idBodyPart = paymentApiIdFromParent(parent, {
          sales_group: "group_id",
        });
        makeChargeBody = {
          ...makeChargeBody,
          ...idBodyPart,
        };
      }
      // Call makeCharge once per line item with the total amount
      const chargeResponse = await makeCharge(makeChargeBody);

      if (!chargeResponse?.data?.id) {
        hasError = true;
        errorMessage =
          chargeResponse.error?.toString() || "Failed to add charge";
        break;
      }
    }

    if (hasError) {
      setError(errorMessage);
      return;
    }

    // If all charges were added successfully
    const refreshReservation = folio.id === ALL_FOLIOS_ID;
    refreshData(refreshReservation);
    handleCloseClick(true);
  };

  function handleIntendedChange(date: Moment) {
    setDateFromPicker(date);
  }

  function handleFolioChange(evt: any) {
    const value = evt.target.value;
    setError("");
    setSelectedId(+value);
  }

  function makeFolioOptions() {
    return (reservation?.folios ?? []).map((f) => ({
      value: f.id.toString(),
      label: `Folio ${f.type}`,
    }));
  }

  const folioOptions = showSelectFolio ? makeFolioOptions() : [];
  return (
    <Dialog
      open={open}
      onClose={() => handleCloseClick()}
      PaperProps={{ sx: { width: "500px" } }}
    >
      <DialogTitle>FAST POST</DialogTitle>
      <DialogContent>
        <Box>
          {error && (
            <Alert sx={{ mb: 2 }} severity="error" onClose={() => setError("")}>
              {`Error adding charge: ${error}`}
            </Alert>
          )}

          {/* Fast Charge Buttons */}
          <Grid container spacing={2} mb={2}>
            {fastCharges?.map((fastCharge) => (
              <Grid
                item
                // Dynamically adjust grid size based on button count
                xs={12}
                sm={fastCharges.length <= 3 ? 6 : 4}
                md={
                  fastCharges.length <= 4 ? 6 : fastCharges.length <= 6 ? 4 : 3
                }
                key={fastCharge.id}
              >
                <Tooltip title={fastCharge.name} placement="top">
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{
                      backgroundColor: "#222",
                      color: "white",
                      "&:hover": { backgroundColor: "#444" },
                      textTransform: "none",
                      borderRadius: 1,
                      padding: "10px 20px",
                      height: "42px", // Fixed height for consistency
                      position: "relative", // For absolute positioning of price
                    }}
                    onClick={() => handleAddItem(fastCharge)}
                    disabled={
                      lineItems.find((item) => item.id === fastCharge.id)
                        ?.quantity === fastCharge.max_qty
                    }
                  >
                    <Box
                      sx={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: "medium",
                          fontSize: "15px",
                          maxWidth: "65%", // Limit text width to make room for price
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          textAlign: "left",
                        }}
                      >
                        {fastCharge.name}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: "bold",
                          fontSize: "15px",
                          marginLeft: "8px",
                        }}
                      >
                        ${apiAmountToNumber(fastCharge.amount).toFixed(2)}
                      </Typography>
                    </Box>
                  </Button>
                </Tooltip>
              </Grid>
            ))}
          </Grid>

          {/* Pending Charges Table */}
          <Box sx={{ mb: 3 }}>
            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{ boxShadow: "none" }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Pending to Add</TableCell>
                    <TableCell align="center">QTY.</TableCell>
                    <TableCell align="right">AMOUNT</TableCell>
                    <TableCell align="right">ACTIONS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lineItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell align="center">
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={() => handleDecrementQuantity(item.id)}
                            disabled={item.quantity <= 1}
                            sx={{
                              padding: "2px",
                              backgroundColor: "#f5f5f5",
                              "&:hover": { backgroundColor: "#e0e0e0" },
                            }}
                          >
                            <RemoveIcon fontSize="small" />
                          </IconButton>
                          <Typography sx={{ mx: 2 }}>
                            {item.quantity}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleIncrementQuantity(item.id)}
                            disabled={item.quantity >= item.max_qty}
                            sx={{
                              padding: "2px",
                              backgroundColor: "#f5f5f5",
                              "&:hover": { backgroundColor: "#e0e0e0" },
                            }}
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        ${item.totalAmount.toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Remove item">
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveItem(item.id)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                  {lineItems.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No items selected
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
          {showSelectFolio && (
            <Box mb={2}>
              <CustomDropdown
                label={"Folio"}
                placeholder="Choose folio "
                disabled={folioOptions.length < 1}
                options={folioOptions}
                onChange={handleFolioChange}
                value={selectedId > 0 ? selectedId.toString() : ""}
                defaultValue=""
                fullWidth
                aria-label="Select Folio to Post to"
                data-testid="fast-charge-folio-select-dropdown"
              />
            </Box>
          )}
          <Box mb={2}>
            <AddChargeIntendedDate
              reservation={reservation}
              intendedDate={dateFromPicker}
              onDateChange={handleIntendedChange}
            />
          </Box>

          {/* Amount Summary */}
          <Grid container spacing={2} alignItems="center" sx={{ mb: 1 }}>
            <Grid item xs={4}>
              <Typography>Amount:</Typography>
            </Grid>
            <Grid item xs={4}></Grid>

            <Grid item xs={4}>
              <TextField
                disabled
                value={subtotal.toFixed(2)}
                fullWidth
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                  readOnly: true,
                }}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2} alignItems="center" sx={{ mb: 1 }}>
            <Grid item xs={4}>
              <Typography>Taxes:</Typography>
            </Grid>
            <Grid item xs={8}>
              <Typography align="right">${taxes.toFixed(2)}</Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <Grid item xs={4}>
              <Typography>Total:</Typography>
            </Grid>
            <Grid item xs={8}>
              <Typography align="right" variant="h6">
                ${total.toFixed(2)}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => handleCloseClick()}
          sx={{ textTransform: "uppercase" }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={lineItems.length === 0 || chargeLoading}
          sx={{
            textTransform: "uppercase",
            backgroundColor: "#222",
            "&:hover": { backgroundColor: "#444" },
          }}
        >
          Add Charge
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddFastChargeModal;
