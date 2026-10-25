import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, CircularProgress, Grid, Typography } from "@mui/material";
import SalesBookingSummary from "../../_components/ContextSalesBookingSummary";
import { useLazyGetReservationListQuery } from "services/reservationSlice";
import useAuth from "hooks/useAuth";
import { useSalesDashboardContext } from "contexts/SalesDashboardContext";
import { useSalesGroupDetailQuery } from "services/salesSlice";
import ReservationTable from "components/ui/ReservationTable/ReservationTable";

const GroupRoomingList: React.FC = () => {
  const { currentProperty } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const groupId = id ? parseInt(id, 10) : 0;
  const { setSelectedGroup } = useSalesDashboardContext();

  const { data: groupDetail, isLoading } = useSalesGroupDetailQuery(
    { group_id: groupId },
    { skip: !groupId }
  );

  const [
    fetchReservations,
    { data: reservations, isLoading: reservationsLoading },
  ] = useLazyGetReservationListQuery();

  useEffect(() => {
    if (!isLoading && groupDetail) {
      setSelectedGroup(groupDetail);
      if (currentProperty?.id) {
        console.log("fetch reservations");
        fetchReservations({
          property_id: currentProperty.id,
          group_code: groupDetail.group_code,
        });
      }
    }
  }, [groupDetail, isLoading, currentProperty]);

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
    <Grid container spacing={2} data-testid="sales-group-rooming-list">
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
          {groupDetail?.group_name ?? ""}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Box
          sx={{
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
            hideEdit
            hideViewGuests
          />
        </Box>
      </Grid>
      <Grid item xs={12} mt={2} sx={{ paddingTop: 0 }}>
        <ReservationTable
          reservations={reservations ?? []}
          isLoading={reservationsLoading}
        />
      </Grid>
    </Grid>
  );
};
export default GroupRoomingList;
