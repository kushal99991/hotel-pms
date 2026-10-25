import { TablePagination, Typography } from "@mui/material";
import React, { ReactNode, useState } from "react";
import { Loader, Placeholder, Table, TableProps } from "rsuite";
import "rsuite/dist/rsuite.min.css";

const { Column, ColumnGroup, HeaderCell, Cell } = Table;

type RowKeyType = string | number;

export interface ScrollingTableColumn<T> {
  key: keyof T;
  label: string;
  width?: number;
  fixed?: "left" | "right";
  align?: "left" | "center" | "right";
  group?: string;
  isMulti?: boolean;
  renderCell?: (rowData: T) => ReactNode;
  renderHeaderCell?: () => ReactNode;
}

export interface ScrollingTableProps {
  columns: ScrollingTableColumn<T>[];
  data: T[];
  height?: number;
  rowsPerPageOptions?: number[];
  initialRowsPerPage?: number;
  onChangePage?: (newPage: number) => void;
  onChangeRowsPerPage?: (perPage: number) => void;
  pagination?: boolean;
  onRowClick?: (rowData: T) => void;
  tableProps?: TableProps<T, RowKeyType>;
  isLoading?: boolean;
}

const ScrollingTable = ({
  columns,
  data,
  pagination = false,
  initialRowsPerPage = 5,
  onRowClick,
  onChangePage,
  onChangeRowsPerPage,
  tableProps,
  rowsPerPageOptions,
  isLoading = false,
}: ScrollingTableProps) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(initialRowsPerPage);

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

  const loaderContainerStyle: T = {
    position: "absolute",
    width: "100%",
    height: "100%",
    background: "var(--rs-bg-card)",
    padding: 20,
    zIndex: 1,
  };

  const renderLoading = () => {
    if (isLoading) {
      return (
        <div style={loaderContainerStyle}>
          <Placeholder.Grid
            rows={initialRowsPerPage}
            columns={columns.length}
            active
          />
        </div>
      );
    }

    return <Loader center backdrop content="Loading..." />;
  };

  const paginatedData = pagination
    ? (data ?? []).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : (data ?? []);

  return (
    <div>
      <Table
        data={isLoading ? [] : paginatedData}
        onRowClick={onRowClick}
        {...tableProps}
        loading={isLoading}
        renderLoading={renderLoading}
        headerHeight={80}
      >
        {/* Generate multi-row headers */}

        {columns.map((column) => {
          return column.isMulti ? (
            <ColumnGroup
              header={
                column.renderHeaderCell
                  ? column.renderHeaderCell()
                  : column.group || column.label || ""
              }
              key={String(column.key)}
              width={column.width || 150}
              align={column.align || "left"}
              fixed={column.fixed}
              headerHeight={150}
            >
              <Column width={column.width || 150} colSpan={2}>
                <HeaderCell>
                  <Typography fontWeight="bold">
                    {column.label || ""}
                  </Typography>
                </HeaderCell>

                <Cell dataKey={String(column.key)}>
                  {(rowData: T) =>
                    column.renderCell
                      ? column.renderCell(rowData)
                      : (rowData[column.key] as ReactNode)
                  }
                </Cell>
              </Column>
            </ColumnGroup>
          ) : (
            <Column
              key={String(column.key)}
              width={column.width || 150}
              align={column.align || "left"}
              fixed={column.fixed}
            >
              <HeaderCell>
                <Typography fontWeight="bold">{column.label || ""}</Typography>
              </HeaderCell>
              <Cell dataKey={String(column.key)}>
                {(rowData: T) =>
                  column.renderCell
                    ? column.renderCell(rowData)
                    : (rowData[column.key] as ReactNode)
                }
              </Cell>
            </Column>
          );
        })}
      </Table>
      {pagination && (
        <TablePagination
          rowsPerPageOptions={rowsPerPageOptions}
          component="div"
          count={data?.length ?? 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}
    </div>
  );
};

export default ScrollingTable;
