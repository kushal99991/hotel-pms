import React, { useEffect } from "react";
import { Box, Button, Grid, Skeleton, styled, Typography } from "@mui/material";
import { pluralValue, getMoment } from "utils/helperFunctions/common";
import { PaymentTotalsData } from "components/ui/PaymentTotals/PaymentTotals";
import { useSalesDashboardContext } from "contexts/SalesDashboardContext";
import { useGetRatesRateCodebyIdMutation } from "services/roomRateSlice";
import { modifyToDisplayDate } from "utils/helperFunctions/dateFormat";
import { toCapitalCase } from "utils/helperFunctions/capitalCase";
import { groupStatusDisplayValues } from "constants/sales";
import useAuth from "hooks/useAuth";
import { ISalesGroupListItem } from "types/salesTypes";

interface DetailRowProps {
  label: string;
  textValue?: string;
  renderValue?: () => React.ReactNode;
}

interface SalesGroupSummaryProps {
  salesGroup?: ISalesGroupListItem;
  isLoading: boolean;
  onChangeTypeClick?: () => void;
  onEditDatesClick?: () => void;
  totals?: PaymentTotalsData;
  /** Hide the "Edit" button in the Date section */
  hideEdit?: boolean;
  /** Hide the "Add Guests" button in the Rooming List section */
  hideAddGuests?: boolean;
  /** Hide the "View Guests" button in the Rooming List section */
  hideViewGuests?: boolean;
  /** Callback when "Add Guests" is clicked */
  onAddGuestsClick?: () => void;
  /** Callback when "View Guests" is clicked */
  onViewGuestsClick?: () => void;
}

const SummaryLoader: React.FC = () => {
  return (
    <SummaryContainer>
      {Array.from({ length: 5 }).map((_, index) => (
        <Col key={index.toString()} isFirst={index === 0}>
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="80%" />
        </Col>
      ))}
    </SummaryContainer>
  );
};

const DetailRow: React.FC<DetailRowProps> = ({
  label,
  textValue,
  renderValue,
}) => (
  <Box display="flex" flexDirection="column" width="100%" flexWrap="wrap">
    <Typography variant="body2" fontWeight="bold" color="text.primary" mb={0.5}>
      {label}:
    </Typography>
    {textValue && <Typography variant="body2">{textValue}</Typography>}
    {renderValue?.()}
  </Box>
);

const SalesGroupSummary: React.FC<SalesGroupSummaryProps> = ({
  salesGroup,
  isLoading,
  hideEdit = false,
  hideAddGuests = false,
  hideViewGuests = false,
  onAddGuestsClick,
  onViewGuestsClick,
}) => {
  const { currentTimeZone } = useAuth();
  const [getRateCode, { data: rateCode, isLoading: rateCodeLoading }] =
    useGetRatesRateCodebyIdMutation();

  useEffect(() => {
    if (!isLoading && salesGroup && !rateCodeLoading && !rateCode) {
      getRateCode({
        id: salesGroup.rate_code_id ?? -1,
      });
    }
  }, [getRateCode, salesGroup, rateCode]);

  if (isLoading) {
    return <SummaryLoader />;
  }

  // Format dates like "Jan 28" using getMoment
  const arrivalDateFormatted = salesGroup?.group_arrival_date
    ? getMoment(salesGroup.group_arrival_date, currentTimeZone, true).format(
        "MMM DD"
      )
    : "-";
  const departureDateFormatted = salesGroup?.group_departure_date
    ? getMoment(salesGroup.group_departure_date, currentTimeZone, true).format(
        "MMM DD"
      )
    : "-";
  const releaseDate = salesGroup?.group_release_date
    ? modifyToDisplayDate(salesGroup.group_release_date)
    : "-";

  // Shoulder date formatting and night counts
  const shoulderArrivalFormatted = salesGroup?.shoulder_arrival_date
    ? getMoment(salesGroup.shoulder_arrival_date, currentTimeZone, true).format("MMM DD")
    : null;
  const shoulderDepartureFormatted = salesGroup?.shoulder_departure_date
    ? getMoment(salesGroup.shoulder_departure_date, currentTimeZone, true).format("MMM DD")
    : null;
  const shoulderStartNights =
    salesGroup?.shoulder_arrival_date && salesGroup?.group_arrival_date
      ? getMoment(salesGroup.group_arrival_date, currentTimeZone, true).diff(
          getMoment(salesGroup.shoulder_arrival_date, currentTimeZone, true),
          "days"
        )
      : 0;
  const shoulderEndNights =
    salesGroup?.shoulder_departure_date && salesGroup?.group_departure_date
      ? getMoment(salesGroup.shoulder_departure_date, currentTimeZone, true).diff(
          getMoment(salesGroup.group_departure_date, currentTimeZone, true),
          "days"
        )
      : 0;

  // Calculate nights
  const totalNight =
    salesGroup?.group_arrival_date && salesGroup?.group_departure_date
      ? getMoment(salesGroup.group_departure_date, currentTimeZone, true).diff(
          getMoment(salesGroup.group_arrival_date, currentTimeZone, true),
          "days"
        )
      : 0;

  // Get status info
  const rawStatus = salesGroup?.group_status as
    | keyof typeof groupStatusDisplayValues
    | null
    | undefined;
  const displayInfo = rawStatus ? groupStatusDisplayValues[rawStatus] : null;

  return (
    <SummaryContainer>
      {/* Column 1: Date & Rate Plan */}
      <Col isFirst>
        <DetailRow
          label="Date"
          renderValue={() => (
            <Box display="flex" alignItems="center" flexWrap="wrap">
              <Typography variant="body2">
                {`${arrivalDateFormatted} - ${departureDateFormatted} (${pluralValue(totalNight, "night", "nights")})`}
              </Typography>
              {!hideEdit && (
                <TextButton
                  sx={{ minWidth: "unset", ml: 0.5 }}
                  data-testid="summary-edit-dates-btn"
                >
                  Edit
                </TextButton>
              )}
              {shoulderArrivalFormatted && (
                <Typography variant="caption" color="text.secondary" display="block" mb={0.25}>
                  {`Pre-Shoulder: ${shoulderArrivalFormatted} – ${arrivalDateFormatted} (${pluralValue(shoulderStartNights, "night", "nights")})`}
                </Typography>
              )}
              {shoulderDepartureFormatted && (
                <Typography variant="caption" color="text.secondary" display="block" mt={0.25}>
                  {`Post-Shoulder: ${departureDateFormatted} – ${shoulderDepartureFormatted} (${pluralValue(shoulderEndNights, "night", "nights")})`}
                </Typography>
              )}
            </Box>
          )}
        />
        <Box mt={1.5}>
          <DetailRow
            label="Rate Plan"
            renderValue={() => {
              if (rateCodeLoading) {
                return <Skeleton variant="text" />;
              }
              return (
                <Typography variant="body2">
                  {rateCode?.name ??
                    (salesGroup?.rate_code_id
                      ? `Rate Code #${salesGroup.rate_code_id}`
                      : "-")}
                </Typography>
              );
            }}
          />
        </Box>
      </Col>

      {/* Column 2: Rooming List */}
      <Col>
        <DetailRow
          label="Rooming List"
          renderValue={() => (
            <Box>
              {!hideAddGuests && (
                <TextButton
                  sx={{ minWidth: "unset", p: 0, mt: 0.5, display: "block" }}
                  data-testid="summary-add-guests-btn"
                  onClick={onAddGuestsClick}
                >
                  Add Guests
                </TextButton>
              )}
              {!hideViewGuests && (
                <TextButton
                  sx={{ minWidth: "unset", p: 0, mt: 0.5, display: "block" }}
                  data-testid="summary-view-guests-btn"
                  onClick={onViewGuestsClick}
                >
                  View Guests
                </TextButton>
              )}
            </Box>
          )}
        />
      </Col>

      {/* Column 3: Room Types & Release Date */}
      <Col>
        <DetailRow
          label="Room Types Blocked / Booked"
          renderValue={() => (
            <Box>
              {Object.entries(salesGroup?.rooms_blocked_by_type ?? {}).length >
              0 ? (
                Object.entries(salesGroup?.rooms_blocked_by_type ?? {}).map(
                  ([type, blocked]) => (
                    <Typography key={type} variant="body2">
                      {type}: {blocked} /{" "}
                      {salesGroup?.rooms_booked_by_type?.[type] ?? 0}
                    </Typography>
                  )
                )
              ) : (
                <Typography variant="body2">
                  {`Blocked: ${salesGroup?.rooms_blocked ?? 0} | Booked: ${salesGroup?.rooms_booked ?? 0}`}
                </Typography>
              )}
            </Box>
          )}
        />
        <Box mt={1.5}>
          <DetailRow label="Release Date" textValue={releaseDate} />
        </Box>
      </Col>

      {/* Column 4: Group Status */}
      <Col>
        <DetailRow
          label="Group Status"
          renderValue={() => (
            <Box>
              {displayInfo ? (
                <Box
                  sx={{
                    backgroundColor: displayInfo.color,
                    color: displayInfo.contrastColor,
                    px: 1,
                    py: 0.25,
                    borderRadius: 1,
                    display: "inline-block",
                    width: "fit-content",
                    mt: 0.5,
                  }}
                >
                  <Typography variant="body2">{displayInfo.label}</Typography>
                </Box>
              ) : (
                <Typography variant="body2">{rawStatus ?? "-"}</Typography>
              )}
              <Typography variant="body2" fontWeight="bold" mt={1.5}>
                GTD: {salesGroup?.contract_signed ? "Yes" : "No"}
              </Typography>
            </Box>
          )}
        />
      </Col>

      {/* Column 5: Payment Method */}
      <Col isLast>
        <DetailRow
          label="Payment Method"
          renderValue={() => (
            <Typography variant="body2">
              {salesGroup?.method_of_payment
                ? toCapitalCase(salesGroup.method_of_payment)
                : "-"}
            </Typography>
          )}
        />
      </Col>
    </SummaryContainer>
  );
};

export default SalesGroupSummary;

// Styled Components
const SummaryContainer = styled(Box)({
  display: "flex",
  flexWrap: "wrap",
  backgroundColor: "#f9f9f9",
  borderRadius: 1,
  border: "1px solid #e0e0e0",
});

const Col = styled(Box, {
  shouldForwardProp: (prop) => prop !== "isFirst" && prop !== "isLast",
})<{ isFirst?: boolean; isLast?: boolean }>(({ isFirst }) => ({
  flex: "1 1 200px",
  minWidth: "180px",
  padding: "16px 20px",
  borderLeft: isFirst ? "none" : "1px solid #e0e0e0",
  "@media (max-width: 900px)": {
    borderLeft: "none",
    borderBottom: "1px solid #e0e0e0",
    flex: "1 1 100%",
  },
}));

const TextButton = styled(Button)({
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
