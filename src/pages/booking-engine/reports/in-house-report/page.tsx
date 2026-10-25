import React from "react";
import BasicReservationReport from "../components/BasicReservationReport";
import { ReservationStatusEnum } from "constants/reservation";

const InHouseReport = () => {
  return (
    <BasicReservationReport
      title="In-House Report"
      fileTitle="in-house"
      defaultFilter={{
        reservation_status: ReservationStatusEnum.IN_HOUSE,
      }}
    />
  );
};

export default InHouseReport;
