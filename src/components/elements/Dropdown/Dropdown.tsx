"use client";
import React from "react";
import { styled } from "@mui/system";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectProps,
} from "@mui/material";

export type DropdownOption = {
  label: string;
  value: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  color?: string;
};

export type DropdownProps = SelectProps & {
  isInvalid?: boolean;
  style?: React.CSSProperties;
  options: DropdownOption[];
};

const Dropdown: React.FC<DropdownProps> = (props) => {
  const { onChange, isInvalid, style, options, id, label, ...rest } = props;
  return (
    <MainWrapper>
      {label && <InputLabel id={id}>{label}</InputLabel>}
      <CustomSelectField
        onChange={onChange}
        error={isInvalid ?? false}
        style={style}
        label={label}
        MenuProps={{
          PaperProps: {
            sx: {
              bgcolor: "background.paper",
            },
          },
        }}
        {...rest}
      >
        {options.map((option, index) => (
          <MenuItem
            key={option.value}
            value={option.value}
            disabled={option?.disabled ?? false}
            sx={{ color: option?.color ?? "inherit" }}
            data-testid={`select-option-${index}`}
          >
            {option?.icon ?? ""} {option.label}
          </MenuItem>
        ))}
      </CustomSelectField>
    </MainWrapper>
  );
};

export default Dropdown;

const MainWrapper = styled(FormControl)(() => ({
  width: "100%",
}));
const CustomSelectField = styled(Select)<{ error: boolean }>(
  ({ theme, error }) => ({
    "& .MuiSelect-select": {
      color: error ? theme.palette.error.main : theme.palette.text.primary,
    },
    "&.MuiOutlinedInput-root": {
      backgroundColor: theme.palette.background.default,
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: error ? theme.palette.error.main : theme.palette.divider,
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: error ? theme.palette.error.main : "unset",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: error ? theme.palette.error.main : "unset",
    },
  })
);
