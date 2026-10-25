import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useParams, Link } from "react-router-dom";
import { ArrowBack } from "@mui/icons-material";
import { Box, CircularProgress, Typography } from "@mui/material";
import SalesBookingSummary from "../_components/ContextSalesBookingSummary";
import SalesGroupDetail from "./component/SalesGroupDetail";
import { useSalesGroupDetailQuery } from "services/salesSlice";
import {
  useSalesDashboardContext,
  SalesDashboardProvider,
} from "contexts/SalesDashboardContext";

const SalesGroupDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const groupId = id ? parseInt(id, 10) : 0;
  const { setSelectedGroup } = useSalesDashboardContext();

  const { data: groupDetail, isLoading } = useSalesGroupDetailQuery(
    { group_id: groupId },
    { skip: !groupId }
  );

  useEffect(() => {
    if (!isLoading && groupDetail) {
      setSelectedGroup(groupDetail);
    }
  }, [groupDetail, isLoading]);

  // Only show loading spinner on initial load when data is missing
  const showLoading = isLoading && !groupDetail;
  if (showLoading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="300px"
      >
        <CircularProgress size={40} />
        <Typography variant="body2" color="text.secondary" mt={2}>
          Loading group details...
        </Typography>
      </Box>
    );
  }

  return (
    <Box data-testid="group-overview">
      <Box mb={3} color="secondary.main">
        <Link
          to="/booking-engine/sales/group"
          style={{ display: "flex", alignItems: "center" }}
        >
          <ArrowBack fontSize="small" sx={{ mr: 1 }} />
          All Groups
        </Link>
      </Box>
      <Box
        mb={2}
        display="flex"
        alignItems="center"
        justifyContent="flex-start"
      >
        <Typography
          component="div"
          fontWeight="bold"
          sx={{ fontSize: "28px", fontWeight: "700" }}
        >
          {groupDetail?.group_name}
        </Typography>
      </Box>

      {/* Summary Section - wrapped with border to align with table */}
      <Box
        sx={{
          borderRadius: 1,
          overflow: "hidden",
        }}
      >
        <SalesBookingSummary
          isLoading={isLoading}
          onAddGuestsClick={() => {
            if (groupDetail?.id) {
              navigate(
                `/booking-engine/sales/rooming-detail/${groupDetail?.id}`
              );
            }
          }}
          onViewGuestsClick={() => {
            if (groupDetail?.id) {
              navigate(
                `/booking-engine/sales/group/rooming-list/${groupDetail.id}`
              );
            }
          }}
        />
      </Box>

      {/* Detail Sections */}
      <Box mt={3}>
        <SalesGroupDetail />
      </Box>
    </Box>
  );
};

const SalesGroupDetailsPage = () => {
  return (
    <SalesDashboardProvider>
      <SalesGroupDetails />
    </SalesDashboardProvider>
  );
};
export default SalesGroupDetailsPage;
