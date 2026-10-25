import React from "react";
import { useFormContext } from "react-hook-form";
import { Box, Grid, Typography } from "@mui/material";
import { GroupReservationFormData } from "forms/schemas/salesGroup.validations";
import { IRoomTypes } from "types/roomTypes";
import { GroupAvailabilityData } from "hooks/useGetGroupAvailabiilty";
import { availabilityForDate } from "../utils/createGroup";
import FormCustomDropdown from "components/forms/FormCustomDropdown";
import { appConfig } from "config/app.config";

import useAuth from "hooks/useAuth";
import { getMoment } from "utils/helperFunctions/common";

interface RoomBlockProps {
  blockIndex: number;
  date: Date;
  onRemove?: () => void;
  isShoulderDate: boolean;
  availabilityData?: GroupAvailabilityData;
  roomTypes?: IRoomTypes[];
  roomsAlreadySelected: number;
}

const RoomBlock: React.FC<RoomBlockProps> = ({
  blockIndex,
  date,
  roomTypes,
  availabilityData,
  roomsAlreadySelected,
  isShoulderDate,
}) => {
  const { currentTimeZone } = useAuth();
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext<GroupReservationFormData>();

  const groupArrival = watch("group_arrival_date");
  const groupDeparture = watch("group_departure_date");
  const shoulderArrival = watch("shoulder_arrival_date");
  const shoulderDeparture = watch("shoulder_departure_date");
  const mainGroupRooms = watch("main_group_rooms") || 0;
  const shoulderRooms = watch("shoulder_rooms") || 0;
  const currentBlock = watch(`group_blocks.${blockIndex}`);
  const currentRoomTypeId = currentBlock.room_type_id;
  const blockMoment = getMoment(date, currentTimeZone);

  const availForDate = availabilityForDate(
    date,
    {
      arrival: groupArrival,
      departure: groupDeparture,
      shoulderArrival: shoulderArrival ?? undefined,
      shoulderDeparture: shoulderDeparture ?? undefined,
    },
    availabilityData
  );

  const blockAvailability = availForDate?.filter(
    (avail) => avail.roomTypeId === currentRoomTypeId
  )[0];
  const dayKey = blockMoment.format(appConfig.dateApiFormat);
  const dayCost = blockAvailability?.pricing[dayKey];
  const totalRoomsForDate = blockAvailability?.roomsAvailable;

  const maxAllocation = isShoulderDate ? shoulderRooms : mainGroupRooms;

  const typeName = roomTypes?.find((rt) => rt.id === currentRoomTypeId)?.type;
  const optionCount = Math.min(
    maxAllocation,
    (totalRoomsForDate ?? maxAllocation) - roomsAlreadySelected
  );

  const roomCountOptions = Array.from(
    { length: optionCount > 0 ? optionCount + 1 : optionCount },
    (_, idx) => ({
      value: `${idx}`,
      label: `${idx}`,
    })
  );

  const dateFull = maxAllocation === roomsAlreadySelected;
  return (
    <Box sx={{ mb: 2 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={3}>
          <Typography component="div" fontWeight="bold">
            {typeName}
          </Typography>
        </Grid>
        <Grid container item xs={12} md={3} justifyContent="center">
          <FormCustomDropdown
            name={`group_blocks.${blockIndex}.alloc_count`}
            options={roomCountOptions}
            disabled={!currentBlock.alloc_count && dateFull}
            defaultValue="0"
            fullWidth
            gridProps={{
              sm: 12,
              paddingTop: "25px", // offset the Typography element below
            }}
          />
          {currentBlock.alloc_count === 0 && (
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{
                fontStyle: "italic",
                marginTop: "5px",
                visibility: dateFull ? "visible" : "hidden",
              }}
            >
              {maxAllocation > 1
                ? `You have selected all ${maxAllocation} of your rooms already.`
                : "You have selected your room already."}
            </Typography>
          )}
        </Grid>
        <Grid item xs={12} md={3}>
          <Typography variant="body2" textAlign="center">
            {`$${dayCost ?? ""}`}
          </Typography>
        </Grid>
        <Grid item xs={12} md={3}>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            {totalRoomsForDate}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RoomBlock;
