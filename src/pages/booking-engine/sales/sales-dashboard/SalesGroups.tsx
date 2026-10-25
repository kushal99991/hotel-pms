import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import SalesTableList from "./components/SalesTableList";
import {
  SalesDashboardProvider,
  useSalesDashboardContext,
} from "contexts/SalesDashboardContext";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { ISalesGroupListItem } from "types/salesTypes";
import GroupSelectPlaceholder from "../_components/GroupSelectPlaceholder";
import SalesBookingSummary from "../_components/ContextSalesBookingSummary";
import SalesGroupDetail from "../sales-group-detail/component/SalesGroupDetail";
import { useSalesGroupDetailQuery } from "services/salesSlice";

const SalesGroupsContent = () => {
  const navigate = useNavigate();
  const { selectedGroup, setSelectedGroup } = useSalesDashboardContext();
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  // Fetch group detail when a row is clicked
  const {
    data: groupDetail,
    isLoading,
    isFetching,
  } = useSalesGroupDetailQuery(
    { group_id: selectedGroupId ?? 0 },
    { skip: !selectedGroupId }
  );

  // Update context when API returns data, avoiding redundant updates
  useEffect(() => {
    if (groupDetail && selectedGroup?.id !== groupDetail.id) {
      setSelectedGroup(groupDetail);
    }
  }, [groupDetail, selectedGroup, setSelectedGroup]);

  const handleRowClick = (rowData: ISalesGroupListItem) => {
    // Set the group ID to trigger API fetch
    setSelectedGroupId(rowData.id);
  };

  const showLoading = isLoading && !groupDetail;

  return (
    <Box
      sx={{
        bgcolor: "background.default",
      }}
    >
      {/* Data Table */}
      <SalesTableList onRowClick={handleRowClick} />

      {/* Group Overview Section */}
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
            {/* Header */}
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

            {/* Summary Section - wrapped with border to align with table */}
            <Box
              sx={{
                border: "1px solid #ccc",
                borderRadius: 1,
                overflow: "hidden",
              }}
            >
              <SalesBookingSummary
                isLoading={false}
                hideEdit={true}
                onViewGuestsClick={() => {
                  if (selectedGroup?.id) {
                    navigate(
                      `/booking-engine/sales/group/rooming-list/${selectedGroup.id}`
                    );
                  }
                }}
                onAddGuestsClick={() => {
                  if (selectedGroup?.id) {
                    navigate(
                      `/booking-engine/sales/rooming-detail/${selectedGroup.id}`
                    );
                  }
                }}
                hideEdit
              />
            </Box>

            {/* Detail Sections */}
            <Box mt={3}>
              <SalesGroupDetail />
            </Box>
          </Box>
        ) : (
          <GroupSelectPlaceholder />
        )}
      </Box>
    </Box>
  );
};

const SalesGroups = () => {
  return (
    <SalesDashboardProvider>
      <DndProvider backend={HTML5Backend}>
        <SalesGroupsContent />
      </DndProvider>
    </SalesDashboardProvider>
  );
};
export default SalesGroups;
