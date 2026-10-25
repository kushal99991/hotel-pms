"use client";
import React, { useCallback, useEffect, useState } from "react";
import moment from "moment";
import Grid from "@mui/material/Grid";
import {
  Box,
  Button,
  Skeleton,
  styled,
  Typography,
  Container,
  Menu,
  MenuItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import {
  Print as PrintIcon,
  Mail as MailIcon,
  ContactPage as ContactPageIcon,
  Description as DescriptionIcon,
  Receipt as ReceiptIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import { pdf } from "@react-pdf/renderer";

import {
  useGetReservationDetailByIdMutation,
  useRenderReservationTemplateMutation,
} from "services/reservationSlice";
import { useGetRoomTypeByPropertyIdMutation } from "services/roomTypeSlice";

import ReservationDetail from "./components/ReservationDetail/ReservationDetail";
import BookingSummary from "./components/BookingSummary";
import { useNavigate, useParams } from "react-router-dom";
import RoomAssignModal from "./components/ReservationDetail/components/RoomAssignModal";
import ChangeRoomTypeModal from "./components/ReservationDetail/components/ChangeRoomTypeModal";
import PaymentModal from "components/ui/PaymentModal/PaymentModal";
import CheckInButton from "./components/ReservationDetail/components/CheckInButton";
import {
  defaultIntent,
  PaymentCaptureTypeEnum,
  ReservationPaymentStatus,
} from "constants/payments";
import { FolioTypes } from "constants/folios";
import {
  getUnpaidTotalClientSecret,
  incidentalPaymentReady,
  isCompReservation,
  isReservationPreCheckin,
  outstandingTotalsFromDataResponses,
} from "utils/reservations";
import CheckInModal from "./components/ReservationDetail/components/CheckInFlow/CheckInModal";
import CheckOutModal from "./components/ReservationDetail/components/CheckOutModal";
import GenerateCardModal from "./components/ReservationDetail/components/GenerateCardModal";
import { ReservationStatusEnum } from "constants/reservation";
import {
  useGetFoliosQuery,
  useGetPaymentsQuery,
  useLazyGetChargesByParamsQuery,
  useLazyGetChargesQuery,
} from "services/paymentsSlice";
import { useGetNightAuditListQuery } from "services/nightAuditSlice";
import ReservationDetailsContext from "contexts/ReservationDetailsContext";
import { appConfig } from "config/app.config";
import useAuth from "hooks/useAuth";
import Modal from "components/widgets/ModalWindows/Modal";
import SendMultipleEmails from "./components/SendMultipleEmails";
import { ControlledResDetailsState } from "types/reservationTypes";
import FolioPDF from "./folios/components/FolioPDF";
import { IPaymentResponse } from "types/payments";
import { sortByDateString } from "utils/helperFunctions/dates";
import CancelReservationModal from "./components/ReservationDetail/components/CancelReservationModal";
import { PaymentTotalsData } from "components/ui/PaymentTotals/PaymentTotals";
import useAllPaymentMethods from "hooks/useAllPaymentMethods";
import { apiAmountToNumber } from "utils/dataFormats";
import { includeIncidentalStep } from "./components/ReservationDetail/components/CheckInFlow/checkinUtils";
import { IChargeResponse } from "types/charges";

const Page: React.FC = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { users, properties, currentProperty } = useAuth();
  const [controlledViewState, setControlledViewState] =
    useState<ControlledResDetailsState>({
      guestVerified: false,
      incidentalsCollected: false,
    });
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [checkOutOpen, setCheckOutOpen] = useState(false);
  const [editDatesOpen, setEditDatesOpen] = useState(false);
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [cardOpen, setCardOpen] = useState(false);
  const [textCopy, setTextCopy] = useState<boolean>(false);
  const [roomAssignOpen, setRoomAssignOpen] = useState<boolean>(false);
  const [typeChangeOpen, setTypeChangeOpen] = useState<boolean>(false);

  const [anchorEl, setAnchorEl] = useState(null);
  const [folioAnchorEl, setFolioAnchorEl] = useState(null);
  const [selectedFolio, setSelectedFolio] = useState<number>();
  const open = Boolean(anchorEl);
  const folioOpen = Boolean(folioAnchorEl);

  const { data: nightAudits } = useGetNightAuditListQuery({
    property_id: users?.defaultPropertyId,
  });
  const [
    getRoomTypeByPropertyId,
    { data: roomTypeList, isLoading: roomTypesLoading },
  ] = useGetRoomTypeByPropertyIdMutation();
  const [openSendEmail, setOpenSendEmail] = useState<boolean>(false);
  const [getChargesByParams] = useLazyGetChargesByParamsQuery();
  const [
    getCharges,
    { isLoading: chargesLoading, data: estimatedChargesData },
  ] = useLazyGetChargesQuery();
  const [
    getReservationDetailById,
    { isLoading, data: reservationDetail, error },
  ] = useGetReservationDetailByIdMutation();

  const allMethods = useAllPaymentMethods(
    reservationDetail?.payment_methods,
    users?.defaultPropertyId
  );

  // Fetch necessary data for printing
  const { data: reservationFolios } = useGetFoliosQuery(
    {
      reservation_id: reservationDetail?.id
        ? Number(reservationDetail?.id)
        : undefined,
    },
    {
      skip: false,
      refetchOnMountOrArgChange: true,
    }
  );

  const { data: payments, refetch: refetchPayments } = useGetPaymentsQuery(
    {
      folio_id: selectedFolio ? Number(selectedFolio) : undefined,
      reservation_id: reservationDetail?.id
        ? Number(reservationDetail?.id)
        : undefined,
      property_id: users?.defaultPropertyId,
    },
    {
      skip: false,
      refetchOnMountOrArgChange: true,
    }
  );

  useEffect(() => {
    if (params?.id && users) {
      getReservationDetailById({
        id: parseInt(params.id),
        propertyId: users.defaultPropertyId,
      });
    }
  }, [params?.id, users]);

  useEffect(() => {
    if (reservationDetail?.id && !chargesLoading && !estimatedChargesData) {
      getCharges({
        reservation_id: reservationDetail.id!,
        start_date: reservationDetail.start_date,
        end_date: moment(reservationDetail.end_date)
          .subtract(1, "days")
          .format(appConfig.dateApiFormat),
      });
    }
  }, [reservationDetail, chargesLoading, estimatedChargesData]);

  useEffect(() => {
    if (reservationDetail?.id && !roomTypesLoading && !roomTypeList) {
      getRoomTypeByPropertyId({
        propertyId: users?.defaultPropertyId ?? 0,
      });
    }
  }, [reservationDetail, roomTypesLoading, roomTypeList, users]);

  useEffect(() => {
    // update incidentals if needed after reservation refresh
    if (!reservationDetail || controlledViewState.incidentalsCollected) {
      return;
    }
    if (isReservationPreCheckin(reservationDetail)) {
      if (isCompReservation(reservationDetail)) {
        setControlledViewState({
          ...controlledViewState,
          incidentalsCollected: true,
        });
        return;
      }
      if (!includeIncidentalStep(reservationDetail, currentProperty)) {
        setControlledViewState({
          ...controlledViewState,
          incidentalsCollected: true,
        });
      }
      const incidentalReady = incidentalPaymentReady(reservationDetail);
      if (incidentalReady) {
        setControlledViewState({
          ...controlledViewState,
          incidentalsCollected: true,
        });
      }
    }
  }, [
    reservationDetail,
    controlledViewState.incidentalsCollected,
    currentProperty,
  ]);

  const handleCopyButton = useCallback((text: string) => {
    setTextCopy(true);
    window.navigator.clipboard.writeText(text);
    setInterval(() => {
      setTextCopy(false);
    }, 2000);
  }, []);

  const [renderReservationTemplate] = useRenderReservationTemplateMutation();

  // Render-only confirmation preview (via PMS API proxy route)
  const handleDownloadPDF = async () => {
    try {
      const resId = reservationDetail?.id
        ? Number(reservationDetail.id)
        : params?.id
          ? parseInt(params.id)
          : 0;
      const data: any = await renderReservationTemplate({
        reservation_id: resId,
        template_name: "stay-confirmation",
      }).unwrap();
      const html = data?.results?.html || data?.body || "<p>No content</p>";
      const preview = window.open("", "_blank");
      if (preview) {
        // Inject a small script to auto-open the print dialog and optionally close the tab after
        const printScript = `
          <script>
            (function(){
              function doPrint(){
                try { window.focus(); } catch(e) {}
                setTimeout(function(){ window.print(); }, 200);
              }
              if (document.readyState === 'complete') { doPrint(); }
              else { window.onload = doPrint; }
              window.onafterprint = function(){ setTimeout(function(){ window.close(); }, 300); };
            })();
          </script>`;

        const hasBody = /<\/body>/i.test(html);
        const printable = hasBody
          ? html.replace(/<\/body>/i, `${printScript}</body>`)
          : `<!doctype html><html><head><meta charset="utf-8"><title>Print</title></head><body>${html}${printScript}</body></html>`;

        preview.document.open();
        preview.document.write(printable);
        preview.document.close();
      }
    } catch (e) {
      console.error("Error rendering confirmation:", e);
    }
  };

  const handleOpenRegisterCard = () => {
    const propertyId = users?.defaultPropertyId ?? 1;
    const newTabUrl = `/booking-engine/reservations/registration-card/${params?.id}/${propertyId}`; // Construct the route
    window.open(newTabUrl, "_blank", "noopener,noreferrer"); // Open in a new tab
  };
  const handleSendEmailClose = useCallback(() => {
    setOpenSendEmail(false);
  }, []);
  const handleSendMailOpen = useCallback(() => {
    setOpenSendEmail(true);
  }, []);

  const onRefresh = useCallback(async () => {
    if (params?.id && !isLoading) {
      setIsRefreshing(true);
      const response = await getReservationDetailById({
        id: parseInt(params.id),
        propertyId: users?.defaultPropertyId ?? 0,
      });
      if (response) {
        setIsRefreshing(false);
      }
    }
  }, [params?.id, getReservationDetailById]);

  // Display the error message and prevent page rendering if an error occurs
  if (error?.message) {
    return (
      <Container style={{ textAlign: "center", marginTop: "5rem" }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Error
        </Typography>
        <Typography variant="body1" gutterBottom>
          {error?.message ?? "Server Error"}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/booking-engine/dashboard")}
        >
          Back to Home
        </Button>
      </Container>
    );
  }
  function handleAssignModalClose(refreshData: boolean) {
    if (refreshData) {
      onRefresh?.();
    }
    setRoomAssignOpen(false);
  }
  function handleTypeModalClose(refreshData: boolean) {
    if (refreshData) {
      onRefresh?.();
    }
    setTypeChangeOpen(false);
  }
  function handleAuthorizeClick() {
    setPaymentOpen(true);
  }
  function handlePaymentClose(refreshData?: boolean) {
    if (refreshData) {
      onRefresh?.();
    }
    setPaymentOpen(false);
  }
  function handleCardClose() {
    setCardOpen(false);
  }
  function handlePaymentComplete() {
    handlePaymentClose();
    onRefresh?.();
  }
  const handleOpenCheckin = () => {
    setCheckinOpen(true);
  };

  const handleCloseCheckin = () => {
    setCheckinOpen(false);
  };
  const handleOpenCheckOut = () => {
    setCheckOutOpen(true);
  };

  const handleCloseCheckOut = () => {
    setCheckOutOpen(false);
  };

  const handleCloseCancel = () => {
    setShowCancel(false);
  };

  const handleCheckInComplete = () => {
    setCheckinOpen(false);
    setCardOpen(true);
    onRefresh();
  };

  const handleCheckOutComplete = () => {
    setCheckOutOpen(false);
    onRefresh();
  };

  const handleCancelComplete = () => {
    setShowCancel(false);
    onRefresh();
  };

  const handleViewStateUpdate = (newState: ControlledResDetailsState) => {
    setControlledViewState(newState);
  };

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleFolioClick = (event: any) => {
    setFolioAnchorEl(event.currentTarget);
  };

  const handleFolioClose = () => {
    setFolioAnchorEl(null);
  };

  const printFolio = async (folioType: any) => {
    // Find the folio with the matching type
    const folio = reservationFolios?.find((f) => f.type === folioType);

    if (!folio) {
      return;
    }

    // Get charges for this folio
    const charges = await getChargesByParams({
      reservation_id: Number(reservationDetail?.id),
      folio_id: folio.id,
    }).unwrap();

    // Get payments for this folio
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Now refetch without parameters (since it's using the state value)
    await refetchPayments();

    const property = properties.find((p) => p.id === users?.defaultPropertyId);

    // Create table data (simplified version - you'll need to adapt makeTableRows logic)
    function makeTableRows() {
      const chargeData = charges ?? [];
      const paymentData = payments ?? [];
      const allData: any[] = [...chargeData, ...paymentData];
      const normalizedData = allData.reduce((agg, data: any) => {
        const isPayment = !!data.payment_date;
        if (isPayment) {
          const paymentData = data as IPaymentResponse;
          // transform payments to look like charges
          const method = allMethods?.find(
            (pm) => pm.id === paymentData.payment_method_id
          );
          const cardName = method
            ? method.brand?.toUpperCase()
            : "Card Payment";
          const cardNumber = method ? method.last4 : paymentData.id;
          const name = method?.direct_billing_account_id
            ? "Direct Billing Account"
            : cardName;
          const displayNumber = method?.direct_billing_account_id ?? cardNumber;
          let amt = apiAmountToNumber(paymentData.amount);
          let refundData;
          if (
            paymentData.status === ReservationPaymentStatus.REFUNDED ||
            paymentData.status === ReservationPaymentStatus.PARTIALLY_REFUNDED
          ) {
            const originalAmount = paymentData.pp_response.amount;
            amt = originalAmount / 100;
            const refundAmount =
              (apiAmountToNumber(paymentData.amount) * 100 - originalAmount) /
              100;
            const isFullRefund =
              paymentData.status === ReservationPaymentStatus.REFUNDED;
            const refundType = isFullRefund
              ? "REFUNDED PAYMENT"
              : "PARTIALLY REFUNDED PAYMENT";
            refundData = {
              isRefund: true,
              payment_amount: refundAmount,
              amount: refundAmount,
              date: paymentData.payment_date,
              description: refundType,
              posting_code: {
                name: name,
                code: displayNumber,
                description: paymentData.description,
                department: {
                  name: refundType,
                },
              },
            };
          }
          if (
            paymentData.status === ReservationPaymentStatus.PAID ||
            paymentData.status === ReservationPaymentStatus.AUTHORIZED ||
            paymentData.status === ReservationPaymentStatus.CREDITED
          ) {
            agg.push({
              ...data,
              payment_amount: amt,
              date: paymentData.payment_date,
              posting_code: {
                name: name,
                code: displayNumber,
                description: paymentData.description,
                department: {
                  name: "PAYMENT",
                },
              },
            });
          }
          if (refundData) {
            agg.push(refundData);
          }
        } else {
          agg.push(data);
        }
        return agg;
      }, []);
      const sorted = normalizedData.sort(sortByDateString);
      return sorted;
    }

    // Generate PDF blob
    const blob = await pdf(
      <FolioPDF
        tableData={makeTableRows()}
        property={property}
        reservation={reservationDetail}
        folio={folio}
        totals={outstandingTotalsFromDataResponses(payments, charges)}
      />
    ).toBlob();

    // Open PDF in new tab
    const link = document.createElement("a");
    const blobUrl = URL.createObjectURL(blob);
    link.href = blobUrl;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    handleFolioClose();
    handleClose();
  };

  function getCaptureType(totals: PaymentTotalsData) {
    if (isReservationPreCheckin(reservationDetail)) {
      if (totals.balance) {
        return PaymentCaptureTypeEnum.IMMEDIATE;
      }
    }
    // TODO revisit if this should be deferred
    return PaymentCaptureTypeEnum.IMMEDIATE;
  }

  const canCheckIn = () => {
    if (!reservationDetail) {
      return false;
    }
    if (reservationDetail.status === ReservationStatusEnum.NO_SHOW) {
      if (!nightAudits?.length) {
        return false;
      }
      // can only check in if there have been two or less
      // night audits from the start date
      const startDate = moment(reservationDetail.start_date);
      const auditsOnOrAfter = nightAudits.filter((a) => {
        const auditDate = moment(a.audit_date);
        return auditDate.isSameOrAfter(startDate, "day");
      });
      return auditsOnOrAfter.length < 3;
    }
    return (
      reservationDetail.status === ReservationStatusEnum.ARRIVING ||
      reservationDetail.status === ReservationStatusEnum.IN_PROGRESS ||
      reservationDetail?.status === ReservationStatusEnum.RESERVED
    );
  };

  function getTotals() {
    const isPreCheckin =
      reservationDetail?.status === ReservationStatusEnum.ARRIVING ||
      reservationDetail?.status === ReservationStatusEnum.IN_PROGRESS ||
      reservationDetail?.status === ReservationStatusEnum.RESERVED;
    const allCharges = reservationDetail?.folios?.reduce((all, f) => {
      return [...all, ...f.charges];
    }, [] as IChargeResponse[]);
    const totalsFromData = outstandingTotalsFromDataResponses(
      reservationDetail?.payments,
      allCharges
    );
    if (!isPreCheckin) {
      // Room and tax may have been posted, can no longer make assumptions about
      // paid vs unpaid fees and taxes, data only shows what the balance is unless there are no
      // payments then I know all fees and taxes are unpaid
      if (reservationDetail?.payments?.length) {
        // I have a payment, I do not know what it is for so I can't assume
        // any fees/taxes are paid/unpaid, zero them out
        const adjustedTotals = { ...totalsFromData };
        adjustedTotals.fees = 0;
        adjustedTotals.paidFees = 0;
        adjustedTotals.taxes = 0;
        adjustedTotals.paidTaxes = 0;
        // adjust subtotal to be total since taxes and fees have been zero'd out
        adjustedTotals.subtotal = adjustedTotals.total;
        return adjustedTotals;
      }
    }
    if (isPreCheckin && estimatedChargesData) {
      const stayRoomTaxesTotal = Object.keys(
        estimatedChargesData.per_night
      ).reduce((total, dateKey) => {
        const chargeNightData = estimatedChargesData.per_night[dateKey];
        if (chargeNightData?.taxes?.length) {
          const taxesForNight = chargeNightData.taxes.reduce((txTotal, t) => {
            const rawValue = +t.amount;
            return txTotal + rawValue * 100;
          }, 0);

          return total + taxesForNight;
        }
        return total;
      }, 0);
      const stayFees = estimatedChargesData.per_reservation?.reduce(
        (total, fee) => {
          return total + +fee.amount * 100;
        },
        0
      );
      const currentTotal = (totalsFromData?.total ?? 0) * 100;
      const chargesTotal = +estimatedChargesData.total * 100;
      const currentTaxes = (totalsFromData?.taxes ?? 0) * 100;
      const currentFees = (totalsFromData?.fees ?? 0) * 100;
      const currentSubtotal = (totalsFromData?.subtotal ?? 0) * 100;
      const rawSubtotal = chargesTotal - stayFees - stayRoomTaxesTotal;
      const newSubtotal = (currentSubtotal + rawSubtotal) / 100;
      const newTotal = (currentTotal + chargesTotal) / 100;
      const newTaxes = (currentTaxes + stayRoomTaxesTotal) / 100;
      const newFees = (currentFees + stayFees) / 100;
      const newBalance = (totalsFromData.balance * 100 + chargesTotal) / 100;
      // round total to cents as backend will reject any number bigger than 10 digits
      return {
        ...totalsFromData,
        total: Math.round(newTotal * 100) / 100,
        taxes: newTaxes,
        balance: Math.round(newBalance * 100) / 100,
        fees: newFees,
        subtotal: newSubtotal,
      };
    }
    return totalsFromData;
  }

  function totalsForPaymentDisplay(totals: PaymentTotalsData) {
    // payments shows an itemized breakdown but that isn't reliable
    // if a payment has already been made
    if (reservationDetail?.payments?.length) {
      // default all totals to balance to avoid showing conflicting numbers
      const totalsForPayment = { ...totals };
      totalsForPayment.fees = 0;
      totalsForPayment.paidFees = 0;
      totalsForPayment.taxes = 0;
      totalsForPayment.paidTaxes = 0;
      // adjust subtotal and total to be balance for consistency
      totalsForPayment.subtotal = totalsForPayment.balance;
      totalsForPayment.total = totalsForPayment.balance;
      return totalsForPayment;
    }
    return totals;
  }
  const totals = getTotals();
  const canCancel =
    reservationDetail?.status !== undefined &&
    ![
      ReservationStatusEnum.CANCELED,
      ReservationStatusEnum.COMPLETED,
      ReservationStatusEnum.IN_HOUSE,
      ReservationStatusEnum.DEPARTED,
      ReservationStatusEnum.DEPARTING,
      ReservationStatusEnum.NO_SHOW,
    ].includes(reservationDetail.status);
  return (
    <ReservationDetailsContext.Provider
      value={{
        viewState: {
          reservation: reservationDetail,
          reservationLoading: isLoading,
          paymentMethods: allMethods,
          charges: estimatedChargesData,
          outstandingTotals: totals,
          guestVerified: controlledViewState.guestVerified,
          incidentalsCollected: controlledViewState.incidentalsCollected,
        },
        setViewState: handleViewStateUpdate,
        refreshReservation: onRefresh,
      }}
    >
      <Grid
        container
        spacing={2}
        marginTop={2}
        data-testid="reservation-booking-detail"
      >
        <Grid
          item
          container
          alignItems="center"
          mb={2}
          className="header-buttons"
        >
          <Grid
            item
            xs={12}
            sm={6}
            sx={(theme) => ({
              [theme.breakpoints.only("xs")]: { textAlign: "center" },
            })}
          >
            <Typography
              component="div"
              fontWeight="bold"
              sx={{ fontSize: "28px", fontWeight: "700" }}
            >{`${reservationDetail?.reservation_first_guest_info?.last_name ?? ""}, ${reservationDetail?.reservation_first_guest_info?.first_name ?? ""}`}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} container justifyContent="flex-end">
            {canCancel && (
              <Grid
                item
                xs={12}
                sm="auto"
                sx={(theme) => ({
                  [theme.breakpoints.only("xs")]: { textAlign: "center" },
                })}
              >
                <Button
                  color="error"
                  variant="outlined"
                  onClick={() => {
                    setShowCancel(true);
                  }}
                >
                  Cancel
                </Button>
              </Grid>
            )}
            <Grid
              item
              xs={12}
              sm="auto"
              ml={2}
              sx={(theme) => ({
                [theme.breakpoints.only("xs")]: {
                  ml: 0,
                  mt: 2,
                  textAlign: "center",
                },
              })}
            >
              <Button
                style={{ visibility: "hidden", display: "none" }}
                variant="outlined"
                onClick={() =>
                  handleCopyButton(reservationDetail?.id?.toString() ?? "")
                }
              >
                {textCopy ? "Copied" : "Copy"} Reservation
              </Button>
            </Grid>
          </Grid>
        </Grid>
        {/* Booking Summary */}
        <Grid item xs={12}>
          <BookingSummary
            details={reservationDetail ?? null}
            isLoading={isLoading}
            onRoomAssignClick={() => setRoomAssignOpen(true)}
            onChangeTypeClick={() => setTypeChangeOpen(true)}
            onEditDatesClick={() => setEditDatesOpen(true)}
            totals={totals}
            onRefresh={onRefresh}
          />
        </Grid>
        {/* Action Buttons */}
        <Grid item xs={12} mt={3} className="action-buttons">
          <Box
            display="flex"
            alignItems="center"
            justifyContent="flex-end"
            flexWrap="wrap"
            sx={(theme) => ({
              [theme.breakpoints.only("xs")]: { justifyContent: "center" },
            })}
          >
            <Box
              display="flex"
              alignItems="center"
              flexDirection="row"
              flexWrap="wrap"
              gap={1}
            >
              {isLoading ? (
                <>
                  <Skeleton variant="rectangular" width={120} height={36} />
                  <Skeleton variant="rectangular" width={36} height={36} />
                  <Skeleton variant="rectangular" width={36} height={36} />
                </>
              ) : (
                <Grid container>
                  <Grid
                    item
                    xs={12}
                    sm="auto"
                    ml={2}
                    sx={(theme) => ({
                      [theme.breakpoints.only("xs")]: { ml: 0, mt: 2 },
                    })}
                  >
                    {canCheckIn() && (
                      <CheckInButton
                        onClick={handleOpenCheckin}
                        reservation={reservationDetail}
                      />
                    )}
                    {(reservationDetail?.status ===
                      ReservationStatusEnum.IN_HOUSE ||
                      reservationDetail?.status ===
                        ReservationStatusEnum.DEPARTING) && (
                      <Button
                        color="error"
                        variant="contained"
                        fullWidth
                        onClick={handleOpenCheckOut}
                      >
                        Check-Out
                      </Button>
                    )}
                  </Grid>
                  <Grid
                    item
                    container
                    xs={12}
                    sm="auto"
                    ml={2}
                    sx={(theme) => ({
                      [theme.breakpoints.only("xs")]: {
                        ml: 0,
                        mt: 2,
                        justifyContent: "center",
                      },
                    })}
                  >
                    <div>
                      <StyledIconButton
                        onClick={handleClick}
                        // color={open ? "primary" : "default"}
                        aria-label="Print options"
                        buttonstyles={{
                          backgroundColor: open
                            ? "rgba(25, 118, 210, 0.08)"
                            : "transparent",
                          color: open ? "primary.main" : "inherit",
                          hoverBg: "rgba(25, 118, 210, 0.12)",
                        }}
                      >
                        <PrintIcon />
                      </StyledIconButton>

                      <Menu
                        id="print-menu"
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        MenuListProps={{
                          "aria-labelledby": "print-button",
                        }}
                        PaperProps={{
                          elevation: 3,
                          sx: {
                            minWidth: "200px",
                            borderRadius: "8px",
                            marginTop: "10px",
                          },
                        }}
                      >
                        <MenuItem onClick={handleDownloadPDF}>
                          <ListItemIcon>
                            <DescriptionIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText>Print Confirmation</ListItemText>
                        </MenuItem>

                        <MenuItem
                          onClick={handleFolioClick}
                          aria-controls={folioOpen ? "folio-menu" : undefined}
                          aria-haspopup="true"
                          aria-expanded={folioOpen ? "true" : undefined}
                          sx={{
                            backgroundColor: folioOpen
                              ? "rgba(0, 0, 0, 0.04)"
                              : "inherit",
                            "&:hover": {
                              backgroundColor: "rgba(0, 0, 0, 0.08)",
                            },
                          }}
                        >
                          <ListItemIcon>
                            <ReceiptIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText>Print Folio Receipt</ListItemText>
                          <ArrowRightIcon fontSize="small" />
                        </MenuItem>

                        <MenuItem onClick={() => handleOpenRegisterCard()}>
                          <ListItemIcon>
                            <ContactPageIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText>Print Reg Card</ListItemText>
                        </MenuItem>
                      </Menu>

                      <Menu
                        id="folio-menu"
                        anchorEl={folioAnchorEl}
                        open={folioOpen}
                        onClose={handleFolioClose}
                        anchorOrigin={{
                          vertical: "bottom",
                          horizontal: "right",
                        }}
                        transformOrigin={{
                          vertical: "top",
                          horizontal: "left",
                        }}
                        PaperProps={{
                          elevation: 3,
                          sx: {
                            minWidth: "180px",
                            borderRadius: "8px",
                            ml: 1, // Add margin to create space between menus
                            mt: 0.5,
                            boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)",
                          },
                        }}
                      >
                        {reservationFolios?.map((folio) => (
                          <MenuItem
                            key={`print-folio-${folio.type}`}
                            onClick={() => {
                              setSelectedFolio(Number(folio.id));
                              printFolio(folio.type);
                            }}
                          >
                            <ListItemIcon>
                              <AssignmentIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={`FOLIO ${folio.type}`} />
                          </MenuItem>
                        ))}
                      </Menu>
                    </div>
                    <StyledIconButton
                      onClick={() => {
                        handleOpenRegisterCard();
                      }}
                    >
                      <ContactPageIcon />
                    </StyledIconButton>

                    <StyledIconButton onClick={handleSendMailOpen}>
                      <MailIcon />
                    </StyledIconButton>
                  </Grid>
                </Grid>
              )}
            </Box>
          </Box>
        </Grid>
        {/* Reservation Detail */}
        <Grid
          item
          xs={12}
          mt={2}
          className="detail-wrapper"
          sx={{ paddingTop: 0 }}
        >
          <ReservationDetail
            details={reservationDetail ?? null}
            isLoading={isLoading}
            isRefreshing={isRefreshing}
            onRefresh={onRefresh}
            onAssignRoom={() => setRoomAssignOpen(true)}
            onPaymentClick={handleAuthorizeClick}
            editDatesOpen={editDatesOpen}
            setEditDatesOpen={setEditDatesOpen}
          />
        </Grid>
        <CheckInModal
          open={checkinOpen}
          balance={totals.balance}
          onClose={handleCloseCheckin}
          onCheckedIn={handleCheckInComplete}
          onRefresh={onRefresh}
          reservation={reservationDetail}
        />
        <CheckOutModal
          open={checkOutOpen}
          onClose={handleCloseCheckOut}
          reservation={reservationDetail}
          onCheckOut={handleCheckOutComplete}
          refreshReservation={onRefresh}
        />
        <RoomAssignModal
          onCloseModal={handleAssignModalClose}
          open={roomAssignOpen}
          reservation={reservationDetail}
          propertyId={users?.defaultPropertyId ?? -1}
        />
        <ChangeRoomTypeModal
          onCloseModal={handleTypeModalClose}
          open={typeChangeOpen}
          reservation={reservationDetail}
          roomTypes={roomTypeList ?? []}
        />
        <Modal
          open={openSendEmail}
          title={`Send Confirmation Email`}
          size="xs"
          onClose={handleSendEmailClose}
          isHideCloseButton={true}
        >
          <SendMultipleEmails
            details={reservationDetail ?? null}
            onClose={handleSendEmailClose}
          />
        </Modal>
        <GenerateCardModal open={cardOpen} onCloseModal={handleCardClose} />
        <PaymentModal
          open={paymentOpen}
          manageDescription
          stripeIntent={
            getUnpaidTotalClientSecret(totals.balance, reservationDetail) ??
            defaultIntent
          }
          onClose={handlePaymentClose}
          onCompleteClick={handlePaymentComplete}
          totalsData={totalsForPaymentDisplay(totals)}
          paymentDisabled={totals.balance <= 0}
          title="Authorize Payment"
          reservationLoading={isLoading}
          reservationId={reservationDetail?.id ?? -1}
          reservation={reservationDetail}
          completeInformation={{
            message: "Payment successfully made! Click below to close",
            buttonLabel: "Close",
          }}
          paySettings={{
            capture_type: getCaptureType(totals),
            folio_type: FolioTypes.A,
            future_usage: true,
          }}
          paymentMethods={allMethods}
          folios={reservationDetail?.folios ?? []}
        />
        <CancelReservationModal
          open={showCancel}
          onClose={handleCloseCancel}
          reservation={reservationDetail}
          onCancelSucess={handleCancelComplete}
          refreshReservation={onRefresh}
        />
      </Grid>
    </ReservationDetailsContext.Provider>
  );
};

export default Page;

const StyledIconButton = styled(Button)<{
  buttonstyles?: {
    backgroundColor?: string;
    color?: string;
    fontWeight?: string;
    hoverBg?: string;
    disableBg?: string;
    disableText?: string;
  };
}>(({ buttonstyles }) => ({
  backgroundColor: buttonstyles?.backgroundColor,
  color: buttonstyles?.color,
  fontSize: "16px",
  fontWeight: buttonstyles?.fontWeight || "800",
  lineHeight: "1",
  borderRadius: "5px",
  padding: "6px",
  "&:hover": {
    backgroundColor: buttonstyles?.hoverBg,
  },
  "&:disabled": {
    backgroundColor: buttonstyles?.disableBg,
    color: buttonstyles?.disableText,
  },
  width: "auto",
  minWidth: "unset",
  whiteSpace: "nowrap",
}));
