import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Chip,
  Drawer,
  TextField,
  Autocomplete,
  TextField as MuiTextField,
  Link,
  IconButton,
  Typography,
} from "@mui/material";
import { CloseOutlined } from "@mui/icons-material";
import { ExpectedStatusEnum } from "constants/reservation";
import { useGetRateCodeByPropertyIdMutation } from "services/roomTypeSlice";
import useAuth from "hooks/useAuth";
import { IRateCodeResponse } from "types/roomTypes";
import {
  IReservationFilter,
  IReservationResponse,
} from "types/reservationTypes";
import useCustomStatus from "hooks/useCustomStatus";
import { useGetReservationListQuery } from "services/reservationSlice";

interface MoreFilterComponentProps {
  filters: IReservationFilter;
  onFilter: (
    field: keyof IReservationFilter,
    value: string | number | Date | undefined | null
  ) => void;
  onReset?: () => void;
  onApply?: () => void;
}

const MoreFilterComponent: React.FC<MoreFilterComponentProps> = ({
  filters,
  onFilter,
  onReset,
  onApply,
}) => {
  const { users } = useAuth();
  const { reservationStatusList } = useCustomStatus();
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  const [getRateCodeByPropertyId, { data: rateCodeList }] =
    useGetRateCodeByPropertyIdMutation();
  const { data: reservationList } = useGetReservationListQuery(
    {
      property_id: users.defaultPropertyId,
    },
    {
      skip: false,
      refetchOnMountOrArgChange: true,
    }
  );

  const onRefresh = useCallback(async () => {
    if (users?.defaultPropertyId) {
      await getRateCodeByPropertyId({
        propertyId: users.defaultPropertyId,
      });
    }
  }, [users?.defaultPropertyId]);

  useEffect(() => {
    onRefresh();
  }, [users?.defaultPropertyId]);

  // Card type options
  const cardTypes = [
    { label: "Visa", value: "visa" },
    { label: "MasterCard", value: "mastercard" },
    { label: "American Express", value: "amex" },
    { label: "Discover", value: "discover" },
  ];

  // Check if any filter is selected
  const selectedFilterCount = Object.keys(filters).filter((key) => {
    return (
      (key === "reservation_status" ||
        key === "expected_status" ||
        key === "wing" ||
        key === "floor" ||
        key === "room_number" ||
        key === "rate_code" ||
        key === "last_4_digits" ||
        key === "card_type") &&
      filters[key as keyof IReservationFilter] !== "" &&
      filters[key as keyof IReservationFilter] !== null &&
      filters[key as keyof IReservationFilter] !== undefined
    );
  }).length;

  // Toggle the drawer
  const toggleDrawer = (open: boolean) => {
    setDrawerOpen(open);
  };

  // Handle filter changes
  const handleFilterChange = (
    field: keyof IReservationFilter,
    value: string | number | Date | undefined | null
  ) => {
    onFilter(field, value);
  };

  const resetFilters = () => {
    onReset?.();
    setDrawerOpen(false);
  };

  const applyFilters = () => {
    onApply?.();
    setDrawerOpen(false);
  };

  const rateCodeOptions = useMemo(() => {
    const rateCodeOptionList = (rateCodeList ?? [])
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((rateCode: IRateCodeResponse) => ({
        label: rateCode.name,
        value: rateCode.id.toString(),
        isDeactivated: rateCode.active === false,
      }));
    return rateCodeOptionList;
  }, [rateCodeList]);

  const groupCodeOptions = useMemo(() => {
    const groupCodeOptionList = (reservationList ?? [])
      .map((reservation: IReservationResponse) => ({
        label: reservation.group?.group_code ?? "",
        value: reservation.group?.group_code?.toString() ?? "",
      }))
      // Filter out empty values
      .filter((option) => option.value);

    // Deduplicate by value
    const uniqueGroupCodeMap = new Map();
    groupCodeOptionList.forEach((option) => {
      if (!uniqueGroupCodeMap.has(option.value)) {
        uniqueGroupCodeMap.set(option.value, option);
      }
    });

    return Array.from(uniqueGroupCodeMap.values());
  }, [reservationList]);

  return (
    <Box>
      <Link
        component="button"
        variant="body2"
        color="primary"
        whiteSpace={"nowrap"}
        onClick={() => toggleDrawer(true)}
      >
        More Filters {selectedFilterCount ? `+${selectedFilterCount}` : ``}
      </Link>

      {/* Drawer for More Filters */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => toggleDrawer(false)}
        data-testid="more-filters-drawer"
      >
        <Box display="flex" flexDirection="column" gap={2} p={2}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography fontWeight="700" fontStyle="normal">
              More Filters
            </Typography>
            <IconButton onClick={() => toggleDrawer(false)} color="primary">
              <CloseOutlined />
            </IconButton>
          </Box>

          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            {/* Apply Button */}
            <IconButton
              aria-label="apply-button"
              onClick={applyFilters}
              sx={{
                border: 1,
                borderRadius: 2,
                backgroundColor: "primary",
                width: "40%",
                height: "80%",
              }}
              color="secondary"
            >
              <Typography>Apply</Typography>
            </IconButton>
            {/* Clear Button */}
            <IconButton
              aria-label="clear-button"
              onClick={resetFilters}
              sx={{
                border: 1,
                borderRadius: 2,
                backgroundColor: "primary",
                width: "40%",
                height: "80%",
              }}
              color="primary"
            >
              <Typography>Clear</Typography>
            </IconButton>
          </Box>

          {/* Reservation Status Filter */}
          <FormControl fullWidth>
            <InputLabel id="reservation-status-label">
              Reservation Status
            </InputLabel>
            <Select
              labelId="reservation-status-label"
              id="reservation-status"
              value={filters.reservation_status}
              label="Reservation Status"
              name="reservation_status"
              onChange={(e) =>
                handleFilterChange("reservation_status", e.target.value)
              }
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {reservationStatusList.map((value, index: number) => {
                return (
                  <MenuItem key={index} value={value.name}>
                    <Chip
                      label={value.name}
                      size="small"
                      sx={{
                        backgroundColor: value.bg_color,
                        color: value.text_color,
                        marginRight: 1,
                      }}
                    />
                    {value.name}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          {/* Expected Status Filter */}
          <FormControl fullWidth>
            <InputLabel id="expected-status-label">Expected Status</InputLabel>
            <Select
              labelId="expected-status-label"
              id="expected-status"
              value={filters.expected_status}
              label="Expected Status"
              onChange={(e) =>
                handleFilterChange("expected_status", e.target.value)
              }
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value={ExpectedStatusEnum.ARRIVING}>Arriving</MenuItem>
              <MenuItem value={ExpectedStatusEnum.DEPARTED}>Departing</MenuItem>
              <MenuItem value={ExpectedStatusEnum.IN_HOUSE}>In House</MenuItem>
            </Select>
          </FormControl>

          {/* Wing Filter */}
          <TextField
            label="Wing"
            value={filters.wing}
            onChange={(e) => handleFilterChange("wing", e.target.value)}
            fullWidth
          />

          {/* Floor Filter */}
          <TextField
            label="Floor"
            value={filters.floor}
            onChange={(e) => handleFilterChange("floor", e.target.value)}
            fullWidth
          />

          <Autocomplete
            value={
              filters.room_number === "not_assign"
                ? "Not Assign Room"
                : filters.room_number || ""
            }
            onChange={(e, newValue) => {
              if (newValue === "Not Assign Room") {
                handleFilterChange("room_number", "not_assign");
              } else {
                handleFilterChange("room_number", newValue || "");
              }
            }}
            options={["Not Assign Room"]}
            freeSolo
            getOptionLabel={(option) => option}
            renderInput={(params) => (
              <MuiTextField
                {...params}
                label="Room Number"
                value={filters.room_number || ""}
                onChange={(e) =>
                  handleFilterChange("room_number", e.target.value)
                }
              />
            )}
            fullWidth
          />

          {/* Room Code Filter (AutoComplete) */}
          <Autocomplete
            value={rateCodeOptions.find(
              (option) => option.value === filters.rate_code
            )}
            onChange={(e, newValue) =>
              handleFilterChange("rate_code", newValue?.value || "")
            }
            options={rateCodeOptions}
            getOptionLabel={(option) =>
              option.isDeactivated
                ? `${option.label} (Deactivated)`
                : option.label
            }
            renderOption={(props, option) => (
              <Box
                component="li"
                {...props}
                sx={{
                  color: option.isDeactivated ? "grey.600" : "inherit",
                  backgroundColor: option.isDeactivated
                    ? "grey.100"
                    : "inherit",
                  opacity: option.isDeactivated ? 0.7 : 1,
                }}
              >
                <Typography
                  variant="body2"
                  fontWeight={option.isDeactivated ? "bold" : "normal"}
                  color={option.isDeactivated ? "error.main" : "inherit"}
                >
                  {option.label} {option.isDeactivated && "(Deactivated)"}
                </Typography>
              </Box>
            )}
            renderInput={(params) => (
              <MuiTextField {...params} label="Rate Code" />
            )}
            fullWidth
          />

          {/* Group Code Filter (AutoComplete) */}
          <Autocomplete
            value={groupCodeOptions.find(
              (option) => option.value === filters.group_code
            )}
            onChange={(e, newValue) =>
              handleFilterChange("group_code", newValue?.value || "")
            }
            options={groupCodeOptions}
            getOptionLabel={(option) => option?.label ?? ""}
            renderOption={(props, option) => (
              <Box
                component="li"
                {...props}
                sx={{
                  color: "inherit",
                  backgroundColor: "inherit",
                  opacity: 1,
                }}
              >
                <Typography
                  variant="body2"
                  fontWeight={"normal"}
                  color={"inherit"}
                >
                  {option.label}
                </Typography>
              </Box>
            )}
            renderInput={(params) => (
              <MuiTextField {...params} label="Group Code" />
            )}
            fullWidth
          />

          {/* Payment Card Type Filter */}
          <FormControl fullWidth>
            <InputLabel id="card-type-label">Card Type</InputLabel>
            <Select
              labelId="card-type-label"
              id="card-type"
              value={filters.card_type || ""}
              label="Card Type"
              onChange={(e) => handleFilterChange("card_type", e.target.value)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {cardTypes.map((card) => (
                <MenuItem key={card.value} value={card.value}>
                  {card.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Card Number Filter (Last 4 Digits) */}
          <TextField
            label="Card Number (Last 4 Digits)"
            value={filters.last_4_digits}
            onChange={(e) =>
              handleFilterChange("last_4_digits", e.target.value)
            }
            fullWidth
            inputProps={{
              maxLength: 4,
              pattern: "[0-9]{4}",
            }}
          />
        </Box>
      </Drawer>
    </Box>
  );
};

export default MoreFilterComponent;
