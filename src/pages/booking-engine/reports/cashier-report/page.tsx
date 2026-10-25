import { useEffect, useMemo, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Card,
  CardContent,
} from "@mui/material";
import { Download, PrintOutlined } from "@mui/icons-material";
import { FaTable } from "react-icons/fa";

import { IReservationResponse } from "types/reservationTypes";
import useAuth from "hooks/useAuth";
import { convertUtcToTimezone, getMoment } from "utils/helperFunctions/common";
import { getCurrentRoom } from "utils/reservations";
import { useLazyGetPaymentsQuery } from "services/paymentsSlice";
import { IPaymentResponse } from "types/payments";
import { downloadPDF } from "utils/downloadPDF";
import { appConfig } from "config/app.config";
import { ReservationPaymentStatus } from "constants/payments";
import { displayPaymentType } from "utils/payments";
import { PaymentMethodTypesEnum } from "constants/paymentMethods";
import { CashierGroupedData } from "types/ui/reports";
import { genComplexType, displayGroupName } from "./displayFuncs";
import GroupedPaymentsList from "./components/GroupedPaymentsList";

const CashierReport = () => {
  const tableRef = useRef<HTMLDivElement>(null);
  const refundTableRef = useRef<HTMLDivElement>(null);
  const { users, currentTimeZone, properties } = useAuth();
  const currentProperty = properties.find(
    (a) => a.id === users?.defaultPropertyId
  );

  const [getPayments, { data: paymentList = [] }] = useLazyGetPaymentsQuery();

  const generatedOnDate = getMoment(null, currentTimeZone).format(
    "MMM DD, YYYY,  hh:mm:ss A"
  );

  useEffect(() => {
    getPayments({
      property_id: users?.defaultPropertyId ?? 1,
    });
  }, [users?.defaultPropertyId]);

  // Group rows
  const groupedRows: {
    paymentRows: CashierGroupedData[];
    refundRows: CashierGroupedData[];
  } = useMemo(() => {
    const groupedRefunds = {} as Record<string, IPaymentResponse[]>;
    const grouped = paymentList.reduce(
      (acc, p) => {
        if (p.status === ReservationPaymentStatus.DUE) {
          return acc;
        }
        const paymentMethodObj = p?.payment_method;
        const paymentType = paymentMethodObj?.payment_type;
        const brand = paymentMethodObj?.brand ?? "-";

        let tenderType = "-";
        if (paymentType === "CREDIT_DEBIT_CARD") {
          tenderType = brand;
        } else {
          tenderType = paymentType ?? "-";
        }
        if (
          p.status === ReservationPaymentStatus.REFUNDED ||
          p.status === ReservationPaymentStatus.PARTIALLY_REFUNDED
        ) {
          if (!groupedRefunds[tenderType]) groupedRefunds[tenderType] = [];
          groupedRefunds[tenderType].push(p);
          return acc;
        }
        if (!acc[tenderType]) acc[tenderType] = [];
        acc[tenderType].push(p);
        return acc;
      },
      {} as Record<string, IPaymentResponse[]>
    );

    return {
      paymentRows: Object.entries(grouped).map(([tenderType, payments]) => ({
        tenderType,
        payments,
      })),
      refundRows: Object.entries(groupedRefunds).map(
        ([tenderType, payments]) => ({
          tenderType,
          payments,
        })
      ),
    };
  }, [paymentList]);

  // Export PDF
  const exportPDF = async () => {
    const headers = [
      "Payment Method",
      "Date",
      "Folio ID",
      "Room Number",
      "Balance",
      "Note",
    ];

    const finalRows: any[][] = [];
    groupedRows.paymentRows.forEach((group) => {
      finalRows.push(
        Object.assign(
          [
            displayGroupName(group),
            "Date",
            "Folio ID",
            "Room Number",
            "Balance",
            "Note",
          ],
          { isGroupHeader: true }
        )
      );

      group.payments.forEach((payment) => {
        const paymentMethodObj = payment?.payment_method;
        const paymentType = paymentMethodObj?.payment_type;
        let displayType = displayGroupName(group);
        if (
          paymentType === PaymentMethodTypesEnum.CREDIT_DEBIT_CARD ||
          paymentType === PaymentMethodTypesEnum.LC_LEVEL
        ) {
          displayType = genComplexType(payment);
        }

        const localDate = convertUtcToTimezone(
          payment.created_at,
          currentTimeZone
        ).format(
          `${appConfig.displayDateFormat} ${appConfig.dateTimeOfDayFormat}`
        );
        const p = payment as IPaymentResponse;
        const reservation = (p?.reservation ??
          null) as IReservationResponse | null;

        const rooms = getCurrentRoom(reservation);
        finalRows.push([
          displayType,
          localDate,
          payment?.folio_id ?? "-",
          rooms?.room_number ?? "-",
          `$${Number(payment?.amount ?? 0).toFixed(2)}`,
          payment?.description || "-",
        ]);
      });
    });
    if (groupedRows.paymentRows.length) {
      // put  empty rows to provide space before refund row
      finalRows.push([null, null, null, null, null, null]);
      finalRows.push([null, null, null, null, null, null]);
      finalRows.push(
        Object.assign(["REFUNDS", null, null, null, null, null], {
          isSectionHeader: true,
        })
      );

      groupedRows.refundRows.forEach((group) => {
        finalRows.push(
          Object.assign(
            [
              displayGroupName(group),
              "Date",
              "Folio ID",
              "Room Number",
              "Balance",
              "Note",
            ],
            { isGroupHeader: true }
          )
        );

        group.payments.forEach((payment) => {
          const paymentMethodObj = payment?.payment_method;
          const paymentType = paymentMethodObj?.payment_type;
          let displayType = displayGroupName(group);
          if (
            paymentType === PaymentMethodTypesEnum.CREDIT_DEBIT_CARD ||
            paymentType === PaymentMethodTypesEnum.LC_LEVEL
          ) {
            displayType = genComplexType(payment);
          }

          const localDate = convertUtcToTimezone(
            payment.created_at,
            currentTimeZone
          ).format(
            `${appConfig.displayDateFormat} ${appConfig.dateTimeOfDayFormat}`
          );
          const p = payment as IPaymentResponse;
          const reservation = (p?.reservation ??
            null) as IReservationResponse | null;

          const rooms = getCurrentRoom(reservation);
          finalRows.push([
            displayType,
            localDate,
            payment?.folio_id ?? "-",
            rooms?.room_number ?? "-",
            `$${Number(payment?.amount ?? 0).toFixed(2)}`,
            payment?.description || "-",
          ]);
        });
      });
    }

    await downloadPDF({
      title: "Cashier Summary Report",
      subtitle: "Detailed summary of cashier transactions",
      columns: headers,
      data: finalRows,
      generatedBy: `${users?.firstName} ${users?.lastName}`,
      logoUrl: currentProperty?.logo || undefined,
      orientation: "landscape",
      parseCellCb: (cellData) => {
        const rowData = cellData.row.raw as {
          isGroupHeader?: boolean;
          groupIdx?: number;
          isSectionHeader?: boolean;
        };
        if (rowData?.isGroupHeader) {
          cellData.cell.styles.fontStyle = "bold";
          cellData.cell.styles.fillColor = [240, 240, 240]; // light gray
          cellData.cell.styles.halign = "left";
        }
        if (rowData?.isSectionHeader) {
          cellData.cell.styles.fontStyle = "bold";
          cellData.cell.styles.fillColor = [41, 128, 186]; // autotable header color
          cellData.cell.styles.textColor = "white";
          cellData.cell.styles.halign = "left";
        }
      },
    });
  };

  // Export Excel
  const exportExcel = () => {
    const headers = [
      "Payment Method",
      "Date",
      "Folio ID",
      "Room Number",
      "Balance",
      "Note",
    ].join(",");

    const groupedPayments = groupedRows.paymentRows.reduce((allRows, g) => {
      if (g.payments.length) {
        return [...allRows, ...g.payments];
      }
      return allRows;
    }, [] as IPaymentResponse[]);
    const groupedRefunds = groupedRows.refundRows.reduce((allRows, g) => {
      if (g.payments.length) {
        return [...allRows, ...g.payments];
      }
      return allRows;
    }, [] as IPaymentResponse[]);
    const rows = groupedPayments
      .map((payment: IPaymentResponse) => {
        const paymentMethodObj = payment?.payment_method;
        const paymentType = paymentMethodObj?.payment_type;
        let displayType = paymentType;
        if (
          paymentType === PaymentMethodTypesEnum.CREDIT_DEBIT_CARD ||
          paymentType === PaymentMethodTypesEnum.LC_LEVEL
        ) {
          displayType = genComplexType(payment);
        } else {
          displayType = displayPaymentType(paymentType ?? "");
        }
        const localDate = convertUtcToTimezone(
          payment.created_at,
          currentTimeZone
        ).format(
          `${appConfig.displayDateFormat} ${appConfig.dateTimeOfDayFormat}`
        );
        const p = payment as IPaymentResponse;
        const reservation = (p?.reservation ??
          null) as IReservationResponse | null;
        const rooms = getCurrentRoom(reservation);

        return [
          `"${displayType}"`,
          `"${localDate}"`,
          `"${payment?.folio_id ?? "-"}"`,
          `"${rooms?.room_number ?? "-"}"`,
          `"${`$${Number(payment?.amount ?? 0).toFixed(2)}`}"`,
          `"${payment?.description || "-"}"`,
        ].join(",");
      })
      .join("\n");

    const refundRows = groupedRefunds
      .map((payment: IPaymentResponse) => {
        const paymentMethodObj = payment?.payment_method;
        const paymentType = paymentMethodObj?.payment_type;
        let displayType = paymentType;
        if (
          paymentType === PaymentMethodTypesEnum.CREDIT_DEBIT_CARD ||
          paymentType === PaymentMethodTypesEnum.LC_LEVEL
        ) {
          displayType = genComplexType(payment);
        } else {
          displayType = displayPaymentType(paymentType ?? "");
        }
        const localDate = convertUtcToTimezone(
          payment.created_at,
          currentTimeZone
        ).format(
          `${appConfig.displayDateFormat} ${appConfig.dateTimeOfDayFormat}`
        );
        const p = payment as IPaymentResponse;
        const reservation = (p?.reservation ??
          null) as IReservationResponse | null;
        const rooms = getCurrentRoom(reservation);

        return [
          `"${displayType}"`,
          `"${localDate}"`,
          `"${payment?.folio_id ?? "-"}"`,
          `"${rooms?.room_number ?? "-"}"`,
          `"${`$${Number(payment?.amount ?? 0).toFixed(2)}`}"`,
          `"${payment?.description || "-"}"`,
        ].join(",");
      })
      .join("\n");

    const refundHeaderRow = "REFUNDS,,,,,\n";

    const BOM = "\uFEFF";
    const csvContent = `${BOM}${headers}\n${rows}\n${refundHeaderRow}${refundRows}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "cashier-report.csv";
    link.click();
  };

  const handlePrint = () => {
    if (tableRef.current) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Cashier Report</title>
              <style>
                table {
                  width: 100%;
                  border-collapse: collapse;
                }
                th, td {
                  border: 1px solid #ddd;
                  padding: 8px;
                }
                th {
                  background-color: #f2f2f2;
                }
              </style>
            </head>
            <body>
              ${tableRef.current.innerHTML}
              ${refundTableRef.current ? refundTableRef.current.innerHTML : ""}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
    }
  };
  return (
    <Box>
      <Typography variant="h4" fontWeight={600} color="primary" gutterBottom>
        Cashier/Refund Report
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" mb={3}>
        Detailed summary of cashier transactions
      </Typography>
      <Card elevation={2}>
        <CardContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Box>
              <Typography variant="subtitle1" color="text.secondary">
                Period:
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                Generated on: {generatedOnDate}
              </Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={exportPDF}
              >
                Export PDF
              </Button>
              <Button
                variant="outlined"
                startIcon={<FaTable />}
                onClick={exportExcel}
              >
                Export Excel
              </Button>
              <Button
                variant="outlined"
                startIcon={<PrintOutlined />}
                onClick={handlePrint}
              >
                Print
              </Button>
            </Stack>
          </Box>

          <Box ref={tableRef}>
            <GroupedPaymentsList tableRows={groupedRows.paymentRows} />
          </Box>

          <Box ref={refundTableRef} mt={4}>
            <Typography variant="h4" mb={2}>
              Refunds
            </Typography>
            <GroupedPaymentsList tableRows={groupedRows.refundRows} />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CashierReport;
