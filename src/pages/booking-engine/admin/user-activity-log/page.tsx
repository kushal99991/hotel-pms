import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  Grid,
  TablePagination,
  Collapse,
  IconButton,
  Autocomplete,
  TextField,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Skeleton,
  Badge,
} from "@mui/material";
import { useGetHistoryByIdMutation } from "services/historySlice";
import { useUsersQuery } from "services/userSlice";
import useAuth from "hooks/useAuth";
import { Person, Update, Clear, FilterList } from "@mui/icons-material";
import { convertUtcToTimezone } from "utils/helperFunctions/common";
import Button from "components/elements/Button/PrimaryButton";
import { IHistory } from "types/historyTypes";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterState {
  userId: FilterOption | null;
  category: FilterOption | null;
  action: FilterOption | null;
  searchText?: string;
}

interface CategoryOption {
  value: string;
  label: string;
  isGroup?: boolean;
  indent?: boolean;
}

const UserActivityLog: React.FC = () => {
  const [getHistoryById, { isLoading, data: historyData }] =
    useGetHistoryByIdMutation();
  const { data: userList = [] } = useUsersQuery();
  const { users, currentTimeZone } = useAuth();

  // Filter and pagination state
  const [filters, setFilters] = useState<FilterState>({
    userId: null,
    category: null,
    action: null,
    searchText: "",
  });
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(100);
  const [filtersExpanded, setFiltersExpanded] = useState<boolean>(false);
  const [activityCategoriesState, setActivityCategoriesState] = useState<
    CategoryOption[]
  >([{ value: "All Activities", label: "All Activities" }]);

  const capitalize = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1);

  useEffect(() => {
    if (historyData?.length) {
      const categoryMap: Record<string, Set<string>> = {};
      historyData.forEach((act: IHistory) => {
        const cat = act.category?.toUpperCase();
        const action = act.action?.toLowerCase();
        if (!categoryMap[cat]) categoryMap[cat] = new Set();
        categoryMap[cat].add(action);
      });

      const options: CategoryOption[] = [
        { value: "All Activities", label: "All Activities" },
      ];

      Object.entries(categoryMap).forEach(([category, actions]) => {
        options.push({
          value: `All ${category} Activities`,
          label: `All ${capitalize(category)} Activities`,
          isGroup: true,
        });

        Array.from(actions).forEach((action) => {
          options.push({
            value: `${category}-${action}`,
            label: `${capitalize(category.toLowerCase())} - ${capitalize(action)}`,
            indent: true,
          });
        });
      });

      setActivityCategoriesState(options);
    }
  }, [historyData]);

  // User options for filter
  const userOptions: FilterOption[] = useMemo(() => {
    if (!userList) return [];
    return userList.map((user) => ({
      label: `${user.firstName} ${user.lastName} (${user.userName})`,
      value: user.id.toString(),
    }));
  }, [userList]);

  const fetchHistory = () => {
    if (!users?.defaultPropertyId) return;

    const params: Record<string, string | number> = {
      property_id: users.defaultPropertyId,
    };

    if (filters?.userId) {
      params.user_id = filters.userId.value;
    }

    if (filters.category) {
      if (filters.category.value.startsWith("All")) {
        const categoryMatch = filters.category.value.match(
          /^All (.+) Activities$/
        );
        if (categoryMatch) {
          params.category = categoryMatch[1].trim().toUpperCase();
        }
      } else {
        const [category, action] = filters.category.value.split("-");
        params.category = category.trim().toUpperCase();
        params.action = action.trim().toLowerCase();
      }
    }

    getHistoryById({
      property_id: Number(params.property_id),
      user_id: params.user_id ? Number(params.user_id) : undefined,
      category: params.category?.toString(),
      action: params.action?.toString(),
      limit: rowsPerPage,
      offset: page,
    });
  };

  useEffect(() => {
    fetchHistory();
  }, [users?.defaultPropertyId, page, rowsPerPage]);

  const handleFilterChange = (
    filterType: keyof FilterState,
    value: FilterOption | null
  ) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
    setPage(0); // Reset to first page when filters change
  };

  const applyFilters = () => {
    fetchHistory();
  };

  const clearFilters = () => {
    setFilters({ userId: null, category: null, action: null });
    setPage(0);
    // Fetch history with cleared filters
    setTimeout(() => {
      if (users?.defaultPropertyId) {
        getHistoryById({
          property_id: users.defaultPropertyId,
          limit: rowsPerPage,
          offset: 0,
        });
      }
    }, 100);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getCategoryColor = (category: string) => {
    switch (category.toUpperCase()) {
      case "RESERVATION":
        return "primary";
      case "USER":
        return "secondary";
      case "PAYMENT":
        return "success";
      case "ROOM":
        return "info";
      default:
        return "default";
    }
  };

  const filteredHistoryData = historyData
    ? historyData.filter((entry) => {
        const search = filters.searchText?.toLowerCase().trim() || "";
        if (!search) return true;
        return (
          entry.details?.toLowerCase().includes(search) ||
          entry.user?.user_name?.toLowerCase().includes(search) ||
          entry.category?.toLowerCase().includes(search) ||
          entry.action?.toLowerCase().includes(search)
        );
      })
    : [];

  // Sort the history data by created_at timestamp in descending order (newest first)
  const sortedHistoryData = filteredHistoryData
    ? [...filteredHistoryData].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    : [];
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.userId) count++;
    if (filters.category) count++;
    if (filters.action) count++;
    if (filters.searchText?.trim()) count++;
    return count;
  }, [filters]);

  // Calculate smart count for pagination
  const hasMoreData = historyData && historyData.length === rowsPerPage;
  const calculatedCount = hasMoreData
    ? (page + 2) * rowsPerPage
    : page * rowsPerPage + (historyData?.length || 0);

  return (
    <Box sx={{ p: 3 }}>
      {/* Compact Header Row */}
      <Paper sx={{ mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {!filtersExpanded && (
              <Badge
                badgeContent={activeFilterCount}
                color="error"
                invisible={activeFilterCount === 0}
              >
                <IconButton
                  onClick={() => setFiltersExpanded(!filtersExpanded)}
                  size="small"
                  sx={{
                    mr: 1,
                    backgroundColor: filtersExpanded
                      ? "action.selected"
                      : "transparent",
                    "&:hover": {
                      backgroundColor: filtersExpanded
                        ? "action.hover"
                        : "action.hover",
                    },
                  }}
                >
                  <FilterList />
                </IconButton>
              </Badge>
            )}

            {filtersExpanded && (
              <IconButton
                onClick={() => setFiltersExpanded(!filtersExpanded)}
                size="small"
                sx={{
                  mr: 1,
                  backgroundColor: filtersExpanded
                    ? "action.selected"
                    : "transparent",
                  "&:hover": {
                    backgroundColor: filtersExpanded
                      ? "action.hover"
                      : "action.hover",
                  },
                }}
              >
                <FilterList />
              </IconButton>
            )}
          </Box>

          <TablePagination
            component="div"
            count={calculatedCount}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[100, 200, 500]}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelDisplayedRows={({ from, to }) => `${from}-${to}`}
            sx={{ border: "none" }}
          />
        </Box>

        {/* Collapsible Filters */}
        <Collapse in={filtersExpanded}>
          <Box
            sx={{ p: 2, pt: 1, borderTop: "1px solid", borderColor: "divider" }}
          >
            <Box sx={{ display: "flex", alignItems: "end", gap: 2, mt: 1 }}>
              <Grid container spacing={2} sx={{ flex: 1 }}>
                <Grid item xs={12} sm={4} md={4}>
                  <Autocomplete<CategoryOption>
                    value={filters.category as CategoryOption | null}
                    onChange={(_, selectedOption) =>
                      handleFilterChange("category", selectedOption)
                    }
                    options={activityCategoriesState}
                    getOptionLabel={(option) =>
                      option?.label || "All Activities"
                    }
                    isOptionEqualToValue={(option, value) =>
                      option.value === value.value
                    }
                    renderOption={(props, option) => (
                      <li
                        {...props}
                        style={{
                          paddingLeft: option.indent ? 24 : 12,
                          fontWeight: option.isGroup ? 600 : 400,
                          backgroundColor: option.isGroup
                            ? "#f5f5f5"
                            : "inherit",
                        }}
                      >
                        {option.label}
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Activity Category"
                        placeholder="All Activities"
                        size="small"
                        fullWidth
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={4} md={4}>
                  <Autocomplete
                    value={filters.userId}
                    onChange={(_, selectedOption) =>
                      handleFilterChange("userId", selectedOption)
                    }
                    options={userOptions}
                    getOptionLabel={(option) => option.label}
                    isOptionEqualToValue={(option, value) =>
                      option.value === value.value
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="User"
                        placeholder="All Users"
                        size="small"
                        fullWidth
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={4} md={4}>
                  <TextField
                    label=""
                    placeholder="Filter by Name, Folio Number, last 4 digits, etc."
                    value={filters.searchText}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        searchText: e.target.value,
                      }))
                    }
                    size="small"
                    fullWidth
                  />
                </Grid>
              </Grid>

              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  label="Apply"
                  onClick={applyFilters}
                  variant="contained"
                  size="small"
                />
                <Button
                  label="Clear"
                  onClick={clearFilters}
                  variant="outlined"
                  size="small"
                  startIcon={<Clear />}
                />
              </Box>
            </Box>
          </Box>
        </Collapse>
      </Paper>

      {/* Activity Log Content */}
      {isLoading ? (
        <Paper sx={{ p: 3 }}>
          {[...Array(5)].map((_, index) => (
            <Box key={index} sx={{ mb: 3 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}
              >
                <Skeleton variant="circular" width={24} height={24} />
                <Skeleton variant="text" width="20%" height={24} />
                <Skeleton variant="rounded" width={80} height={24} />
                <Skeleton
                  variant="text"
                  width="30%"
                  height={20}
                  sx={{ ml: "auto" }}
                />
              </Box>
              <Skeleton variant="rectangular" height={60} />
            </Box>
          ))}
        </Paper>
      ) : (
        <Paper sx={{ p: 3 }}>
          {sortedHistoryData.length > 0 ? (
            <Stepper orientation="vertical" sx={{ mb: 1 }} connector={null}>
              {sortedHistoryData.map((item) => (
                <Step key={item.id} active completed>
                  <StepLabel
                    StepIconComponent={() => (
                      <Box sx={{ mr: 1 }}>
                        <Update fontSize="small" color="action" />
                      </Box>
                    )}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 1,
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        sx={{ textTransform: "capitalize" }}
                      >
                        {item.action}
                      </Typography>
                      <Chip
                        label={item.category}
                        size="small"
                        color={getCategoryColor(item.category)}
                        sx={{ ml: 1 }}
                      />
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ ml: "auto" }}
                      >
                        {convertUtcToTimezone(
                          item.created_at,
                          currentTimeZone
                        ).format("MM/DD/YYYY h:mm A")}
                      </Typography>
                    </Box>
                  </StepLabel>
                  <StepContent>
                    <Box
                      sx={{
                        py: 1,
                        px: 2,
                        mb: 0.7,
                        bgcolor: "background.paper",
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="body2" sx={{ mb: 1.5 }}>
                        {(() => {
                          const details = item.details || "";

                          // Handle "Reservation ID [number]" pattern in any category
                          const reservationIdMatch = details.match(
                            /Reservation ID \[(\d+)\]/
                          );
                          if (reservationIdMatch) {
                            const reservationId = reservationIdMatch[1];
                            return details
                              .split(
                                new RegExp(
                                  `(Reservation ID \\[${reservationId}\\])`,
                                  "g"
                                )
                              )
                              .map((part, index) => {
                                if (
                                  part === `Reservation ID [${reservationId}]`
                                ) {
                                  return (
                                    <span key={index}>
                                      Reservation ID [
                                      <Link
                                        href={`/booking-engine/reservations/${reservationId}`}
                                      >
                                        {reservationId}
                                      </Link>
                                      ]
                                    </span>
                                  );
                                }
                                return part;
                              });
                          }

                          // Handle Reservation category with table_id (for cases like "Reservation 10007 created")
                          if (
                            item.category?.toLowerCase() === "reservation" &&
                            item.table_id
                          ) {
                            return details
                              .replace(
                                new RegExp(`\\b${item.table_id}\\b`, "g"),
                                "|||LINK|||"
                              )
                              .split("|||LINK|||")
                              .map((part, index, array) => (
                                <span key={index}>
                                  {part}
                                  {index < array.length - 1 && (
                                    <Link
                                      href={`/booking-engine/reservations/${item.table_id}`}
                                    >
                                      {item.table_id}
                                    </Link>
                                  )}
                                </span>
                              ));
                          }

                          return details;
                        })()}
                      </Typography>
                      <Box
                        sx={{ display: "flex", gap: 2, alignItems: "center" }}
                      >
                        {item.user?.user_name && (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <Person fontSize="small" color="action" />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              User Name: {item.user.user_name}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          ) : (
            <Box sx={{ py: 4, textAlign: "center" }}>
              <Typography variant="body1" color="text.secondary">
                No activity history found for the selected filters.
              </Typography>
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default UserActivityLog;
