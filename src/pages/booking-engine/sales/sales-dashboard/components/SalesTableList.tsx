import React, { useMemo, useState, useCallback, useEffect } from "react";
import {
  DataGrid,
  GridColDef,
  GridRowParams,
  GridToolbarContainer,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import { Box, Button, Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import SearchInput from "components/elements/SearchInput/SearchInput";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import useAuth from "hooks/useAuth";
import { groupStatusDisplayValues } from "constants/sales";
import { useSalesGroupListQuery } from "services/salesSlice";
import { ISalesGroupListItem } from "types/salesTypes";
import { CommonPagination } from "utils/FilterComponent";
import { useGetRateCodeByPropertyIdMutation } from "services/roomTypeSlice";
import { IRateCodeResponse } from "types/roomTypes";
import { toCapitalCase } from "utils/helperFunctions/capitalCase";
import { modifyToDisplayDate } from "utils/helperFunctions/dateFormat";

interface SalesTableListProps {
  onRowClick?: (rowData: ISalesGroupListItem) => void;
  maxRows?: number;
  groups?: ISalesGroupListItem[];
}

const formatDate = (value: string | null | undefined) =>
  value ? modifyToDisplayDate(value) : "";

const displayMethodOfPayment = (value: string | null | undefined) => {
  if (!value) return "";
  return toCapitalCase(value);
};

const columns: GridColDef<ISalesGroupListItem>[] = [
  { field: "group_name", headerName: "Group Name", minWidth: 160, flex: 1 },
  {
    field: "company",
    headerName: "Company",
    minWidth: 120,
    flex: 1,
    // No dedicated company field yet; leave blank to avoid long descriptions spilling in.
    valueGetter: () => "",
  },
  {
    field: "group_status",
    headerName: "Group Status",
    minWidth: 120,
    flex: 1,
    renderCell: (params) => {
      const rawStatus = params.row?.group_status as
        | keyof typeof groupStatusDisplayValues
        | null
        | undefined;
      if (!rawStatus) {
        // Match other tables: show an empty cell instead of a "-" chip.
        return null;
      }
      const displayInfo = groupStatusDisplayValues[rawStatus];

      return (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="flex-start"
          gap={1}
          sx={{
            height: "100%",
            py: 0.5,
            width: "100%",
            flexWrap: "nowrap",
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          <Chip
            label={displayInfo?.label ?? rawStatus}
            size="small"
            sx={{
              backgroundColor: displayInfo?.color,
              color: displayInfo?.contrastColor,
              maxWidth: "100%",
              "& .MuiChip-label": {
                display: "block",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              },
            }}
          />
        </Box>
      );
    },
  },
  {
    field: "contract_signed",
    headerName: "Contract Signed",
    minWidth: 120,
    flex: 1,
    valueGetter: (_, row) => (row.contract_signed ? "Yes" : "No"),
  },
  {
    field: "group_arrival_date",
    headerName: "Arrival Date",
    minWidth: 120,
    flex: 1,
    valueGetter: (_, row) => formatDate(row.group_arrival_date),
  },
  {
    field: "group_departure_date",
    headerName: "Departure Date",
    minWidth: 120,
    flex: 1,
    valueGetter: (_, row) => formatDate(row.group_departure_date),
  },
  {
    field: "shoulder_dates",
    headerName: "Shoulder Dates",
    minWidth: 120,
    flex: 1,
    valueGetter: (_, row) => (row.shoulder_dates ? "Yes" : "No"),
  },
  {
    field: "rooms_blocked",
    headerName: "Rooms Committed",
    minWidth: 150,
    flex: 1,
  },
  { field: "rooms_booked", headerName: "Rooms Booked", minWidth: 120, flex: 1 },
  {
    field: "group_cutoff_date",
    headerName: "Cut Off Date (Rate)",
    minWidth: 150,
    flex: 1,
    valueGetter: (_, row) => formatDate(row.group_cutoff_date),
  },
  {
    field: "group_release_date",
    headerName: "Release Date (Inventory)",
    minWidth: 180,
    flex: 1,
    valueGetter: (_, row) => formatDate(row.group_release_date),
  },
  {
    field: "banquet",
    headerName: "Banquet",
    minWidth: 100,
    flex: 1,
    valueGetter: (_, row) => (row.banquet ? "Yes" : "No"),
  },
  {
    field: "catering",
    headerName: "Catering",
    minWidth: 100,
    flex: 1,
    valueGetter: (_, row) => (row.catering ? "Yes" : "No"),
  },
  {
    field: "method_of_payment",
    headerName: "Method of Payment",
    minWidth: 100,
    flex: 1,
    valueGetter: (_, row) => displayMethodOfPayment(row.method_of_payment),
  },
  {
    field: "rate_code_id",
    headerName: "Rate Code",
    minWidth: 100,
    flex: 1,
    valueGetter: (_, row) => (row.rate_code_id ? String(row.rate_code_id) : ""),
  },
  { field: "group_code", headerName: "Group Code", minWidth: 100, flex: 1 },
  {
    field: "market_segment",
    headerName: "Segment",
    minWidth: 100,
    flex: 1,
    valueGetter: (_, row) => row.market_segment ?? "",
  },
];

const CustomToolbar = () => (
  <GridToolbarContainer>
    <GridToolbarFilterButton />
  </GridToolbarContainer>
);

const SalesTableList: React.FC<SalesTableListProps> = ({
  onRowClick,
  maxRows,
  groups,
}) => {
  const { users } = useAuth();
  const [getRateCodeByPropertyId, { data: rateCodeList }] =
    useGetRateCodeByPropertyIdMutation();
  const { data: fetchedGroupList, isLoading } = useSalesGroupListQuery(
    { property_id: users?.defaultPropertyId ?? 0 },
    { skip: !users?.defaultPropertyId || !!groups }
  );
  const groupList = groups ?? fetchedGroupList;
  const [searchQuery, setSearchQuery] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    if (users?.defaultPropertyId) {
      getRateCodeByPropertyId({ propertyId: users.defaultPropertyId });
    }
  }, [users?.defaultPropertyId, getRateCodeByPropertyId]);

  const rateCodeNameById = useMemo(() => {
    const map = new Map<number, string>();
    (rateCodeList ?? []).forEach((r: IRateCodeResponse) => {
      map.set(r.id, r.name);
    });
    return map;
  }, [rateCodeList]);

  const handleSearchInputChange = useCallback((query: string) => {
    setSearchQuery(query.toLowerCase());
  }, []);

  const filteredRows = useMemo(() => {
    const rows = groupList ?? [];
    if (!searchQuery) return rows;
    return rows.filter((row) =>
      (row.group_name ?? "").toLowerCase().includes(searchQuery)
    );
  }, [groupList, searchQuery]);
  const handleRowClick = (params: GridRowParams) => {
    if (onRowClick) {
      onRowClick(params.row); // Pass entire row data to parent
    }
  };

  return (
    <Box my={2}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent={"space-between"}
        gap={2}
        mb={2}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <SearchInput onSearch={handleSearchInputChange} size="small" />
          <Button
            type="button"
            variant="outlined"
            onClick={() =>
              navigate(`/booking-engine/front-office/advanced-search`)
            }
          >
            Search
          </Button>
        </Box>
        <Box>
          <PrimaryButton
            label="Create Group"
            type="button"
            onClick={() => navigate("/booking-engine/sales/group/create")}
          />
        </Box>
      </Box>

      <DataGrid
        getRowId={(row) => row.id}
        rows={filteredRows}
        columns={columns.map((col) => {
          if (col.field !== "rate_code_id") return col;
          return {
            ...col,
            valueGetter: (_: unknown, row: ISalesGroupListItem) => {
              const id = row.rate_code_id;
              if (!id) return "";
              return rateCodeNameById.get(id) ?? String(id);
            },
          };
        })}
        loading={isLoading}
        initialState={{
          pagination: { paginationModel: { pageSize: maxRows ?? 10 } },
        }}
        pageSizeOptions={[10, 25, 50]}
        autoHeight
        disableRowSelectionOnClick
        slots={{
          toolbar: CustomToolbar,
          pagination: CommonPagination,
        }}
        onRowClick={handleRowClick}
        sx={{
          "& .MuiDataGrid-columnHeaders": {
            fontWeight: "bold",
            fontSize: 14,
            textAlign: "center",
            backgroundColor: "#eeeeee",
          },
          "& .MuiDataGrid-cell": {
            textAlign: "center",
          },
          "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": {
            outline: "none",
          },
          "& .MuiDataGrid-columnHeaderTitle": {
            textAlign: "center",
            width: "100%",
          },
          "& .MuiDataGrid-row": {
            cursor: "pointer",
          },
        }}
      />
    </Box>
  );
};

export default SalesTableList;
