import React, { useState } from "react";
import { Box, Grid } from "@mui/material";
import FifteenDaysOutlook from "./FifteenDaysOutlook";
import ScheduleHeader from "./ScheduleHeader";
import ScheduleDateHeaders from "./ScheduleDateHeaders";
import ScheduleEventGrid from "./ScheduleEventGrid";
import AddEventModal from "./AddEventModal";
import { useSalesDashboardContext } from "contexts/SalesDashboardContext";
import { Event, ISalesGroupListItem } from "types/salesTypes";

interface CalendarScheduleProps {
  salesGroups: ISalesGroupListItem[];
}

const CalendarSchedule: React.FC<CalendarScheduleProps> = ({ salesGroups }) => {
  const { addEvent } = useSalesDashboardContext();
  const [modalOpen, setModalOpen] = useState(false);

  const handleAddEvent = (newEvent: Event) => {
    addEvent(newEvent);
  };

  return (
    <Box sx={{ mb: 3, height: 400, position: "relative" }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={2}>
          <FifteenDaysOutlook salesGroups={salesGroups} />
        </Grid>
        <Grid item xs={12} md={10}>
          <Box
            component="section"
            sx={{ width: "100%", height: "100%", overflow: "hidden" }}
          >
            <ScheduleHeader handleOpenModal={() => setModalOpen(true)} />
            <ScheduleDateHeaders />

            <ScheduleEventGrid salesGroups={salesGroups} />
          </Box>
        </Grid>
      </Grid>

      <AddEventModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleAddEvent}
      />
    </Box>
  );
};

export default CalendarSchedule;
