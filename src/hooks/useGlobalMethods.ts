import { useState, useEffect } from "react";
import { useLazyGetPaymentMethodsQuery } from "services/paymentsSlice";
import { IPaymentMethodResponse } from "types/reservationTypes";

export const useGlobalMethods = (propertyId: number | undefined) => {
  const [methods, setMethods] = useState<IPaymentMethodResponse[]>([]);
  const [getMethod] = useLazyGetPaymentMethodsQuery();

  useEffect(() => {
    const fetchGlobals = async () => {
      const results = await getMethod({ globally_available: true });
      if (results.data) {
        setMethods(results.data);
      }
    };

    fetchGlobals();
  }, [propertyId]);

  return methods;
};
