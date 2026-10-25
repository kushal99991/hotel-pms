import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  Skeleton,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import AccountSummaryCards from "./AccountSummaryCards";
import AccountTransactions from "./AccountTransactions";
import AccountBillingInfo from "./AccountBillingInfo";
import AccountInvoices from "./AccountInvoices";
import AccountDetailsModals, {
  AccDetailsModalsSettings,
  AccDetailsModalsEnum,
} from "./AccountDetailsModals";
import TransactionsToolbar from "./TransactionsToolbar";
import { useLazyGetDirectBillingAccountQuery } from "services/paymentsSlice";
import useAuth from "hooks/useAuth";
import useSnackbar from "hooks/useSnackbar";
import { IDirectBillingAccountResponse } from "types/payments";
import { AdditionationalModalProps } from "types/ui/accounting";
import AccountHeader from "./AccountHeader";
import PaymentMethodModal from "pages/booking-engine/reservations/components/ReservationDetail/components/PaymentMethodModal";
import useAllPaymentMethods from "hooks/useAllPaymentMethods";

const AccountSkeleton = () => {
  return (
    <Box p={3}>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Skeleton variant="text" width="30%" height={40} />
        <Skeleton variant="rectangular" width={70} height={36} />
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} mb={3}>
        {[...Array(4)].map((_, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card>
              <CardContent>
                <Skeleton variant="text" width="60%" height={20} />
                <Skeleton variant="text" width="80%" height={30} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tabs */}
      <Box>
        <Tabs value={0}>
          <Tab label={<Skeleton width={80} />} />
          <Tab label={<Skeleton width={100} />} />
        </Tabs>
      </Box>

      {/* Tab Content - Simulate "Overview" Tab */}
      <Box>
        <Card>
          <CardContent>
            <Typography variant="h6">
              <Skeleton width="30%" />
            </Typography>
            <Box mt={2}>
              {[...Array(5)].map((_, idx) => (
                <Skeleton key={idx} variant="text" width="50%" height={20} />
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

interface AccountDetailsViewProps {
  accountId?: string;
}

const AccountDetailsView: React.FC<AccountDetailsViewProps> = ({
  accountId,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [methodsOpen, setMethodsOpen] = useState(false);
  const [currentModal, setCurrentModal] = useState<AccDetailsModalsSettings>({
    open: false,
    modalKey: AccDetailsModalsEnum.EMPTY,
  });
  const { users } = useAuth();
  const { openSnackbar } = useSnackbar();
  const [accountDetail, setAccountDetail] = useState<
    IDirectBillingAccountResponse | undefined
  >(undefined);
  const [tab, setTab] = React.useState(
    location.search.includes("invoices") ? 2 : 0
  );

  const [getDirectBillingAccount, { isLoading }] =
    useLazyGetDirectBillingAccountQuery();

  const allMethods = useAllPaymentMethods(
    accountDetail?.payment_methods,
    users?.defaultPropertyId
  );
  useEffect(() => {
    onRefresh();
  }, [accountId, users?.defaultPropertyId]);

  const onRefresh = useCallback(async () => {
    if (accountId) {
      const response = await getDirectBillingAccount({
        id: Number(accountId),
        property_id: users?.defaultPropertyId,
      });
      if (response?.error) {
        openSnackbar(response.error as string, "error");
        return false;
      }
      const dataSources = response?.data ?? [];
      if (dataSources?.length > 0) {
        setAccountDetail(dataSources[0]);
      }
    }
  }, [accountId, users?.defaultPropertyId]);

  function handleOpenMethodsClick() {
    setMethodsOpen(true);
  }

  function handleModalClose(refreshData?: boolean) {
    if (refreshData) {
      onRefresh();
    }
    setCurrentModal({
      ...currentModal,
      open: false,
    });
  }

  function handlePostPayment() {
    setCurrentModal({
      open: true,
      modalKey: AccDetailsModalsEnum.POST_PAYMENT,
      width: "550px",
    });
  }

  function handleCancelPayment(paymentId: number) {
    setCurrentModal({
      modalKey: AccDetailsModalsEnum.CANCEL_PAYMENT,
      additionalProps: { selectedPaymentId: paymentId },
      open: true,
    });
  }

  function handleCancelCharge(chargeId: number) {
    setCurrentModal({
      modalKey: AccDetailsModalsEnum.CANCEL_CHARGE,
      additionalProps: { selectedChargeId: chargeId },
      open: true,
    });
  }

  function handleOnApplyPayment({
    folioId,
    paymentId,
  }: {
    folioId?: number;
    paymentId?: number;
  }) {
    const idProps = {} as AdditionationalModalProps;
    if (folioId) {
      idProps.selectedResId = folioId;
    }
    if (paymentId) {
      idProps.selectedPaymentId = paymentId;
    }
    setCurrentModal({
      modalKey: AccDetailsModalsEnum.APPLY_PAYMENT,
      additionalProps: Object.keys(idProps).length ? idProps : undefined,
      open: true,
      width: "1000px",
    });
  }

  function handleCreateInvoiceClick() {
    setCurrentModal({
      modalKey: AccDetailsModalsEnum.CREATE_INVOICE,
      open: true,
      width: "1000px",
    });
  }

  function handleManualPostClick() {
    setCurrentModal({
      modalKey: AccDetailsModalsEnum.MANUAL_POST,
      open: true,
    });
  }

  function handleApplyPaymentClick() {
    setCurrentModal({
      modalKey: AccDetailsModalsEnum.APPLY_PAYMENT,
      open: true,
      width: "1000px",
    });
  }

  function handleUnapplyPaymentClick() {
    setCurrentModal({
      modalKey: AccDetailsModalsEnum.UNAPPLY_PAYMENT,
      open: true,
      width: "1000px",
    });
  }

  function handleOnUnapplyPayment({
    folioId,
    paymentId,
  }: {
    folioId?: number;
    paymentId?: number;
  }) {
    const idProps = {} as AdditionationalModalProps;
    if (folioId) {
      idProps.selectedResId = folioId;
    }
    if (paymentId) {
      idProps.selectedPaymentId = paymentId;
    }
    setCurrentModal({
      modalKey: AccDetailsModalsEnum.UNAPPLY_PAYMENT,
      additionalProps: Object.keys(idProps).length ? idProps : undefined,
      open: true,
      width: "1000px",
    });
  }

  function onCancelPayment(paymentId: number) {
    return () => {
      handleCancelPayment(paymentId);
    };
  }

  function onCancelCharge(chargeId: number) {
    return () => {
      handleCancelCharge(chargeId);
    };
  }

  function onApplyPaymentFromRes(folioId: number) {
    return () => {
      handleOnApplyPayment({ folioId });
    };
  }

  function onApplyPaymentFromPayment(paymentId: number) {
    return () => {
      handleOnApplyPayment({ paymentId });
    };
  }

  function onUnapplyPaymentFromRes(folioId: number) {
    return () => {
      handleOnUnapplyPayment({ folioId });
    };
  }

  function onUnapplyPaymentFromPayment(paymentId: number) {
    return () => {
      handleOnUnapplyPayment({ paymentId });
    };
  }

  if (isLoading) {
    return <AccountSkeleton />;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <AccountHeader
          billingName={accountDetail?.billing_name ?? ""}
          accountId={
            accountId?.toString() || accountDetail?.id?.toString() || ""
          }
        />

        <Button
          variant="outlined"
          onClick={() =>
            navigate(
              `/booking-engine/accounting/account/${accountDetail?.id}/edit`
            )
          }
          sx={{ ml: 3 }}
        >
          Edit Account
        </Button>
      </Box>

      <Box mt={2}>
        <AccountSummaryCards
          creditLimit={accountDetail?.credit_limit}
          currentLimit={accountDetail?.credit_limit_with_unsettled_payments}
          isAccountLoading={isLoading}
          accountId={accountDetail?.id}
          payments={accountDetail?.payments}
          charges={accountDetail?.charges}
        />
      </Box>

      <Box textAlign="right" mt={2}>
        <TransactionsToolbar
          onPostPayment={handlePostPayment}
          onApplyPayment={handleApplyPaymentClick}
          onCreateInvoice={handleCreateInvoiceClick}
          onOpenMethods={handleOpenMethodsClick}
          onManualPost={handleManualPostClick}
          onUnapplyPayment={handleUnapplyPaymentClick}
        />
      </Box>

      <Box mt={2}>
        <Tabs value={tab} onChange={(e, newVal) => setTab(newVal)}>
          <Tab label="Transactions" />
          <Tab label="Details" />
          <Tab label="Invoices" />
        </Tabs>
      </Box>

      <Box mt={2}>
        {tab === 0 && (
          <AccountTransactions
            transactions={accountDetail?.lc_payments ?? []}
            paymentMethods={allMethods}
            payments={accountDetail?.payments}
            charges={accountDetail?.charges}
            onAccountRefresh={onRefresh}
            account={accountDetail ?? undefined}
            onCancelPayment={onCancelPayment}
            onCancelCharge={onCancelCharge}
            onApplyPaymentFromPayment={onApplyPaymentFromPayment}
            onApplyPaymentFromRes={onApplyPaymentFromRes}
            onUnapplyPaymentFromPayment={onUnapplyPaymentFromPayment}
            onUnapplyPaymentFromRes={onUnapplyPaymentFromRes}
          />
        )}
        {tab === 1 && <AccountBillingInfo accountDetail={accountDetail} />}
        {tab === 2 && <AccountInvoices accountDetail={accountDetail} />}
      </Box>
      <PaymentMethodModal
        open={methodsOpen}
        hideDirectBillAccounts
        hideMakePrimaryAction
        onClose={() => setMethodsOpen(false)}
        paymentMethods={allMethods ?? []}
        dbAccountId={accountDetail?.id}
        refreshData={onRefresh}
        folios={[]}
        reservation={null}
      />
      <AccountDetailsModals
        modalSettings={currentModal}
        account={accountDetail}
        paymentMethods={allMethods}
        refreshAccount={onRefresh}
        onClose={handleModalClose}
        ModalPaperProps={{
          sx: {
            width: currentModal.width ?? "400px",
            maxWidth: currentModal.width ?? null,
          },
        }}
      />
    </Box>
  );
};

export default AccountDetailsView;
