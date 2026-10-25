import React from "react";
import { Box, Skeleton, Stack } from "@mui/material";
import { CalendarView } from "./Calendar";

interface FullScreenCalendarSkeletonProps {
  view: CalendarView;
  showHeaderPlaceholder?: boolean;
}

const ROW_COUNT = 10;
const DAYS_IN_VIEW = 7;

const FullScreenCalendarSkeleton: React.FC<FullScreenCalendarSkeletonProps> = ({
  view,
  showHeaderPlaceholder = true,
}) => {
  const barWidths = [160, 120, 180, 140, 170, 150, 130];

  const headerControls = showHeaderPlaceholder ? (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      px={1}
    >
      <Skeleton variant="rounded" width={220} height={48} />
      <Box display="flex" gap={1}>
        <Skeleton variant="rounded" width={140} height={48} />
        <Skeleton variant="circular" width={40} height={40} />
      </Box>
    </Box>
  ) : null;

  const dateHeader = (
    <Box display="flex" alignItems="center" gap={1} px={1} py={0.5}>
      <Skeleton variant="rounded" width={140} height={34} />
      {Array.from({ length: DAYS_IN_VIEW }).map((_, idx) => (
        <Skeleton key={idx} variant="rounded" width={140} height={34} />
      ))}
    </Box>
  );

  const row = (rowIdx: number) => (
    <Box
      key={rowIdx}
      display="flex"
      alignItems="center"
      gap={1}
      px={1}
      py={0.75}
      sx={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
    >
      <Skeleton variant="rounded" width={150} height={36} />
      {Array.from({ length: DAYS_IN_VIEW }).map((_, idx) => (
        <Skeleton
          key={idx}
          variant="rounded"
          width={barWidths[idx % barWidths.length]}
          height={32}
        />
      ))}
    </Box>
  );

  return (
    <Box width="100%" sx={{ overflowY: "auto" }}>
      <Stack spacing={1}>
        {headerControls}
        {dateHeader}
        <Box>{Array.from({ length: ROW_COUNT }).map((_, idx) => row(idx))}</Box>
      </Stack>
    </Box>
  );
};

export default FullScreenCalendarSkeleton;
