import React from "react";
import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Box,
} from "@mui/material";
import { FieldError } from "react-hook-form";

interface PermissionCheckboxGroupProps {
  label: string;
  defaultPermissionList: string[];
  selectedValues: string[];
  onChange: (updatedValues: string) => void;
  error?: FieldError;
}

const PermissionCheckboxGroup: React.FC<PermissionCheckboxGroupProps> = ({
  label,
  defaultPermissionList,
  selectedValues,
  onChange,
  error,
}) => {
  return (
    <>
      <label>{label}</label>
      <FormGroup>
        <Box display={"grid"} gridTemplateColumns={"repeat(2, 1fr)"} gap={0.7}>
          {defaultPermissionList.map((item, index) => (
            <FormControlLabel
              key={index}
              control={
                <Checkbox
                  checked={selectedValues.includes(item)}
                  onChange={(e) => {
                    const updatedValues = e.target.checked
                      ? [...selectedValues, item] // Add the selected item
                      : selectedValues.filter((val) => val !== item); // Remove unchecked item

                    // Join the array to create a comma-separated string
                    onChange(updatedValues.join(","));
                  }}
                />
              }
              label={item}
            />
          ))}
        </Box>
      </FormGroup>
      {error && <FormHelperText error>{error?.message}</FormHelperText>}
    </>
  );
};

export default PermissionCheckboxGroup;
