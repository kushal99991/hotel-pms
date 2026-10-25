import React, { createContext, useContext } from "react";
import { GlobalMethodsContextValue } from "types/ui/paymentMethods";
import { useGlobalMethods } from "hooks/useGlobalMethods";
import useAuth from "hooks/useAuth";

const GlobalMethodsContext = createContext<GlobalMethodsContextValue | null>(
  null
);

export const GlobalMethodsContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { users: currentUser } = useAuth();
  const methods = useGlobalMethods(currentUser?.defaultPropertyId);
  return (
    <GlobalMethodsContext.Provider value={{ methods }}>
      {children}
    </GlobalMethodsContext.Provider>
  );
};

export const useGlobalMethodsContext = () => {
  const context = useContext(GlobalMethodsContext);

  if (!context) {
    throw new Error(
      "useGlobalMethods must be used within a GlobalMethodsContextProvider"
    );
  }

  return context;
};

export default GlobalMethodsContext;
