// src/pages/NightAuditReports.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  CircularProgress,
  Button,
  Alert,
  Skeleton,
} from "@mui/material";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { usePresignedFileUrl } from "hooks/usePresignedReportUrl";
import { useGetReportMediaMutation } from "services/propertyMediaSlice";
import { appConfig } from "config/app.config";
import useAuth from "hooks/useAuth";
import moment from "moment";

const NightAuditReportsSkeleton: React.FC = () => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card elevation={2}>
          <CardContent>
            {/* Filters Skeleton */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
                mb: 2,
              }}
            >
              <Skeleton variant="text" width={200} height={30} />
              <Box sx={{ display: "flex", gap: 1 }}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    variant="rectangular"
                    width={90}
                    height={36}
                    sx={{ borderRadius: 1 }}
                  />
                ))}
              </Box>
            </Box>

            {/* Table Skeleton */}
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Skeleton width="80%" />
                    </TableCell>
                    <TableCell>
                      <Skeleton width="60%" />
                    </TableCell>
                    <TableCell>
                      <Skeleton width="40%" />
                    </TableCell>
                    <TableCell align="center">
                      <Skeleton width="30%" />
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <Skeleton width="90%" />
                      </TableCell>
                      <TableCell>
                        <Skeleton width="70%" />
                      </TableCell>
                      <TableCell>
                        <Skeleton width="60%" />
                      </TableCell>
                      <TableCell align="center">
                        <Skeleton width={24} height={24} variant="circular" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

/* ------------------------------------------------------------------------ */
/*                               Helper types                               */
/* ------------------------------------------------------------------------ */

export interface IReportMediaItem {
  Key: string;
  LastModified: string;
  Size: number;
  FullPath: string;
}

/* ------------------------------------------------------------------------ */
/*                               Helper utils                               */
/* ------------------------------------------------------------------------ */

/** Build the S3 prefix for night‑audit report objects */
const buildReportMediaKey = ({
  tenant,
  property_id,
  year,
  month,
  day,
  type,
}: {
  tenant: string;
  property_id: number;
  year: number;
  month: number;
  day: number;
  type: string;
}) =>
  `/tenant=${tenant}/property_id=${property_id}/year=${year}/month=${month}/day=${day}/type=${type}`;

/** Parse an S3 object key back into its component parts */
const parseMediaKey = (key: string) => {
  const segments = key.split("/");
  const fileName = segments.at(-1) || "";
  const params: Record<string, string> = {};
  segments.forEach((seg) => {
    const [k, v] = seg.split("=");
    if (v) params[k] = v;
  });
  return {
    fileName,
    property_id: Number(params.property_id),
    year: Number(params.year),
    month: Number(params.month),
    day: Number(params.day),
    type: params.type,
  };
};

/** Render bytes in a friendlier format */
const humanSize = (bytes: number) =>
  bytes < 1024
    ? `${bytes} B`
    : bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

/* ------------------------------------------------------------------------ */
/*                               Main page                                  */
/* ------------------------------------------------------------------------ */

const NightAuditReports: React.FC = () => {
  const { users } = useAuth();

  /* ----------------------- date‑filter state --------------------------- */
  const today = moment();
  const [day, setDay] = useState(today.date());
  const [month, setMonth] = useState(today.month() + 1);
  const [year, setYear] = useState(today.year());

  /* -------------------------- API hooks -------------------------------- */
  const [getReportMedia, { data: mediaList = [], isLoading: listLoading }] =
    useGetReportMediaMutation();

  const {
    getUrl,
    error: downloadError,
    loading: downloadLoading,
  } = usePresignedFileUrl();

  const [loadingRow, setLoadingRow] = useState<number | null>(null);

  const lastFiveYears = Array.from({ length: 5 }, (_, i) => today.year() - i);

  /* ----------------------- fetch list helper --------------------------- */
  const fetchReportMedia = () => {
    const key = buildReportMediaKey({
      tenant: appConfig.getCookie("domain") || "default",
      property_id: users?.defaultPropertyId ?? 1,
      year,
      month,
      day,
      type: "night_audit",
    });

    getReportMedia({
      bucket: appConfig.s3ReportBucketName,
      key,
    });
  };

  useEffect(() => {
    if (users?.defaultPropertyId) fetchReportMedia();
  }, [users?.defaultPropertyId]);

  /* ----------------------- download handler ---------------------------- */
  const handleDownload = async (rowIdx: number) => {
    const item = mediaList[rowIdx];
    if (!item) return;

    const { property_id, year, month, day, type, fileName } = parseMediaKey(
      item.Key
    );

    setLoadingRow(rowIdx);

    const url = await getUrl({
      propertyId: property_id,
      date: new Date(year, month - 1, day),
      type,
      fileName,
    });

    if (url) window.open(url, "_blank");
    setLoadingRow(null);
  };

  /* ----------------------- render helpers ------------------------------ */
  const renderDownloadBtn = (rowIdx: number) => {
    const busy = downloadLoading && loadingRow === rowIdx;
    return (
      <Tooltip title="Download" arrow>
        <span>
          <IconButton
            size="small"
            onClick={() => handleDownload(rowIdx)}
            disabled={busy}
          >
            {busy ? (
              <CircularProgress size={18} />
            ) : (
              <FileDownloadOutlinedIcon fontSize="small" />
            )}
          </IconButton>
        </span>
      </Tooltip>
    );
  };

  /* -------------------------------------------------------------------- */
  /*                                 UI                                   */
  /* -------------------------------------------------------------------- */

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={600} color="primary" gutterBottom>
          Night Audit Reports
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Browse and download generated nightly reports
        </Typography>
      </Box>
      {listLoading ? (
        <NightAuditReportsSkeleton />
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card elevation={2}>
              <CardContent>
                {/* Filters */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 2,
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" fontWeight={600}>
                    Night Audit Reports List
                  </Typography>

                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    {/* Day */}
                    <FormControl size="small" sx={{ minWidth: 80 }}>
                      <InputLabel>Day</InputLabel>
                      <Select
                        value={day}
                        label="Day"
                        onChange={(e) => setDay(Number(e.target.value))}
                      >
                        {Array.from({ length: 31 }, (_, i) => (
                          <MenuItem key={i + 1} value={i + 1}>
                            {i + 1}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {/* Month */}
                    <FormControl size="small" sx={{ minWidth: 90 }}>
                      <InputLabel>Month</InputLabel>
                      <Select
                        value={month}
                        label="Month"
                        onChange={(e) => setMonth(Number(e.target.value))}
                      >
                        {Array.from({ length: 12 }, (_, i) => (
                          <MenuItem key={i + 1} value={i + 1}>
                            {i + 1}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {/* Year */}
                    <FormControl size="small" sx={{ minWidth: 90 }}>
                      <InputLabel>Year</InputLabel>
                      <Select
                        value={year}
                        label="Year"
                        onChange={(e) => setYear(Number(e.target.value))}
                      >
                        {lastFiveYears.map((y) => (
                          <MenuItem key={y} value={y}>
                            {y}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {/* Search */}
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={fetchReportMedia}
                      disabled={listLoading}
                    >
                      {listLoading ? <CircularProgress size={18} /> : "Search"}
                    </Button>
                  </Box>
                </Box>

                {/* Error banner on download failure */}
                {downloadError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {downloadError}
                  </Alert>
                )}

                {/* Media table */}
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>File</TableCell>
                        <TableCell>Last Modified</TableCell>
                        <TableCell>Size</TableCell>
                        <TableCell align="center">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {mediaList.map((item: IReportMediaItem, idx: number) => {
                        const { fileName } = parseMediaKey(item.Key);
                        return (
                          <TableRow key={item.Key}>
                            <TableCell>{fileName}</TableCell>
                            <TableCell>
                              {new Date(item.LastModified).toLocaleString()}
                            </TableCell>
                            <TableCell>{humanSize(item.Size)}</TableCell>
                            <TableCell align="center">
                              {renderDownloadBtn(idx)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {mediaList.length === 0 && !listLoading && (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            No reports found for the selected date.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default NightAuditReports;
