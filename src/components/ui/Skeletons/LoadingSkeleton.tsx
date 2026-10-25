import React from "react";
import { Box, Skeleton } from "@mui/material";

interface LoadingSkeletonProps {
  setMaxWidth?: number | string;
  setMy?: number;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  setMaxWidth = 400,
  setMy = 4,
}) => {
  return (
    <Box sx={{ width: "100%", maxWidth: setMaxWidth, mx: "auto", my: setMy }}>
      <Skeleton
        variant="text"
        height={40}
        width="80%"
        data-testid="loading-skeleton-text"
      />
      <Skeleton
        variant="rectangular"
        height={56}
        sx={{ my: 2 }}
        data-testid="loading-skeleton-rectangular"
      />
      <Skeleton
        variant="rectangular"
        height={56}
        sx={{ my: 2 }}
        data-testid="loading-skeleton-rectangular"
      />
      <Skeleton
        variant="rectangular"
        height={36}
        width="50%"
        sx={{ my: 2 }}
        data-testid="loading-skeleton-rectangular"
      />
    </Box>
  );
};

export default LoadingSkeleton;
