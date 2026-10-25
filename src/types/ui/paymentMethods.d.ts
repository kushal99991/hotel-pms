import { IPaymentMethodResponse } from "types/reservationTypes";

export interface GlobalMethodsContextValue {
  methods: IPaymentMethodResponse[];
}

export interface MethodLisItemDetails {
  main: string;
  secondary?: string;
}
