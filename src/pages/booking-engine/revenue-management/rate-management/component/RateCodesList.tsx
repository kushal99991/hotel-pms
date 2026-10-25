import React, { useMemo } from "react";
import { Grid, Box, Typography } from "@mui/material";
import RatePlanDetail from "components/ui/RatePlanDetail/RatePlanDetail";
import { IRateCodeListResponse } from "types/roomRateTypes";
import { sortRateCodesByInheritance } from "utils/helperFunctions/common";

interface RateCodeSelectorProps {
  rateCodesList: IRateCodeListResponse[];
  selectedRateCodeIds: number[];
  onRateCodeSelect: (selectedIds: number[]) => void;
}

const RateCodesList: React.FC<RateCodeSelectorProps> = ({
  rateCodesList,
  selectedRateCodeIds,
  onRateCodeSelect,
}) => {
  const sortedRateCodes = useMemo(() => {
    if (!rateCodesList) return [];
    return sortRateCodesByInheritance(rateCodesList);
  }, [rateCodesList]);

  const getBlockStyle = (selected: boolean, deactivated: boolean) => {
    if (deactivated) {
      return {
        border: 1,
        borderRadius: 2,
        borderColor: "grey.400",
        padding: 2,
        cursor: "not-allowed",
        backgroundColor: "#f5f5f5",
        color: "#9e9e9e",
        opacity: 0.7,
      };
    }

    return {
      border: 1,
      borderRadius: 2,
      borderColor: "#00bfff",
      padding: 2,
      cursor: "pointer",
      backgroundColor: selected ? "#0c8ce9" : "white",
      color: selected ? "white" : "black",
    };
  };

  return (
    <Grid
      container
      direction={{ xs: "row", sm: "row", md: "column" }}
      spacing={1}
    >
      {sortedRateCodes.map((rate) => {
        const isDeactivated = rate.active === false;

        return (
          <Grid
            item
            xs={4}
            sm={3}
            md={12}
            sx={{ position: "relative" }}
            key={rate.id}
          >
            <Box
              sx={getBlockStyle(
                selectedRateCodeIds.includes(rate.id),
                isDeactivated
              )}
              onClick={() => {
                if (isDeactivated) return; // prevent selection
                const updatedIds = selectedRateCodeIds.includes(rate.id)
                  ? selectedRateCodeIds.filter((id) => id !== rate.id)
                  : [...selectedRateCodeIds, rate.id];
                onRateCodeSelect(updatedIds);
              }}
            >
              <Typography variant="body2" fontWeight="bold">
                {rate.name}{" "}
                {isDeactivated && (
                  <Typography
                    component="span"
                    variant="caption"
                    color="error"
                    fontWeight="bold"
                    sx={{ ml: 1 }}
                  >
                    (Deactivated)
                  </Typography>
                )}
              </Typography>

              {rate.parent_rate_code_id && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontStyle="italic"
                >
                  inherits from{" "}
                  {sortedRateCodes.find(
                    (r) => r.id === Number(rate.parent_rate_code_id)
                  )?.name ?? "Unknown"}
                </Typography>
              )}

              <Typography
                variant="body2"
                sx={{
                  display: { xs: "none", sm: "none", md: "block" },
                }}
              >
                {rate.description}
              </Typography>
            </Box>

            <Box sx={{ position: "absolute", top: 0, right: 0, padding: 1 }}>
              <RatePlanDetail
                rate_plan_id={
                  rate?.rate_plan ? Number(rate.rate_plan?.id) : null
                }
              />
            </Box>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default RateCodesList;
