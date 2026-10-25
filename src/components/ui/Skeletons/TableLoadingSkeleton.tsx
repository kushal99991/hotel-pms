import React from "react";
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Box,
  Skeleton,
  Grid,
} from "@mui/material";

interface DashboardTableLoadingSkeletonProps {
  columns: number;
  rows: number;
  headerSkeletonType?: "text" | "rectangular";
  rowSkeletonType?: "text" | "rectangular";
  searchSkeleton?: boolean;
  setMaxWidth?: string;
  setDataTestId?: string;
}

const DashboardTableLoadingSkeleton: React.FC<
  DashboardTableLoadingSkeletonProps
> = ({
  columns,
  rows,
  headerSkeletonType = "text",
  rowSkeletonType = "rectangular",
  searchSkeleton = true,
  setMaxWidth = "100%",
  setDataTestId = "",
}) => {
  return (
    <Box
      sx={{ width: "100%", maxWidth: setMaxWidth, mx: "auto", my: 2 }}
      data-testid={setDataTestId}
    >
      <Grid container direction="column" alignItems="flex-start" spacing={2}>
        {/* Optional Skeleton for Search Input */}
        {searchSkeleton && (
          <Grid item sx={{ width: "20rem" }}>
            <Skeleton variant="rectangular" height={40} />
          </Grid>
        )}
        {/* Skeleton for Table */}
        <Grid item sx={{ width: "100%" }}>
          <TableContainer component={Paper} sx={{ width: "100%" }}>
            <Table>
              <TableHead>
                <TableRow>
                  {[...Array(columns)].map((_, index) => (
                    <TableCell key={index}>
                      <Skeleton
                        variant={headerSkeletonType}
                        sx={{ width: "80%" }}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {[...Array(rows)].map((_, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {[...Array(columns)].map((_, colIndex) => (
                      <TableCell key={colIndex}>
                        <Skeleton
                          variant={rowSkeletonType}
                          sx={{ height: 30 }}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardTableLoadingSkeleton;
