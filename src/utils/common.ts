import { LabelDisplayedRowsArgs } from "@mui/material";

export async function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const paginationlabelDisplayedRows = ({
  count,
  page,
  from,
  to,
}: LabelDisplayedRowsArgs) => {
  // ✅ Calculate rowsPerPage using the offset (from is 1-based)
  const rowsPerPage = to - from + 1 > 0 ? to - from + 1 : count;

  // ✅ Calculate total pages
  const totalPages = Math.ceil(count / rowsPerPage);

  if (count === 0) {
    return `Page 0 of 0`;
  }

  return `Page ${page + 1} of ${totalPages} — Total Records: ${count}`;
};
