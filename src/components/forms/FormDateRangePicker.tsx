import React from "react";
import { useFormContext } from "react-hook-form";
import { Grid, GridProps } from "@mui/material";
import { GridSize } from "@mui/system";
import CommonDateRangePicker, {
  CommonDateRangePickerProps,
} from "components/elements/DatePicker/CommonDateRangePicker";

type FormDateRangePickerProps = Omit<
  CommonDateRangePickerProps,
  "value" | "onChange" | "error" | "helperText"
> & {
  startFormName: string;
  endFormName: string;
  sm?: GridSize;
  gridProps?: GridProps;
  required?: boolean;
  onChange?: (value: [Date | null, Date | null]) => void;
};

const FormDateRangePicker: React.FC<FormDateRangePickerProps> = ({
  startFormName,
  endFormName,
  gridProps,
  sm,
  required,
  onChange,
  ...rest
}) => {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const startDate = watch(startFormName);
  const endDate = watch(endFormName);

  const handleChange = (value: [Date | null, Date | null]) => {
    setValue(startFormName, value[0], { shouldValidate: true });
    setValue(endFormName, value[1], { shouldValidate: true });
    onChange?.(value);
  };

  const startError = errors[startFormName];
  const endError = errors[endFormName];
  const error = startError || endError;

  let markInvalid = !!error;
  if (required) {
    markInvalid = !startDate || !endDate;
  }

  return (
    <Grid item xs={12} sm={sm ?? 6} {...gridProps}>
      <CommonDateRangePicker
        {...rest}
        onChange={handleChange}
        value={[startDate || null, endDate || null]}
        error={markInvalid}
        helperText={(error?.message as string) ?? ""}
      />
    </Grid>
  );
};

export default FormDateRangePicker;
