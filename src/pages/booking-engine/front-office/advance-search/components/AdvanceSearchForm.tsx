import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Autocomplete, Box, Grid, TextField } from "@mui/material";
import MoreFilterComponent from "./MoreFilterComponent";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { appConfig } from "config/app.config";
import { IReservationFilter } from "types/reservationTypes";
import { GridFilterModel, GridLogicOperator } from "@mui/x-data-grid";
import { useGetRoomTypeByPropertyIdMutation } from "services/roomTypeSlice";
import useAuth from "hooks/useAuth";
import { IRoomTypes } from "types/roomTypes";
import { Controller, FormProvider, useForm } from "react-hook-form";
import FormTextField from "components/forms/FormTextField";

const AdvanceSearchForm: React.FC<{
  setFilterModel: (values: React.SetStateAction<GridFilterModel>) => void;
}> = ({ setFilterModel }) => {
  const { users } = useAuth();
  const [isResettingFilters, setIsResettingFilters] = useState<boolean>(false);
  const [filters, setFilters] = useState<IReservationFilter>({
    reservation_status: null,
    start_date: "",
    end_date: "",
    arriving_date: "",
    departing_date: "",
    expected_status: "",
    confirmation_number: "",
    first_name: "",
    last_name: "",
    wing: "",
    floor: "",
    last_4_digits: "",
    rate_code: "",
    expected_checkin_time: "",
    expected_checkout_time: "",
    room_number: "",
    reservation_id: "",
  });
  const methods = useForm<IReservationFilter>({
    mode: "all",
    defaultValues: {
      first_name: "",
      last_name: "",
      reservation_id: "",
      room_type: "",
      confirmation_number: "",
      start_date: undefined,
      end_date: undefined,
      arriving_date: undefined,
      departing_date: undefined,
    },
  });

  const { handleSubmit, reset, control } = methods;

  const [getRoomTypeByPropertyId, { data: roomTypeList }] =
    useGetRoomTypeByPropertyIdMutation();

  const onRefresh = useCallback(async () => {
    if (users?.defaultPropertyId) {
      await getRoomTypeByPropertyId({
        propertyId: users.defaultPropertyId,
      });
    }
  }, [users?.defaultPropertyId]);

  useEffect(() => {
    onRefresh();
  }, [users?.defaultPropertyId]);

  useEffect(() => {
    if (isResettingFilters) {
      handleSubmit(onSubmit)();
      setIsResettingFilters(false);
    }
  }, [isResettingFilters]);

  const handleFilterChange = (
    field: keyof IReservationFilter,
    value: string | number | Date | undefined | null
  ) => {
    let sanitizedValue: string | null = null;

    if (value !== undefined && value !== null) {
      if (typeof value === "string") {
        sanitizedValue = value;
      } else if (typeof value === "number") {
        sanitizedValue = value.toString();
      } else if (value instanceof Date) {
        sanitizedValue = value.toISOString();
      }
    }

    setFilters((prevFilters) => ({
      ...prevFilters,
      [field]: sanitizedValue,
    }));
  };

  const onSubmit = (data: IReservationFilter) => {
    const mergeData = { ...filters, ...data };
    const filteredEntries = Object.entries(mergeData).filter(
      ([_key, value]) => value !== "" && value !== null && value !== undefined
    );
    const filterData = filteredEntries.reduce(
      (acc, [field, value]) => {
        switch (field) {
          case "arriving_date":
            acc[field] = value ? dayjs(value).format("YYYY-MM-DD") : null;
            break;
          case "departing_date":
            acc[field] = value ? dayjs(value).format("YYYY-MM-DD") : null;
            break;
          default:
            acc[field] = value;
            break;
        }
        return acc;
      },
      {} as Record<string, unknown>
    );
    const result: GridFilterModel = {
      items: filterData
        ? Object.entries(filterData).map(([field, value], index) => ({
            id: index + 1,
            field,
            value,
            operator: "equals",
          }))
        : [],
      logicOperator: GridLogicOperator.And,
      quickFilterValues: [],
      quickFilterLogicOperator: GridLogicOperator.And,
      quickFilterExcludeHiddenColumns: true,
    };
    setFilterModel(result);
  };

  const handleResetFilter = () => {
    setFilters({
      reservation_status: null,
      start_date: "",
      end_date: "",
      arriving_date: "",
      departing_date: "",
      expected_status: "",
      confirmation_number: "",
      first_name: "",
      last_name: "",
      wing: "",
      floor: "",
      last_4_digits: "",
      rate_code: "",
      expected_checkin_time: "",
      expected_checkout_time: "",
      room_number: "",
      reservation_id: "",
      room_type: "",
    });
    reset();
    setIsResettingFilters(true);
  };

  const roomTypesOptions = useMemo(() => {
    const options = (roomTypeList ?? []).map((roomType: IRoomTypes) => ({
      label: roomType.type,
      value: roomType.type,
    }));
    const defaultOptions = { label: "All", value: "" };
    return [defaultOptions, ...options];
  }, [roomTypeList]);

  return (
    <FormProvider {...methods}>
      <Grid container spacing={2} alignItems={"center"}>
        {/* Search by First Name */}
        <FormTextField
          name="first_name"
          sm={6}
          label="Search by First Name"
          textFieldProps={{
            fullWidth: true,
            placeholder: "Enter First Name",
          }}
          required
          gridProps={{ xs: 12, md: 3 }}
        />

        {/* Search by Last Name */}
        <FormTextField
          name="last_name"
          sm={6}
          label="Search by Last Name"
          textFieldProps={{
            fullWidth: true,
            placeholder: "Enter Search by Last Name",
          }}
          required
          gridProps={{ xs: 12, md: 3 }}
        />

        {/* Search by Folio Number */}
        <FormTextField
          name="reservation_id"
          sm={6}
          label="Search by Folio Number"
          textFieldProps={{
            fullWidth: true,
            placeholder: "Enter Search by Folio Number",
            type: "number",
          }}
          required
          gridProps={{ xs: 12, md: 3 }}
        />

        {/* Search by Room Type */}
        <Grid item xs={12} sm={6} md={3}>
          {/* Room Type Filter (AutoComplete) */}
          <Controller
            name="room_type"
            control={control}
            render={({ field: { value, onChange } }) => {
              const selectedRoomType = roomTypesOptions.find(
                (option) => option.value === value
              );
              return (
                <Autocomplete
                  value={selectedRoomType}
                  onChange={(e, newValue) => {
                    onChange(newValue?.value || "");
                  }}
                  options={roomTypesOptions}
                  getOptionLabel={(option) => option.label}
                  renderInput={(params) => (
                    <TextField {...params} name="room_type" label="Room Type" />
                  )}
                  fullWidth
                />
              );
            }}
          />
        </Grid>

        {/* Search by Confirmation */}
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="confirmation_number"
            control={control}
            render={({ field: { value, onChange, name } }) => {
              return (
                <TextField
                  fullWidth
                  label="Search by Confirmation"
                  placeholder="Search by Confirmation"
                  value={value}
                  onChange={(e) => {
                    onChange(e.target.value);
                    handleFilterChange(name, e.target.value);
                  }}
                  required
                />
              );
            }}
          />
        </Grid>

        {/* Search by Arrival */}
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="arriving_date"
            control={control}
            render={({ field: { value, onChange, name } }) => {
              return (
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Search by Arrival"
                    value={value ? dayjs(value) : null}
                    format={appConfig.displayDateFormat}
                    onChange={(date) => {
                      onChange(date?.toDate());
                      handleFilterChange(name, date?.toDate());
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                      },
                    }}
                  />
                </LocalizationProvider>
              );
            }}
          />
        </Grid>

        {/* Search by Departure */}
        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="departing_date"
            control={control}
            render={({ field: { value, onChange, name } }) => {
              return (
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Search by Departure"
                    value={value ? dayjs(value) : null}
                    format={appConfig.displayDateFormat}
                    onChange={(date) => {
                      onChange(date?.toDate());
                      handleFilterChange(name, date?.toDate());
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                      },
                    }}
                  />
                </LocalizationProvider>
              );
            }}
          />
        </Grid>
        {/* Buttons */}
        <Grid item xs={12} sm={6} md={3}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="flex-end"
            gap={2}
          >
            <PrimaryButton
              label="Search"
              buttonStyles={{
                backgroundColor: "#32A1AE",
                color: "#FFFFFF",
                fontWeight: "bold",
              }}
              isLoading={false}
              type="button"
              onClick={handleSubmit(onSubmit)}
            />
            <PrimaryButton
              label="RESET"
              buttonStyles={{
                backgroundColor: "gray",
                color: "#FFFFFF",
                fontWeight: "bold",
              }}
              isLoading={false}
              type="button"
              onClick={handleResetFilter}
            />
            <MoreFilterComponent
              filters={filters}
              onFilter={handleFilterChange}
              onReset={handleResetFilter}
              onApply={() => handleSubmit(onSubmit)()}
            />
          </Box>
        </Grid>
      </Grid>
    </FormProvider>
  );
};

export default AdvanceSearchForm;
