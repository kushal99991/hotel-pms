import React from "react";
import {
  Box,
  Card,
  CardContent,
  Divider,
  Typography,
  Skeleton,
} from "@mui/material";
import RoomIcon from "@mui/icons-material/Room";
import { IProperty } from "types/property";
import PropertyRoomTypeTable from "pages/booking-engine/admin/property-settings/_components/property/_components/room-type/PropertyRoomTypeTable";

interface RoomConfigurationProps {
  property: IProperty | null;
  isLoading: boolean;
}

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

const RoomConfiguration: React.FC<RoomConfigurationProps> = ({
  property,
  isLoading,
}) => {
  return (
    <Box mt={2}>
      <Box sx={{ mb: 3 }}>
        {/* Property Room Type List */}
        <Card>
          <CardContent>
            <CustomCardTitle title={`Room Types`} icon={<RoomIcon />} />
            {isLoading ? (
              <Skeleton variant="rectangular" height={200} />
            ) : (
              <PropertyRoomTypeTable property={property} />
            )}
          </CardContent>
        </Card>
      </Box>
      <Divider />
    </Box>
  );
};

export default RoomConfiguration;
