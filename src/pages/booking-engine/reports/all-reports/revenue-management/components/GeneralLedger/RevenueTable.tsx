import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { PictureAsPdf, Print, FileDownload } from "@mui/icons-material";
import useGeneralLedger from "hooks/useGeneralLedger";
import React, { useMemo, useRef, useState } from "react";
import { downloadPDF } from "utils/downloadPDF";
import useAuth from "hooks/useAuth";

const RevenueTable: React.FC = () => {
  const { users, properties } = useAuth();
  const tableRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState<string>("");
  const currentProperty = properties.find(
    (a) => a.id === users?.defaultPropertyId
  );

  const {
    totals,
    page,
    rowsPerPage,
    mockRevenueData,
    handleChangePage,
    handleChangeRowsPerPage,
    getVariancePercentage,
  } = useGeneralLedger();

  /** ------------------- Filtered Data ------------------- **/
  const filteredRows = useMemo(() => {
    if (!search.trim()) return mockRevenueData;
    return mockRevenueData.filter((row) =>
      row.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, mockRevenueData]);

  const currentPageRows = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredRows.slice(start, start + rowsPerPage);
  }, [filteredRows, page, rowsPerPage]);

  const exportPDF = async () => {
    const headers = [
      "Posting Code",
      "Today",
      "Month To Date",
      "Year To Date",
      "Last Year MTD",
      "Last Year YTD",
    ];

    const finalRows = filteredRows.map((row) => {
      return [
        row.name,
        `$${row.today.toLocaleString()}`,
        `$${row.month_to_date.toLocaleString()}`,
        `$${row.year_to_date.toLocaleString()}`,
        `$${row.last_year_mtd.toLocaleString()}`,
        `$${row.last_year_to_date.toLocaleString()}`,
      ];
    });

    await downloadPDF({
      title: "General Ledger Report",
      subtitle: `Overall Financial Report ${filteredRows.length} posting codes`,
      columns: headers,
      data: finalRows,
      generatedBy: `${users?.firstName} ${users?.lastName}`,
      logoUrl: currentProperty?.logo || undefined,
      orientation: "landscape",
    });
  };

  const exportExcel = () => {
    const headers = [
      "Posting Code",
      "Today",
      "Month To Date",
      "Year To Date",
      "Variance %",
      "Last Year MTD",
      "Last Year YTD",
    ].join(",");

    const rows = filteredRows
      .map((row) => {
        return [
          `"${row.name}"`,
          `"${row.today}"`,
          `"${row.month_to_date}"`,
          `"${row.year_to_date}"`,
          `"${row.last_year_mtd}"`,
          `"${row.last_year_to_date}"`,
        ].join(",");
      })
      .join("\n");

    const BOM = "\uFEFF"; // Excel UTF-8 BOM
    const csvContent = `${BOM}${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "general-ledger-report.csv";
    link.click();
  };

  /** ------------------- Print ------------------- **/
  const handlePrint = () => {
    if (tableRef.current) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>General Ledger Report</title>
              <style>
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #ddd; padding: 8px; }
                th { background-color: #f2f2f2; }
              </style>
            </head>
            <body>
              ${tableRef.current.innerHTML}
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
    <Card className="shadow-lg border-0">
      <CardContent className="p-6">
        <Box className="flex items-center justify-between mb-6">
          <Box>
            <Typography variant="h6" className="font-bold text-gray-900 mb-1">
              Detailed Revenue Breakdown
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              Complete financial breakdown - {mockRevenueData.length} Posting
              Code
            </Typography>
          </Box>
          <Box className="flex items-center space-x-2">
            <Button
              variant="outlined"
              size="small"
              startIcon={<PictureAsPdf />}
              onClick={exportPDF}
            >
              Export PDF
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<FileDownload />}
              onClick={exportExcel}
            >
              Export Excel
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Print />}
              onClick={handlePrint}
            >
              Print
            </Button>
          </Box>
        </Box>
        {/* 🔍 Search Filter */}
        <Box className="mb-4">
          <TextField
            label="Filter by Posting Code"
            variant="outlined"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
          />
        </Box>
        <TableContainer
          component={Paper}
          className="rounded-lg overflow-hidden shadow-sm"
          ref={tableRef}
        >
          <Table>
            <TableHead>
              <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100">
                <TableCell className="font-bold text-gray-700 py-4">
                  Posting Code
                </TableCell>
                <TableCell
                  align="right"
                  className="font-bold text-gray-700 py-4"
                >
                  Today
                </TableCell>
                <TableCell
                  align="right"
                  className="font-bold text-gray-700 py-4"
                >
                  Month To Date
                </TableCell>
                <TableCell
                  align="right"
                  className="font-bold text-gray-700 py-4"
                >
                  Year To Date
                </TableCell>
                <TableCell
                  align="right"
                  className="font-bold text-gray-700 py-4"
                >
                  Variance %
                </TableCell>
                <TableCell
                  align="right"
                  className="font-bold text-gray-700 py-4"
                >
                  Last Year MTD
                </TableCell>
                <TableCell
                  align="right"
                  className="font-bold text-gray-700 py-4"
                >
                  Last Year YTD
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentPageRows.map((row, idx) => {
                const variance = getVariancePercentage(
                  row.month_to_date,
                  row.last_year_mtd
                );
                return (
                  <TableRow
                    key={idx}
                    hover
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    <TableCell className="font-medium text-gray-900 py-4">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-blue-500 mr-3" />
                        {row.name}
                      </div>
                    </TableCell>
                    <TableCell
                      align="right"
                      className="text-gray-700 py-4 font-medium"
                    >
                      ${row.today.toLocaleString()}
                    </TableCell>
                    <TableCell
                      align="right"
                      className="text-gray-700 py-4 font-medium"
                    >
                      ${row.month_to_date.toLocaleString()}
                    </TableCell>
                    <TableCell
                      align="right"
                      className="text-gray-700 py-4 font-medium"
                    >
                      ${row.year_to_date.toLocaleString()}
                    </TableCell>
                    <TableCell align="right" className="py-4">
                      <Chip
                        label={`${variance >= 0 ? "+" : ""}${variance.toFixed(1)}%`}
                        size="small"
                        color={variance >= 0 ? "success" : "error"}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right" className="text-gray-700 py-4">
                      ${row.last_year_mtd.toLocaleString()}
                    </TableCell>
                    <TableCell align="right" className="text-gray-700 py-4">
                      ${row.last_year_to_date.toLocaleString()}
                    </TableCell>
                  </TableRow>
                );
              })}

              {/* Total Row */}
              <TableRow className="bg-gradient-to-r from-blue-50 to-indigo-50 border-t-2 border-blue-200">
                <TableCell className="font-bold text-gray-900 py-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-600 mr-3" />
                    Total Revenue
                  </div>
                </TableCell>
                <TableCell
                  align="right"
                  className="font-bold text-gray-900 py-4"
                >
                  ${totals.today.toLocaleString()}
                </TableCell>
                <TableCell
                  align="right"
                  className="font-bold text-gray-900 py-4"
                >
                  ${totals.mtd.toLocaleString()}
                </TableCell>
                <TableCell
                  align="right"
                  className="font-bold text-gray-900 py-4"
                >
                  ${totals.last_year_mtd.toLocaleString()}
                </TableCell>
                <TableCell align="right" className="py-4">
                  <Chip
                    label={`+${getVariancePercentage(totals.mtd, totals.last_year_mtd).toFixed(1)}%`}
                    size="small"
                    color="success"
                    className="font-bold"
                  />
                </TableCell>
                <TableCell
                  align="right"
                  className="font-bold text-gray-900 py-4"
                >
                  ${totals.ytd.toLocaleString()}
                </TableCell>
                <TableCell
                  align="right"
                  className="font-bold text-gray-900 py-4"
                >
                  ${totals.last_year_ytd.toLocaleString()}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <TablePagination
            component="div"
            count={filteredRows.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50, 100]}
            className="border-t border-gray-200 bg-gray-50"
          />
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default RevenueTable;
