"use client";
import { DateRangePicker, DateRangePickerProps } from "rsuite";

import React from "react";
import { styled } from "@mui/material/styles";
import "rsuite/dist/rsuite.min.css";

export type DateRange = [Date, Date];
export interface RangeType<T = DateRange> {
  label: React.ReactNode;

  value: T | ((value?: T) => T);
  closeOverlay?: boolean;
  placement?: "bottom" | "left";
}

export interface CommonDateRangePickerProps
  extends Partial<DateRangePickerProps> {
  value: T | ((value?: T) => T);
  ranges?: RangeType[];
  constraint?: boolean; // weather to limit the range of the date constraints to a standard stay

  onDateRangeChange?: (range: [Date | null, Date | null]) => void;
  isInvalid?: boolean;
  style?: React.CSSProperties;
  inputStyle?: React.CSSProperties;
}

const CommonDateRangePicker: React.FC<CommonDateRangePickerProps> = ({
  value,
  ranges,
  onDateRangeChange,
  isInvalid = false,
  style,
  ...props
}) => {
  const handleChange = (value: [Date | null, Date | null] | null) => {
    if (onDateRangeChange && value) {
      onDateRangeChange(value);
    }
  };

  return (
    <Wrapper style={style}>
      <CustomDateRangePicker
        placeholder="Select Date Range"
        value={value}
        ranges={ranges}
        onChange={handleChange}
        className={isInvalid ? "has-error" : ""}
        {...props}
      />
    </Wrapper>
  );
};

export default CommonDateRangePicker;

const Wrapper = styled("div")({
  width: "100%",
});

const CustomDateRangePicker = styled(DateRangePicker)`
  &.has-error {
    border: 1px solid red;
  }

  &:hover {
    border-color: red;
  }

  width: 100%;
`;
