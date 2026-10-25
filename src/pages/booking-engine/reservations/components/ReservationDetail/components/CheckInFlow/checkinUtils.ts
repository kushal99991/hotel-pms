import { IProperty } from "types/property";
import { IReservationResponse } from "types/reservationTypes";
import { isCompReservation } from "utils/reservations";

export function includeIncidentalStep(
  reservation?: IReservationResponse,
  property?: IProperty
) {
  const propertyIncidentalRate = property?.incidentals_per_night ?? "-1";
  if (+propertyIncidentalRate === 0) {
    return false;
  }
  if (isCompReservation(reservation)) {
    return false;
  }
  return true;
}
