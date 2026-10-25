import { Typography, Paper, Chip, Stack, Divider } from "@mui/material";
import BoardTable from "./BoardTable";
import { ShiftGroup } from "types/ui/housekeepingReports";

interface ShiftSectionProps {
  group: ShiftGroup;
}

function ShiftSection({ group }: ShiftSectionProps) {
  return (
    <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight={700}>
          {group.shift.name}
        </Typography>
        <Divider orientation="vertical" flexItem />
        <Typography variant="body2" color="text.secondary">
          {group.boards.length} {group.boards.length === 1 ? "board" : "boards"}
        </Typography>
        <Divider orientation="vertical" flexItem />
        <Chip
          label={`${group.totalCredits} total credits`}
          size="small"
          color="secondary"
          variant="filled"
        />
      </Stack>

      {group.boards.map((board, index) => (
        <BoardTable key={board.id} board={board} index={index} />
      ))}
    </Paper>
  );
}

export default ShiftSection;
