import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import {
  Autocomplete,
  TextField,
  Grid,
  GridProps,
  AutocompleteRenderInputParams,
} from "@mui/material";
import Label from "components/elements/Label/Label";
import { GridSize } from "@mui/system";

type AutocompleteOption = {
  label: string;
  value: any;
};

type FormAutocompleteProps = {
  name: string;
  options: AutocompleteOption[];
  label?: string;
  sm?: GridSize;
  gridProps?: GridProps;
  required?: boolean;
  defaultValue?: any;
  multiple?: boolean;
  placeholder?: string;
  disabled?: boolean;
  renderInput?: (params: AutocompleteRenderInputParams) => React.ReactNode;
};

const FormAutocomplete: React.FC<FormAutocompleteProps> = ({
  name,
  options,
  label,
  gridProps,
  sm,
  defaultValue,
  multiple = false,
  placeholder,
  disabled = false,
  renderInput,
}) => {
  const { control, trigger } = useFormContext();

  const getValue = (fieldValue: any) => {
    if (multiple) {
      if (!fieldValue || !Array.isArray(fieldValue)) {
        return [];
      }
      return options.filter((opt) => fieldValue.includes(opt.value));
    } else {
      return options.find((opt) => opt.value === fieldValue) || null;
    }
  };

  const handleChange = (
    newValue: AutocompleteOption | AutocompleteOption[] | null,
    onChange: (value: any) => void
  ) => {
    if (multiple) {
      const values = Array.isArray(newValue)
        ? newValue.map((item) => item.value)
        : [];
      onChange(values);
      trigger(name);
    } else {
      onChange((newValue as AutocompleteOption | null)?.value || "");
      trigger(name);
    }
  };

  const defaultRenderInput =
    (error?: any) => (params: AutocompleteRenderInputParams) => (
      <TextField
        {...params}
        placeholder={placeholder}
        fullWidth
        error={!!error}
        helperText={error?.message}
        sx={(theme) => ({
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: error
              ? theme.palette.error.main
              : theme.palette.divider,
          },
        })}
      />
    );

  return (
    <Grid item xs={12} sm={sm ?? 6} {...gridProps}>
      {label && <Label style={{ textAlign: "center" }}>{label}</Label>}
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <Autocomplete
            options={options}
            defaultValue={defaultValue}
            getOptionLabel={(option) => option.label}
            value={getValue(field.value)}
            onChange={(_, newValue) => handleChange(newValue, field.onChange)}
            multiple={multiple}
            disabled={disabled}
            renderInput={renderInput || defaultRenderInput(error)}
          />
        )}
      />
    </Grid>
  );
};

export default FormAutocomplete;
