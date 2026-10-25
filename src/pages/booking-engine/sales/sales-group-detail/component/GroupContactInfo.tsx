import React from "react";
import { Typography, Box } from "@mui/material";
import { useSalesDashboardContext } from "contexts/SalesDashboardContext";
import Label from "components/elements/Label/Label";
import { formatPhone } from "utils/helperFunctions/dataFormatters";

const GroupContactInfo: React.FC = () => {
  const { selectedGroup } = useSalesDashboardContext();
  const contact = selectedGroup?.sales_contact;

  if (!contact) {
    return (
      <Box>
        <Typography color="text.secondary">
          No contact info available
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Label>Name:</Label>
        <Typography>
          {`${contact.first_name ?? ""} ${contact.last_name ?? ""}`.trim() ||
            "-"}
        </Typography>
      </Box>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Label>Email:</Label>
        <Typography>{contact.email ?? "-"}</Typography>
      </Box>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Label>Phone:</Label>
        <Typography>{formatPhone(contact.phone)}</Typography>
      </Box>
      {selectedGroup?.group_code && (
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Label>Group Code:</Label>
          <Typography>{selectedGroup.group_code}</Typography>
        </Box>
      )}
    </Box>
  );
};

export default GroupContactInfo;
