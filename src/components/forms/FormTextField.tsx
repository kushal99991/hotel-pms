import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Grid, TextField, TextFieldProps, GridProps } from "@mui/material";
import { toCapitalCase } from "utils/helperFunctions/capitalCase";
import { GridSize } from "@mui/system";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

// Format functions for React 19 compatibility (replaces react-input-mask)
const applyMask = (value: string, mask: string): string => {
  const cleaned = value.replace(/\D/g, "");
  let result = "";
  let valueIndex = 0;

  for (let i = 0; i < mask.length && valueIndex < cleaned.length; i++) {
    if (mask[i] === "9") {
      result += cleaned[valueIndex];
      valueIndex++;
    } else {
      result += mask[i];
    }
  }

  return result;
};

interface FormTextFieldProps {
  name: string;
  sm?: GridSize;
  gridProps?: GridProps;
  textFieldProps?: TextFieldProps;
  label?: string | undefined | null;
  required?: boolean;
  mask?: string;
}

const FormTextField: React.FC<FormTextFieldProps> = ({
  name,
  gridProps,
  textFieldProps,
  label,
  sm,
  required,
  mask = "(999) 999-9999",
}) => {
  const { control } = useFormContext();
  let displayLabel = label;
  if (!label) {
    displayLabel = toCapitalCase(`${name}`);
  }

  return (
    <Grid item xs={12} sm={sm ?? 6} {...gridProps}>
      <Controller
        name={name}
        control={control}
        render={({
          field: { onChange, value },
          fieldState: { invalid, error },
        }) => {
          const isPhoneType = textFieldProps?.type === "tel";
          const isPhoneNumberWithCountry = textFieldProps?.type === "phone";

          return isPhoneType ? (
            <TextField
              fullWidth
              InputLabelProps={{ required: !!required }}
              {...textFieldProps}
              error={invalid}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                const plainNumber = event.target.value.replace(/\D/g, "");
                onChange(plainNumber);
              }}
              value={applyMask(value ?? "", mask)}
              label={displayLabel}
              key={name}
              helperText={error?.message ?? ""}
              inputProps={{
                "data-testid": `${label?.toLowerCase()}-input`,
              }}
            />
          ) : isPhoneNumberWithCountry ? (
            <PhoneInput
              placeholder={textFieldProps?.placeholder ?? "Enter phone number"}
              value={value ?? ""}
              onChange={(value: string) => onChange(value)}
              preferredCountries={["us", "in"]}
              inputProps={{
                name: name,
                required: required,
                autoFocus: true,
              }}
              specialLabel={label ?? ""}
              inputStyle={{
                width: "100%",
                height: "100%",
                paddingTop: "15px",
                paddingBottom: "15px",
                fontSize: "1.2rem",
                border: "1px solid #ccc",
                outline: invalid ? "1px solid red" : "none",
                boxSizing: "border-box",
              }}
            />
          ) : (
            <TextField
              fullWidth
              InputLabelProps={{ required: !!required }}
              {...textFieldProps}
              error={invalid}
              onChange={onChange}
              value={value ?? ""}
              label={displayLabel}
              key={name}
              helperText={error?.message ?? ""}
              inputProps={{
                "data-testid": `${label?.toLowerCase()}-input`,
              }}
            />
          );
        }}
      />
    </Grid>
  );
};

export default FormTextField;
