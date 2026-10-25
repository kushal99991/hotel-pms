import React from "react";
import { Typography, styled, Box } from "@mui/material";

import Label from "components/elements/Label/Label";
import Dropdown, { DropdownProps } from "components/elements/Dropdown/Dropdown";

export type CustomDropdownProps = DropdownProps & {
  label?: string;
  helperText?: string;
  className?: string;
  hideTopLabel?: boolean;
};

const CustomDropdown: React.FC<CustomDropdownProps> = (props) => {
  const {
    label,
    hideTopLabel = false,
    onChange,
    value,
    isInvalid,
    helperText,
    style,
    className,
    ...rest
  } = props;
  return (
    <MainWrapper className={className}>
      {label && !hideTopLabel && <Label>{label}</Label>}

      <Dropdown
        isInvalid={isInvalid}
        label={hideTopLabel ? label : ""}
        onChange={onChange}
        value={value}
        style={style}
        {...rest}
      />
      {isInvalid && helperText && (
        <ErrorText variant="caption" color="error">
          {helperText}
        </ErrorText>
      )}
    </MainWrapper>
  );
};

export default CustomDropdown;

const MainWrapper = styled(Box)(() => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
}));

const ErrorText = styled(Typography)(() => ({
  // marginTop: theme.spacing(1),
}));
