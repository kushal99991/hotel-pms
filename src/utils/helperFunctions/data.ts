import {
  bookingChannelList,
  marketOptionList,
} from "config/tables/reservations";
import { ChargeStatusEnum } from "constants/charges";
import moment from "moment";
import { IChargeResponse } from "types/charges";
import { IFolioResponse } from "types/folios";
import { IFullGuest, IGuest } from "types/reservationTypes";
import { apiAmountToNumber } from "utils/dataFormats";

export const guestIsHolder = (
  guest: IGuest,
  reservationHolder: IFullGuest
): boolean => {
  const guestFirstname = guest.firstName ?? "";
  const guestLastname = guest.lastName ?? "";
  const guestEmail = guest.email ?? "";
  const holderFirstname = reservationHolder.first_name;
  const holderLastname = reservationHolder.last_name;
  const holderEmail = reservationHolder.email ?? "";
  const firstNameSame =
    guestFirstname.toLowerCase() === holderFirstname.toLowerCase();
  const lastNameSame =
    guestLastname.toLowerCase() === holderLastname.toLowerCase();
  const emailSame = guestEmail.toLowerCase() === holderEmail.toLowerCase();
  return firstNameSame && lastNameSame && emailSame;
};

export const calculateFolioTotal = (folio?: IFolioResponse): number => {
  const charges = folio?.charges || [];
  return charges.reduce((total: number, charge: IChargeResponse) => {
    const value = apiAmountToNumber(charge.amount);
    return total + value;
  }, 0);
};

export const calculateFolioBalance = (folio?: IFolioResponse): number => {
  const charges = folio?.charges || [];
  return charges.reduce((total: number, charge: IChargeResponse) => {
    const value = apiAmountToNumber(charge.amount);
    if (
      charge.status === ChargeStatusEnum.DUE ||
      charge.status === ChargeStatusEnum.PENDING
    ) {
      return total + value;
    }
    return total;
  }, 0);
};

export function getReadableMarketOption(marketOption?: string) {
  const option = marketOptionList.find((opt) => opt.value === marketOption);
  return option?.label ?? marketOption;
}

export function getReadableBookingChannel(channel?: string) {
  const option = bookingChannelList.find((ch) => ch.value === channel);
  return option?.label ?? channel;
}

export const calculateTotalNights = (
  checkIn: Date | null,
  checkOut: Date | null
): number => {
  if (!checkIn || !checkOut) return 0;
  const checkInMoment = moment(checkIn);
  const checkOutMoment = moment(checkOut);
  const diffDays = checkOutMoment.diff(checkInMoment, "days");
  return diffDays > 1 ? diffDays : 1;
};
