import React, { useEffect, useMemo } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { Box, Typography } from "@mui/material";
import { getMoment } from "utils/helperFunctions/common";
import {
  GroupFormBlock,
  GroupReservationFormData,
} from "forms/schemas/salesGroup.validations";
import { GroupAvailabilityData } from "hooks/useGetGroupAvailabiilty";
import { IRoomTypes } from "types/roomTypes";
import RoomBlockSection from "./RoomBlockSection";
import {
  availabilityForDate,
  buildAvailabilityKey,
  buildBlocksKey,
  isShoulderDate,
} from "../utils/createGroup";
import useAuth from "hooks/useAuth";

export const RoomBlocksSection: React.FC<{
  availability?: GroupAvailabilityData;
  roomTypes?: IRoomTypes[];
}> = ({ availability, roomTypes }) => {
  const { currentTimeZone } = useAuth();
  const { control, watch } = useFormContext<GroupReservationFormData>();
  const { fields: blocks, replace: replaceBlocks } = useFieldArray({
    control,
    name: "group_blocks",
  });

  const groupArrival = watch("group_arrival_date");
  const groupDeparture = watch("group_departure_date");
  const shoulderArrival = watch("shoulder_arrival_date");
  const shoulderDeparture = watch("shoulder_departure_date");
  const mainGroupRooms = watch("main_group_rooms") || 0;
  const shoulderRooms = watch("shoulder_rooms") || 0;

  useEffect(() => {
    if (!groupArrival || !groupDeparture || !currentTimeZone) {
      return;
    }
    if (blocks.length > 0) {
      const availabilityKey = buildAvailabilityKey(availability);
      const blockKey = buildBlocksKey(blocks, currentTimeZone);
      if (availabilityKey === blockKey) return;
    }
    const effectiveStart = shoulderArrival ?? groupArrival;
    const effectiveEnd = shoulderDeparture ?? groupDeparture;

    // Interpret both boundary dates in the target timezone, normalized to midnight
    const startMoment = getMoment(
      effectiveStart,
      currentTimeZone,
      false
    ).startOf("day");
    const endMoment = getMoment(effectiveEnd, currentTimeZone, false).startOf(
      "day"
    );

    const dates: Date[] = [];
    const current = startMoment.clone();

    while (current.isBefore(endMoment)) {
      dates.push(current.toDate());
      current.add(1, "day");
    }

    const terminalEndDate = endMoment.toDate();
    const newBlocks: GroupFormBlock[] = [];
    dates.forEach((date, index) => {
      const isLast = index === dates.length - 1;
      const availForDate = availabilityForDate(
        date,
        {
          arrival: groupArrival,
          departure: groupDeparture,
          shoulderArrival: shoulderArrival ?? undefined,
          shoulderDeparture: shoulderDeparture ?? undefined,
        },
        availability
      );
      if (availForDate?.length) {
        const groupDates = {
          arrival: groupArrival,
          departure: groupDeparture,
          shoulderArrival: shoulderArrival ?? undefined,
          shoulderDeparture: shoulderDeparture ?? undefined,
        };
        const dateInShoulder = isShoulderDate(date, groupDates, currentTimeZone);
        const roomsNeeded = dateInShoulder ? shoulderRooms : mainGroupRooms;
        const isSingleType = availForDate.length === 1;
        availForDate.forEach((avail) => {
          newBlocks.push({
            start_date: date,
            end_date: isLast ? terminalEndDate : dates[index + 1],
            room_type_id: avail.roomTypeId,
            alloc_count: isSingleType ? roomsNeeded : 0,
          });
        });
      }
    });
    replaceBlocks(newBlocks);
  }, [
    groupArrival,
    groupDeparture,
    shoulderArrival,
    shoulderDeparture,
    mainGroupRooms,
    shoulderRooms,
    replaceBlocks,
    blocks,
    availability,
    currentTimeZone,
  ]);

  const blocksByDate = useMemo(() => {
    const grouped = new Map<string, number[]>();
    blocks.forEach((field, index) => {
      if (!field.start_date) return;
      const dateKey = field.start_date.toISOString().split("T")[0];
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)?.push(index);
    });

    // Sort by date
    return new Map([...grouped.entries()].sort());
  }, [blocks]);

  if (blocks.length === 0) {
    return null;
  }
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Room Allocations
      </Typography>

      {Array.from(blocksByDate.entries()).map(([dateKey, indices], index) => {
        const firstBlockIndex = indices[0];
        const firstBlock = blocks[firstBlockIndex];
        // since blocks in this group are all the same start date, just use
        // the first one for the date

        return (
          <RoomBlockSection
            key={`${firstBlock.start_date}_${index}`}
            date={firstBlock.start_date}
            availability={availability}
            roomTypes={roomTypes}
          />
        );
      })}
    </Box>
  );
};
