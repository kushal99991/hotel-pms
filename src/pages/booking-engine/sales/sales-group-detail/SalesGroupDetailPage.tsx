import SalesBookingSummary from "../_components/ContextSalesBookingSummary";
import { Grid, Typography } from "@mui/material";
import SalesGroupDetail from "./component/SalesGroupDetail";
import { useSalesDashboardContext } from "contexts/SalesDashboardContext";

const SalesGroupDetailPage: React.FC = () => {
  const { groupDetail } = useSalesDashboardContext();
  return (
    <Grid container spacing={2} data-testid="sales-group-booking-detail">
      {/* Header - Group Name left aligned and vertically centered */}
      <Grid
        item
        xs={12}
        display="flex"
        alignItems="center"
        justifyContent="flex-start"
        mb={2}
      >
        <Typography
          component="div"
          fontWeight="bold"
          sx={{ fontSize: "28px", fontWeight: "700" }}
        >
          {groupDetail?.groupName ?? ""}
        </Typography>
      </Grid>
      {/* Booking Summary */}
      <Grid item xs={12}>
        <SalesBookingSummary isLoading={false} hideEdit/>
      </Grid>
      <Grid
        item
        xs={12}
        mt={2}
        className="detail-wrapper"
        sx={{ paddingTop: 0 }}
      >
        <SalesGroupDetail />
      </Grid>
    </Grid>
  );
};
export default SalesGroupDetailPage;
