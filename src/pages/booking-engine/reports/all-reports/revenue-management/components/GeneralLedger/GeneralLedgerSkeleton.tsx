import {
  Box,
  Card,
  CardContent,
  Grid,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import React from "react";

const GeneralLedgerSkeleton: React.FC = () => {
  return (
    <Box p={3}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Skeleton variant="text" width={240} height={32} />
            <Skeleton variant="text" width={320} height={20} />
          </Grid>
          <Grid item>
            <Skeleton variant="rectangular" width={160} height={40} />
          </Grid>
        </Grid>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} className="mb-8">
        {[...Array(5)].map((_, i) => (
          <Grid item xs={12} sm={6} lg={2.4} key={i}>
            <Card>
              <CardContent>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="80%" height={36} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Chart Section */}
      <Card className="mb-8">
        <CardContent>
          <Box className="flex justify-between items-center mb-6">
            <Box>
              <Skeleton variant="text" width={240} height={28} />
              <Skeleton variant="text" width={320} />
            </Box>
            <Box display="flex" gap={2}>
              {[...Array(3)].map((_, i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  width={120}
                  height={40}
                />
              ))}
            </Box>
          </Box>
          <Box sx={{ height: 320 }}>
            <Skeleton variant="rectangular" width="100%" height="100%" />
          </Box>
        </CardContent>
      </Card>

      {/* Table Section */}
      <Card>
        <CardContent>
          <Box className="flex justify-between items-center mb-6">
            <Box>
              <Skeleton variant="text" width={240} height={28} />
              <Skeleton variant="text" width={320} />
            </Box>
            <Skeleton variant="rectangular" width={120} height={32} />
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  {[...Array(7)].map((_, i) => (
                    <TableCell key={i}>
                      <Skeleton width={100} />
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {[...Array(5)].map((_, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {[...Array(7)].map((_, cellIndex) => (
                      <TableCell key={cellIndex}>
                        <Skeleton width="80%" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default GeneralLedgerSkeleton;
