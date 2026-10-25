import React, { useState } from "react";
import { Link } from "react-router-dom";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
  Alert,
  Box,
  IconButton,
  Skeleton,
  Typography,
  CircularProgress,
} from "@mui/material";
import { Download } from "@mui/icons-material";
import { useParams } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

import { useGetInvoiceQuery } from "services/paymentsSlice";
import useAuth from "hooks/useAuth";
import { getMoment } from "utils/helperFunctions/common";
import { appConfig } from "config/app.config";
import { apiAmountToNumber } from "utils/dataFormats";
import useGetS3SignedFilesList from "hooks/useGetS3ReportList";
import { makeParamsFromInvoicePath } from "utils/media";

type InvoiceItemRow = {
  key: string;
  id: number;
  reservationId: number;
  firstName: string;
  lastName: string;
  arrival: string;
  departure: string;
  site: string;
  balance: number;
};

const InvoiceDetails: React.FC = () => {
  const { users: currentUser, currentTimeZone, properties } = useAuth();
  const params = useParams();
  const theme = useTheme();
  const [downloadError, setDownloadError] = useState("");
  const {
    data: invoice,
    isLoading,
    error,
  } = useGetInvoiceQuery({
    invoice_id: params.id ? +params.id : -1,
  });
  const s3Params = makeParamsFromInvoicePath(invoice?.path ?? "");
  const [getFileList, { error: printError, loading: downloading }] =
    useGetS3SignedFilesList({
      ...s3Params,
      property_id: currentUser?.defaultPropertyId ?? -1,
      type: "direct_billing_invoice",
    });

  async function handleDownloadClick() {
    setDownloadError("");
    const presignedResults = await getFileList();
    if (
      "results" in presignedResults &&
      presignedResults?.results?.files?.length
    ) {
      const fileName = s3Params.fileName;
      if (!fileName) {
        setDownloadError(
          "No file was available to download for this invoice. Contact your administrator for assistance."
        );
        return;
      }
      const fullSignedUrl = presignedResults.results.files.find((f: string) => {
        return f.toString().includes(fileName.toString());
      });
      if (fullSignedUrl) {
        window.open(fullSignedUrl, "_blank");
      } else {
        setDownloadError(
          "File for this invoice was not found. Contact your administrator for assistance."
        );
      }
    }
  }

  const columns: GridColDef<InvoiceItemRow>[] = [
    {
      field: "id",
      headerName: "Folio No",
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Link
          to={`/booking-engine/reservations/folios/${params.row.reservationId}`}
          style={{ textDecoration: "underline" }}
        >
          {params.value}
        </Link>
      ),
    },
    {
      field: "firstName",
      headerName: "First Name",
      flex: 1,
    },
    {
      field: "lastName",
      headerName: "Last Name",
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "arrival",
      headerName: "Arrival",
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "departure",
      headerName: "Departure",
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "site",
      headerName: "Site",
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "balance",
      headerName: "Balance",
      align: "center",
      headerAlign: "center",
      flex: 1,
      renderCell: (params) => {
        if (params.value == null) {
          return "";
        }
        return params.value;
      },
    },
  ];

  const tableRows: InvoiceItemRow[] = (invoice?.folios ?? []).map((f) => {
    const first = f.payments[0]?.reservation?.guest?.first_name ?? "";
    const last = f.payments[0]?.reservation?.guest?.last_name ?? "";
    let arrival = "";
    let departure = "";
    let site = "";
    if (f.payments[0]?.reservation) {
      arrival = getMoment(
        f.payments[0].reservation.start_date,
        currentTimeZone
      ).format(appConfig.displayDateFormat);
      departure = getMoment(
        f.payments[0].reservation.end_date,
        currentTimeZone
      ).format(appConfig.displayDateFormat);

      const property = properties.find(
        (p) => p.id === f.payments[0]?.reservation?.property_id
      );
      site = property?.name ?? `${f.payments[0]?.reservation?.property_id}`;
    }
    return {
      key: `${f.id}_${f.payments[0]?.reservation?.id ?? "unknown_res"}`,
      balance: apiAmountToNumber(f.amount_needed_to_settle),
      id: f.id,
      reservationId: f.payments[0]?.reservation?.id ?? -1,
      firstName: first,
      lastName: last,
      arrival,
      departure,
      site,
    };
  });

  if (isLoading) {
    return (
      <Box>
        <Typography variant="h5" fontWeight={600}>
          <Skeleton width="200px" />
        </Typography>

        <Box mt={0.5}>
          <Skeleton width="300px" height="1.25rem" />
        </Box>

        <Box display="flex" flexDirection="column" mt={5}>
          <Skeleton height={56} width="100%" />

          {[...Array(5)].map((_, index) => (
            <Skeleton key={index} height={40} width="100%" sx={{ mt: 1 }} />
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ my: 2 }}>
          {`There was an error trying to retrieve details for Invoice #${params.id}`}
          {error.message ?? error.toString()}
          Please refresh to try again.
        </Alert>
      )}
      {printError && (
        <Alert severity="error" sx={{ my: 2 }}>
          {`There was an error retrieving invoice file to download. `}
          {`${printError?.message ?? printError?.toString()}. `}
          Please refresh to try again.
        </Alert>
      )}
      {downloadError && (
        <Alert severity="error" sx={{ my: 2 }}>
          {`There was an error retrieving invoice file to download. `}
          {downloadError}
        </Alert>
      )}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography
            variant="h5"
            fontWeight={600}
          >{`Invoice #${params.id}`}</Typography>
          <Box mt={0.5}>
            <Link
              to={`/booking-engine/accounting/account/${invoice?.direct_billing_account_id}`}
              style={{
                textDecoration: "underline",
                color: theme.palette.secondary.main,
                fontSize: "0.875rem",
                marginTop: "8px",
              }}
            >
              {`Go to Direct Billing Account ${invoice?.direct_billing_account_id}`}
            </Link>
          </Box>
        </Box>
        <IconButton
          onClick={handleDownloadClick}
          sx={{
            backgroundColor: "secondary.main",
            mr: 2,
            "&:hover": { backgroundColor: "secondary.dark" },
          }}
        >
          {downloading ? (
            <CircularProgress sx={{ color: "white" }} size={24} />
          ) : (
            <Download sx={{ color: "white" }} />
          )}
        </IconButton>
      </Box>
      <Box display="flex" flexDirection="column" mt={5}>
        <DataGrid
          rows={tableRows}
          columns={columns}
          getRowId={(row) => row.key}
          rowSelection={false}
          pageSizeOptions={[25, 50, 100]}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 25,
                page: 0,
              },
            },
          }}
          sx={{
            "& .MuiDataGrid-cell:focus": {
              outline: "none",
            },

            "& .MuiDataGrid-cell:focus-within": {
              outline: "none",
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default InvoiceDetails;
