import React, { useState } from "react";
import { Typography, Box, Grid, Button, styled } from "@mui/material";
import { useSalesDashboardContext } from "contexts/SalesDashboardContext";
import { toCapitalCase } from "utils/helperFunctions/capitalCase";
import GroupSegmentChannelModal from "./GroupSegmentChannelModal";

interface RoomInfoProps {
  showRightSection?: boolean;
  showTitle?: boolean;
}

const RoomInfo: React.FC<RoomInfoProps> = ({
  showRightSection = true,
  showTitle = true,
}) => {
  const { selectedGroup, onRefresh } = useSalesDashboardContext();
  const [openSegmentModal, setOpenSegmentModal] = useState(false);

  function handleEditClick() {
    setOpenSegmentModal(true);
  }

  function handleModalClose(refresh: boolean) {
    setOpenSegmentModal(false);
    if (refresh) {
      onRefresh();
    }
  }

  const roomsBlockedByType = selectedGroup?.rooms_blocked_by_type ?? {};
  const roomsBookedByType = selectedGroup?.rooms_booked_by_type ?? {};
  const roomTypes = Object.keys(roomsBlockedByType);

  return (
    <Grid container>
      {/* Left Section - Room Types */}
      <Grid
        item
        xs={12}
        sm={showRightSection ? 6 : 12}
        display="flex"
        flexDirection="column"
      >
        {showTitle && (
          <Typography variant="body1" fontWeight="bold" mb={1}>
            Room Types Blocked / Booked:
          </Typography>
        )}

        {roomTypes.length > 0 ? (
          roomTypes.map((roomType) => (
            <Typography key={roomType} variant="body2" mb={0.5}>
              {roomType} - {roomsBlockedByType[roomType] ?? 0} /{" "}
              {roomsBookedByType[roomType] ?? 0}
            </Typography>
          ))
        ) : (
          <Typography color="text.secondary">No rooms allocated</Typography>
        )}
      </Grid>

      {/* Conditionally render Right Section with divider */}
      {showRightSection && (
        <Grid
          item
          xs={12}
          sm={6}
          display="flex"
          flexDirection="column"
          paddingLeft={2}
          sx={{
            borderLeft: "1px solid #D6D6D6",
          }}
        >
          {/* Market Segment Row */}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mb={0.5}
          >
            <Box display="flex" alignItems="center">
              <Typography fontWeight="bold" variant="body2" mr={1}>
                Market Segment:
              </Typography>
              <Typography variant="body2">
                {`${selectedGroup?.market_segment
                  ? toCapitalCase(
                      selectedGroup.market_segment.replace(/_/g, " ")
                    )
                  : "-"} / ${selectedGroup?.sales_distribution
                  ? toCapitalCase(
                      selectedGroup.sales_distribution.replace(/_/g, " ")
                    )
                  : "-"}`}
              </Typography>
            </Box>
            <EditButton onClick={handleEditClick}>Edit</EditButton>
          </Box>

          {/* Booking Channel Row */}
          <Box display="flex" alignItems="center">
            <Typography fontWeight="bold" variant="body2" mr={1}>
              Booking Channel:
            </Typography>
            <Typography variant="body2">
              {selectedGroup?.booking_channel
                ? toCapitalCase(
                    selectedGroup.booking_channel.replace(/_/g, " ")
                  )
                : "-"}
            </Typography>
          </Box>
        </Grid>
      )}
      <GroupSegmentChannelModal
        open={openSegmentModal}
        group={selectedGroup}
        onCloseModal={handleModalClose}
      />
    </Grid>
  );
};

export default RoomInfo;

const EditButton = styled(Button)({
  textTransform: "none",
  textDecoration: "underline",
  color: "#32A1AE",
  fontSize: "14px",
  padding: 0,
  minWidth: "unset",
  "&:hover": {
    textDecoration: "underline",
    backgroundColor: "transparent",
  },
});
