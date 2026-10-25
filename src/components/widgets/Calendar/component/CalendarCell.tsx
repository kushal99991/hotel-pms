import React, { useState } from "react";
import moment from "moment";
import {
  Box,
  styled,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { CalendarView, ICalendarEvent } from "../Calendar";

interface CalendarCellProps {
  day: moment.Moment;
  currentDate: Date;
  currentIndex: number;
  view?: CalendarView;
  events: ICalendarEvent[];
  isStartOfWeek: boolean;
  isEndOfWeek: boolean;
  onDateClick?: (date: Date) => void;
  onEventClick?: (date: ICalendarEvent) => void;
  onEventDelete?: (event: ICalendarEvent) => void;
}

const BASE_COLOR = "#0C8CE9"; // base rate color
const DYNAMIC_COLOR = "#07AAAD"; // dynamic rate color
const LIGHTENED_BASE_COLOR = "#2992deff"; // parent base rate color
const LIGHTENED_DYNAMIC_COLOR = "#41c5c7ff"; // parent dynamic rate color

const BILLING_UNIT_COLOR_MAP: Record<
  "PER_DAY" | "PER_HOUR" | "PER_HALF_HOUR" | "DEFAULT",
  string
> = {
  PER_DAY: "#380f90ff",
  PER_HOUR: "#2fd33aff",
  PER_HALF_HOUR: "#e11ad1ff",
  DEFAULT: "#0C8CE9",
};

const formatBillingUnitLabel = (billingUnit?: string | null) => {
  if (!billingUnit) {
    return null;
  }

  return billingUnit.replace(/_/g, " ").toLowerCase();
};

const CalendarCell: React.FC<CalendarCellProps> = ({
  day,
  currentDate,
  currentIndex,
  events,
  isStartOfWeek,
  isEndOfWeek,
  onDateClick,
  onEventClick,
  onEventDelete,
}) => {
  const [hoveredEventId, setHoveredEventId] = useState<number | null>(null);
  const [infoEvent, setInfoEvent] = useState<ICalendarEvent | null>(null);
  const isCurrentDate = moment(day).isSame(moment(), "day");
  const isPastDate = day.isBefore(moment().startOf("day"));

  const hasEvent = events.some(
    (event) =>
      moment(event.date).format("YYYY-MM-DD") === day.format("YYYY-MM-DD")
  );

  const targetDay = moment(day);
  const targetDayEvents = events.filter(
    (event) =>
      moment(event.date).format("YYYY-MM-DD") === targetDay.format("YYYY-MM-DD")
  );

  const dayBefore = targetDay.clone().subtract(1, "day");
  const dayAfter = targetDay.clone().add(1, "day");

  const dayBeforeEvents = events.filter(
    (event) =>
      moment(event.date).format("YYYY-MM-DD") === dayBefore.format("YYYY-MM-DD")
  );

  const dayAfterEvents = events.filter(
    (event) =>
      moment(event.date).format("YYYY-MM-DD") === dayAfter.format("YYYY-MM-DD")
  );

  const isSameRateEvent = (
    firstEvent?: ICalendarEvent,
    secondEvent?: ICalendarEvent
  ) => {
    if (!firstEvent || !secondEvent) {
      return false;
    }

    const firstRoomTypeId = firstEvent.room_type?.id;
    const secondRoomTypeId = secondEvent.room_type?.id;

    return (
      firstEvent.rate_code_id === secondEvent.rate_code_id &&
      firstEvent.name === secondEvent.name &&
      firstEvent.type === secondEvent.type &&
      firstRoomTypeId === secondRoomTypeId
    );
  };

  return (
    <>
      <Box
        display="inline-block"
        width="14.2857%"
        sx={{
          minWidth: "120px",
          position: "relative",
          cursor: isPastDate ? "not-allowed" : "pointer",
          opacity: isPastDate ? 0.5 : 1,
          marginLeft: currentIndex === 0 ? "120px" : "0",
        }}
        onClick={() => !hasEvent && !isPastDate && onDateClick?.(day.toDate())}
      >
        <DayCell
          style={{
            borderTop: "1px solid #ebebeb",
            borderBottom: "1px solid #ebebeb",
            borderLeft: isStartOfWeek ? "1px solid #ebebeb" : "none",
            borderRight: isEndOfWeek
              ? "1px solid #ebebeb"
              : "1px solid #ebebeb",
            color: isCurrentDate
              ? "white"
              : day.isSame(currentDate, "month")
                ? "inherit"
                : "lightgray",
            backgroundColor: isCurrentDate
              ? "#f7fff4"
              : hasEvent
                ? "#fcfcfc"
                : "initial",
          }}
        >
          <Typography
            sx={{
              borderRadius: isCurrentDate ? "50%" : "0",
              backgroundColor: isCurrentDate ? "#f7fff4" : "initial",
              padding: "15px",
            }}
          >
            {/* {isCurrentDate ? day.format("DD") : ""} */}
          </Typography>
        </DayCell>
        {hasEvent && (
          <>
            {targetDayEvents.map((event, idx) => {
              const hasSameEventBefore = dayBeforeEvents.some((beforeEvent) =>
                isSameRateEvent(beforeEvent, event)
              );
              const hasSameEventAfter = dayAfterEvents.some((afterEvent) =>
                isSameRateEvent(afterEvent, event)
              );

              const isStartOfEvent = !hasSameEventBefore;
              const isEndOfEvent = !hasSameEventAfter;

              const isParentBaseRate = event?.type === "PARENT_BASE_RATE";
              const isParentDynamicRate = event?.type === "PARENT_DYNAMIC_RATE";
              const eventBackgroundColor =
                event?.type === "PARENT_BASE_RATE"
                  ? LIGHTENED_BASE_COLOR
                  : event?.type === "PARENT_DYNAMIC_RATE"
                    ? LIGHTENED_DYNAMIC_COLOR
                    : event?.type === "OWN_DYNAMIC_RATE"
                      ? DYNAMIC_COLOR
                      : BASE_COLOR;
              const eventTextColor = "#fff";
              const hasRate =
                event.rate !== null && event.rate !== undefined
                  ? true
                  : Boolean(event.name);
              const displayRate = hasRate
                ? event.name || event.rate?.toString() || ""
                : "Add Rate";

              return (
                <Box
                  key={`${event.rate_code_id ?? "event"}-${idx}`}
                  sx={{
                    position: "absolute",
                    top: "10%",
                    marginTop: idx === 0 ? 0 : 5,
                    left: isEndOfEvent ? "45%" : "50%",
                    width: isEndOfEvent ? "90%" : "100%",
                    transform: "translateX(-50%)",
                    backgroundColor: eventBackgroundColor,
                    padding: "5px",
                    borderTopLeftRadius: isStartOfEvent ? "10px" : "0px",
                    borderBottomLeftRadius: isStartOfEvent ? "10px" : "0px",
                    borderTopRightRadius: isEndOfEvent ? "10px" : "0px",
                    borderBottomRightRadius: isEndOfEvent ? "10px" : "0px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    cursor: isPastDate ? "not-allowed" : "pointer",
                    marginLeft: isStartOfEvent ? "10px" : "0px",
                  }}
                  onClick={(e) => {
                    if (!isPastDate) {
                      onEventClick?.(event);
                    }
                    e.stopPropagation();
                  }}
                  onMouseEnter={() => setHoveredEventId(idx)}
                  onMouseLeave={() => setHoveredEventId(null)}
                >
                  {/* Action Icons */}
                  {hoveredEventId === idx && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        display: "flex",
                        gap: 0.5,
                        alignItems: "center",
                      }}
                    >
                      {event.type === "OWN_DYNAMIC_RATE" && (
                        <IconButton
                          sx={{
                            height: "25px",
                            color:
                              isParentBaseRate || isParentDynamicRate
                                ? "rgba(0,0,0,0.6)"
                                : "#fff",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isPastDate) {
                              onEventDelete?.(event);
                            }
                          }}
                        >
                          <DeleteIcon sx={{ color: "#fff" }} />
                        </IconButton>
                      )}
                      <IconButton
                        sx={{
                          height: "25px",
                          color:
                            isParentBaseRate || isParentDynamicRate
                              ? "rgba(0,0,0,0.6)"
                              : "#fff",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setInfoEvent(event);
                        }}
                      >
                        <InfoOutlinedIcon sx={{ color: "#fff" }} />
                      </IconButton>
                    </Box>
                  )}
                  <Typography
                    component="span"
                    key={idx}
                    sx={{
                      fontSize: "12px",
                      color: eventTextColor,
                      fontWeight: "bold",
                      minHeight: "20px",
                    }}
                  >
                    {(isStartOfEvent || isEndOfEvent) && displayRate}
                  </Typography>
                </Box>
              );
            })}
          </>
        )}
      </Box>
      <Dialog
        open={Boolean(infoEvent)}
        onClose={() => setInfoEvent(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Billing units & prices</DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {infoEvent?.billing_units && infoEvent.billing_units.length > 0 ? (
            <List dense sx={{ py: 0 }}>
              {infoEvent.billing_units.map((unit, i) => {
                const priceForUnit = unit.price ?? "—";
                return (
                  <React.Fragment key={`${unit.name}-${i}`}>
                    <ListItem
                      sx={{
                        alignItems: "center",
                        py: 1.25,
                        px: 2,
                        gap: 1.5,
                      }}
                    >
                      <BillingUnitIndicator
                        title={unit.name}
                        sx={{
                          backgroundColor:
                            BILLING_UNIT_COLOR_MAP[
                              (unit.name as
                                | "PER_DAY"
                                | "PER_HOUR"
                                | "PER_HALF_HOUR") ?? "DEFAULT"
                            ] || BILLING_UNIT_COLOR_MAP.DEFAULT,
                        }}
                      />
                      <ListItemText
                        primary={
                          <Typography fontWeight={600}>
                            {formatBillingUnitLabel(unit.name) ?? "Unknown"}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="textSecondary">
                            Billing unit
                          </Typography>
                        }
                      />
                      <Typography fontWeight={700}>
                        {Number(priceForUnit) > 0
                          ? Number(priceForUnit).toLocaleString("en-US", {
                              style: "currency",
                              currency: "USD",
                              maximumFractionDigits: 2,
                            })
                          : priceForUnit}
                      </Typography>
                    </ListItem>
                  </React.Fragment>
                );
              })}
            </List>
          ) : (
            <Box px={2} py={2}>
              <Typography variant="body2" color="textSecondary">
                No billing unit data available.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInfoEvent(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const DayCell = styled(Box)(() => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  height: "45px",
}));

const BillingUnitIndicator = styled(Box)(() => ({
  width: "10px",
  height: "10px",
  borderRadius: "2px",
  marginBottom: "4px",
}));

export default CalendarCell;
