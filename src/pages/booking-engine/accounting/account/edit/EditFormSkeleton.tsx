import React from "react";
import { Box, Grid, Skeleton } from "@mui/material";

const EditFormSkeleton = () => {
  return (
    <Box sx={{ width: "100%", p: 2 }}>
      {/* Alert placeholders */}
      <Box mb={2}>
        <Skeleton variant="rectangular" height={48} sx={{ borderRadius: 1 }} />
      </Box>

      <Grid container spacing={2}>
        {/* Guest Selection */}
        <Grid item xs={12} sm={6} mb={2}>
          <Skeleton
            variant="rectangular"
            height={56}
            sx={{ borderRadius: 1 }}
          />
        </Grid>

        {/* Credit Limit */}
        <Grid item xs={12} sm={6} mb={2}>
          <Skeleton
            variant="rectangular"
            height={56}
            sx={{ borderRadius: 1 }}
          />
        </Grid>

        {/* Billing Name */}
        <Grid item xs={12} sm={6} mb={2}>
          <Skeleton
            variant="rectangular"
            height={56}
            sx={{ borderRadius: 1 }}
          />
        </Grid>

        {/* Billing Phone */}
        <Grid item xs={12} sm={6} mb={2}>
          <Skeleton
            variant="rectangular"
            height={56}
            sx={{ borderRadius: 1 }}
          />
        </Grid>

        {/* Billing Phone Extension */}
        <Grid item xs={12} sm={6} mb={2}>
          <Skeleton
            variant="rectangular"
            height={56}
            sx={{ borderRadius: 1 }}
          />
        </Grid>

        {/* Billing Fax */}
        <Grid item xs={12} sm={6} mb={2}>
          <Skeleton
            variant="rectangular"
            height={56}
            sx={{ borderRadius: 1 }}
          />
        </Grid>

        {/* Billing Email */}
        <Grid item xs={12} sm={6} mb={2}>
          <Skeleton
            variant="rectangular"
            height={56}
            sx={{ borderRadius: 1 }}
          />
        </Grid>

        {/* Billing City */}
        <Grid item xs={12} sm={6} mb={2}>
          <Skeleton
            variant="rectangular"
            height={56}
            sx={{ borderRadius: 1 }}
          />
        </Grid>

        {/* Billing State */}
        <Grid item xs={12} sm={6} mb={2}>
          <Skeleton
            variant="rectangular"
            height={56}
            sx={{ borderRadius: 1 }}
          />
        </Grid>

        {/* Billing Country */}
        <Grid item xs={12} sm={6} mb={2}>
          <Skeleton
            variant="rectangular"
            height={56}
            sx={{ borderRadius: 1 }}
          />
        </Grid>

        {/* Billing Zip */}
        <Grid item xs={12} sm={6} mb={2}>
          <Skeleton
            variant="rectangular"
            height={56}
            sx={{ borderRadius: 1 }}
          />
        </Grid>

        {/* Billing Address */}
        <Grid item xs={12} mb={2}>
          <Skeleton
            variant="rectangular"
            height={56}
            sx={{ borderRadius: 1 }}
          />
        </Grid>

        {/* Action Buttons */}
        <Grid item xs={12}>
          <Box display="flex" alignItems="center" gap={2}>
            <Skeleton
              variant="rectangular"
              width={100}
              height={40}
              sx={{ borderRadius: 1 }}
            />
            <Skeleton
              variant="rectangular"
              width={80}
              height={40}
              sx={{ borderRadius: 1 }}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EditFormSkeleton;
