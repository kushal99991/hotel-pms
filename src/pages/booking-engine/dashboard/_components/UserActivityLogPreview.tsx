import React, { useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Person, Update } from "@mui/icons-material";
import { useGetHistoryByIdMutation } from "services/historySlice";
import useAuth from "hooks/useAuth";
import { convertUtcToTimezone } from "utils/helperFunctions/common";

const UserActivityLogPreview: React.FC<{ startDate: string }> = ({
  startDate,
}) => {
  const [getHistory, { isLoading, data: historyData }] =
    useGetHistoryByIdMutation();
  const { users, currentTimeZone } = useAuth();
  const navigate = useNavigate();

  // Sort the history data by created_at timestamp in descending order (newest first)
  const sortedHistoryData = historyData
    ? [...historyData]
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .slice(0, 3) // Take only the latest 5 entries
    : [];

  useEffect(() => {
    if (users?.defaultPropertyId) {
      getHistory({
        property_id: users.defaultPropertyId,
      });
    }
  }, [getHistory, users?.defaultPropertyId, startDate]);

  const getCategoryColor = (category: string) => {
    switch (category.toUpperCase()) {
      case "RESERVATION":
        return "primary";
      case "USER":
        return "secondary";
      case "PAYMENT":
        return "success";
      case "ROOM":
        return "info";
      default:
        return "default";
    }
  };

  const handleViewAll = () => {
    navigate("/booking-engine/admin/user-activity-log");
  };

  return (
    <Paper sx={{ p: 2, height: "100%" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6">User Activity Log</Typography>
        <Button
          variant="text"
          sx={{
            textTransform: "none",
            textDecoration: "underline",
            color: "#32A1AE",
          }}
          onClick={handleViewAll}
        >
          View All
        </Button>
      </Box>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
          <CircularProgress size={24} />
        </Box>
      ) : sortedHistoryData.length > 0 ? (
        <Stepper orientation="vertical" sx={{ mb: 1 }} connector={null}>
          {sortedHistoryData.map((item) => (
            <Step key={item.id} active completed>
              <StepLabel
                StepIconComponent={() => (
                  <Box sx={{ mr: 1 }}>
                    <Update fontSize="small" color="action" />
                  </Box>
                )}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 1,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    sx={{ textTransform: "capitalize" }}
                  >
                    {item.action}
                  </Typography>
                  <Chip
                    label={item.category}
                    size="small"
                    color={getCategoryColor(item.category)}
                    sx={{ ml: 1, height: 20, fontSize: "0.7rem" }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ ml: "auto" }}
                  >
                    {convertUtcToTimezone(
                      item.created_at,
                      currentTimeZone
                    ).format("MM/DD/YYYY h:mm A")}
                  </Typography>
                </Box>
              </StepLabel>
              <StepContent>
                <Box
                  sx={{
                    py: 0.5,
                    px: 1.5,
                    mb: 0.5,
                    bgcolor: "background.paper",
                    borderRadius: 1,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 0.5,
                      fontSize: "0.8rem",
                      maxHeight: "2.4rem",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {item.details}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      alignItems: "center",
                    }}
                  >
                    {item.user?.user_name && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                      >
                        <Person
                          fontSize="small"
                          color="action"
                          sx={{ fontSize: 14 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          User Name: {item.user.user_name}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      ) : (
        <Box sx={{ textAlign: "center", py: 2 }}>
          <Typography variant="body2" color="text.secondary">
            No recent activity to display
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default UserActivityLogPreview;
