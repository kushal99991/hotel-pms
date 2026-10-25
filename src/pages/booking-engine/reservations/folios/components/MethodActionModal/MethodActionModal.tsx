import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
} from "@mui/material";
import CardListItem from "components/ui/CardListItem/CardListItem";
import { ISimpleFolio } from "types/payments";
import { IPaymentMethodResponse } from "types/reservationTypes";
import AssignPrimaryMethod from "./AssignPrimaryMethod";
import DeleteMethod from "./DeleteMethod";

export enum MethodActionType {
  DELETE = "delete",
  PRIMARY = "primary",
}

interface MethodActionModalProps {
  open: boolean;
  reservationId: number;
  currentFolioId: number;
  folios?: ISimpleFolio[];
  onClose: () => void;
  refreshMethods?: any;
  refreshFolios?: any;
  paymentMethod?: IPaymentMethodResponse;
  type: MethodActionType;
}

const CardActionModal: React.FC<MethodActionModalProps> = ({
  currentFolioId,
  folios,
  reservationId,
  open,
  onClose,
  refreshMethods,
  refreshFolios,
  paymentMethod,
  type,
}) => {
  let title;
  switch (type) {
    case MethodActionType.DELETE:
      title = "Remove Payment Method";
      break;
    case MethodActionType.PRIMARY:
      title = "Set as Primary Payment Method";
      break;
    default:
      title = "Payment Method Action";
  }
  function createAssignOptionLabel(label: string, isSelected: boolean) {
    return `${label}${isSelected ? " (Current Selected Folio)" : ""}`;
  }
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm">
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="h6">{title}</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box my={2}>
          <CardListItem paymentMethod={paymentMethod} primaryPaymentMap={{}} />
        </Box>

        {type === MethodActionType.DELETE && (
          <DeleteMethod
            onClose={onClose}
            refreshMethods={refreshMethods}
            paymentMethod={paymentMethod}
          />
        )}
        {type === MethodActionType.PRIMARY && (
          <AssignPrimaryMethod
            onClose={onClose}
            currentFolioId={currentFolioId}
            paymentMethod={paymentMethod}
            refreshFolios={refreshFolios}
            folios={folios}
            reservationId={reservationId}
            createLabel={createAssignOptionLabel}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CardActionModal;
