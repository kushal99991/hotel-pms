import React from "react";
import { Box, Typography } from "@mui/material";

import PrimaryButton from "components/elements/Button/PrimaryButton";

interface UserCardProps {
  user: {
    name: string;
    email: string;
    details: string;
  };
  handleEditClick: () => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, handleEditClick }) => {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      padding={2}
      border={1}
      borderRadius={1}
    >
      <Box>
        <Typography variant="h6">{user.name}</Typography>
        <Typography variant="body1">{user.email}</Typography>
        <Typography variant="body2">{user.details}</Typography>
      </Box>
      <PrimaryButton
        label={`Edit`}
        onClick={handleEditClick}
        data-testid="user-edit-button"
      />
    </Box>
  );
};

export default UserCard;
