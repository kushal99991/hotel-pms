"use client";
import React from "react";
import {
  Paper,
  Divider,
  Box,
  Card,
  CardContent,
  Typography,
} from "@mui/material";
import SecurityIcon from "@mui/icons-material/Security";
import EmailIcon from "@mui/icons-material/Email";

import ChangePassword from "./_components/ChangePassword";
import UserDetails from "./_components/UserDetails";
import ChangeEmail from "./_components/ChangeEmail";

const UserProfile: React.FC = () => {
  const CustomCardTitle = ({
    title,
    icon,
  }: {
    title: string;
    icon: React.ReactNode;
  }) => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between", // space between the title and right content
        mb: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        {icon}
        <Typography variant="h6" sx={{ ml: 1 }}>
          {title}
        </Typography>
      </Box>
    </Box>
  );
  return (
    <Paper elevation={3} style={{ padding: "20px" }}>
      <UserDetails />
      <Divider />
      {/* Additional Sections */}
      <Box sx={{ mb: 3 }}>
        {/* Email */}
        <Card>
          <CardContent>
            <CustomCardTitle title="Email" icon={<EmailIcon />} />
            <ChangeEmail />
          </CardContent>
        </Card>
      </Box>
      <Divider />
      <Box sx={{ mb: 3 }}>
        {/* Change Password */}
        <Card>
          <CardContent>
            <CustomCardTitle title="Password" icon={<SecurityIcon />} />
            <ChangePassword />
          </CardContent>
        </Card>
      </Box>
    </Paper>
  );
};

export default UserProfile;
