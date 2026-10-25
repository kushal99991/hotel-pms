import { TableCell, styled, TableCellProps } from "@mui/material";
import { lighten } from "@mui/material/styles";

interface StyledTableCellProps extends TableCellProps {
  isFirstColumn?: boolean;
  isHeader?: boolean;
  isToday?: boolean;
  isDirty?: boolean;
}

const StyledTableCell = styled(TableCell, {
  shouldForwardProp: (prop) =>
    prop !== "isFirstColumn" &&
    prop !== "isHeader" &&
    prop !== "isToday" &&
    prop !== "isDirty",
})<StyledTableCellProps>(
  ({ theme, isFirstColumn, isHeader, isToday, isDirty }) => ({
    ...(isFirstColumn && {
      position: "sticky",
      left: 0,
      backgroundColor: theme.palette.background.paper,
      zIndex: 3, // accounts for header where other header cells are z-index 2
      boxShadow: "2px 0px 3px rgba(0,0,0,0.1)",
    }),
    ...(isHeader && {
      backgroundColor: theme.palette.grey[200],
      fontWeight: "bold",
    }),
    ...(isToday && {
      backgroundColor: lighten(theme.palette.secondary.main, 0.7),
    }),
    ...(isDirty && {
      border: `1px solid ${theme.palette.warning.dark}`,
    }),
  })
);

export default StyledTableCell;
