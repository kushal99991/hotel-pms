import React from "react";
import { Box, styled, SxProps } from "@mui/material";

import Input, { InputProps } from "components/elements/TextInput/TextInput";
import Label from "components/elements/Label/Label";

export type CustomTextInputProps = InputProps & {
  label: string;
  helperText?: string;
  className?: string;
  rootSX?: SxProps;
};

export default function CustomTextInput(props: CustomTextInputProps) {
  const {
    label,
    onChange,
    value,
    isInvalid,
    helperText,
    style,
    rootSX,
    className,
    ...rest
  } = props;
  return (
    <MainWrapper className={className} sx={rootSX}>
      <Label>{label}</Label>
      <Input
        isInvalid={isInvalid}
        onChange={onChange}
        value={value}
        key={0}
        style={style}
        helperText={helperText}
        {...rest}
      />
    </MainWrapper>
  );
}

const MainWrapper = styled(Box)(() => ({}));
