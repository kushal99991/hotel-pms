import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  CircularProgress,
  Grid,
  Snackbar,
  Typography,
} from "@mui/material";
import SalesBookingSummary from "../_components/ContextSalesBookingSummary";
import SalesRoomingDetail from "./component/SalesRoomingDetail";
import { useSalesDashboardContext } from "contexts/SalesDashboardContext";
import { useSalesGroupDetailQuery } from "services/salesSlice";

const SalesRoomingDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const groupId = id ? parseInt(id, 10) : 0;
  const [groupName, setGroupName] = useState<string>("");
  const { selectedGroup, setSelectedGroup } = useSalesDashboardContext();

  const {
    data: groupDetail,
    isLoading,
    refetch,
    isFetching,
  } = useSalesGroupDetailQuery({ group_id: groupId }, { skip: !groupId });

  useEffect(() => {
    if (!isLoading && groupDetail) {
      setSelectedGroup(groupDetail);
      setGroupName(groupDetail.group_name);
    }
  }, [groupDetail, isLoading]);

  useEffect(() => {
    // update if mounted and brand new group is fetched
    if (groupDetail && selectedGroup?.id !== groupDetail.id) {
      setSelectedGroup(groupDetail);
      if (groupDetail.group_name !== groupName) {
        setGroupName(groupDetail.group_name);
      }
    }
  }, [groupDetail, selectedGroup, groupName, setSelectedGroup]);

  function handleSuccessFulCreate() {
    refetch();
  }

  function allBlocksFullyBooked() {
    if (!groupDetail) return false;
    const blocked = groupDetail.rooms_blocked_by_type;
    return (
      Object.keys(blocked).length > 0 &&
      Object.entries(blocked).every(
        ([type, count]) => (groupDetail.rooms_booked_by_type?.[type] ?? 0) >= count
      )
    );
  }

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
    <Grid container spacing={2} data-testid="sales-group-booking-detail">
      <Grid
        item
        xs={12}
        display="flex"
        alignItems="center"
        mb={2}
        className="header-buttons"
      >
        <Typography
          component="div"
          fontWeight="bold"
          sx={{ fontSize: "28px", fontWeight: "700" }}
        >
          {groupName ?? ""}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Box
          sx={{
            overflow: "hidden",
          }}
        >
          <SalesBookingSummary
            isLoading={isLoading || isFetching}
            hideEdit
            hideAddGuests
            onViewGuestsClick={() => {
              if (selectedGroup?.id) {
                navigate(
                  `/booking-engine/sales/group/rooming-list/${selectedGroup.id}`
                );
              }
            }}
          />
        </Box>
      </Grid>
      {allBlocksFullyBooked() && (
        <Grid item xs={12}>
          <Alert severity="warning">
            All the reservations for the blocks reserved have been booked. The
            group may book additional reservations but the group rate may not be
            guaranteed.
          </Alert>
        </Grid>
      )}
      <Grid
        item
        xs={12}
        mt={2}
        className="detail-wrapper"
        sx={{ paddingTop: 0 }}
      >
        <SalesRoomingDetail
          group={groupDetail}
          onSuccessfulCreate={handleSuccessFulCreate}
        />
      </Grid>
    </Grid>
  );
};
export default SalesRoomingDetailPage;
