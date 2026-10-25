import React, { useEffect, useMemo, useState } from "react";
import { QueryActionCreatorResult } from "@reduxjs/toolkit/query";
import { pdf } from "@react-pdf/renderer";
import {
  Alert,
  Box,
  Button,
  Grid,
  IconButton,
  Typography,
  Paper,
  Snackbar,
  Tooltip,
} from "@mui/material";
import { Add, Close, DriveFileMove, Print } from "@mui/icons-material";
import {
  useGetPaymentsQuery,
  useLazyGetChargesByParamsQuery,
} from "services/paymentsSlice";
import { useGetPostcodeDeptListQuery } from "services/financeSlice";
import AddChargeModal from "./AddChargeModal";
import { appConfig } from "config/app.config";
import { currencyString } from "utils/helperFunctions/numbers";
import { IPaymentResponse, ISimpleFolio } from "types/payments";
import {
  IPaymentMethodResponse,
  IReservationResponse,
} from "types/reservationTypes";
import FolioPaymentMethods from "./FolioPaymentMethods";
import { useLazyGetPaymentMethodsQuery } from "services/paymentsSlice";
import AdHocPaymentModal from "components/ui/AdHocPaymentModal/AdHocPaymentModal";
import MoveChargeModal from "./MoveChargeModal";
import CancelChargeModal from "./CancelChargeModal";
import CancelPaymentModal from "./CancelPaymentModal";
import RefundPaymentModal from "./RefundPaymentModal";
import FolioPDF from "./FolioPDF";
import { outstandingTotalsFromDataResponses } from "utils/reservations";
import { sortObjArrayByDateString } from "utils/helperFunctions/dates";
import { IChargeResponse } from "types/charges";
import {
  chargeCreatedTime,
  chargeDateTimeFromCreation,
  makeCancelDescription,
  paymentApiIdFromParent,
  paymentCreatedTime,
} from "utils/payments";
import { INightAuditResponse } from "types/nightAuditTypes";
import { ReservationPaymentStatus } from "constants/payments";
import { isAdjustment } from "utils/charges";
import useAuth from "hooks/useAuth";
import AddFastChargeModal from "./AddFastChargeModal";
import MethodActionModal, {
  MethodActionType,
} from "./MethodActionModal/MethodActionModal";
import { getFirstValidMethod, hasUsableMethods } from "utils/payments";
import { IFolioResponse } from "types/folios";
import {
  DataGrid,
  GridColDef,
  GridRowId,
  GridRowSelectionModel,
} from "@mui/x-data-grid";
import { getMoment, pluralValue } from "utils/helperFunctions/common";
import { paymentMethodDisplayVals } from "utils/payments";
import { nightAuditDateTime } from "utils/nightAudit";
import { apiAmountToNumber } from "utils/dataFormats";
import { ALL_FOLIOS_ID, ALL_FOLIOS_KEY } from "constants/ui/folios";
import useAllPaymentMethods from "hooks/useAllPaymentMethods";
import { PaymentMethodTypesEnum } from "constants/paymentMethods";
import { CommonPagination } from "utils/FilterComponent";
import { PaymentProccessorsEnum } from "constants/paymentProcessors";
import { PaymentParent } from "types/ui/payments";
import { PaymentParentEnum } from "constants/ui/payments";
import { PaymentTotalsData } from "components/ui/PaymentTotals/PaymentTotals";

interface MethodModalOptions {
  type: MethodActionType;
  paymentMethod: IPaymentMethodResponse;
}

const FolioCharges: React.FC<{
  reservationId: number;
  reservation?: IReservationResponse;
  parent?: PaymentParent;
  folio: ISimpleFolio;
  folios: ISimpleFolio[];
  fullFolios?: IFolioResponse[];
  lastNightAudit?: INightAuditResponse;
  refetchFolios: () => QueryActionCreatorResult<any>;
  refetchReservation?: () => void;
  preventMove?: boolean;
  onPrintClick?: (tableData: any[], totals: PaymentTotalsData) => void;
}> = ({
  reservationId,
  reservation,
  folio,
  fullFolios,
  refetchFolios,
  refetchReservation,
  folios,
  lastNightAudit,
  parent,
  preventMove,
  onPrintClick,
}) => {
  const { users: currentUser, properties, currentTimeZone } = useAuth();
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showMoveCharge, setShowMoveCharge] = useState(false);
  const [methodModalOpts, setMethodModalOpts] = useState<
    MethodModalOptions | undefined
  >(undefined);
  const [selectedPayment, setSelectedPayment] =
    useState<IPaymentMethodResponse | null>(folio?.primary_payment_method);
  const [getCharges, { data: charges, error }] =
    useLazyGetChargesByParamsQuery();
  const { data: payments, refetch: refetchPayments } = useGetPaymentsQuery(
    {
      folio_id: folio?.id,
      reservation_id: reservationId > 0 ? reservationId : undefined,
      ...(parent ? paymentApiIdFromParent(parent) : {}),
    },
    { refetchOnMountOrArgChange: true }
  );
  const [fetchMethods, { data: paymentMethods, isLoading: methodsLoading }] =
    useLazyGetPaymentMethodsQuery();
  const [selectedCharge, setSelectedCharge] = useState<
    IChargeResponse | undefined
  >();
  const [chargeToCancel, setChargeToCancel] = useState<
    IChargeResponse | undefined
  >();
  const [paymentToRefund, setPaymentToRefund] = useState<
    IPaymentResponse | undefined
  >();
  const [paymentToCancel, setPaymentToCancel] = useState<
    IPaymentResponse | undefined
  >();
  const { data: departments } = useGetPostcodeDeptListQuery();
  const [showAddCharge, setShowAddCharge] = useState(false);
  const [showAddFastCharge, setShowAddFastCharge] = useState(false);
  const [selectedCharges, setSelectedCharges] = useState<number[]>([]);

  const allAvailableMethods = useAllPaymentMethods(
    reservation?.payment_methods && !parent
      ? reservation?.payment_methods
      : paymentMethods,
    currentUser?.defaultPropertyId
  );

  useEffect(() => {
    if (reservationId && reservationId > 0 && folio?.id) {
      getCharges({
        reservation_id: reservationId,
        folio_id: folio?.id,
      });
    } else if (parent && folio?.id) {
      const idBodyPart = paymentApiIdFromParent(parent, {
        sales_group: "group_id",
      });
      getCharges({
        folio_id: folio.id,
        ...idBodyPart,
      });
    }
  }, [folio?.id, parent?.type, parent?.id]);
  useEffect(() => {
    if (reservationId && reservationId > 0) {
      fetchMethods({
        reservation_id: reservationId,
      });
    } else if (parent) {
      const idBodyPart = paymentApiIdFromParent(parent);
      fetchMethods(idBodyPart);
    }
  }, [reservationId, parent?.type, parent?.id]);
  useEffect(() => {
    if (!paymentMethods || !folio) return;
    if (!selectedPayment && paymentMethods && folio) {
      const primaryFromFolio = folio.primary_payment_method;
      const primaryFromFolioReady =
        primaryFromFolio && primaryFromFolio?.future_use;
      let fallbackSelectedMethod = primaryFromFolioReady
        ? primaryFromFolio
        : undefined;
      if (!primaryFromFolioReady && paymentMethods.length) {
        const usabledMethod = getFirstValidMethod(paymentMethods);
        if (usabledMethod) {
          fallbackSelectedMethod = usabledMethod;
        }
      }
      if (fallbackSelectedMethod) {
        setSelectedPayment(fallbackSelectedMethod);
      }
    }
  }, [selectedPayment, folio, paymentMethods]);
  useEffect(() => {
    if (paymentMethods && selectedPayment) {
      if (paymentMethods.length < 1) {
        // there are no more methods after an update
        setSelectedPayment(null);
        return;
      }
      const selectedMethodIsPresent = paymentMethods.find(
        (pm) => pm.id === selectedPayment?.id
      );
      if (!selectedMethodIsPresent) {
        // previous selected method no longer in database, grab 1st one
        setSelectedPayment(paymentMethods[0]);
      }
    }
  }, [paymentMethods, selectedPayment]);
  function refreshCharges(reservationRefresh?: boolean) {
    let getChargesBody = {
      reservation_id:
        reservationId && reservationId > 0 ? reservationId : undefined,
      folio_id: folio.id,
    };
    if (parent) {
      const idBodyPart = paymentApiIdFromParent(parent);
      getChargesBody = {
        ...getChargesBody,
        ...idBodyPart,
      };
    }
    getCharges(getChargesBody);
    if (reservationRefresh || folio?.type === ALL_FOLIOS_KEY) {
      refetchReservation?.();
    }
  }
  function handleMethodModalClose() {
    setMethodModalOpts(undefined);
  }
  function refetchMethods() {
    let fetchMethodBody = {
      reservation_id: reservationId > 0 ? reservationId : undefined,
    };
    if (parent) {
      const idBodyPart = paymentApiIdFromParent(parent);
      fetchMethodBody = {
        ...fetchMethodBody,
        ...idBodyPart,
      };
    }
    fetchMethods(fetchMethodBody);
  }
  function onAddFastChargeClose(addSuccess?: boolean): void {
    setShowAddFastCharge(false);
    if (addSuccess) {
      refreshCharges();
    }
  }
  function handleOnChargeClick() {
    setShowAddCharge(true);
  }
  function onAddChargeClose(addSuccess?: boolean) {
    if (addSuccess) {
      setSnackbarMsg("Charge successfully added!");
    }
    setShowAddCharge(false);
  }
  function handleSnackbarClose() {
    setSnackbarMsg("");
  }
  function calcBalance(): { balance: number; unpaidBalance: number } {
    let chargesData = charges;
    let paymentsData = payments;
    if (folio?.type === ALL_FOLIOS_KEY) {
      const allFolios = reservation?.folios
        ? reservation?.folios
        : (fullFolios ?? []);
      const { allCharges, allPayments } = (allFolios ?? []).reduce(
        (agg, f: IFolioResponse) => {
          const folioCharges = f.charges ?? [];
          const folioPayments = f.payments ?? [];
          if (folioCharges.length) {
            agg.allCharges = [...agg.allCharges, ...folioCharges];
          }
          if (folioPayments.length) {
            agg.allPayments = [...agg.allPayments, ...folioPayments];
          }
          return agg;
        },
        {
          allCharges: [] as IChargeResponse[],
          allPayments: [] as IPaymentResponse[],
        }
      );
      chargesData = allCharges;
      paymentsData = allPayments;
    }
    if (!chargesData?.length && !paymentsData?.length) {
      return {
        balance: 0,
        unpaidBalance: 0,
      };
    }
    const total = outstandingTotalsFromDataResponses(paymentsData, chargesData);
    return {
      balance: total.balance,
      unpaidBalance: total.unpaidBalance ?? 0,
    };
  }

  function refreshPaymentData() {
    refetchPayments();
    refetchReservation?.();
  }
  function handleSuccessfulMethodAddition() {
    refetchFolios();
    refetchReservation?.();
  }
  function handleStripePayComplete() {
    setShowPaymentModal(false);
    refreshPaymentData();
    refetchMethods();
    if (!hasUsableMethods(paymentMethods)) {
      refetchFolios();
    }
  }
  function handlePaymentComplete() {
    setShowPaymentModal(false);
    refreshPaymentData();
  }
  function handlePayModalClose(refreshPayments?: boolean) {
    setShowPaymentModal(false);
    if (refreshPayments) {
      refreshPaymentData();
    }
  }
  function handleRefundClose(refreshPayments?: boolean) {
    setPaymentToRefund(undefined);
    if (refreshPayments) {
      refreshPaymentData();
    }
  }
  function handleCancelPaymentClose(refreshPayments?: boolean) {
    setPaymentToCancel(undefined);
    if (refreshPayments) {
      refreshPaymentData();
    }
  }
  function handleMoveChargeClick(dataItem: any) {
    return () => {
      setSelectedCharge(dataItem as IChargeResponse);
    };
  }
  function handleBulkMoveChargeClick() {
    if (preventMove) {
      return;
    }
    setShowMoveCharge(true);
  }
  function handleCancelChargeClick(dataItem: any) {
    return () => {
      setChargeToCancel(dataItem);
    };
  }
  function handleCancelPaymentClick(dataItem: any) {
    return () => {
      setPaymentToCancel(dataItem);
    };
  }
  function handleRefundClick(dataItem: any) {
    return () => {
      setPaymentToRefund(dataItem);
    };
  }

  const chargesAndPayments = useMemo((): {
    charges: IChargeResponse[];
    payments: IPaymentResponse[];
  } => {
    if (folio?.type === ALL_FOLIOS_KEY) {
      const allFolios = reservation?.folios
        ? reservation?.folios
        : (fullFolios ?? []);
      const { allCharges, allPayments } = (allFolios ?? []).reduce(
        (agg, f: IFolioResponse) => {
          const folioCharges = f.charges ?? [];
          const folioPayments = f.payments ?? [];
          if (folioCharges.length) {
            agg.allCharges = [...agg.allCharges, ...folioCharges];
          }
          if (folioPayments.length) {
            agg.allPayments = [...agg.allPayments, ...folioPayments];
          }
          return agg;
        },
        {
          allCharges: [] as IChargeResponse[],
          allPayments: [] as IPaymentResponse[],
        }
      );
      return {
        charges: allCharges,
        payments: allPayments,
      };
    }
    return {
      charges: charges ?? [],
      payments: payments ?? [],
    };
  }, [folio?.type, reservation?.folios, charges, payments]);

  function handleMethodDelete(methodId: number) {
    const method = paymentMethods?.find((pm) => pm.id === methodId);
    if (!method) {
      return;
    }
    setMethodModalOpts({
      type: MethodActionType.DELETE,
      paymentMethod: method,
    });
  }
  function handleMethodPrimary(methodId: number) {
    const method = paymentMethods?.find((pm) => pm.id === methodId);
    if (!method) {
      console.error("Unable to find selected payment method to make primary");
      return;
    }
    setMethodModalOpts({
      type: MethodActionType.PRIMARY,
      paymentMethod: method,
    });
  }
  function handleMoveClose(refreshData?: boolean, refreshFolios?: boolean) {
    if (refreshData) {
      refreshCharges();
    }
    if (refreshFolios) {
      refetchFolios();
    }
    setSelectedCharge(undefined);
    setShowMoveCharge(false);
  }
  function handleCancelClose(refreshData?: boolean) {
    if (refreshData) {
      refreshCharges();
    }
    setChargeToCancel(undefined);
  }
  function chargeAfterLastAudit(charge: IChargeResponse) {
    if (!lastNightAudit) {
      return false;
    }
    const chargeDate = getMoment(
      chargeDateTimeFromCreation(charge),
      currentTimeZone
    );
    const auditDate = getMoment(
      nightAuditDateTime(lastNightAudit),
      currentTimeZone
    );
    return chargeDate.isAfter(auditDate);
  }
  function canDelete(rowItem: any) {
    if (rowItem.payment_date || rowItem.payment_amount) {
      // this is a payment
      return false;
    }
    if (!lastNightAudit) {
      return false;
    }
    return chargeAfterLastAudit(rowItem.row as IChargeResponse);
  }
  function canRefund(rowItem: IPaymentResponse) {
    if (!rowItem.payment_date) {
      // this is a charge which cannot be refunded
      return false;
    }
    if (rowItem.payment_method?.payment_type === PaymentMethodTypesEnum.CASH) {
      return false;
    }
    if (
      rowItem.status === ReservationPaymentStatus.REFUNDED ||
      rowItem.status === ReservationPaymentStatus.AUTHORIZED ||
      rowItem.status === ReservationPaymentStatus.CREDITED ||
      rowItem.status === ReservationPaymentStatus.SETTLED ||
      rowItem.status === ReservationPaymentStatus.CANCELLED
    ) {
      return false;
    }
    return true;
  }
  function canCancelPayment(rowItem: IPaymentResponse) {
    if (!rowItem.payment_date) {
      // this is a charge which cannot be canceled in the same way
      return false;
    }
    if (
      rowItem.status === ReservationPaymentStatus.AUTHORIZED ||
      rowItem.status === ReservationPaymentStatus.CREDITED ||
      rowItem.status === ReservationPaymentStatus.SETTLED
    ) {
      return true;
    }
    return false;
  }
  function displayChargeAmount(rowItem: IChargeResponse) {
    const amountString = currencyString(apiAmountToNumber(rowItem.amount));
    if (isAdjustment(rowItem, chargesAndPayments.charges)) {
      return `- ${amountString}`;
    }
    return amountString;
  }
  function displayChargeDescription(rowItem: IChargeResponse) {
    if (isAdjustment(rowItem, chargesAndPayments.charges)) {
      return rowItem.description
        ? `ADJUSTMENT: ${rowItem.description}`
        : "ADJUSTMENT";
    }
    return rowItem.description;
  }
  function displayPaymentAmount(rowItem: any) {
    if (!rowItem.payment_amount) {
      return "0.00";
    }
    const absAmount = Math.abs(rowItem.payment_amount);
    const amt = currencyString(absAmount);
    if (rowItem.isRefund) {
      return `+ ${amt}`;
    }
    return `- ${amt}`;
  }
  function isCharge(rowItem: IChargeResponse) {
    return !Object.keys(rowItem).includes("payment_amount");
  }
  function countCharges() {
    let chargesData = charges;
    if (folio?.type === ALL_FOLIOS_KEY) {
      const allFolios = reservation?.folios
        ? reservation?.folios
        : (fullFolios ?? []);
      const allCharges = (allFolios ?? []).reduce((agg, f: IFolioResponse) => {
        const folioCharges = f.charges ?? [];
        if (folioCharges.length) {
          return [...agg, ...folioCharges];
        }
        return agg;
      }, [] as IChargeResponse[]);
      chargesData = allCharges;
    }
    if (!chargesData || !chargesData.length) {
      return { charges: 0, adjustments: 0 };
    }
    const totals = chargesData.reduce(
      (agg, c) => {
        if (isAdjustment(c, chargesData)) {
          agg.adjustments = agg.adjustments + 1;
        } else {
          agg.charges = agg.charges + 1;
        }
        return agg;
      },
      {
        charges: 0,
        adjustments: 0,
      }
    );
    return totals;
  }

  function generateTableData() {
    if (folio?.type === ALL_FOLIOS_KEY) {
      const allFolios = reservation?.folios
        ? reservation?.folios
        : (fullFolios ?? []);
      const { allCharges, allPayments } = (allFolios ?? []).reduce(
        (agg, f: IFolioResponse) => {
          const folioCharges = f.charges ?? [];
          const folioPayments = f.payments ?? [];
          if (folioCharges.length) {
            agg.allCharges = [...agg.allCharges, ...folioCharges];
          }
          if (folioPayments.length) {
            agg.allPayments = [...agg.allPayments, ...folioPayments];
          }
          return agg;
        },
        {
          allCharges: [] as IChargeResponse[],
          allPayments: [] as IPaymentResponse[],
        }
      );
      return makeTableRows(allCharges, allPayments);
    }
    return makeTableRows(charges, payments);
  }

  function makeTableRows(
    chargeItems?: IChargeResponse[],
    paymentItems?: IPaymentResponse[]
  ) {
    const chargeData = chargeItems ?? [];
    const paymentsData = paymentItems ?? [];
    // need access to both active and inactive methods so retrieve from
    // reservation
    const allMethods = allAvailableMethods ?? [];
    const allData: any[] = [...chargeData, ...paymentsData];
    const normalizedData = allData.reduce((agg, data: any) => {
      let newAgg = agg;
      const isPayment = !!data.payment_date;
      if (isPayment) {
        const paymentData = data as IPaymentResponse;
        const payFolioType = (folios ?? []).find(
          (f) => f.id === paymentData?.folio_id
        )?.type;
        // transform payments to look like charges
        const method = allMethods.find(
          (pm) => pm.id === paymentData?.payment_method_id
        );
        const { name: cardName, number: cardNumber } =
          paymentMethodDisplayVals(method);
        const amt = apiAmountToNumber(paymentData.amount);
        const refundData = [];
        if (
          paymentData.status === ReservationPaymentStatus.REFUNDED ||
          paymentData.status === ReservationPaymentStatus.PARTIALLY_REFUNDED
        ) {
          const isFullRefund =
            paymentData.status === ReservationPaymentStatus.REFUNDED;
          let originalAmount = paymentData.pp_response?.amount ?? 0;
          if (
            paymentData.pp_response?.PAYMENT_PROCESSOR ===
              PaymentProccessorsEnum.STRIPE &&
            paymentData.pp_response?.amount
          ) {
            // stripe stores amounts as cent values, normalize to dollars to match
            // back end values
            originalAmount = originalAmount / 100;
          }
          if (!originalAmount && paymentData.refunds?.length && isFullRefund) {
            // sum refunds objects for original total
            originalAmount = paymentData.refunds.reduce((total, refund) => {
              return total + apiAmountToNumber(refund.amount);
            }, 0);
          }
          // add the original payment to the list
          refundData.push({
            ...data,
            amount: 0,
            folioLabel: payFolioType,
            payment_amount: isFullRefund ? originalAmount : amt,
            originalAmount: originalAmount,
            created_at: paymentData.payment_date,
            sortDate: paymentCreatedTime(paymentData),
            displayDate: paymentCreatedTime(paymentData),
            date: paymentData.payment_date,
            posting_code: {
              name: cardName,
              code: cardNumber,
              description: paymentData.description,
              department: {
                name: "PAYMENT",
              },
            },
          });
          const amountFromData = Number.isNaN(+paymentData.amount)
            ? 0
            : +paymentData.amount;
          const refundAmount =
            (amountFromData * 100 - originalAmount * 100) / 100;
          const refundType = isFullRefund
            ? "REFUNDED PAYMENT"
            : "PARTIALLY REFUNDED PAYMENT";
          // add a row for the refund to the list
          refundData.push({
            isRefund: true,
            folioLabel: payFolioType,
            payment_amount: 0,
            amount: Math.abs(refundAmount),
            created_at: paymentData.payment_date,
            sortDate: paymentCreatedTime(paymentData),
            displayDate: paymentCreatedTime(paymentData),
            date: paymentData.payment_date,
            description: refundType,
            posting_code: {
              name: cardName,
              code: cardNumber,
              description: paymentData.description,
              department: {
                name: refundType,
              },
            },
          });
        }
        if (
          paymentData.status === ReservationPaymentStatus.PAID ||
          paymentData.status === ReservationPaymentStatus.AUTHORIZED ||
          paymentData.status === ReservationPaymentStatus.CREDITED ||
          paymentData.status === ReservationPaymentStatus.PARTIALLY_SETTLED ||
          paymentData.status === ReservationPaymentStatus.SETTLED
        ) {
          let type = "PAYMENT";
          if (
            paymentData.status === ReservationPaymentStatus.PARTIALLY_SETTLED
          ) {
            type = `${type} - PARTIALLY SETTLED`;
          } else if (paymentData.status === ReservationPaymentStatus.SETTLED) {
            type = `${type} - SETTLED`;
          }
          newAgg.push({
            ...data,
            folioLabel: payFolioType,
            amount: 0,
            payment_amount: amt,
            created_at: paymentData.payment_date,
            sortDate: paymentCreatedTime(paymentData),
            displayDate: paymentCreatedTime(paymentData),
            date: paymentData.payment_date,
            posting_code: {
              name: cardName,
              code: cardNumber,
              description: paymentData.description,
              department: {
                name: type,
              },
            },
          });
        }
        if (paymentData.status === ReservationPaymentStatus.CANCELLED) {
          newAgg.push({
            ...data,
            amount: 0,
            folioLabel: payFolioType,
            payment_amount: 0,
            created_at: paymentData.payment_date,
            sortDate: paymentCreatedTime(paymentData),
            displayDate: paymentCreatedTime(paymentData),
            date: paymentData.payment_date,
            description: makeCancelDescription(paymentData),
            posting_code: {
              name: cardName,
              code: cardNumber,
              description: makeCancelDescription(paymentData),
              department: {
                name: "CANCELLED PAYMENT",
              },
            },
          });
        }
        if (refundData.length > 0) {
          newAgg = agg.concat(refundData);
        }
      } else {
        // Charges
        const chargeDateTimeString = chargeDateTimeFromCreation(
          data as IChargeResponse
        );
        const chargeCreatedAt = chargeCreatedTime(data as IChargeResponse);
        const chargeDateMoment = getMoment(
          chargeDateTimeString,
          currentTimeZone
        );
        const chargeCreatedMoment = getMoment(chargeCreatedAt, currentTimeZone);
        let sortMoment = chargeCreatedMoment;
        if (!chargeDateMoment.isSame(chargeCreatedMoment, "day")) {
          // move time to end of day as this charge was added outside of
          // the reservation start and end dates
          const normalizedMoment = chargeDateMoment.clone().hour(23).minute(0);
          sortMoment = normalizedMoment;
        }
        newAgg.push({
          ...data,
          folioLabel: (data as IChargeResponse).folio_type,
          displayDate: sortMoment.format(`${appConfig.dateTimeWithTZFormat}`),
          sortDate: sortMoment.format(`${appConfig.dateTimeWithTZFormat}`),
          isAdjustmentCharge: isAdjustment(data, chargeItems),
        });
      }
      return newAgg;
    }, []);
    const sorted = sortObjArrayByDateString(normalizedData, "sortDate");
    return sorted;
  }

  async function handlePrintClick() {
    const { charges: viewCharges, payments: viewPayments } = chargesAndPayments;
    const printTableData = generateTableData();
    const totals = outstandingTotalsFromDataResponses(viewPayments, viewCharges);

    if (onPrintClick) {
      onPrintClick(printTableData, totals);
      return;
    }

    const property = properties.find(
      (p) => p.id === currentUser?.defaultPropertyId
    );
    const blob = await pdf(
      <FolioPDF
        tableData={printTableData}
        includeFolioColumn={folio?.type === ALL_FOLIOS_KEY}
        property={property}
        reservation={reservation}
        folio={folio}
        totals={totals}
      />
    ).toBlob();

    const link = document.createElement("a");
    const blobUrl = URL.createObjectURL(blob);
    link.href = blobUrl;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  const tableData = generateTableData();
  const { balance, unpaidBalance } = calcBalance();
  const totals = countCharges();
  const paymentString =
    unpaidBalance > 0
      ? `Pay the folio balance of ${currencyString(unpaidBalance)}, or specify a different amount.`
      : "Specify an amount for payment and provide a description if needed";
  const foliosAsFolioResponse = folios.map(
    (f) =>
      ({
        ...f,
        // add in dummy values to match the type
        charges: [],
        payments: [],
      }) as IFolioResponse
  );

  const columns: GridColDef[] = [
    {
      field: "date",
      headerName: "Date",
      flex: 0.8,
      valueFormatter: (_, params) =>
        getMoment(params.displayDate || params.date, currentTimeZone).format(
          appConfig.displayDateFormat
        ),
    },
    {
      field: "sortDate",
      headerName: "Time",
      flex: 0.7,
      valueFormatter: (_, params) =>
        getMoment(params?.sortDate, currentTimeZone).format("hh:mm A"),
    },
    {
      field: "posting_code",
      headerName: "Code/Description",
      flex: 2.1,
      valueGetter: (_, params) =>
        params.posting_code?.name?.toLocaleUpperCase(),
      renderCell: (params) => (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            whiteSpace: "nowrap",
            height: "100%",
            overflow: "visible",
            justifyContent: "center",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              whiteSpace: "normal",
            }}
          >
            {`${params?.row?.posting_code?.name?.toLocaleUpperCase()}${params?.row?.posting_code?.code ? ` - ${params?.row?.posting_code?.code}` : ""}`}
          </Typography>
          <Typography
            variant="caption"
            fontSize="0.75rem"
            sx={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {displayChargeDescription(params?.row)}
          </Typography>
        </div>
      ),
    },
    {
      field: "amount",
      headerName: "Charges (USD)",
      flex: 1,
      align: "center",
      headerAlign: "center",
      valueFormatter: (_, params) => displayChargeAmount(params),
    },
    {
      field: "payment_amount",
      headerName: "Credits (USD)",
      flex: 1,
      align: "center",
      headerAlign: "center",
      valueFormatter: (_, params) => displayPaymentAmount(params),
    },
    {
      field: "department",
      headerName: "Department",
      flex: 1.7,
      align: "center",
      headerAlign: "center",
      valueGetter: (_, params) => params?.posting_code?.department.name,
    },
    {
      field: "user",
      headerName: "User Name",
      flex: 1,
      align: "center",
      headerAlign: "center",
      valueGetter: (_, params) => params?.user?.user_name ?? "",
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      align: "center",
      headerAlign: "center",
      sortable: false,
      renderCell: (params) => {
        if (isCharge(params?.row)) {
          return (
            <Box display="flex" justifyContent="center">
              <Box display="flex" alignItems="center">
                {!preventMove && (
                  <Box>
                    <Tooltip title="Move Charge to another Folio">
                      <IconButton
                        onClick={handleMoveChargeClick(params?.row)}
                        sx={{
                          backgroundColor: "transparent",
                          color: "secondary.main",
                        }}
                      >
                        <DriveFileMove sx={{ color: "secondary.main" }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
                {canDelete(params) && (
                  <Box>
                    <Tooltip title="Cancel Charge">
                      <IconButton
                        onClick={handleCancelChargeClick(params?.row)}
                        sx={{
                          backgroundColor: "transparent",
                          color: "error.main",
                        }}
                      >
                        <Close sx={{ color: "error.main" }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </Box>
            </Box>
          );
        }

        if (
          !isCharge(params?.row) &&
          !canRefund(params?.row) &&
          !canCancelPayment(params?.row)
        ) {
          return "--";
        }

        if (canRefund(params?.row)) {
          return (
            <Box
              display="flex"
              justifyContent="center"
              height="100%"
              alignItems="center"
            >
              <Button
                variant="text"
                color="secondary"
                size="small"
                onClick={handleRefundClick(params?.row)}
              >
                Refund
              </Button>
            </Box>
          );
        }

        if (canCancelPayment(params?.row)) {
          return (
            <Box
              display="flex"
              justifyContent="center"
              height="100%"
              alignItems="center"
            >
              <Button
                variant="text"
                color="secondary"
                size="small"
                onClick={handleCancelPaymentClick(params?.row)}
              >
                Cancel
              </Button>
            </Box>
          );
        }
      },
    },
  ];

  if (folio?.type === ALL_FOLIOS_KEY) {
    columns.splice(5, 0, {
      field: "folioLabel",
      headerName: "Folio",
      align: "center",
      headerAlign: "center",
    });
  }

  function handleRowSelect(newIds: GridRowSelectionModel) {
    if (!newIds.length) {
      setSelectedCharges([]);
      return;
    }
    const selectedIds = newIds.map((selectedId: GridRowId) => {
      // format for the newIds are noted below
      const idParts = (selectedId as string).split("-");
      const idString = idParts[1];
      if (idString) {
        return +idString;
      }
      return 0;
    });
    setSelectedCharges(selectedIds.filter((id) => !!id));
  }

  // Prepare data for DataGrid (needs unique id for each row)
  const rows =
    tableData?.map((item, index) => ({
      newId: `row-${item.id}-${index}`, // Make sure each row has a unique id
      ...item,
    })) || [];
  return (
    <Paper sx={{ p: 3, backgroundColor: "grey.200", borderTopLeftRadius: 0 }}>
      {error && (
        <Alert severity="error">
          There was an error fetching folio data, refresh the page to try again
        </Alert>
      )}
      <Grid container alignItems="center" justifyContent="space-between" mb={2}>
        <Grid item>
          {`${pluralValue(totals.charges, "Charge", "Charges")}`}
          <span
            style={{ marginLeft: "24px", display: "inline-block" }}
          >{`${pluralValue(totals.adjustments, "Adjustment", "Adjustments")}`}</span>
        </Grid>
        <Grid item>
          <Button
            sx={{ mr: 2, backgroundColor: "white" }}
            onClick={handleBulkMoveChargeClick}
            color="secondary"
            variant="outlined"
            disabled={!selectedCharges.length}
          >
            Bulk Move
          </Button>
          <Button
            sx={{ mr: 2 }}
            onClick={() => setShowAddFastCharge(true)}
            color="secondary"
            variant="contained"
          >
            Fast post
          </Button>

          <IconButton
            onClick={handlePrintClick}
            sx={{
              backgroundColor: "secondary.main",
              mr: 2,
              "&:hover": { backgroundColor: "secondary.dark" },
            }}
          >
            <Print sx={{ color: "white" }} />
          </IconButton>
          <Tooltip title="Add Charge">
            <IconButton
              onClick={handleOnChargeClick}
              sx={{
                backgroundColor: "secondary.main",
                "&:hover": { backgroundColor: "secondary.dark" },
              }}
            >
              <Add sx={{ color: "white" }} />
            </IconButton>
          </Tooltip>
        </Grid>
      </Grid>
      <Box
        sx={{
          height: 500,
          width: "100%",
          backgroundColor: "white",
          borderRadius: "3px",
        }}
      >
        <DataGrid
          getRowId={(row) => row.newId}
          rows={rows}
          columns={columns}
          slots={{
            pagination: CommonPagination,
          }}
          rowHeight={60}
          checkboxSelection
          disableRowSelectionOnClick
          isRowSelectable={(params) => {
            return !params.row.payment_date;
          }}
          onRowSelectionModelChange={handleRowSelect}
          sx={{
            "& .MuiDataGrid-cell:focus-within, & .MuiDataGrid-cell:focus": {
              outline: "none",
            },
          }}
        />
      </Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mt={3}
      >
        <FolioPaymentMethods
          paymentMethods={paymentMethods ?? []}
          methodsLoading={methodsLoading}
          reservationId={reservationId}
          primaryMethod={folio?.primary_payment_method ?? undefined}
          selectedPaymentId={selectedPayment?.id ?? -1}
          folio={folio}
          onPaymentSelection={(pm?: IPaymentMethodResponse) => {
            setSelectedPayment(pm ?? null);
          }}
          onAddSuccess={handleSuccessfulMethodAddition}
          fetchMethods={refetchMethods}
          onDelete={handleMethodDelete}
          onMakePrimary={handleMethodPrimary}
          parent={parent}
        />
        <Box display="flex" alignItems="center">
          <Typography
            component="div"
            fontWeight="bold"
            mr={2}
          >{`Unpaid Balance: ${currencyString(unpaidBalance > 0 ? unpaidBalance : 0)}`}</Typography>
          {`Balance: ${currencyString(balance)}`}
          <Button
            onClick={() => {
              setShowPaymentModal(true);
            }}
            sx={{ ml: 3, background: balance <= 0 ? "white" : "" }}
            variant={balance <= 0 ? "outlined" : "contained"}
            color="secondary"
          >
            Make Payment
          </Button>
        </Box>
      </Box>
      <AddChargeModal
        onClose={onAddChargeClose}
        reservation={reservation}
        folio={folio}
        open={showAddCharge}
        departments={departments}
        refreshData={refreshCharges}
        parent={parent}
      />
      <AddFastChargeModal
        onClose={onAddFastChargeClose}
        reservationId={reservationId}
        reservation={reservation}
        folio={folio}
        open={showAddFastCharge}
        refreshData={refreshCharges}
        parent={parent}
      />
      <AdHocPaymentModal
        open={showPaymentModal}
        message={paymentString}
        onClose={handlePayModalClose}
        totals={{ balance: unpaidBalance }}
        reservation={reservation}
        folios={foliosAsFolioResponse}
        paymentMethods={allAvailableMethods}
        currentFolioId={folio?.id}
        allowFolioSelect={folio?.id === ALL_FOLIOS_ID}
        currentPaymentId={selectedPayment?.id}
        onPaymentComplete={handlePaymentComplete}
        onStripePaymentComplete={handleStripePayComplete}
        parent={parent}
      />
      <MoveChargeModal
        open={selectedCharge ? true : showMoveCharge}
        chargeIds={selectedCharge?.id ? [selectedCharge.id] : selectedCharges}
        reservationId={reservationId}
        currentFolio={folio}
        folios={folios}
        onClose={handleMoveClose}
        refreshData={refreshCharges}
      />
      <CancelChargeModal
        open={!!chargeToCancel}
        charge={chargeToCancel}
        onClose={handleCancelClose}
        refreshData={refreshCharges}
      />
      <RefundPaymentModal
        open={!!paymentToRefund}
        onClose={handleRefundClose}
        payment={paymentToRefund}
        refreshData={refreshPaymentData}
      />
      <CancelPaymentModal
        open={!!paymentToCancel}
        onClose={handleCancelPaymentClose}
        payment={paymentToCancel}
        refreshData={refreshPaymentData}
        paymentMethods={paymentMethods}
      />
      <MethodActionModal
        open={!!methodModalOpts}
        reservationId={reservationId}
        currentFolioId={folio?.id}
        folios={folios}
        refreshMethods={refetchMethods}
        refreshFolios={refetchFolios}
        onClose={handleMethodModalClose}
        paymentMethod={methodModalOpts?.paymentMethod}
        type={methodModalOpts?.type ?? MethodActionType.PRIMARY}
      />
      <Snackbar
        open={!!snackbarMsg}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
      >
        <Alert severity="success" onClose={handleSnackbarClose}>
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default FolioCharges;
