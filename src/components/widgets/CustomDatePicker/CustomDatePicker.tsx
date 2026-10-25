import React from "react";
import { Typography, styled, Box } from "@mui/material";

import Label from "components/elements/Label/Label";
import CommonDateRangePicker, {
  CommonDateRangePickerProps,
} from "components/elements/DatePicker/DatePicker";
import { BoxProps } from "@mui/system";

interface PickerStyles {
  pickerWrapper?: React.CSSProperties;
  pickerInputGroup?: React.CSSProperties;
  pickerInput?: React.CSSProperties;
}

interface BoxPropsCustomProp extends BoxProps {
  pickerStyles?: PickerStyles;
}

export interface CustomDropdownProps
  extends Omit<CommonDateRangePickerProps, "isInvalid"> {
  label: string;
  helperText?: string;
  className?: string;
  isInvalid?: boolean;
  pickerStyles?: PickerStyles;
}

const CustomCommonDateRangePicker: React.FC<CustomDropdownProps> = (props) => {
  const {
    label,
    onDateRangeChange,
    value,
    helperText,
    style,
    className,
    pickerStyles,
    isInvalid = false,
    ...rest
  } = props;
  return (
    <MainWrapper className={className} pickerStyles={pickerStyles}>
      {label && <Label>{label}</Label>}

      <CommonDateRangePicker
        value={value}
        style={style}
        onDateRangeChange={onDateRangeChange}
        isInvalid={isInvalid}
        {...rest}
      />

      {helperText && (
        <ErrorText variant="caption" color="error">
          {helperText}
        </ErrorText>
      )}
    </MainWrapper>
  );
};

export default CustomCommonDateRangePicker;

const MainWrapper = styled(Box, {
  shouldForwardProp: (prop) => prop !== "pickerStyles",
})<BoxPropsCustomProp>(({ pickerStyles }) => ({
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  "& .rs-picker-daterange": pickerStyles?.pickerWrapper,
  "& .rs-picker-daterange .rs-picker-input-group":
    pickerStyles?.pickerInputGroup,
  "& .rs-picker-daterange .rs-input": pickerStyles?.pickerInput,
}));

const ErrorText = styled(Typography)(() => ({
  // marginTop: theme.spacing(1),
}));
