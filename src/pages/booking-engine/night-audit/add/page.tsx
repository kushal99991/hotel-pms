import React, { useEffect, useState } from "react";
import { Box, Typography, Grid } from "@mui/material";
import NightAuditStepper from "./component/NightAuditStepper";
import useAuth from "hooks/useAuth";
import moment from "moment-timezone";
import { appConfig } from "config/app.config";
import { useAppSelector } from "store/hooks";
import { RootState } from "store/store";

const AddNightAudit: React.FC = () => {
  const selectedNightAudit = useAppSelector(
    (state: RootState) => state?.nightAudit?.selectedNightAudit
  );
  const auditDateParam = selectedNightAudit?.audit_date;
  const { users, properties } = useAuth();
  const [selectedDate, setSelectedDate] = useState<moment.Moment | null>(null);

  const defaultProperty = properties.find(
    (a) => a.id === users?.defaultPropertyId
  );

  useEffect(() => {
    let initialDate = moment(); // Default to today
    if (auditDateParam && moment(auditDateParam).isValid()) {
      initialDate = moment(auditDateParam);
    } else {
      if (defaultProperty?.timezone) {
        initialDate = initialDate.tz(defaultProperty.timezone);
      }
    }
    setSelectedDate(initialDate);
  }, []);

  const propertyId = users?.defaultPropertyId ?? 0;

  return (
    <Box sx={{ mt: 5 }}>
      {/* Property Name and Date */}
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} md={6}>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body1" fontWeight="bold">
              Property Name:
            </Typography>
            <Typography variant="body1">
              {defaultProperty?.name ?? "Property Name"}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="flex-end"
            gap={1}
          >
            <Typography variant="body1" fontWeight="bold">
              Audit Date:
            </Typography>
            <Typography variant="body1">
              {selectedDate?.format(appConfig.displayDateFormat) ?? ""}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* NightAuditStepper */}
      <Box mt={3}>
        <NightAuditStepper auditDate={selectedDate} propertyId={propertyId} />
      </Box>
    </Box>
  );
};

export default AddNightAudit;
