import React from "react";
import { Box } from "@mui/material";
import { AddReservationViewContextProvider } from "contexts/AddReservationViewContext";
import AddReservationForm from "./AddReservationForm";

const NewReservation: React.FC = () => {
  return (
    <AddReservationViewContextProvider>
      <Box
        sx={{
          padding: 2,
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <AddReservationForm />
      </Box>
    </AddReservationViewContextProvider>
  );
};

export default NewReservation;
