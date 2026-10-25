import React, { createContext, useContext, useState } from "react";
import { ReservationDetailsState } from "types/reservationTypes";

interface ReservationDetailsContext {
  viewState: ReservationDetailsState;
  setViewState: (newstate: ReservationDetailsState) => void;
  refreshReservation?: () => void;
}

const ReservationDetailsContext =
  createContext<ReservationDetailsContext | null>(null);

export const ReservationDetailsContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [currentState, setCurrentState] = useState<ReservationDetailsState>({});
  return (
    <ReservationDetailsContext.Provider
      value={{ viewState: currentState, setViewState: setCurrentState }}
    >
      {children}
    </ReservationDetailsContext.Provider>
  );
};

export const useReservationDetails = () => {
  const context = useContext(ReservationDetailsContext);

  if (!context) {
    throw new Error(
      "useReservationDetails must be used within a ReservationDetailsContextProvider"
    );
  }

  return context;
};

export default ReservationDetailsContext;
