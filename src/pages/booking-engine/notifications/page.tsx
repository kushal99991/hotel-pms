import React, { useEffect } from "react";
import {
  Card,
  CardContent,
  Chip,
  Skeleton,
  Stack,
  Typography,
  Divider,
} from "@mui/material";
import useAuth from "hooks/useAuth";
import { appConfig } from "config/app.config";
import { ISendNotificationRequest, MessageResult } from "types/serviceSocket";
import { useNotification } from "hooks/useNotification";
import moment from "moment";
import { useNavigate } from "react-router-dom";

const NotificationList: React.FC = () => {
  const { users } = useAuth();
  const {
    fetchNotifications,
    notifications: notificationResponse,
    isLoading,
    updateNotification,
  } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    if (users?.defaultPropertyId) {
      const domain = appConfig.getCookie(appConfig.domainName);
      if (domain) {
        const roomName = `${domain}-org-${users?.id}-property-${users?.defaultPropertyId}`;
        fetchNotifications({ room: roomName });
      }
    }
  }, [users?.defaultPropertyId]);

  const handleCardClick = async (row: MessageResult) => {
    const payload: ISendNotificationRequest = {
      type: row.type,
      data: {
        ...row.data,
        read: true,
      },
      priority: row.priority,
      message: row.message,
      room: row.tenant_name,
      level: row.level,
      origin: row.origin,
      id: row.id,
    };

    await updateNotification(payload);

    navigate(`/booking-engine/rooms/maintenance/view/${row.data?.room_id}`);
  };

  // Show skeleton while loading
  if (isLoading) {
    return (
      <Stack spacing={2}>
        {Array.from({ length: 5 }).map((_, idx) => (
          <Card key={idx} sx={{ p: 2 }}>
            <Skeleton width="40%" height={28} />
            <Skeleton width="70%" height={22} />
            <Skeleton width="90%" height={20} />
          </Card>
        ))}
      </Stack>
    );
  }
  return (
    <Stack spacing={2}>
      {[...(notificationResponse ?? [])]
        .sort(
          (a, b) =>
            new Date(b.created_date).getTime() -
            new Date(a.created_date).getTime()
        )
        .map((row, index) => {
          const isRead = row?.data?.read === true;
          return (
            <Card
              key={index}
              onClick={() => handleCardClick(row)}
              sx={{
                cursor: "pointer",
                backgroundColor: isRead ? "background.paper" : "#e3f2fd",
                borderLeft: isRead
                  ? "4px solid transparent"
                  : "4px solid #1976d2",
                boxShadow: isRead ? 1 : 3,
                transition: "background 0.2s",
                "&:hover": {
                  boxShadow: 6,
                },
              }}
            >
              <CardContent sx={{ p: 2 }}>
                {/* Header row */}
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography
                    variant="subtitle1"
                    fontWeight={isRead ? 500 : 700}
                  >
                    Ticket #{row?.data?.room_id ?? "-"}
                  </Typography>
                  <Chip
                    label={row.priority}
                    color={row.priority === "High" ? "error" : "default"}
                    size="small"
                  />
                </Stack>

                {/* Meta info row */}
                <Typography
                  variant="body2"
                  color="text.secondary"
                  mt={0.5}
                  noWrap
                >
                  {row.tenant_name} • {row.origin} • {row.category} •{" "}
                  {row.level}
                </Typography>

                <Divider sx={{ my: 1 }} />

                {/* Main message */}
                <Typography
                  variant="body1"
                  fontWeight={isRead ? 400 : 600}
                  sx={{ whiteSpace: "pre-line" }}
                >
                  {row.message}
                </Typography>

                {/* Request (if exists) */}
                {row.type === "ROOM_FIX" && "request" in row.data && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    mt={0.5}
                    sx={{ fontStyle: "italic" }}
                  >
                    Request: {row.data.request}
                  </Typography>
                )}

                {/* Footer row */}
                <Stack
                  direction="row"
                  spacing={2}
                  mt={2}
                  justifyContent="flex-start"
                >
                  <Typography variant="caption" color="text.secondary">
                    By: {row?.meta?.user_name ?? "-"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {moment(row.created_date).format(
                      appConfig.displayDateWithTimeFormat
                    )}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {moment(row.created_date).fromNow()}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          );
        })}
    </Stack>
  );
};

export default NotificationList;
