import React, { createContext, useState } from "react";
import { IReservationCreationResponse } from "types/reservationTypes";
import { IRoomTypes } from "types/roomTypes";

interface AddReservationViewState {
  childrenAssigned: number;
  totalChildren: number;
  totalAdults?: number;
  reservationCreated?: boolean;
  reservationCreationResponse?: IReservationCreationResponse;
}

interface AddReservationViewContext {
  viewState: AddReservationViewState;
  setViewState: React.Dispatch<React.SetStateAction<AddReservationViewState>>;
  roomTypeList: IRoomTypes[];
  setRoomTypeList: React.Dispatch<React.SetStateAction<IRoomTypes[]>>;
}

const AddReservationViewContext =
  createContext<AddReservationViewContext | null>(null);

export const AddReservationViewContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [currentState, setCurrentState] = useState<AddReservationViewState>({
    totalChildren: 0,
    childrenAssigned: 0,
    totalAdults: 1,
  });

  const [roomTypeList, setRoomTypeList] = useState<IRoomTypes[]>([]);

  return (
    <AddReservationViewContext.Provider
      value={{
        viewState: currentState,
        setViewState: setCurrentState,
        roomTypeList,
        setRoomTypeList,
      }}
    >
      {children}
    </AddReservationViewContext.Provider>
  );
};

export default AddReservationViewContext;
