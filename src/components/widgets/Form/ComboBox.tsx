import React, { SyntheticEvent } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete, {
  AutocompletePropsSizeOverrides,
} from "@mui/material/Autocomplete";
import { Box, Typography } from "@mui/material";
import { OverridableStringUnion } from "@mui/types";

export type TComboBoxOptions = {
  label: string | null;
  id: string | number;
  icon?: React.ReactNode;
};

export type TComboBoxProps = {
  label: string;
  items: TComboBoxOptions[];
  value?: TComboBoxOptions | null;
  onChange: (event: SyntheticEvent<Element, Event>, val: any) => void;
  width?: number | string;
  isInvalid?: boolean;
  helperText?: string;
  size?: OverridableStringUnion<
    "small" | "medium",
    AutocompletePropsSizeOverrides
  >;
  disabled?: boolean;
};

const ComboBox: React.FC<TComboBoxProps> = (props) => {
  const {
    label,
    items,
    width,
    isInvalid,
    helperText,
    value,
    onChange,
    size,
    disabled,
  } = props;

  return (
    <>
      <Autocomplete
        disableClearable
        options={items}
        value={value ?? items?.[0]}
        size={size ?? "small"}
        getOptionLabel={(option) => (option?.label ? option?.label : "")}
        isOptionEqualToValue={(option, value) => option?.id === value?.id}
        onChange={onChange}
        sx={{ width: width || 300 }}
        renderOption={(props, option) => (
          <Box
            component="li"
            sx={{ display: "flex", alignItems: "center" }}
            {...props}
            key={`${option.id}-${option.label}`}
          >
            {option.icon && (
              <Box component="span" sx={{ mr: 1 }}>
                {option.icon}
              </Box>
            )}
            <Typography>{option.label}</Typography>
          </Box>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            disabled={disabled}
            label={label || ""}
            error={isInvalid}
            helperText={isInvalid ? helperText : ""}
          />
        )}
      />
    </>
  );
};

export default ComboBox;
