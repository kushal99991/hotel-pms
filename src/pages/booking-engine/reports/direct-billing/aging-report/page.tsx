// components/reports/AgingReport.tsx
import React, { useMemo, useState } from "react";
import { Box, Paper, Stack, Grid, Typography, Button } from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import { Download, PrintOutlined } from "@mui/icons-material";
import { FaTable } from "react-icons/fa";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import moment from "moment";
import useAuth from "hooks/useAuth";
import CustomDropdown from "components/widgets/CustomDropdown/CustomDropdown";
import { useGetAccountReceivablesQuery } from "services/accountingSlice";
import { IAccountReceivables } from "types/accountTypes";
import { useNavigate } from "react-router-dom";
import exampleLogo from "assets/images/logo.png";
import { CommonPagination } from "utils/FilterComponent";

const AGE_BUCKETS = [
  { label: "All", value: "ALL" },
  { label: "0-30", value: "0-30" },
  { label: "31-60", value: "31-60" },
  { label: "61-90", value: "61-90" },
  { label: "91-120", value: "91-120" },
  { label: "120+", value: "120+" },
];

const bucketOf = (days: number | null) => {
  if (days == null) return "0-30";
  if (days <= 30) return "0-30";
  if (days <= 60) return "31-60";
  if (days <= 90) return "61-90";
  if (days <= 120) return "91-120";
  return "120+";
};

const AgingReport: React.FC = () => {
  const Navigate = useNavigate();
  const { currentTimeZone, users, properties } = useAuth();
  const currentProperty = properties.find(
    (a) => a.id === users?.defaultPropertyId
  );
  const [filters, setFilters] = useState({ ageBucket: "ALL", accountId: "" });

  const {
    data: receivables = [],
    isFetching,
    isLoading,
  } = useGetAccountReceivablesQuery();

  const accountOptions = useMemo(
    () => [
      { label: "All", value: "" },
      ...Array.from(
        new Map(
          receivables.map((r) => [
            r.direct_billing_account_id,
            r.direct_billing_account?.billing_name ||
              `Account ${r.direct_billing_account_id}`,
          ])
        )
      ).map(([value, label]) => ({ value: String(value), label })),
    ],
    [receivables]
  );

  const filteredRows = useMemo(() => {
    return receivables.filter((row) => {
      const matchAccount =
        !filters.accountId ||
        String(row.direct_billing_account_id) === filters.accountId;
      const matchBucket =
        filters.ageBucket === "ALL" ||
        bucketOf(row.aging) === filters.ageBucket;
      return matchAccount && matchBucket;
    });
  }, [receivables, filters]);

  const formatCurrency = (val: number) =>
    val.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    });

  const columns: GridColDef<IAccountReceivables>[] = [
    {
      field: "direct_billing_account.billing_name",
      headerName: "Account Name",
      flex: 1.5,
      renderCell: ({ row }) =>
        row.direct_billing_account?.billing_name ||
        `Account ${row.direct_billing_account_id}`,
    },
    {
      field: "direct_billing_account_id",
      headerName: "Account #",
      flex: 0.8,
    },
    {
      field: "balance",
      headerName: "Total Bal Due",
      flex: 1,
      renderCell: ({ value }) => formatCurrency(Number(value)),
    },
    {
      field: "balance_30_0",
      headerName: "30 Days",
      flex: 1,
      renderCell: ({ value }) => formatCurrency(value ?? 0),
    },
    {
      field: "balance_60_30",
      headerName: "31 - 60 Days",
      flex: 1,
      renderCell: ({ value }) => formatCurrency(value ?? 0),
    },
    {
      field: "balance_90_60",
      headerName: "61 - 90 Days",
      flex: 1,
      renderCell: ({ value }) => formatCurrency(value ?? 0),
    },
    {
      field: "bucket",
      headerName: "Aging",
      flex: 1,
      renderCell: ({ row }) => `${row?.aging ?? 0} Days`,
    },
  ];

  const Toolbar = () => (
    <GridToolbarContainer>
      <GridToolbarFilterButton />
    </GridToolbarContainer>
  );

  const convertImageUrlToBase64 = (imageUrl: string): Promise<string> => {
    return fetch(imageUrl)
      .then((response) => response.blob())
      .then((blob) => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = reader.result as string;
            resolve(base64String.split(",")[1]);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      })
      .catch(() => {
        throw new Error("Failed to load image");
      });
  };

  async function isValidImageUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: "HEAD" });
      return (
        response.ok &&
        /image\/*/.test(response.headers.get("Content-Type") ?? "")
      );
    } catch {
      return false;
    }
  }

  const exportPDF = async () => {
    const doc = new jsPDF();
    const title = "Direct Billing Aging Report";

    const timestamp = `DateTime Generated: ${moment().tz(currentTimeZone).format("MMM DD, YYYY – hh:mm:ss A")}`;
    const generatedDate = ``;
    const generatedBy = `Generated by: ${users?.firstName} ${users?.lastName}`;
    const dateRange = "";

    const imageUrl = currentProperty?.logo ?? exampleLogo;

    if (imageUrl) {
      const isValid = await isValidImageUrl(imageUrl);
      let imageBase64 = await convertImageUrlToBase64(exampleLogo);
      let imageExtension = "PNG";

      if (isValid) {
        const base64Image = await convertImageUrlToBase64(imageUrl);
        const ext = imageUrl.split(".").pop()?.toLowerCase() ?? "png";
        if (ext.toUpperCase() !== "AVIF") {
          imageBase64 = base64Image;
          imageExtension = ext.toUpperCase();
        }
      }

      const x = 10,
        y = 10,
        size = 40,
        radius = size / 2;
      doc.setFillColor(255, 255, 255);
      doc.ellipse(x + radius, y + radius, radius, radius, "F");
      doc.addImage(
        "data:image/" + imageExtension.toLowerCase() + ";base64," + imageBase64,
        imageExtension,
        x,
        y,
        size,
        size,
        undefined,
        "FAST"
      );
    }

    // Text Section
    const textX = 70;
    let textY = 25;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(title, textX, textY);
    textY += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(generatedDate, textX, textY);
    textY += 5;
    doc.text(timestamp, textX, textY);
    textY += 5;
    doc.text(generatedBy, textX, textY);
    textY += 5;
    doc.text(dateRange, textX, textY);
    textY += 10;

    const headers = [
      "Account Name",
      "Account #",
      "Total Bal Due",
      "30 Days",
      "31 - 60 Days",
      "61 - 90 Days",
      "Aging",
    ];

    const tableData = filteredRows.map((row) => [
      row.direct_billing_account?.billing_name ||
        `Account ${row.direct_billing_account_id}`,
      row.direct_billing_account_id,
      formatCurrency(row.balance),
      formatCurrency(row.balance_30_0),
      formatCurrency(row.balance_60_30),
      formatCurrency(row.balance_90_60),
      `${row?.aging ?? 0} Days`,
    ]);

    (doc as any).autoTable({
      head: [headers],
      body: tableData,
      startY: textY,
      styles: { fontSize: 8 },
      headStyles: {
        fillColor: [224, 224, 224],
        textColor: 0,
        fontStyle: "bold",
      },
      columnStyles: {
        2: { halign: "right" },
        3: { halign: "right" },
        4: { halign: "right" },
        5: { halign: "right" },
        6: { halign: "right" },
        7: { halign: "right" },
      },
    });

    doc.save("direct-billing-aging-report.pdf");
  };

  const exportCSV = () => {
    const visibleCols = columns;
    const headers = visibleCols.map((c) => `"${c.headerName}"`).join(",");
    const rows = filteredRows
      .map((row) =>
        visibleCols
          .map((col) => {
            const value = (row as any)[col.field];
            return typeof value === "number"
              ? `"${value.toFixed(2)}"`
              : `"${String(value ?? "").replace(/"/g, '""')}"`;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob([`${headers}\n${rows}`], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "direct-billing-aging-report.csv";
    link.click();
  };

  const handleRowClick = ({ row }: { row: IAccountReceivables }) => {
    Navigate(
      `/booking-engine/accounting/account/${row.direct_billing_account_id}`
    );
  };

  return (
    <>
      <Box sx={{ "@media print": { m: 0, p: "20px" } }}>
        <Paper
          elevation={3}
          sx={{ p: 3, "@media print": { boxShadow: "none" } }}
        >
          <Stack spacing={3}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="h6">
                  Direct Billing Aging Report
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  Generated on:{" "}
                  {moment()
                    .tz(currentTimeZone)
                    .format("MMM DD, YYYY – HH:mm:ss A")}
                </Typography>
              </Box>
              <Stack
                direction="row"
                spacing={2}
                sx={{ "@media print": { display: "none" } }}
              >
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
                  onClick={exportCSV}
                >
                  Export CSV
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<PrintOutlined />}
                  onClick={() => window.print()}
                >
                  Print
                </Button>
              </Stack>
            </Box>

            <Grid container spacing={2} pr={4}>
              <Grid item xs={12} md={6}>
                <CustomDropdown
                  label="Age Bucket"
                  options={AGE_BUCKETS}
                  value={filters.ageBucket}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      ageBucket: e.target.value as string,
                    }))
                  }
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <CustomDropdown
                  label="Account"
                  options={accountOptions}
                  value={filters.accountId}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      accountId: e.target.value as string,
                    }))
                  }
                  fullWidth
                />
              </Grid>
            </Grid>

            <DataGrid
              rows={filteredRows}
              columns={columns}
              getRowId={(r) => r.id}
              loading={isFetching || isLoading}
              initialState={{
                pagination: { paginationModel: { pageSize: 25 } },
                sorting: { sortModel: [{ field: "balance", sort: "desc" }] },
              }}
              pageSizeOptions={[25, 50, 100]}
              autoHeight
              onRowClick={handleRowClick}
              slots={{
                toolbar: Toolbar,
                pagination: CommonPagination,
              }}
              sx={{
                "& .MuiDataGrid-columnHeaders": {
                  fontWeight: "bold",
                  fontSize: 17,
                },
              }}
            />
          </Stack>
        </Paper>
      </Box>
    </>
  );
};

export default AgingReport;
