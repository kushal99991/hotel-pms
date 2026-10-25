import React, { useCallback, useEffect } from "react";
import CommonTabs from "components/elements/Tabs/CommonTabs";
import EditRoomType from "./EditRoomType";
import RoomAmenities from "./RoomAmenities";
import { useGetRoomTypeByIdMutation } from "services/roomTypeSlice";
import { useNavigate, useParams } from "react-router-dom";
import { Box, IconButton, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const EditRoomTypePage: React.FC = () => {
  const params = useParams<{ id: string }>();
  const Navigate = useNavigate();
  const [getRoomTypeById, { data: roomTypeDetail }] =
    useGetRoomTypeByIdMutation();
  useEffect(() => {
    if (params?.id) {
      getRoomTypeById({ id: params.id });
    }
  }, [params]);
  const onBackClick = useCallback(() => {
    Navigate(
      `/booking-engine/admin/property/detail/${roomTypeDetail?.propertyId}?type=room-configuration`
    );
  }, [roomTypeDetail?.propertyId]);
  return (
    <Box>
      {/* Title with Back Arrow */}
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={onBackClick} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" component="div">
          {roomTypeDetail?.name || "Loading..."}
        </Typography>
      </Box>
      <CommonTabs
        tabs={[
          {
            content: <EditRoomType />,
            label: "General",
          },
          {
            content: <RoomAmenities />,
            label: "Room Amenities",
          },
        ]}
        initialTab={0}
      />
    </Box>
  );
};
export default EditRoomTypePage;
