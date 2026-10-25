import React, { useState, useMemo } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import {
  Box,
  Typography,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  GroupFormBlock,
  GroupReservationFormData,
} from "forms/schemas/salesGroup.validations";
import { GroupAvailabilityData } from "hooks/useGetGroupAvailabiilty";
import { IRoomTypes } from "types/roomTypes";
import useAuth from "hooks/useAuth";
import RoomBlock from "./RoomBlock";
import { availabilityForDate } from "../utils/createGroup";
import { getMoment } from "utils/helperFunctions/common";
import { appConfig } from "config/app.config";
import { isShoulderDate } from "../utils/createGroup";

interface RoomBlockSectionProps {
  date: Date;
  roomTypes?: IRoomTypes[];
  availability?: GroupAvailabilityData;
}

interface RenderBlock extends GroupFormBlock {
  idx: number;
}

const RoomBlockSection: React.FC<RoomBlockSectionProps> = ({
  date,
  availability,
  roomTypes,
}) => {
  const { currentTimeZone } = useAuth();
  const { watch } = useFormContext<GroupReservationFormData>();
  const [accordionOpen, setAccordionOpen] = useState<boolean>(true);
  const blocks = watch("group_blocks");
  const dateMoment = getMoment(date, currentTimeZone);
  const sectionBlocks = blocks.reduce((viewBlocks, block, idx) => {
    const blockMoment = getMoment(block.start_date, currentTimeZone);
    if (blockMoment.isSame(dateMoment, "day")) {
      viewBlocks.push({
        idx,
        ...block,
      });
    }
    return viewBlocks;
  }, [] as RenderBlock[]);

  const groupArrival = watch("group_arrival_date");
  const groupDeparture = watch("group_departure_date");
  const shoulderArrival = watch("shoulder_arrival_date");
  const shoulderDeparture = watch("shoulder_departure_date");
  const mainGroupRooms = watch("main_group_rooms") || 0;
  const shoulderRooms = watch("shoulder_rooms") || 0;
  const dateInShoulder = isShoulderDate(
    date,
    {
      arrival: groupArrival,
      departure: groupDeparture,
      shoulderArrival: shoulderArrival ?? undefined,
      shoulderDeparture: shoulderDeparture ?? undefined,
    },
    currentTimeZone
  );

  function handleAccordionChange(_evt, open) {
    setAccordionOpen(open);
  }

  const dateAvailability = availabilityForDate(
    date,
    {
      arrival: groupArrival,
      departure: groupDeparture,
      shoulderArrival: shoulderArrival ?? undefined,
      shoulderDeparture: shoulderDeparture ?? undefined,
    },
    availability
  );

  const summaryInfo = roomTypes?.reduce(
    (acc, type) => {
      const block = sectionBlocks.find((b) => b.room_type_id === type.id);
      if (block) {
        const typeAvailabilityForDate = dateAvailability?.find(
          (da) => da.roomTypeId === type.id
        );
        const dayKey = dateMoment.format(appConfig.dateApiFormat);
        const dayCost = typeAvailabilityForDate?.pricing[dayKey];
        acc.push({
          selected: block.alloc_count ? `${block.alloc_count}` : "0",
          type: type?.type ?? "--",
          cost: dayCost ?? "N/A",
          available: typeAvailabilityForDate?.roomsAvailable
            ? `${typeAvailabilityForDate?.roomsAvailable}`
            : "--",
        });
      }
      return acc;
    },
    [] as { selected: string; type: string; cost: string; available: string }[]
  );

  const selectedStr = summaryInfo?.map((b) => b.selected).join(" / ");
  const typeStr = summaryInfo?.map((b) => b.type).join(" / ");
  const costStr = summaryInfo
    ?.map((b) => (b.cost === "N/A" ? "N/A" : `$${b.cost}`))
    .join(" / ");
  const availableStr = summaryInfo?.map((b) => b.available).join(" / ");

  const roomsNeeded = dateInShoulder ? shoulderRooms : mainGroupRooms;
  const selectedCount = sectionBlocks.reduce(
    (sum, block) => sum + +block.alloc_count,
    0
  );
  const sectionComplete = selectedCount >= roomsNeeded;
  return (
    <Accordion defaultExpanded onChange={handleAccordionChange}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          "& .MuiAccordionSummary-content": {
            flexWrap: "wrap",
          },
        }}
      >
        <Typography variant="subtitle1" fontWeight="medium" fontSize="1.2rem">
          {dateMoment.format(appConfig.displayDateFormat)}
        </Typography>
        {!accordionOpen && (
          <Grid container mt={1}>
            <Grid item xs={12} sm={3}>
              <Typography component="span" fontWeight="bold">
                Selected Rooms
              </Typography>
              <Typography component="span" sx={{ ml: 2 }}>
                {summaryInfo?.map((b, i) => (
                  <Typography key={i} component="span">
                    {i > 0 && " / "}
                    <Typography
                      component="span"
                      sx={{ color: sectionComplete ? (+b.selected > 0 ? "success.main" : "text.primary") : "warning.main" }}
                    >
                      {b.selected}
                    </Typography>
                  </Typography>
                ))}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography component="span" fontWeight="bold">
                Room Type
              </Typography>
              <Typography component="span" sx={{ ml: 2 }}>
                {typeStr}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography component="span" fontWeight="bold">
                Daily Rate
              </Typography>
              <Typography component="span" sx={{ ml: 2 }}>
                {costStr}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography component="span" fontWeight="bold">
                Available Rooms
              </Typography>
              <Typography component="span" sx={{ ml: 2 }}>
                {availableStr}
              </Typography>
            </Grid>
          </Grid>
        )}
      </AccordionSummary>
      <AccordionDetails>
        <Typography
          variant="subtitle1"
          fontWeight="medium"
          sx={{ color: sectionComplete ? "success.main" : "warning.main" }}
        >
          {`${selectedCount} / ${roomsNeeded} Rooms Selected`}
        </Typography>
        <Grid
          container
          spacing={2}
          alignItems="center"
          sx={{
            borderBottom: "1px solid",
            borderColor: "text.secondary",
            marginLeft: 0,
            width: "auto",
          }}
          pb={2}
          mt={0}
        >
          <Grid item xs={3} sx={{ "&.MuiGrid-item": { paddingLeft: 0 } }}>
            <Typography component="div" fontWeight="bold">
              Room Type
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography component="div" textAlign="center" fontWeight="bold">
              Select Room
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography component="div" textAlign="center" fontWeight="bold">
              Daily Rate
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography component="div" textAlign="center" fontWeight="bold">
              Available Rooms
            </Typography>
          </Grid>
        </Grid>
        <Box>
          {sectionBlocks.map((block) => (
            <RoomBlock
              key={block.idx}
              blockIndex={block.idx}
              date={date}
              availabilityData={availability}
              roomTypes={roomTypes}
              roomsAlreadySelected={selectedCount}
              isShoulderDate={dateInShoulder}
            />
          ))}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default RoomBlockSection;
