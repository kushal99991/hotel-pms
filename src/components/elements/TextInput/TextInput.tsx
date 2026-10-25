import React, { useState } from "react";
import {
  Box,
  styled,
  TextField,
  TextFieldProps as MuiTextFieldProps,
  IconButton,
} from "@mui/material";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Visibility from "@mui/icons-material/Visibility";

export type InputProps = MuiTextFieldProps & {
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  value?: string | number | undefined;
  isInvalid: boolean;
  style?: React.CSSProperties;
  width?: string;
};

export default function Input(props: InputProps) {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const {
    onChange,
    value,
    isInvalid,
    style,
    helperText,
    width = "100%",
    type,
    ...rest
  } = props;

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  return (
    <MainWrapper width={width}>
      <CustomTextField
        style={style}
        type={type === "password" && !showPassword ? "password" : "text"}
        autoCapitalize="none"
        value={value}
        error={isInvalid}
        onChange={onChange}
        helperText={helperText}
        inputProps={{ className: "form-control" }}
        InputProps={{
          endAdornment: type === "password" && (
            <IconButton
              disableRipple
              aria-label="toggle password visibility"
              onClick={handleClickShowPassword}
              edge="end"
            >
              {showPassword ? <Visibility /> : <VisibilityOff />}
            </IconButton>
          ),
        }}
        {...rest}
      />
    </MainWrapper>
  );
}

const MainWrapper = styled(Box)<{ width?: string }>(({ width }) => ({
  width: width ?? "100%",
}));

const CustomTextField = styled(TextField)<{ error: boolean }>(() => ({
  "& .MuiInputBase-root": {
    border: "0 !important",
  },
  "& input": {
    fontSize: "16px",
    fontWeight: "400",
    lineHeight: "1.5",
    color: "#565656",
    padding: "14px",
  },
  "& svg": {
    fill: "#D2D2D2",
  },
  "& p.Mui-error": {
    margin: "0",
  },
  "& .MuiInputBase-root.Mui-focused": {
    border: "1px solid #32A1AE",
    "& fieldset": {
      border: "1px solid #32A1AE",
    },
    "& svg": {
      fill: "#333333",
    },
  },
  "& .MuiInputBase-root:hover": {
    "& fieldset": {
      borderColor: "#D2D2D2",
    },
  },
  "& fieldset": {
    borderColor: "#D2D2D2",
  },
}));
