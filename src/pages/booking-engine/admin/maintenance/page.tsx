import React, { useState } from "react";
import { Box, styled } from "@mui/material";
import { useGetMaintenanceEnumListQuery } from "services/maintenanceSlice";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import CustomDropdown from "components/widgets/CustomDropdown/CustomDropdown";
import { useNavigate } from "react-router-dom";
import MaintenanceListing from "./component/MaintenanceListing";

const MaintenanceList: React.FC = () => {
  const [ticketStatus, setTicketStatus] = useState<string>("OPEN");
  const Navigate = useNavigate();

  const { data: enumList } = useGetMaintenanceEnumListQuery();

  const serviceOptions = [
    { value: "ALL", label: "ALL" },
    ...(enumList?.result.service_status?.map((item) => ({
      value: item,
      label: item,
    })) || []),
  ];

  return (
    <MainWrapper>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mt={2}
        mb={2}
      >
        <PrimaryButton
          buttonStyles={{
            backgroundColor: "#32A1AE",
            color: "#FFFFFF",
            fontWeight: "bold",
          }}
          onClick={() => {
            Navigate("/booking-engine/rooms/maintenance/create");
          }}
          label="Create Ticket"
        />
        <CustomDropdown
          label="Ticket Status"
          placeholder="Ticket Status"
          options={serviceOptions || []}
          onChange={(event) => {
            setTicketStatus(event.target.value as string);
          }}
          value={ticketStatus}
          isInvalid={false}
          fullWidth
          aria-label="HSKP Status"
          data-testid="room-number"
        />
      </Box>
      <MaintenanceListing status={ticketStatus} />
    </MainWrapper>
  );
};
export default MaintenanceList;

const MainWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  padding: "15px",
  height: "100%",
  marginTop: "10px",
}));
