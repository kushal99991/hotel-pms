import React, { useState, useEffect, useRef } from "react";
import { styled } from "@mui/material";

import CustomTextInput from "components/widgets/CustomTextInput/CustomTextInput";

interface OTPInputProps {
  length: number;

  onChange: (otp: string) => void;
}

const OTPInput: React.FC<OTPInputProps> = ({ length, onChange }) => {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(""));
  const [validity, setValidity] = useState<boolean[]>(Array(length).fill(true));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const otpWithDash = otp.slice(0, 2).join("") + "-" + otp.slice(2).join("");
    onChange(otpWithDash);
  }, [otp, onChange]);

  const handleChange = (index: number, value: string) => {
    const newOtp = [...otp];
    const newValidity = [...validity];
    const upperCaseValue = value.toUpperCase();

    if (index < 2) {
      if (/^[A-Z]$/.test(upperCaseValue)) {
        newOtp[index] = upperCaseValue;
        newValidity[index] = true;
      } else {
        newValidity[index] = false;
      }
    } else {
      if (/^\d$/.test(upperCaseValue)) {
        newOtp[index] = upperCaseValue;
        newValidity[index] = true;
      } else {
        newValidity[index] = false;
      }
    }

    setOtp(newOtp);
    setValidity(newValidity);

    if (value && index < length - 1 && newValidity[index]) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    const newOtp = [...otp];
    const newValidity = [...validity];

    if (event.key === "Backspace" || event.key === "Delete") {
      event.preventDefault();
      newOtp[index] = "";
      newValidity[index] = true;
      setOtp(newOtp);
      setValidity(newValidity);

      if (event.key === "Backspace" && index > 0) {
        inputsRef.current[index - 1]?.focus();
      } else if (event.key === "Delete" && index < length - 1) {
        inputsRef.current[index + 1]?.focus();
      }
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      {otp.map((_, index) => (
        <React.Fragment key={index}>
          {index === 2 && <span>-</span>}{" "}
          {/* Insert dash after the second input */}
          <StyleTextInput
            fullWidth
            isInvalid={!validity[index]}
            label=""
            placeholder=""
            value={otp[index]}
            onChange={(
              event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
            ) => handleChange(index, event.target.value)}
            onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) =>
              handleKeyDown(index, event)
            }
            helperText=""
            inputProps={{
              "data-testid": "otp-input",
              maxLength: 1,
              className: "otp-input",
            }}
            inputRef={(el) => (inputsRef.current[index] = el)}
          />
        </React.Fragment>
      ))}
    </div>
  );
};

export default OTPInput;

const StyleTextInput = styled(CustomTextInput)(({ theme }) => ({
  "& .otp-input": {
    [theme.breakpoints.down("sm")]: {
      padding: "10px 5px",
      textAlign: "center",
      fontSize: "14px",
    },
  },
}));
