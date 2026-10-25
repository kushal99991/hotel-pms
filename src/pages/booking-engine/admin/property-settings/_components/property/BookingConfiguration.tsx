import React from "react";
import {
  Box,
  Card,
  CardContent,
  Divider,
  Typography,
  Skeleton,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import { IProperty } from "types/property";
import BookingEditableField from "./_components/BookingEditableField";

interface BookingConfigurationProps {
  property: IProperty | null;
  isLoading: boolean;
  onRefresh?: () => void;
}

const BookingConfigurationSkeleton = () => {
  return (
    <Box mt={2}>
      {/* Title skeleton */}
      <Skeleton variant="text" width={200} height={30} />

      <Box mt={2}>
        {/* Field skeletons */}
        <Skeleton
          variant="rectangular"
          height={40}
          sx={{ mb: 2, borderRadius: 1 }}
        />
        <Skeleton
          variant="rectangular"
          height={40}
          sx={{ mb: 2, borderRadius: 1 }}
        />
        <Skeleton
          variant="rectangular"
          height={40}
          sx={{ mb: 2, borderRadius: 1 }}
        />
        <Skeleton
          variant="rectangular"
          height={40}
          sx={{ mb: 2, borderRadius: 1 }}
        />
      </Box>
    </Box>
  );
};

const CustomCardTitle = ({
  title,
  icon,
  rightContent,
}: {
  title: string;
  icon: React.ReactNode;
  rightContent?: React.ReactNode;
}) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center" }}>
      {icon}
      <Typography variant="h6" sx={{ ml: 1 }}>
        {title}
      </Typography>
    </Box>
    {rightContent && <Box>{rightContent}</Box>}
  </Box>
);

const BookingConfiguration: React.FC<BookingConfigurationProps> = ({
  property,
  isLoading,
  onRefresh,
}) => {
  if (isLoading) return <BookingConfigurationSkeleton />;
  return (
    <Box mt={2}>
      <Divider sx={{ my: 2 }} />

      {/* Booking Configuration Section */}
      <Card>
        <CardContent>
          <CustomCardTitle
            title="Booking Configuration"
            icon={<SettingsIcon />}
          />
          {isLoading || !property ? (
            <Skeleton variant="rectangular" height={150} />
          ) : (
            <Box mt={2}>
              <BookingEditableField
                label="Max Stay Duration Days"
                value={property.max_stay_duration_days}
                fieldKey="max_stay_duration_days"
                property={property}
                onRefresh={onRefresh}
              />
              {/* <BookingEditableField
                label="Incidentals Per Night"
                value={property.incidentals_per_night}
                fieldKey="incidentals_per_night"
                property={property}
                onRefresh={onRefresh}
              /> */}
              <BookingEditableField
                label="Max Reservations Per Request"
                value={property.max_reservations_per_request}
                fieldKey="max_reservations_per_request"
                property={property}
                onRefresh={onRefresh}
              />
              <BookingEditableField
                label="Booking Window"
                value={property.booking_window}
                fieldKey="booking_window"
                property={property}
                onRefresh={onRefresh}
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default BookingConfiguration;
