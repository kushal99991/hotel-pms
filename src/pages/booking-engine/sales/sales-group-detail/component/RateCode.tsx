import React from "react";
import { Box, Typography } from "@mui/material";
import Label from "components/elements/Label/Label";
import { pluralValue, getMoment } from "utils/helperFunctions/common";
import { useSalesDashboardContext } from "contexts/SalesDashboardContext";
import useAuth from "hooks/useAuth";

const RateCode: React.FC = () => {
  const { selectedGroup, rateCodeName } = useSalesDashboardContext();
  const { currentTimeZone } = useAuth();

  // Calculate nights from group dates
  const totalNights =
    selectedGroup?.group_arrival_date && selectedGroup?.group_departure_date
      ? getMoment(
          selectedGroup.group_departure_date,
          currentTimeZone,
          true
        ).diff(
          getMoment(selectedGroup.group_arrival_date, currentTimeZone, true),
          "days"
        )
      : 0;

  const startDateFormatted = selectedGroup?.group_arrival_date
    ? getMoment(selectedGroup.group_arrival_date, currentTimeZone, true).format(
        "MMM DD"
      )
    : "-";
  const endDateFormatted = selectedGroup?.group_departure_date
    ? getMoment(
        selectedGroup.group_departure_date,
        currentTimeZone,
        true
      ).format("MMM DD")
    : "-";

  return (
    <Box>
      {/* Date Range with Nightly Rates Link */}
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Label>{`${pluralValue(totalNights, "Night", "Nights")}:`}</Label>
        <Typography>
          {`${startDateFormatted} - ${endDateFormatted}`}
        </Typography>
      </Box>

      {/* Rate Code */}
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Label>Rate:</Label>
        <Typography fontWeight="bold">
          {rateCodeName ??
            (selectedGroup?.rate_code_id
              ? `Rate Code #${selectedGroup.rate_code_id}`
              : "Unknown")}
        </Typography>
      </Box>

      {/* ADR (placeholder - no data available in API) */}
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Label>ADR:</Label>
        <Typography fontWeight="bold">-</Typography>
      </Box>
    </Box>
  );
};

export default RateCode;
