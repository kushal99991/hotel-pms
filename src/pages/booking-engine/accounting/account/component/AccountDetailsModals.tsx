import React, { ComponentType, useState } from "react";
import { Box, Dialog, DialogTitle, PaperProps } from "@mui/material";
import PostPaymentView from "../../components/PostPaymentView";
import { IDirectBillingAccountResponse } from "types/payments";
import {
  AccountModalViewProps,
  AdditionationalModalProps,
} from "types/ui/accounting";
import ApplyPaymentView from "../../components/ApplyPaymentView";
import CancelPaymentModal from "../../components/CancelPaymentView";
import CreateInvoiceView from "../../components/CreateInvoiceView";
import { IPaymentMethodResponse } from "types/reservationTypes";
import PostChargeView from "../../components/PostChargeView";
import CancelChargeView from "../../components/CancelChargeView";
import UnapplyPaymentView from "../../components/UnapplyPaymentView";

export enum AccDetailsModalsEnum {
  POST_PAYMENT = "POST_PAYMENT",
  APPLY_PAYMENT = "APPLY_PAYMENT",
  UNAPPLY_PAYMENT = "UNAPPLY_PAYMENT",
  MANUAL_POST = "MANUAL_POST",
  CREATE_INVOICE = "CREATE_INVOICE",
  CANCEL_PAYMENT = "CANCEL_PAYMENT",
  CANCEL_CHARGE = "CANCEL_CHARGE",
  VIEW_INVOICE = "VIEW_INVOICE",
  EMPTY = "EMPTY",
}

export interface AccDetailsModalsSettings {
  open: boolean;
  modalKey: AccDetailsModalsEnum;
  additionalProps?: AdditionationalModalProps;
  width?: string;
}

interface AccountDetailsModalsProps {
  account?: IDirectBillingAccountResponse;
  accounts?: IDirectBillingAccountResponse[];
  paymentMethods?: IPaymentMethodResponse[];
  modalSettings: AccDetailsModalsSettings;
  onClose: (refresh?: boolean) => void;
  refreshAccount?: () => void;
  ModalPaperProps?:
    | Partial<
        PaperProps<React.ElementType<any, keyof React.JSX.IntrinsicElements>>
      >
    | undefined;
}

interface AccModalView {
  title: string;
  component: ComponentType<AccountModalViewProps>;
}

const AvailableModals: { [modalKey in AccDetailsModalsEnum]?: AccModalView } = {
  [AccDetailsModalsEnum.POST_PAYMENT]: {
    title: "Post Payment",
    component: PostPaymentView,
  },
  [AccDetailsModalsEnum.APPLY_PAYMENT]: {
    title: "Apply Payment",
    component: ApplyPaymentView,
  },
  [AccDetailsModalsEnum.UNAPPLY_PAYMENT]: {
    title: "Unapply Payment",
    component: UnapplyPaymentView,
  },
  [AccDetailsModalsEnum.CANCEL_PAYMENT]: {
    title: "Cancel Payment",
    component: CancelPaymentModal,
  },
  [AccDetailsModalsEnum.CANCEL_CHARGE]: {
    title: "Cancel Charge",
    component: CancelChargeView,
  },
  [AccDetailsModalsEnum.CREATE_INVOICE]: {
    title: "Create Invoice",
    component: CreateInvoiceView,
  },
  [AccDetailsModalsEnum.MANUAL_POST]: {
    title: "Post Charge/Adjustment",
    component: PostChargeView,
  },
  [AccDetailsModalsEnum.EMPTY]: {
    title: "",
    component: () => <Box></Box>,
  },
};

const AccountDetailsModals: React.FC<AccountDetailsModalsProps> = ({
  account,
  accounts,
  paymentMethods,
  onClose,
  refreshAccount,
  modalSettings,
  ModalPaperProps,
}) => {
  const [refreshOnBackdropClose, setRefreshOnBackdropClose] =
    useState<boolean>(false);
  function handleParentClose(
    _: any,
    reason: "backdropClick" | "escapeKeyDown"
  ) {
    if (refreshOnBackdropClose && reason) {
      onClose(true);
      return;
    }
    onClose();
  }

  const currentModal = AvailableModals[modalSettings.modalKey];
  const CurrentView = currentModal?.component;
  return (
    <Dialog
      open={modalSettings.open}
      onClose={handleParentClose}
      PaperProps={ModalPaperProps}
    >
      <DialogTitle>{currentModal?.title ?? ""}</DialogTitle>
      {CurrentView && (
        <CurrentView
          account={account}
          accounts={accounts}
          paymentMethods={paymentMethods}
          onRefresh={refreshAccount}
          onClose={onClose}
          additionalProps={modalSettings.additionalProps}
          setRefreshOnBackdrop={setRefreshOnBackdropClose}
        />
      )}
    </Dialog>
  );
};

export default AccountDetailsModals;
