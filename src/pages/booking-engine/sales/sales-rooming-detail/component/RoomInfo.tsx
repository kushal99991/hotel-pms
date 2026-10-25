import React from "react";
import { Typography, Box } from "@mui/material";

interface RoomInfoProps {
  showRightSection?: boolean;
  showTitle?: boolean;
}

const RoomInfo: React.FC<RoomInfoProps> = ({
  showRightSection = true,
  showTitle = true,
}) => {
  return (
    <Box
      display="flex"
      alignItems="stretch"
      justifyContent="space-between"
      gap={3}
    >
      {/* Left Section */}
      <Box flex={1}>
        {showTitle && (
          <Typography component="span" fontWeight="bold">
            Room Types Blocked / Booked:
          </Typography>
        )}

        <Typography>
          <Typography component="span" fontWeight="bold">
            King NS
          </Typography>{" "}
          - 5 / 5
        </Typography>

        <Typography>
          <Typography component="span" fontWeight="bold">
            QQNS
          </Typography>{" "}
          - 62 / 60
        </Typography>

        <Typography>
          <Typography component="span" fontWeight="bold">
            QQADNS
          </Typography>{" "}
          - 3 / 3
        </Typography>
      </Box>

      {/* Conditionally render Divider + Right Section */}
      {showRightSection && (
        <>
          {/* Divider Line */}
          <Box
            sx={{
              width: "1px",
              backgroundColor: "divider",
            }}
          />

          <Box flex={1}>
            <Typography>
              <Typography component="span" fontWeight="bold">
                Market Segment:
              </Typography>{" "}
              Groups / Wedding
            </Typography>
            <Typography>
              <Typography component="span" fontWeight="bold">
                Booking Channel:
              </Typography>{" "}
              Groups
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
};

export default RoomInfo;
