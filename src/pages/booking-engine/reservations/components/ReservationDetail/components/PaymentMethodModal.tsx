import React, { useState, useEffect } from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  IconButton,
  Typography,
  Button,
} from "@mui/material";
import {
  Add,
  ArrowBack,
  DeleteOutline,
  StarPurple500,
} from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import {
  IPaymentMethodResponse,
  IReservationResponse,
} from "types/reservationTypes";
import CardLogo from "components/ui/CardLogo/CardLogo";
import { IFolioResponse } from "types/folios";
import CardListItem from "components/ui/CardListItem/CardListItem";
import { isValidMethod, primaryMethodsFromFolios } from "utils/payments";
import DeleteMethod from "pages/booking-engine/reservations/folios/components/MethodActionModal/DeleteMethod";
import AssignPrimaryMethod from "pages/booking-engine/reservations/folios/components/MethodActionModal/AssignPrimaryMethod";
import { FolioTypes } from "constants/folios";
import AddPaymentMethod from "components/ui/AddPaymentMethod/AddPaymentMethod";
import { getCardListDetailStrings } from "utils/paymentMethods";

enum SubViews {
  LIST = "list",
  ADD = "add",
  DELETE = "delete",
  PRIMARY = "primary",
}

interface PaymentMethodModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  folios: IFolioResponse[];
  paymentMethods: IPaymentMethodResponse[];
  hideDirectBillAccounts?: boolean;
  hideMakePrimaryAction?: boolean;
  maxListHeight?: number;
  // pass-through props to AddCard
  reservation: IReservationResponse | null;
  refreshData?: () => void;
  dbAccountId?: number;
}

const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({
  open,
  onClose,
  paymentMethods,
  folios,
  title,
  reservation,
  refreshData,
  dbAccountId,
  hideDirectBillAccounts,
  hideMakePrimaryAction,
  maxListHeight,
}) => {
  const noValidMethods = paymentMethods.every((p) => !isValidMethod(p));
  const [currentView, setCurrentView] = useState<SubViews>(
    noValidMethods ? SubViews.ADD : SubViews.LIST
  );
  const primaryPaymentMap = primaryMethodsFromFolios(folios);
  const [selectedMethod, setSelectedMethod] = useState<
    IPaymentMethodResponse | undefined
  >(undefined);
  const activeMethods = paymentMethods.filter((pm) => pm.future_use);
  useEffect(() => {
    const hasValidMethod = paymentMethods.some((p) => isValidMethod(p));
    if (!open && hasValidMethod && currentView === SubViews.ADD) {
      setCurrentView(SubViews.LIST);
    }
  }, [reservation?.payment_methods, paymentMethods, currentView, open]);
  function handleAddClick() {
    setCurrentView(SubViews.ADD);
  }
  function showListView() {
    setCurrentView(SubViews.LIST);
  }
  function handleCardAdded() {
    refreshData?.();
    showListView();
  }
  function handleDeleteClick(id: number) {
    return () => {
      const method = activeMethods.find((m) => m.id === id);
      if (method) {
        setSelectedMethod(method);
        setCurrentView(SubViews.DELETE);
      }
    };
  }
  function handlePrimaryClick(id: number) {
    return () => {
      const method = activeMethods.find((m) => m.id === id);
      if (method) {
        setSelectedMethod(method);
        setCurrentView(SubViews.PRIMARY);
      }
    };
  }
  function handleClose() {
    setSelectedMethod(undefined);
    setCurrentView(SubViews.LIST);
    onClose();
  }
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{ sx: { width: "600px", minHeight: "300px" } }}
    >
      <DialogTitle>{title ?? "Payment Methods"}</DialogTitle>
      <IconButton
        aria-label="close"
        onClick={handleClose}
        sx={(theme) => ({
          position: "absolute",
          right: 8,
          top: 8,
          color: theme.palette.grey[500],
        })}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent>
        {currentView === SubViews.ADD && (
          <AddPaymentMethod
            allowDirectBill={!hideDirectBillAccounts}
            onBackClick={showListView}
            addCardProps={{
              paymentMethods,
              reservation,
              onComplete: handleCardAdded,
            }}
            directBillProps={{
              reservationId: reservation?.id ?? -1,
              totalsData: { balance: 0 },
              paymentLabel: "Attach Direct Billing Account",
              onPaymentSuccessClick: handleCardAdded,
            }}
            dbAccountId={dbAccountId}
          />
        )}
        {currentView === SubViews.LIST && (
          <Box>
            <Box maxHeight={maxListHeight ?? 345} sx={{ overflowY: "scroll" }}>
              {activeMethods.map((p: IPaymentMethodResponse) => {
                if (!isValidMethod(p)) {
                  return null;
                }
                const actionsEnabled = !p.globally_avail;
                const { main, secondary } = getCardListDetailStrings(p);
                return (
                  <Grid
                    container
                    key={p.id}
                    flexWrap="nowrap"
                    alignItems="center"
                    borderBottom="1px solid"
                    borderColor="grey.500"
                    py={2}
                    sx={{
                      "&:first-of-type": {
                        borderTop: "1px solid",
                        borderColor: "grey.500",
                      },
                    }}
                  >
                    <Grid item mr={3}>
                      <CardLogo
                        isDirectBill={!!p.direct_billing_account_id}
                        cardType={p?.brand?.toString()}
                        paymentType={p?.payment_type}
                      />
                    </Grid>
                    <Grid item container direction="column">
                      <Grid item sx={{ textTransform: "capitalize" }}>
                        <Typography fontWeight="bold" fontSize="1rem">
                          {main}
                        </Typography>
                      </Grid>
                      {secondary && (
                        <Grid item>
                          <Typography fontSize="0.75rem" color="grey.700">
                            {secondary}
                          </Typography>
                        </Grid>
                      )}
                      {primaryPaymentMap[p.id] && (
                        <Grid item>
                          <Typography fontSize="0.75rem" color="success.main">
                            {`Primary payment for Folios: ${primaryPaymentMap[p.id].folios.join(", ")}`}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                    <Grid>
                      {actionsEnabled && (
                        <Box pl={1} display="flex">
                          {!hideMakePrimaryAction && (
                            <Button
                              aria-label="Make method a primary method"
                              onClick={handlePrimaryClick(p.id)}
                              sx={{
                                color: "secondary.main",
                                minWidth: "auto",
                                borderRadius: "50%",
                                padding: "6px",
                                mr: "4px",
                                fontSize: "18px",
                                "&:hover": {
                                  color: "white",
                                  backgroundColor: "secondary.main",
                                },
                              }}
                            >
                              <StarPurple500 fontSize="inherit" />
                            </Button>
                          )}
                          <Button
                            aria-label="Delete payment method"
                            onClick={handleDeleteClick(p.id)}
                            sx={{
                              color: "error.main",
                              minWidth: "auto",
                              borderRadius: "50%",
                              padding: "6px",
                              fontSize: "18px",
                              "&:hover": {
                                color: "white",
                                backgroundColor: "error.main",
                              },
                            }}
                          >
                            <DeleteOutline fontSize="inherit" />
                          </Button>
                        </Box>
                      )}
                    </Grid>
                  </Grid>
                );
              })}
            </Box>
            <Box textAlign="center" mt={3}>
              <Button
                onClick={handleAddClick}
                variant="outlined"
                startIcon={<Add />}
              >
                Add Payment Method
              </Button>
            </Box>
          </Box>
        )}
        {currentView === SubViews.DELETE && (
          <Box mt={-4}>
            <Box display="flex">
              <Box display="flex" alignItems="center">
                <IconButton aria-label="back" onClick={showListView}>
                  <ArrowBack />
                </IconButton>
              </Box>
              <Box ml={3} my={2}>
                <CardListItem
                  paymentMethod={selectedMethod}
                  primaryPaymentMap={{}}
                />
              </Box>
            </Box>
            <Box>
              <DeleteMethod
                onClose={showListView}
                refreshMethods={refreshData}
                paymentMethod={selectedMethod}
                closeButtonText="Back"
              />
            </Box>
          </Box>
        )}
        {currentView === SubViews.PRIMARY && (
          <Box mt={-4}>
            <Box display="flex">
              <Box display="flex" alignItems="center">
                <IconButton aria-label="back" onClick={showListView}>
                  <ArrowBack />
                </IconButton>
              </Box>
              <Box my={2} ml={3}>
                <CardListItem
                  paymentMethod={selectedMethod}
                  primaryPaymentMap={{}}
                />
              </Box>
            </Box>
            <Box>
              <AssignPrimaryMethod
                onClose={showListView}
                currentFolioId={
                  folios.find((f) => f.type === FolioTypes.A)?.id ?? -1
                }
                paymentMethod={selectedMethod}
                refreshFolios={refreshData}
                folios={folios.map((f) => ({
                  type: f.type,
                  reservation_id: reservation?.id ?? -1,
                  id: f.id,
                  primary_payment_method: f.primary_payment_method,
                }))}
                reservationId={reservation?.id ?? -1}
                closeButtonText="Back"
              />
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentMethodModal;
