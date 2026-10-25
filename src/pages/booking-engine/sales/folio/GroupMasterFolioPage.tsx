import { Box, Grid, Typography } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useNavigate, useParams, Link } from "react-router-dom";
import { SalesDashboardProvider } from "contexts/SalesDashboardContext";
import { useSalesGroupDetailQuery } from "services/salesSlice";
import SalesGroupSummary from "../_components/SalesGroupSummary";
import GroupMasterFolio from "./GroupMasterFolio";

const GroupMasterFolioPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const groupId = id ? parseInt(id, 10) : 0;

  const {
    data: groupDetail,
    isLoading,
    refetch,
    isFetching,
  } = useSalesGroupDetailQuery({ group_id: groupId }, { skip: !groupId });

  return (
    <SalesDashboardProvider>
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
          {groupDetail?.group_name ?? ""}
        </Typography>
      </Grid>
      <Box mb={3} color="secondary.main">
        <Link
          to={`/booking-engine/sales/group-detail/${groupDetail?.id}`}
          style={{ display: "flex", alignItems: "center" }}
        >
          <ArrowBack fontSize="small" sx={{ mr: 1 }} />
          Group Details
        </Link>
      </Box>
      <SalesGroupSummary
        salesGroup={groupDetail}
        isLoading={isLoading}
        onViewGuestsClick={() => {
          if (groupDetail?.id) {
            navigate(
              `/booking-engine/sales/group/rooming-list/${groupDetail.id}`
            );
          }
        }}
        onAddGuestsClick={() => {
          if (groupDetail?.id) {
            navigate(`/booking-engine/sales/rooming-detail/${groupDetail.id}`);
          }
        }}
      />
      <Box mt={2}>
        <GroupMasterFolio groupDetail={groupDetail} />
      </Box>
    </SalesDashboardProvider>
  );
};
export default GroupMasterFolioPage;
