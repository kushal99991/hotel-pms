import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import SalesTableList from "./components/SalesTableList";
import {
  SalesDashboardProvider,
  useSalesDashboardContext,
} from "contexts/SalesDashboardContext";
import { ISalesGroupListItem } from "types/salesTypes";
import GroupSelectPlaceholder from "../_components/GroupSelectPlaceholder";
import SalesBookingSummary from "../_components/ContextSalesBookingSummary";
import ReservationTable from "components/ui/ReservationTable/ReservationTable";
import useAuth from "hooks/useAuth";
import { useSalesGroupDetailQuery } from "services/salesSlice";
import { useLazyGetReservationListQuery } from "services/reservationSlice";

const SalesRoomingContent = () => {
  const navigate = useNavigate();
  const { currentProperty } = useAuth();
  const { selectedGroup, setSelectedGroup } = useSalesDashboardContext();
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  const {
    data: groupDetail,
    isLoading,
    isFetching,
  } = useSalesGroupDetailQuery(
    { group_id: selectedGroupId ?? 0 },
    { skip: !selectedGroupId }
  );

  const [
    fetchReservations,
    { data: reservations, isLoading: reservationsLoading },
  ] = useLazyGetReservationListQuery();

  useEffect(() => {
    if (groupDetail && selectedGroup?.id !== groupDetail.id) {
      setSelectedGroup(groupDetail);
    }
  }, [groupDetail, selectedGroup, setSelectedGroup]);

  const handleRowClick = (rowData: ISalesGroupListItem) => {
    setSelectedGroupId(rowData.id);
    if (currentProperty && rowData.group_code) {
      fetchReservations({
        property_id: currentProperty?.id,
        group_code: rowData.group_code,
      });
    }
  };

  const showLoading = isLoading && !groupDetail;

  return (
    <Box
      sx={{
        bgcolor: "background.default",
      }}
    >
      <SalesTableList onRowClick={handleRowClick} maxRows={5} />

      <Box mt={3}>
        {showLoading ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height="200px"
            sx={{
              border: "1px dashed #ccc",
              borderRadius: 2,
              backgroundColor: "#f9f9f9",
            }}
          >
            <CircularProgress size={40} />
            <Typography variant="body2" color="text.secondary" mt={2}>
              Loading group details...
            </Typography>
          </Box>
        ) : selectedGroup ? (
          <Box data-testid="group-overview">
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
                {selectedGroup.group_name}
              </Typography>
            </Box>

            <Box
              sx={{
                border: "1px solid #ccc",
                borderRadius: 1,
                overflow: "hidden",
              }}
            >
              <SalesBookingSummary
                isLoading={false}
                hideEdit
                hideViewGuests
                onAddGuestsClick={() => {
                  if (selectedGroup?.id) {
                    navigate(
                      `/booking-engine/sales/rooming-detail/${selectedGroup.id}`
                    );
                  }
                }}
              />
            </Box>
            <Box mt={3}>
              <ReservationTable
                reservations={reservations ?? []}
                isLoading={reservationsLoading}
              />
            </Box>
          </Box>
        ) : (
          <GroupSelectPlaceholder message="Choose a group to see it's current rooming list." />
        )}
      </Box>
    </Box>
  );
};

const SalesRooming = () => {
  return (
    <SalesDashboardProvider>
      <SalesRoomingContent />
    </SalesDashboardProvider>
  );
};
export default SalesRooming;
