import { GridFilterOperator } from "@mui/x-data-grid";
import dayjs from "dayjs";
import { useCallback } from "react";
import {
  DatePickerFilter,
  DropdownFilter,
  TimePickerFilter,
} from "utils/FilterComponent";

export const useFilter = () => {
  const getFilterOperators = useCallback(
    (
      type: "text" | "date" | "dropdown" | "time",
      label: string,
      options?: { label: string; value: string }[]
    ) => {
      let filterOperators: GridFilterOperator[] = [];

      switch (type) {
        case "text":
          filterOperators = [
            {
              label: `${label} (equals)`,
              value: "equals",
              getApplyFilterFn: (filterItem) => {
                if (!filterItem.value) return null;
                return (value: string) => value === filterItem.value;
              },
            },
          ];
          break;

        case "date":
          filterOperators = [
            {
              label: `Same`,
              value: "on",
              getApplyFilterFn: (filterItem) => {
                if (!filterItem.value) return null;
                return (value: string) =>
                  dayjs(value).isSame(dayjs(filterItem.value), "day");
              },
              InputComponent: (props: any) => (
                <DatePickerFilter
                  {...props}
                  label={label}
                  applyValue={props.applyValue}
                />
              ),
            },
            // {
            //   label: `Before`,
            //   value: "before",
            //   getApplyFilterFn: (filterItem) => {
            //     if (!filterItem.value) return null;
            //     return (value: string) =>
            //       dayjs(value).isBefore(dayjs(filterItem.value), "day");
            //   },
            //   InputComponent: (props: any) => (
            //     <DatePickerFilter
            //       {...props}
            //       label={`Before ${label}`}
            //       applyValue={props.applyValue}
            //     />
            //   ),
            // },
            // {
            //   label: `After`,
            //   value: "after",
            //   getApplyFilterFn: (filterItem) => {
            //     if (!filterItem.value) return null;
            //     return (value: string) =>
            //       dayjs(value).isAfter(dayjs(filterItem.value), "day");
            //   },
            //   InputComponent: (props: any) => (
            //     <DatePickerFilter
            //       {...props}
            //       label={`After ${label}`}
            //       applyValue={props.applyValue}
            //     />
            //   ),
            // },
          ];
          break;
        case "time":
          filterOperators = [
            {
              label: `Same`,
              value: "on",
              getApplyFilterFn: (filterItem) => {
                if (!filterItem.value) return null;
                return (value: string) => {
                  const timeFormat = dayjs(filterItem.value).format("HH:mm:ss");
                  return value === timeFormat;
                };
              },
              InputComponent: (props: any) => (
                <TimePickerFilter
                  {...props}
                  label={label}
                  applyValue={props.applyValue}
                />
              ),
            },
            // {
            //   label: `Before`,
            //   value: "before",
            //   getApplyFilterFn: (filterItem) => {
            //     if (!filterItem.value) return null;
            //     return (value: string) => value < filterItem.value;
            //   },
            //   InputComponent: (props: any) => (
            //     <TimePickerFilter
            //       {...props}
            //       label={`Before ${label}`}
            //       applyValue={props.applyValue}
            //     />
            //   ),
            // },
            // {
            //   label: `After`,
            //   value: "after",
            //   getApplyFilterFn: (filterItem) => {
            //     if (!filterItem.value) return null;
            //     return (value: string) => value > filterItem.value;
            //   },
            //   InputComponent: (props: any) => (
            //     <TimePickerFilter
            //       {...props}
            //       label={`After ${label}`}
            //       applyValue={props.applyValue}
            //     />
            //   ),
            // },
          ];
          break;

        case "dropdown":
          if (!options) break;
          filterOperators = [
            {
              label: `${label} (equals)`,
              value: "equals",
              getApplyFilterFn: (filterItem) => {
                if (!filterItem.value) return null;
                return (value: string) => value === filterItem.value;
              },
              InputComponent: (props: any) => (
                <DropdownFilter
                  {...props}
                  label={label}
                  optionsWithAll={options}
                  applyValue={props.applyValue}
                />
              ),
            },
          ];
          break;

        default:
          break;
      }

      return filterOperators;
    },
    []
  );

  return {
    getFilterOperators,
  };
};

export default useFilter;
