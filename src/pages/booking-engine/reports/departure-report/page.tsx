import React from "react";
import useAuth from "hooks/useAuth";
import BasicReservationReport from "../components/BasicReservationReport";
import { ReservationStatusEnum } from "constants/reservation";

const DepartureReport = () => {
  return (
    <BasicReservationReport
      title="Departure Report"
      fileTitle="departures"
      defaultFilter={{
        reservation_status: ReservationStatusEnum.DEPARTING,
      }}
    />
  );
};

export default DepartureReport;
