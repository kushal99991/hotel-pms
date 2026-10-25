import React from "react";
import { Box, Button, Skeleton, styled, Typography } from "@mui/material";
import { pluralValue, getMoment } from "utils/helperFunctions/common";
import { PaymentTotalsData } from "components/ui/PaymentTotals/PaymentTotals";
import { useSalesDashboardContext } from "contexts/SalesDashboardContext";
import { modifyToDisplayDate } from "utils/helperFunctions/dateFormat";
import { toCapitalCase } from "utils/helperFunctions/capitalCase";
import { groupStatusDisplayValues } from "constants/sales";
import useAuth from "hooks/useAuth";

interface DetailRowProps {
  label: string;
  textValue?: string;
  renderValue?: () => React.ReactNode;
}

interface IBookingSummaryProps {
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

const BookingSummaryLoader: React.FC = () => {
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

const ContextSalesBookingSummary: React.FC<IBookingSummaryProps> = ({
  isLoading,
  hideEdit = false,
  hideAddGuests = false,
  hideViewGuests = false,
  onAddGuestsClick,
  onViewGuestsClick,
}) => {
  const { selectedGroup, rateCodeName } = useSalesDashboardContext();
  const { currentTimeZone } = useAuth();

  if (isLoading) {
    return (
      <>
        <BookingSummaryLoader />
      </>
    );
  }

  // Format dates like "Jan 28" using getMoment
  const arrivalDateFormatted = selectedGroup?.group_arrival_date
    ? getMoment(selectedGroup.group_arrival_date, currentTimeZone, true).format(
        "MMM DD"
      )
    : "-";
  const departureDateFormatted = selectedGroup?.group_departure_date
    ? getMoment(
        selectedGroup.group_departure_date,
        currentTimeZone,
        true
      ).format("MMM DD")
    : "-";
  const releaseDate = selectedGroup?.group_release_date
    ? modifyToDisplayDate(selectedGroup.group_release_date)
    : "-";

  // Calculate nights
  const totalNight =
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

  // Shoulder date formatting and night counts
  const shoulderArrivalFormatted = selectedGroup?.shoulder_arrival_date
    ? getMoment(selectedGroup.shoulder_arrival_date, currentTimeZone, true).format("MMM DD")
    : null;
  const shoulderDepartureFormatted = selectedGroup?.shoulder_departure_date
    ? getMoment(selectedGroup.shoulder_departure_date, currentTimeZone, true).format("MMM DD")
    : null;
  const shoulderStartNights =
    selectedGroup?.shoulder_arrival_date && selectedGroup?.group_arrival_date
      ? getMoment(selectedGroup.group_arrival_date, currentTimeZone, true).diff(
          getMoment(selectedGroup.shoulder_arrival_date, currentTimeZone, true),
          "days"
        )
      : 0;
  const shoulderEndNights =
    selectedGroup?.shoulder_departure_date && selectedGroup?.group_departure_date
      ? getMoment(selectedGroup.shoulder_departure_date, currentTimeZone, true).diff(
          getMoment(selectedGroup.group_departure_date, currentTimeZone, true),
          "days"
        )
      : 0;

  // Get status info
  const rawStatus = selectedGroup?.group_status as
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
            <Box>
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
              </Box>
              {shoulderArrivalFormatted && (
                <Typography variant="caption" color="text.secondary" display="block" mb={0.25}>
                  {`Pre Shoulder: ${shoulderArrivalFormatted} – ${arrivalDateFormatted} (${pluralValue(shoulderStartNights, "night", "nights")})`}
                </Typography>
              )}
              {shoulderDepartureFormatted && (
                <Typography variant="caption" color="text.secondary" display="block" mt={0.25}>
                  {`Post Shoulder: ${departureDateFormatted} – ${shoulderDepartureFormatted} (${pluralValue(shoulderEndNights, "night", "nights")})`}
                </Typography>
              )}
            </Box>
          )}
        />
        <Box mt={1.5}>
          <DetailRow
            label="Rate Plan"
            renderValue={() => (
              <Typography variant="body2">
                {rateCodeName ??
                  (selectedGroup?.rate_code_id
                    ? `Rate Code #${selectedGroup.rate_code_id}`
                    : "-")}
              </Typography>
            )}
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
              {Object.entries(selectedGroup?.rooms_blocked_by_type ?? {})
                .length > 0 ? (
                Object.entries(selectedGroup?.rooms_blocked_by_type ?? {}).map(
                  ([type, blocked]) => (
                    <Typography key={type} variant="body2">
                      {type}: {blocked} /{" "}
                      {selectedGroup?.rooms_booked_by_type?.[type] ?? 0}
                    </Typography>
                  )
                )
              ) : (
                <Typography variant="body2">
                  {`Blocked: ${selectedGroup?.rooms_blocked ?? 0} | Booked: ${selectedGroup?.rooms_booked ?? 0}`}
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
                GTD: {selectedGroup?.contract_signed ? "Yes" : "No"}
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
              {selectedGroup?.method_of_payment
                ? toCapitalCase(selectedGroup.method_of_payment)
                : "-"}
            </Typography>
          )}
        />
      </Col>
    </SummaryContainer>
  );
};

export default ContextSalesBookingSummary;

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
