import React from "react";
import BasicReservationReport from "../components/BasicReservationReport";
import { ReservationStatusEnum } from "constants/reservation";

const RoomExpectedDeparturesReport = () => {
  return (
    <BasicReservationReport
      title="Expected Departures"
      fileTitle="expected-departures"
      defaultFilter={{
        reservation_status: ReservationStatusEnum.DEPARTING,
      }}
    />
  );
};

export default RoomExpectedDeparturesReport;
