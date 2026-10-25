import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Divider,
  Skeleton,
  Grid,
  IconButton,
  Card,
  CardContent,
} from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

import { useSalesAccountDetailQuery } from "services/salesSlice";
import GroupListing from "./GroupListing";
import {
  formatFaxNumber,
  formatPhoneNumber,
} from "utils/helperFunctions/formatPercentage";

export default function SalesAccountDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch the account details by ID
  const { data: account, isLoading } = useSalesAccountDetailQuery({
    id: id ?? "",
  });

  const CustomCardTitle = ({
    title,
    icon,
    rightContent,
  }: {
    title: string;
    icon?: React.ReactNode;
    rightContent?: React.ReactNode;
  }) => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        mb: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        {icon ?? ""}
        <Typography variant="h6" sx={{ ml: 1 }}>
          {title}
        </Typography>
      </Box>
      {rightContent && <Box>{rightContent}</Box>}
    </Box>
  );

  if (isLoading) {
    return (
      <Box sx={{ padding: 3 }} data-testid="sales-view-skeleton-loader">
        {/* Main Account Details Skeleton Loader */}
        <Paper sx={{ padding: 3, marginBottom: 3 }}>
          <Box display="flex" alignItems="center">
            <IconButton disabled>
              <ArrowBackIosIcon />
            </IconButton>
            <Skeleton width="40%" height={60} />
          </Box>
          <Divider />
          <Grid container spacing={2} sx={{ marginTop: 2 }}>
            {[...Array(9)].map((_, index) => (
              <Grid item xs={12} sm={4} key={index}>
                <Skeleton variant="text" height={40} />
                <Skeleton variant="text" height={40} />
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Related Group Names Skeleton Loader */}
        <Paper sx={{ padding: 3 }}>
          <Skeleton variant="text" width="30%" height={40} />
          <Divider />
          <Box sx={{ marginTop: 2 }}>
            {[...Array(3)].map((_, index) => (
              <Skeleton key={index} variant="text" width="100%" />
            ))}
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3 }}>
      {/* Main Account Details Section */}
      <Paper sx={{ padding: 3, marginBottom: 3 }}>
        <Box display="flex" alignItems="center">
          <IconButton size="small" onClick={() => navigate(-1)}>
            <ArrowBackIosIcon />
          </IconButton>
          <Typography variant="h5">{`${account?.first_name ?? ""} ${account?.last_name ?? ""}`}</Typography>
        </Box>
        <Divider />
        <Grid container spacing={2} sx={{ marginTop: 2 }}>
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2">Unique Group Code:</Typography>
            <Typography variant="subtitle1">
              {/* {account?.unique_group_code} */}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2">Credit Limit:</Typography>
            <Typography variant="subtitle1">
              {/* ${fixedNumber(account?.credit_limit ?? 0)} */}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2">Billing Name:</Typography>
            <Typography variant="subtitle1">{account?.billing_name}</Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2">Billing Phone:</Typography>
            <Typography variant="subtitle1">
              {formatPhoneNumber(account?.billing_phone ?? "")}
              {account?.billing_phone_ext ? " ext: " : ""}
              {formatPhoneNumber(account?.billing_phone_ext ?? "")}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2">Billing Fax:</Typography>
            <Typography variant="subtitle1">
              {formatFaxNumber(account?.billing_fax ?? "N/A")}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle1">Billing Email:</Typography>
            <Typography variant="subtitle2">
              {account?.billing_email}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2">Billing Address:</Typography>
            <Typography variant="subtitle1">
              {account?.billing_address}, {account?.billing_city},{" "}
              {account?.billing_state}, {account?.billing_zip},{" "}
              {account?.billing_country}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2">Market Segment:</Typography>
            <Typography variant="subtitle1">
              {/* {account?.market_segment} */}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2">Account Notes:</Typography>
            <Typography variant="subtitle1">
              {/* {account?.account_notes || "N/A"} */}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ mb: 3 }}>
        {/* Group Names Section */}
        <Card>
          <CardContent>
            <CustomCardTitle title="Guest Detail" />
            <Divider />

            <Grid container spacing={2} sx={{ marginTop: 2 }}>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2">Guest Name:</Typography>
                <Typography variant="subtitle1">
                  {/* {account?.guest?.first_name} {account?.guest?.last_name} */}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2">Guest Email:</Typography>
                <Typography variant="subtitle1">
                  {/* {account?.guest?.email} */}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2">Guest Country:</Typography>
                <Typography variant="subtitle1">
                  {/* {account?.guest?.country ?? "N/A"} */}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2">Guest Note:</Typography>
                <Typography variant="subtitle1">
                  {/* {account?.guest?.note ?? "N/A"} */}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>

      {/* Related Group Names Section */}
      <GroupListing />
    </Box>
  );
}
