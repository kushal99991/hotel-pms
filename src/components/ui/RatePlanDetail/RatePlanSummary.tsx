import React from "react";
import { Box, Typography, Stack } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocalCafeIcon from "@mui/icons-material/LocalCafe";
import CreditCardOffIcon from "@mui/icons-material/CreditCardOff";
import CancelIcon from "@mui/icons-material/Cancel";
import { IRatePlanRule } from "types/roomRateTypes";
import { formatRule } from "utils/rates";

const iconMap: Record<string, React.ReactNode> = {
  breakfast_included: (
    <LocalCafeIcon sx={{ color: "green", mt: "2px", mr: 1 }} />
  ),
  refundable: <CheckCircleIcon sx={{ color: "green", mt: "2px", mr: 1 }} />,
  rate_discount: <CheckCircleIcon sx={{ color: "green", mt: "2px", mr: 1 }} />,
  allow_to_extend_stay: (
    <CheckCircleIcon sx={{ color: "green", mt: "2px", mr: 1 }} />
  ),
  min_stay: <CheckCircleIcon sx={{ color: "green", mt: "2px", mr: 1 }} />,
  suppressed_rates: (
    <CheckCircleIcon sx={{ color: "green", mt: "2px", mr: 1 }} />
  ),
  parking_included: (
    <CheckCircleIcon sx={{ color: "green", mt: "2px", mr: 1 }} />
  ),
  credit_card_needed: (
    <CreditCardOffIcon sx={{ color: "green", mt: "2px", mr: 1 }} />
  ),
};

const RatePlanSummary: React.FC<{
  ratePlanRules: IRatePlanRule[];
}> = ({ ratePlanRules }) => {
  if (!ratePlanRules || ratePlanRules.length === 0) {
    return (
      <Box
        sx={{
          border: "1px solid #d2e3dc",
          borderRadius: 2,
          p: 2,
          backgroundColor: "#f6fdf9",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          No rate plan rules available.
        </Typography>
      </Box>
    );
  }
  return (
    <Box
      sx={{
        border: "1px solid #d2e3dc",
        borderRadius: 2,
        p: 2,
        backgroundColor: "#f6fdf9",
      }}
    >
      <Stack spacing={1.5}>
        {ratePlanRules.map((rule) => {
          const formatted = formatRule(rule.rule_key, rule.rule_value);
          if (!formatted) return null;

          const { message, isPositive } = formatted;

          return (
            <Box key={rule.rule_key} display="flex" alignItems="center">
              {isPositive ? (
                iconMap[rule.rule_key] || (
                  <CheckCircleIcon sx={{ color: "green", mt: "2px", mr: 1 }} />
                )
              ) : (
                <CancelIcon sx={{ color: "red", mt: "2px", mr: 1 }} />
              )}
              <Typography
                variant="body2"
                color={isPositive ? "green" : "error"}
              >
                <strong>{message}</strong>
              </Typography>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
};

export default RatePlanSummary;
