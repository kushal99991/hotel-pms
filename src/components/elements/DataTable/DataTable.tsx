import React, { useState, ReactNode, useEffect, useMemo, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell as MuiTableCell,
  TableContainer,
  TableHead as MuiTableHead,
  TableRow,
  Paper,
  TablePagination,
  styled,
  TableRowProps,
  TextField,
} from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import TableSkeletonRow from "components/ui/Skeletons/TableRowSkeleton";
import { useDrag, useDrop } from "react-dnd";
import { paginationlabelDisplayedRows } from "utils/common";

export interface Column<T> {
  field: keyof T;
  label: string;
  align?: "right" | "left" | "center";
  edittable?: boolean;
  isOnChange?: boolean;
  renderCell?: (value: T) => ReactNode;
  renderEditCell?: (params: {
    row: T;
    value: string;
    onChange: (value: string) => void;
    onSave: () => void;
  }) => ReactNode;
}

export interface DataTableProps<T = any> {
  data: T[];
  columns: Column<T>[];
  isLoading: boolean;
  clearSelection?: boolean;
  isPaginationAllowed?: boolean;
  rowsPerPageOptions?: number[];
  initialRowsPerPage?: number;
  skeletonRows?: number;
  headerStyles?: {
    backgroundColor?: string;
    color?: string;
    fontWeight?: string;
    minWidth?: string;
  };
  onRowClick?: (rowData: T) => void;
  onChangePage?: (newPage: number) => void;
  onChangeRowsPerPage?: (perPage: number) => void;
  minWidth?: number;
  maxHeight?: number;
  renderFooter?: () => React.ReactNode;
  isDrggable?: boolean;
  checkboxSelection?: boolean; // New prop for checkbox selection
  onSelectedRowsChange?: (selected: T[]) => void;
  rowHeight?: string;
  currentPage?: number;
  onProcessUpdate?: (params: {
    rowId: number | string | null;
    field: keyof T | null;
    value: Record<string, string>;
  }) => void;
  onProcessUpdateChange?: (
    params: {
      rowId: number | string | null;
      field: keyof T | null;
      value: Record<string, string>;
    },
    callback?: () => void
  ) => void;
  // DnD (react-dnd) specific, optional
  dndType?: string;
  boardIndex?: number;
  onMoveAcrossBoards?: (
    sourceBoardIndex: number,
    fromIndex: number,
    destinationBoardIndex: number,
    toIndex: number
  ) => void;
}

const DataTable = ({
  data,
  columns,
  isLoading,
  isPaginationAllowed = true,
  rowsPerPageOptions = [5, 10, 25],
  initialRowsPerPage = 5,
  skeletonRows = 5,
  headerStyles,
  minWidth = 650,
  maxHeight,
  onChangePage,
  onChangeRowsPerPage,
  renderFooter,
  isDrggable = false,
  checkboxSelection = false, // Destructure the new prop
  onSelectedRowsChange,
  onRowClick,
  rowHeight,
  currentPage = 0,
  onProcessUpdate,
  onProcessUpdateChange,
  clearSelection,
  dndType,
  boardIndex,
  onMoveAcrossBoards,
}: DataTableProps) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
  const [selected, setSelected] = useState<number[]>([]);
  const [editingCell, setEditingCell] = useState<{
    rowId: number | string | null;
    field: keyof T | null;
  }>({ rowId: null, field: null });
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (selected.length > 0) {
      const filterRecord = paginatedData.filter((item) =>
        selected.includes(item?.id)
      );
      onSelectedRowsChange?.(filterRecord);
    } else {
      onSelectedRowsChange?.([]);
    }
  }, [selected]);

  useEffect(() => {
    if (clearSelection) {
      setSelected([]); // Clear selection when triggered
    }
  }, [clearSelection]);

  useEffect(() => {
    setPage(currentPage);
  }, [currentPage]);

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
    onChangePage?.(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    onChangeRowsPerPage?.(parseInt(event.target.value, 10));
    onChangePage?.(0);
  };

  const paginatedData = useMemo(() => {
    if (!isPaginationAllowed) return data;
    return (data ?? []).slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [isPaginationAllowed, data, page, rowsPerPage]);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = paginatedData.map((row) => row.id); // Assuming each row has a unique 'id'
      setSelected(newSelected);
    } else {
      setSelected([]);
    }
  };

  const handleSelectOne = (
    event: React.ChangeEvent<HTMLInputElement>,
    id: number
  ) => {
    const newSelected = event.target.checked
      ? [...selected, id]
      : selected.filter((item) => item !== id);
    setSelected(newSelected);
  };

  const handleInputChange = (
    field: string,
    value: string,
    isOnChange: boolean
  ) => {
    setEditValues((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Proceed to update only if value is not empty
    if (value?.trim() !== "") {
      const updateData = { ...editingCell, value: { [field]: value } };
      if (isOnChange) {
        onProcessUpdateChange?.(updateData, () => {
          setEditingCell({ rowId: null, field: null });
          setEditValues({});
        });
      }
    } else {
      if (isOnChange) {
        setEditingCell({ rowId: null, field: null });
        setEditValues({});
      }
    }
  };

  const handleSave = () => {
    if (editValues && Object.keys(editValues).length > 0) {
      onProcessUpdate?.({ ...editingCell, value: editValues });
    }
    setEditingCell({ rowId: null, field: null });
    setEditValues({});
  };

  const renderRowComponent = (
    row: T,
    rowIndex: number,
    rowProps?: TableRowProps
  ) => {
    return (
      <TableRow
        key={`tr-${rowIndex?.toString()}`}
        {...rowProps}
        onClick={() => onRowClick?.(row)}
        sx={{ height: rowHeight, cursor: onRowClick ? "pointer" : null }}
      >
        {checkboxSelection && (
          <TableCell align="center">
            <Checkbox
              checked={selected.indexOf(row.id) !== -1}
              onChange={(event) => handleSelectOne(event, row.id)}
              inputProps={{ "aria-labelledby": `select-${row.id}` }}
            />
          </TableCell>
        )}
        {columns.map((column) => {
          const isEditing =
            editingCell.rowId === row.id && editingCell.field === column.field;

          return (
            <MuiTableCell
              key={`row-${rowIndex}_col${String(column.field)}`}
              align={column.align || "left"}
              onDoubleClick={() =>
                column.edittable &&
                setEditingCell({ rowId: row.id, field: column.field })
              }
            >
              {isEditing ? (
                column.renderEditCell ? (
                  column.renderEditCell({
                    row,
                    value:
                      editValues[column.field as string] ?? row[column.field],
                    onChange: (value: T) =>
                      handleInputChange(
                        String(column.field),
                        value,
                        column?.isOnChange ?? false
                      ),
                    onSave: () => handleSave(),
                  })
                ) : (
                  <TextField
                    type="number"
                    value={
                      editValues[column.field as string] ?? row[column.field]
                    }
                    onChange={(e) =>
                      handleInputChange(
                        String(column.field),
                        e.target.value,
                        column?.isOnChange ?? false
                      )
                    }
                    onBlur={() => handleSave()}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSave();
                      }
                    }}
                  />
                )
              ) : column.renderCell ? (
                column.renderCell(row)
              ) : (
                row[column.field]
              )}
            </MuiTableCell>
          );
        })}
      </TableRow>
    );
  };

  // Inner component to attach react-dnd to rows when draggable
  const DraggableRow: React.FC<{
    row: T;
    rowIndex: number;
  }> = ({ row, rowIndex }) => {
    const ref = useRef<HTMLTableRowElement | null>(null);

    // Drop target for reordering and cross-board move
    const [, drop] = useDrop({
      accept: dndType || "",
      hover: (item: any) => {
        if (!ref.current || item == null) return;
      },
      drop: (item: any) => {
        if (item == null) return;
        const sourceBoardIndex: number | undefined = item.sourceBoardIndex;
        const sourceIndex: number | undefined = item.index;
        if (
          typeof sourceBoardIndex === "number" &&
          typeof sourceIndex === "number" &&
          typeof boardIndex === "number" &&
          sourceBoardIndex !== boardIndex
        ) {
          onMoveAcrossBoards?.(
            sourceBoardIndex,
            sourceIndex,
            boardIndex,
            rowIndex
          );
          // Update item to reflect new location (for completeness)
          item.sourceBoardIndex = boardIndex;
          item.index = rowIndex;
        }
      },
    });

    const [{ isDragging }, drag] = useDrag({
      type: dndType || "",
      item: {
        sourceBoardIndex: boardIndex,
        index: rowIndex,
        row,
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    drag(drop(ref));

    return renderRowComponent(row, rowIndex, {
      ref,
      sx: {
        opacity: isDragging ? 0.5 : 1, // softer transparency
        transform: isDragging ? "scale(1.02)" : "none", // lifted effect
        boxShadow: isDragging ? "0 4px 12px rgba(0,0,0,0.15)" : "none", // shadow while dragging
        transition: "all 0.2s ease",
        background: isDragging ? "#f0f8ff" : "#fff", // light blue while dragging
        cursor: isDragging ? "grabbing" : "grab", // grabbing hand
      },
    });
  };

  return (
    <div>
      <TableContainer
        component={Paper}
        sx={{
          maxHeight: maxHeight, // Set the maximum height for the table container
          overflow: "auto", // Enable scrolling if the content exceeds maxHeight
        }}
      >
        <Table sx={{ minWidth: minWidth }} aria-label="data table">
          {!maxHeight && renderFooter && <caption>{renderFooter?.()}</caption>}
          <TableHead
            sx={{
              ...(maxHeight && {
                position: "sticky", // Make the header sticky
                top: 0, // Stick it to the top
                zIndex: 1, // Ensure it stays on top of the table rows
              }),
            }}
            headerstyles={headerStyles}
          >
            <TableRow>
              {checkboxSelection && (
                <TableCell align="center">
                  <Checkbox
                    indeterminate={
                      selected.length > 0 &&
                      selected.length < paginatedData.length
                    }
                    checked={
                      paginatedData.length > 0 &&
                      selected.length === paginatedData.length
                    }
                    onChange={handleSelectAll}
                    inputProps={{ "aria-label": "select all rows" }}
                  />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell
                  key={String(column.field)}
                  align={column.align || "left"}
                  headerstyles={headerStyles}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              [...Array(skeletonRows)].map((_, index) => (
                <TableSkeletonRow
                  key={`loaderRow_${index}`}
                  columns={columns.length}
                />
              ))
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <MuiTableCell
                  colSpan={columns.length + (checkboxSelection ? 1 : 0)}
                  align="center"
                >
                  No data found
                </MuiTableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, rowIndex) =>
                isDrggable &&
                dndType != null &&
                typeof boardIndex === "number" ? (
                  <DraggableRow
                    key={`row_${row.id?.toString?.() || rowIndex}`}
                    row={row}
                    rowIndex={rowIndex}
                  />
                ) : (
                  renderRowComponent(row, rowIndex)
                )
              )
            )}
          </TableBody>
        </Table>
        {isPaginationAllowed && (
          <TablePagination
            rowsPerPageOptions={rowsPerPageOptions}
            component="div"
            count={data.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelDisplayedRows={paginationlabelDisplayedRows}
          />
        )}
      </TableContainer>
      {maxHeight && renderFooter && (
        <StyledCaption>{renderFooter?.()}</StyledCaption>
      )}
    </div>
  );
};

export default DataTable;

// Styled components for TableHead and TableCell
const TableHead = styled(MuiTableHead)<{
  headerstyles?: {
    backgroundColor?: string;
    color?: string;
    fontWeight?: string;
  };
}>(({ theme, headerstyles }) => ({
  backgroundColor: headerstyles?.backgroundColor || theme.palette.grey[200],
  color: headerstyles?.color || theme.palette.text.primary,
  fontWeight: headerstyles?.fontWeight || "bold",
}));

const TableCell = styled(MuiTableCell)<{
  headerstyles?: {
    backgroundColor?: string;
    color?: string;
    fontWeight?: string;
    minWidth?: string;
  };
}>(({ theme, headerstyles }) => ({
  padding: theme.spacing(1),
  fontSize: theme.typography.body2.fontSize,
  color: headerstyles?.color || theme.palette.text.primary,
  fontWeight: "bold",
  fontStyle: "normal",
  minWidth: headerstyles?.minWidth || "auto",
}));

const StyledCaption = styled("div")(() => ({
  marginTop: "8px",
  textAlign: "left",
  width: "100%",
  display: "flex",
  justifyContent: "space-between",
  padding: "8px 16px",
  borderTop: "1px solid #e0e0e0",
  // Optional: You can use theme for responsive adjustments or styling variations.
}));
