import React from "react";
import { Typography } from "@mui/material";

interface AccountHeaderProps {
  billingName: string;
  accountId?: string;
}

const AccountHeader: React.FC<AccountHeaderProps> = ({
  billingName,
  accountId,
}) => {
  return (
    <Typography variant="h5" fontWeight={600}>
      {billingName}
      <Typography
        component="span"
        variant="subtitle1"
        color="text.secondary"
        ml={1}
      >
        #{accountId}
      </Typography>
    </Typography>
  );
};

export default AccountHeader;
