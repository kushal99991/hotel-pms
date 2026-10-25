import React from "react";
import { Box, Grid, Typography, Skeleton } from "@mui/material";
import { INightAuditResponse } from "types/nightAuditTypes";
import PrimaryButton from "components/elements/Button/PrimaryButton";

interface StepContentComponentProps {
  data?: INightAuditResponse;
  onNext?: () => void;
  isLastStep?: boolean;
  isLoading: boolean;
}

const StepContentComponent: React.FC<StepContentComponentProps> = ({
  data,
  onNext,
  isLastStep,
  isLoading,
}) => (
  <Box sx={{ width: "100%", padding: 2 }}>
    <Grid container spacing={2}>
      {/* Headers */}
      <Grid item xs={12} sm={4}>
        <Typography variant="subtitle1" fontWeight="bold">
          {isLoading ? <Skeleton width={100} height={20} /> : "Action"}
        </Typography>
      </Grid>
      <Grid item xs={12} sm={4}>
        <Typography variant="subtitle1" fontWeight="bold">
          {isLoading ? <Skeleton width={120} height={20} /> : "Last Executed"}
        </Typography>
      </Grid>
      <Grid item xs={12} sm={4}>
        <Typography variant="subtitle1" fontWeight="bold">
          {isLoading ? <Skeleton width={100} height={20} /> : "Status"}
        </Typography>
      </Grid>

      {/* Data */}
      <Grid item xs={12} sm={4}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {isLoading ? (
            <Skeleton width={200} height={36} variant="rectangular" />
          ) : (
            <PrimaryButton
              variant="contained"
              label={isLastStep ? "Finish" : "Continue"}
              onClick={onNext}
              isLoading={isLoading}
              size="small"
              sx={{ width: "200px" }}
            />
          )}
        </Box>
      </Grid>
      <Grid item xs={12} sm={4}>
        <Typography>
          {isLoading ? <Skeleton width={150} height={20} /> : data?.audit_date}
        </Typography>
      </Grid>
      <Grid item xs={12} sm={4}>
        <Typography>
          {isLoading ? <Skeleton width={120} height={20} /> : data?.status}
        </Typography>
      </Grid>
    </Grid>
  </Box>
);

export default StepContentComponent;
