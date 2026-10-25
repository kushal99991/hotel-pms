import React from "react";
import { Box, Grid, Skeleton, styled, Typography } from "@mui/material";

export interface IRoomSummaryDetails {
  roomType: string;
  totalRoom: number;
  addedRoom: number;
  remainingRoom: number;
  totalWing: string;
  totalFloor: string;
}

interface DetailRowProps {
  label: string;
  textValue?: string;
  renderValue?: () => React.ReactNode;
}

interface IRoomSummaryProps {
  isLoading: boolean;
  details: IRoomSummaryDetails;
}

const RoomSummaryLoader: React.FC = () => {
  return (
    <Grid
      container
      spacing={2}
      border="1px solid #ccc"
      borderRadius={1}
      sx={{
        backgroundColor: "#f9f9f9",
      }}
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <Grid
          key={index.toString()}
          item
          xs={12}
          sm={5}
          md={4}
          lg={2}
          padding={2}
        >
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="80%" />
        </Grid>
      ))}
    </Grid>
  );
};

const DetailRow: React.FC<DetailRowProps> = ({
  label,
  textValue,
  renderValue,
}) => (
  <Box display="flex" flexDirection="column" width="100%" flexWrap="wrap">
    <Typography variant="body1" fontWeight="bold">
      {label}:
    </Typography>
    {textValue && <Typography variant="body2">{textValue}</Typography>}
    {renderValue?.()}
  </Box>
);

const RoomSummary: React.FC<IRoomSummaryProps> = ({ isLoading, details }) => {
  if (isLoading) {
    return (
      <>
        <RoomSummaryLoader />
      </>
    );
  }
  return (
    <Grid
      container
      spacing={2}
      marginLeft={0}
      sx={{
        backgroundColor: "#f9f9f9",
      }}
    >
      <Col item xs={12} sm={6} md={4} lg={3} padding={2}>
        <DetailRow
          label="Room Type"
          renderValue={() => <Typography>{details.roomType}</Typography>}
        />
      </Col>
      <Col item xs={12} sm={6} md={4} lg={3} padding={2}>
        <DetailRow
          label="Total Room"
          renderValue={() => (
            <Typography color="green" fontWeight="bold">
              {details.totalRoom}
            </Typography>
          )}
        />
      </Col>
      {/* <Col item xs={12} sm={6} md={4} lg={2} padding={2}>
        <DetailRow
          label="Added Room"
          renderValue={() => (
            <Typography color="green" fontWeight="bold">
              {details.addedRoom}
            </Typography>
          )}
        />
      </Col>
      <Col item xs={12} sm={6} md={4} lg={2} padding={2} borderRight={0}>
        <DetailRow
          label="Remaining Room"
          renderValue={() => (
            <Typography color="red" fontWeight="bold">
              {details.remainingRoom}
            </Typography>
          )}
        />
      </Col> */}
      <Col item xs={12} sm={6} md={4} lg={3} padding={2}>
        <DetailRow label="Wings" textValue={details.totalWing} />
      </Col>
      <Col item xs={12} sm={6} md={4} lg={3} padding={2}>
        <DetailRow label="Floors" textValue={details.totalFloor} />
      </Col>
    </Grid>
  );
};

export default RoomSummary;

const Col = styled(Grid)(() => ({
  border: "1px solid #ccc",
  marginTop: "-1px",
  marginLeft: "-1px",
}));
