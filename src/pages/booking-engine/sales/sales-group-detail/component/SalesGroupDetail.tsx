import React from "react";
import { Box, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ReservationDetailBox from "pages/booking-engine/reservations/components/ReservationDetail/components/ReservationDetailBox";
import GroupGuestCount from "./GroupGuestCount";
import GroupContactInfo from "./GroupContactInfo";
import RateCode from "./RateCode";
import SpecialRequest from "./SpecialRequest";
import StayInfo from "./StayInfo";
import RoomInfo from "./RoomInfo";
import PaymentAndCharges from "./PaymentAndCharges";
import Comments from "pages/booking-engine/reservations/components/Comments";
import { useSalesDashboardContext } from "contexts/SalesDashboardContext";
import History from "pages/booking-engine/reservations/components/History";

const SalesGroupDetail: React.FC = () => {
  const navigate = useNavigate();
  const { selectedGroup, onRefresh } = useSalesDashboardContext();
  return (
    <Grid container spacing={2}>
      {/* Left Side */}
      <Grid
        item
        xs={12}
        md={4}
        sm={12}
        display="flex"
        flexDirection="column"
        gap={2}
      >
        <ReservationDetailBox label="Group Guest Count" isLoading={false}>
          <GroupGuestCount />
        </ReservationDetailBox>

        <ReservationDetailBox label="Group Contact Info" isLoading={false}>
          <GroupContactInfo />
        </ReservationDetailBox>

        <ReservationDetailBox label="Rate Code" isLoading={false}>
          <RateCode />
        </ReservationDetailBox>

        <ReservationDetailBox label="Notes" isLoading={false}>
          <SpecialRequest />
        </ReservationDetailBox>
      </Grid>

      {/* Right Side */}
      <Grid
        item
        xs={12}
        md={8}
        sm={12}
        display="flex"
        flexDirection="column"
        gap={2}
      >
        <ReservationDetailBox label="Stay Info" isLoading={false}>
          <StayInfo />
        </ReservationDetailBox>

        <ReservationDetailBox label="Room Info" isLoading={false}>
          <RoomInfo />
        </ReservationDetailBox>

        <ReservationDetailBox
          label="Payment & Charges"
          isLoading={false}
          actions={[
            {
              label: "Manage Folios",
              onClick: () => {
                navigate(
                  `/booking-engine/sales/group-detail/${selectedGroup?.id}/folio`
                );
              },
              newTabAction: true,
            },
          ]}
        >
          <PaymentAndCharges selectedGroup={selectedGroup} />
        </ReservationDetailBox>

        <ReservationDetailBox label="Comments" isLoading={false}>
          <Comments
            comments={[]}
            reservationId={selectedGroup?.id ?? null}
            onRefresh={onRefresh}
            key={"comments"}
          />
        </ReservationDetailBox>

        <ReservationDetailBox label="History" isLoading={false}>
          <Box px={2} pt={2}>
            <History reservationId={selectedGroup?.id ?? null} />
          </Box>
        </ReservationDetailBox>
      </Grid>
    </Grid>
  );
};

export default SalesGroupDetail;
