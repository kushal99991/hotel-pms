import React from "react";
import { SelectChangeEvent } from "@mui/material/Select";
import { useFormContext, Controller } from "react-hook-form";
import CustomDropdown, {
  CustomDropdownProps,
} from "components/widgets/CustomDropdown/CustomDropdown";
import { Grid, GridProps } from "@mui/material";
import { GridSize } from "@mui/system";

type FormCustomDropdownProps = CustomDropdownProps & {
  name: string;
  sm?: GridSize;
  gridProps?: GridProps;
  required?: boolean;
  defaultValue?: any;
};

const FormCustomDropdown: React.FC<FormCustomDropdownProps> = ({
  name,
  gridProps,
  sm,
  required,
  defaultValue,
  onChange: consumerOnChange,
  ...rest
}) => {
  const { control } = useFormContext();
  return (
    <Grid item xs={12} sm={sm ?? 6} {...gridProps}>
      <Controller
        name={name}
        control={control}
        render={({
          field: { onChange: fieldOnChange, value },
          fieldState: { invalid, error },
        }) => {
          let markInvalid = invalid;
          if (required) {
            markInvalid = !value;
          }
          const handleChange = (
            event: SelectChangeEvent<unknown>,
            child: React.ReactNode
          ) => {
            fieldOnChange(event.target.value);
            consumerOnChange?.(event, child);
          };
          return (
            <CustomDropdown
              {...rest}
              onChange={handleChange}
              value={value || defaultValue}
              isInvalid={markInvalid}
              helperText={error?.message ?? ""}
            />
          );
        }}
      />
    </Grid>
  );
};

export default FormCustomDropdown;
