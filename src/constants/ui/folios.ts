import { ISimpleFolio } from "types/payments";
import { IReservationResponse } from "types/reservationTypes";

export const ALL_FOLIOS_KEY = "aToZ";
export const ALL_FOLIOS_ID = -22;

export function makeAllFolioForRes(
  reservation?: IReservationResponse
): ISimpleFolio {
  return {
    type: ALL_FOLIOS_KEY,
    reservation_id: reservation?.id ?? -1,
    id: ALL_FOLIOS_ID,
    primary_payment_method: null,
  };
}
