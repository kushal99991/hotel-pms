import React, { useState } from "react";
import { Box, Card, CardContent, Tooltip, Typography } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import moment from "moment";
import { useSalesDashboardContext } from "contexts/SalesDashboardContext";
import { groupStatusDisplayValues, GroupStatusEnum } from "constants/sales";
import { ISalesGroupListItem } from "types/salesTypes";
import { getMoment } from "utils/helperFunctions/common";
import useAuth from "hooks/useAuth";
import { appConfig } from "config/app.config";
import {
  isGroupActiveOnDate,
  isGroupOnShoulderDate,
} from "./salesGroupDateUtils";

interface FifteenDaysOutlookProps {
  salesGroups: ISalesGroupListItem[];
}

const FifteenDaysOutlook: React.FC<FifteenDaysOutlookProps> = ({
  salesGroups,
}) => {
  const { startDate } = useSalesDashboardContext();
  const { currentTimeZone } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    startDate ?? getMoment(null, currentTimeZone, true).toDate()
  );
  const [errorDate, setErrorDate] = useState<string>("");

  const dateColumns = Array.from({ length: 7 }, (_, i) =>
    getMoment(selectedDate, currentTimeZone, true)
      .add(i, "days")
      .format("YYYY-MM-DD")
  );

  const handleDateChange = (date: Date | null) => {
    if (
      date &&
      getMoment(date, currentTimeZone, true).isBefore(
        getMoment(null, currentTimeZone, true),
        "day"
      )
    ) {
      setErrorDate("Date cannot be in the past");
    } else {
      setErrorDate("");
      setSelectedDate(date);
    }
  };

  type GroupEntry = { group: ISalesGroupListItem; isShoulder: boolean };

  const getGroupsForDate = (date: string): GroupEntry[] =>
    salesGroups
      .filter((group) => isGroupActiveOnDate(group, date, currentTimeZone))
      .map((group) => ({
        group,
        isShoulder: isGroupOnShoulderDate(group, date, currentTimeZone),
      }));

  const getStatusGroups = (
    entries: GroupEntry[]
  ): { status: GroupStatusEnum; entries: GroupEntry[] }[] => {
    const map = new Map<GroupStatusEnum, GroupEntry[]>();
    entries.forEach((entry) => {
      if (!entry.group.group_status) return;
      const status = entry.group.group_status as GroupStatusEnum;
      if (!map.has(status)) map.set(status, []);
      map.get(status)!.push(entry);
    });
    return Array.from(map.entries()).map(([status, entries]) => ({
      status,
      entries,
    }));
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
          7 Day Outlook
        </Typography>

        <DatePicker
          label="Starts From"
          value={selectedDate}
          shouldDisableDate={(date) => moment(date).isBefore(moment(), "day")}
          onChange={handleDateChange}
          format={appConfig.datePickerDateFormat}
          slotProps={{
            textField: {
              error: !!errorDate,
              helperText: errorDate,
              fullWidth: true,
              size: "small",
              sx: { mb: 2 },
            },
          }}
        />

        <Box sx={{ overflow: "auto" }}>
          {dateColumns.map((date) => {
            const dayGroupEntries = getGroupsForDate(date);
            const statusGroups = getStatusGroups(dayGroupEntries);
            const groupCount = dayGroupEntries.length;
            return (
              <Box
                key={date}
                sx={{
                  p: 1,
                  mb: 1,
                  border: "1px solid #e0e0e0",
                  borderRadius: 1,
                  bgcolor: groupCount ? "#f8f9fa" : "transparent",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {moment(date).format("ddd, MMM D")}
                  </Typography>
                  {groupCount > 0 && (
                    <Typography variant="caption" sx={{ color: "#666" }}>
                      {groupCount} group{groupCount > 1 ? "s" : ""}
                    </Typography>
                  )}
                </Box>
                {statusGroups.length > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 0.5,
                      mt: 0.75,
                    }}
                  >
                    {statusGroups.map(({ status, entries }) => {
                      const displayInfo = groupStatusDisplayValues[status];
                      const tooltipContent = (
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 700 }}
                          >
                            {displayInfo?.label ?? status}
                          </Typography>
                          {entries.map(({ group, isShoulder }) => (
                            <Typography
                              key={group.id}
                              variant="caption"
                              display="block"
                            >
                              {group.group_name}
                              {isShoulder ? " (Shoulder)" : ""}
                            </Typography>
                          ))}
                        </Box>
                      );
                      return (
                        <Tooltip key={status} title={tooltipContent} arrow>
                          <Box
                            sx={{
                              width: 22,
                              height: 22,
                              borderRadius: "50%",
                              bgcolor: displayInfo?.color ?? "#bdbdbd",
                              color: displayInfo?.contrastColor ?? "#000",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 10,
                              fontWeight: 700,
                              cursor: "default",
                              flexShrink: 0,
                            }}
                          >
                            {entries.length}
                          </Box>
                        </Tooltip>
                      );
                    })}
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
};

export default FifteenDaysOutlook;
