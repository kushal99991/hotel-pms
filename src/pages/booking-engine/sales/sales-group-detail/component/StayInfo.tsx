import React from "react";
import { Box, Grid, Typography, Button, styled } from "@mui/material";
import { pluralValue, getMoment } from "utils/helperFunctions/common";
import { useSalesDashboardContext } from "contexts/SalesDashboardContext";
import useAuth from "hooks/useAuth";

interface DetailSectionProps {
  label: string;
  children: React.ReactNode;
  rightBtn?: React.ReactNode;
}

const DetailSection: React.FC<DetailSectionProps> = ({
  label,
  children,
  rightBtn,
}) => (
  <Box>
    <Box display="flex" alignItems="center" justifyContent="space-between">
      <Typography variant="body1" fontWeight="bold">
        {label}
      </Typography>
      <Box display="flex">{rightBtn && rightBtn}</Box>
    </Box>
    <Box>{children}</Box>
  </Box>
);

interface DateColumnProps {
  label: string;
  value: string;
  dim?: boolean;
  maxWidth?: string | number;
}

const DateColumn: React.FC<DateColumnProps> = ({ label, value, dim = false, maxWidth }) => (
  <Box display="flex" flexDirection="column" flex={1} sx={{ maxWidth: { sm: maxWidth } }}>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography
      variant={dim ? "body1" : "body1"}
      fontWeight={dim ? "normal" : "bold"}
      color={dim ? "text.secondary" : "text.primary"}
      sx={{fontSize: dim ? "" : "16px"}}
    >
      {value}
    </Typography>
  </Box>
);

const TextButton = styled(Button)({
  textTransform: "none",
  textDecoration: "underline",
  color: "#32A1AE",
});

const StayInfos: React.FC = () => {
  const { selectedGroup, rateCodeName } = useSalesDashboardContext();
  const { currentTimeZone } = useAuth();

  const formatDate = (date: string) =>
    getMoment(date, currentTimeZone, true).format("MMM D");

  const arrivalDate = selectedGroup?.group_arrival_date
    ? formatDate(selectedGroup.group_arrival_date)
    : "-";
  const departureDate = selectedGroup?.group_departure_date
    ? formatDate(selectedGroup.group_departure_date)
    : "-";

  const shoulderArrivalDate = selectedGroup?.shoulder_arrival_date
    ? formatDate(selectedGroup.shoulder_arrival_date)
    : null;
  const shoulderDepartureDate = selectedGroup?.shoulder_departure_date
    ? formatDate(selectedGroup.shoulder_departure_date)
    : null;

  const totalNights =
    selectedGroup?.group_arrival_date && selectedGroup?.group_departure_date
      ? getMoment(selectedGroup.group_departure_date, currentTimeZone, true).diff(
          getMoment(selectedGroup.group_arrival_date, currentTimeZone, true),
          "days"
        )
      : 0;

  const preShoulderNights =
    selectedGroup?.shoulder_arrival_date && selectedGroup?.group_arrival_date
      ? getMoment(selectedGroup.group_arrival_date, currentTimeZone, true).diff(
          getMoment(selectedGroup.shoulder_arrival_date, currentTimeZone, true),
          "days"
        )
      : null;

  const postShoulderNights =
    selectedGroup?.shoulder_departure_date && selectedGroup?.group_departure_date
      ? getMoment(selectedGroup.shoulder_departure_date, currentTimeZone, true).diff(
          getMoment(selectedGroup.group_departure_date, currentTimeZone, true),
          "days"
        )
      : null;

  const shoulderNightsSuffix = (() => {
    const parts: string[] = [];
    if (preShoulderNights !== null) parts.push(`+${preShoulderNights} pre`);
    if (postShoulderNights !== null) parts.push(`+${postShoulderNights} post`);
    return parts.length > 0 ? ` (${parts.join(" / ")})` : "";
  })();

  const hasShoulder = selectedGroup?.shoulder_arrival_date || selectedGroup?.shoulder_departure_date;

  return (
    <Grid container>
      <Grid item xs={12} sm={7} display="flex" flexDirection="column">
        <DetailSection
          label="Stay Dates"
          rightBtn={
            // Edit link rendered but no functionality per JIRA
            <TextButton>Edit</TextButton>
          }
        >
          <Box display="flex" flexDirection="column" gap={1} mt={0.5} pr={2}>
            <Box display="flex" gap={4}>
              {shoulderArrivalDate && (
                <DateColumn label="Pre-shoulder" value={shoulderArrivalDate} dim />
              )}
              <DateColumn label="Arrival" value={arrivalDate} maxWidth={!hasShoulder ? "20%" : undefined} />
              <DateColumn label="Departure" value={departureDate} maxWidth={!hasShoulder ? "20%" : undefined}/>
              {shoulderDepartureDate && (
                <DateColumn label="Post-shoulder" value={shoulderDepartureDate} dim />
              )}
            </Box>
            <Box display="flex" alignItems="baseline" mt={1}>
              <Typography color="text.secondary" mr={2}>Length of stay</Typography>
              <Typography fontWeight="bold">
                {pluralValue(totalNights, "night", "nights")}
                {shoulderNightsSuffix && (
                  <Typography component="span" fontWeight="normal">
                    {shoulderNightsSuffix}
                  </Typography>
                )}
              </Typography>
            </Box>
          </Box>
        </DetailSection>
      </Grid>
      <Grid
        item
        xs={12}
        sm={5}
        display="flex"
        flexDirection="column"
        padding={2}
        paddingTop={2.5}
        sx={{
          borderLeft: "1px solid #D6D6D6",
        }}
      >
        <DetailSection label="Rate Plan">
          <Box display="flex">
            <Typography>
              {rateCodeName ??
                (selectedGroup?.rate_code_id
                  ? `Rate Code #${selectedGroup.rate_code_id}`
                  : "Unknown")}
            </Typography>
          </Box>
        </DetailSection>
      </Grid>
    </Grid>
  );
};

export default StayInfos;
