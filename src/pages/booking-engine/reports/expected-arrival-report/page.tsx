import React from "react";
import BasicReservationReport from "../components/BasicReservationReport";
import { ReservationStatusEnum } from "constants/reservation";

const ExpectedArrivalReport = () => {
  return (
    <BasicReservationReport
      title="Expected Arrivals Report"
      fileTitle="expected-arrivals"
      defaultFilter={{
        reservation_status: ReservationStatusEnum.ARRIVING,
      }}
    />
  );
};

export default ExpectedArrivalReport;
