import { useGlobalMethods } from "./useGlobalMethods";
import { IPaymentMethodResponse } from "types/reservationTypes";

const useAllPaymentMethods = (
  currentMethods?: IPaymentMethodResponse[],
  property_id?: number
) => {
  const globalMethods = useGlobalMethods(property_id);
  let methods = [...globalMethods];

  if (currentMethods?.length) {
    methods = [...currentMethods, ...globalMethods];
  }

  return methods;
};

export default useAllPaymentMethods;
