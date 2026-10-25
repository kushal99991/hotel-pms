import { Autocomplete, TablePagination, TextField } from "@mui/material";
import {
  GridFilterInputValueProps,
  gridPageSelector,
  gridPageSizeSelector,
  gridRowCountSelector,
  useGridApiContext,
  useGridSelector,
} from "@mui/x-data-grid";
import {
  DatePicker,
  LocalizationProvider,
  TimePicker,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

export interface ColumnFilterProps extends GridFilterInputValueProps {
  label: string;
  optionsWithAll?: { label: string; value: string }[];
}

export const DropdownFilter = ({
  item,
  label,
  optionsWithAll = [],
  applyValue,
}: ColumnFilterProps) => {
  return (
    <Autocomplete
      value={
        optionsWithAll.find(
          (option) => option.value === item.value?.toString()
        ) || null
      }
      onChange={(_, selectedOption) => {
        applyValue({ ...item, value: selectedOption?.value });
      }}
      options={optionsWithAll}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, value) => option.value === value.value}
      renderInput={(params) => (
        <TextField {...params} name={item.field} label={label} />
      )}
      fullWidth
    />
  );
};

export const DatePickerFilter = ({
  item,
  label,
  applyValue,
}: ColumnFilterProps) => {
  const handleDateChange = (date: dayjs.Dayjs | null) => {
    const formattedDate = date ? date.format("YYYY-MM-DD") : null;
    applyValue({ ...item, value: formattedDate });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label={label}
        value={item.value ? dayjs(item.value) : null}
        onChange={handleDateChange}
        slotProps={{
          textField: {
            fullWidth: true,
          },
        }}
      />
    </LocalizationProvider>
  );
};

export const TimePickerFilter = ({
  item,
  label,
  applyValue,
}: ColumnFilterProps) => {
  const handleDateChange = (date: dayjs.Dayjs | null) => {
    const formattedTime = date ? date.format("YYYY-MM-DD HH:mm:ss") : null;
    applyValue({ ...item, value: formattedTime });
  };
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <TimePicker
        label={label}
        value={item.value ? dayjs(item.value) : null}
        onChange={handleDateChange}
        slotProps={{
          textField: {
            fullWidth: true,
          },
        }}
      />
    </LocalizationProvider>
  );
};

export const CommonPagination = ({
  rowsPerPageOptions = [5, 10, 25, 50, 100],
  ...props
}: T) => {
  const apiRef = useGridApiContext();
  const page = useGridSelector(apiRef, gridPageSelector);
  const pageSize = useGridSelector(apiRef, gridPageSizeSelector);
  const rowCount = useGridSelector(apiRef, gridRowCountSelector);

  const totalPages = rowCount > 0 ? Math.ceil(rowCount / pageSize) : 0;

  return (
    <TablePagination
      component="div"
      count={rowCount}
      page={page}
      onPageChange={(_, newPage) => apiRef.current.setPage(newPage)}
      rowsPerPage={pageSize}
      onRowsPerPageChange={(e) =>
        apiRef.current.setPageSize(parseInt(e.target.value, 10))
      }
      rowsPerPageOptions={rowsPerPageOptions}
      labelDisplayedRows={() =>
        rowCount === 0
          ? `Page 0 of 0 — Total Records: 0`
          : `Page ${page + 1} of ${totalPages} — Total Records: ${rowCount}`
      }
      {...props}
    />
  );
};
