import {
  FieldValues,
  UseFormClearErrors,
  UseFormReturn,
  UseFormSetValue,
} from "react-hook-form";
import { IFullGuest, IGuest, IStay } from "types/reservationTypes";
import { SET_VALUE_OPTIONS } from "constants/forms";
import { allFieldsReady } from "./fieldStates";
import { reservationSchema } from "utils/validations.utils";

export const isReservationHolderReady = (formContextMethods: UseFormReturn) => {
  const { getValues, getFieldState, trigger } = formContextMethods;
  const resHolderReady = allFieldsReady(
    "guest",
    getValues,
    getFieldState,
    reservationSchema
  );
  if (!resHolderReady) {
    trigger("guest");
    return false;
  }
  return true;
};

export const assignResHolderToStay = (
  stay: IStay,
  stayIdx: number,
  reservationHolder: IFullGuest,
  setValue: UseFormSetValue<FieldValues>,
  clearErrors: UseFormClearErrors<FieldValues>
) => {
  const holderStayGuest: IGuest = {
    firstName: reservationHolder.first_name,
    lastName: reservationHolder.last_name,
    email: reservationHolder.email,
    primaryGuest: true,
  };
  const stayGuests = stay.guests ?? [];
  // insert holder into the first guest
  const guestsFormName = `stays.${stayIdx}.guests`;
  const guestsPastFirst = stayGuests.slice(1);
  const updatedGuestList: IGuest[] = [
    holderStayGuest,
    ...guestsPastFirst.map((g) => ({ ...g, primaryGuest: false })),
  ];
  setValue(guestsFormName, updatedGuestList, SET_VALUE_OPTIONS);
  clearErrors(guestsFormName);

  // now mark stay as having the primary guest i.e. reservation holder
  const primaryGuestFormName = `stays.${stayIdx}.primaryGuest`;
  setValue(primaryGuestFormName, true, SET_VALUE_OPTIONS);
};
