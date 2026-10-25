import React, { useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Collapse,
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowRight } from "@mui/icons-material";
import useAuth from "hooks/useAuth";
import { appConfig } from "config/app.config";
import { getCurrentRoom } from "utils/reservations";
import { genComplexType, displayGroupName } from "../displayFuncs";
import { convertUtcToTimezone } from "utils/helperFunctions/common";
import { CashierGroupedData } from "types/ui/reports";
import { IReservationResponse } from "types/reservationTypes";
import { PaymentMethodTypesEnum } from "constants/paymentMethods";

const GroupedPaymentsList: React.FC<{ tableRows: CashierGroupedData[] }> = ({
  tableRows,
}) => {
  const { currentTimeZone } = useAuth();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {}
  );

  const toggleGroup = (tenderType: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [tenderType]: !prev[tenderType],
    }));
  };
  return (
    <Table>
      <TableBody>
        {tableRows.length > 0 ? (
          tableRows.map((group) => (
            <React.Fragment key={group.tenderType}>
              <TableRow sx={{ backgroundColor: "#f0f0f0" }}>
                <TableCell colSpan={6}>
                  <Box display="flex" alignItems="center">
                    <IconButton
                      size="small"
                      onClick={() => toggleGroup(group.tenderType)}
                    >
                      {expandedGroups[group.tenderType] ? (
                        <KeyboardArrowDown />
                      ) : (
                        <KeyboardArrowRight />
                      )}
                    </IconButton>
                    <Typography fontWeight="bold">
                      {displayGroupName(group)} ({group.payments.length})
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell colSpan={6} sx={{ p: 0, borderBottom: "none" }}>
                  <Collapse
                    in={expandedGroups[group.tenderType] || false}
                    timeout="auto"
                    unmountOnExit
                  >
                    <Table size="small">
                      {/* Add table headers here */}
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ pl: 6 }}>Payment Method</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Folio ID</TableCell>
                          <TableCell>Room Number</TableCell>
                          <TableCell>Balance</TableCell>
                          <TableCell>Note</TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {group.payments.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} align="center">
                              No records found
                            </TableCell>
                          </TableRow>
                        ) : (
                          group.payments.map((payment, idx) => {
                            const paymentMethodObj = payment?.payment_method;
                            const paymentType = paymentMethodObj?.payment_type;
                            let displayType = displayGroupName(group);
                            if (
                              paymentType ===
                                PaymentMethodTypesEnum.CREDIT_DEBIT_CARD ||
                              paymentType === PaymentMethodTypesEnum.LC_LEVEL
                            ) {
                              displayType = genComplexType(payment);
                            }

                            const localDate = convertUtcToTimezone(
                              payment.created_at,
                              currentTimeZone
                            ).format(appConfig.displayDateWithTimeFormat);

                            const reservation = (payment?.reservation ??
                              null) as IReservationResponse | null;
                            const rooms = getCurrentRoom(reservation);

                            return (
                              <TableRow key={idx}>
                                <TableCell sx={{ pl: 6 }}>
                                  {displayType}
                                </TableCell>
                                <TableCell>{localDate}</TableCell>
                                <TableCell>
                                  {payment?.folio_id ?? "-"}
                                </TableCell>
                                <TableCell>
                                  {rooms?.room_number ?? "-"}
                                </TableCell>
                                <TableCell>
                                  ${Number(payment?.amount ?? 0).toFixed(2)}
                                </TableCell>
                                <TableCell>
                                  {payment?.description || "-"}
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </Collapse>
                </TableCell>
              </TableRow>
            </React.Fragment>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={6} align="center">
              No records found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default GroupedPaymentsList;
