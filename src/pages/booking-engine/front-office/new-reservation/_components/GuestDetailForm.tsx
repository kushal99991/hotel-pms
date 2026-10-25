import { useFieldArray, Control } from "react-hook-form";
import React from "react";
import { Box, Button } from "@mui/material";
import { Add } from "@mui/icons-material";
import GuestRow from "./GuestRow";

import { IGuest, IReservation } from "types/reservationTypes";

interface GuestDetailFormProps {
  control: Control<IReservation>;
  maxGuest: number;
  index: number;
  guests: IGuest[];
}

const GuestDetailForm: React.FC<GuestDetailFormProps> = ({
  control,
  maxGuest,
  index,
}) => {
  const {
    fields: guests,
    append,
    remove,
  } = useFieldArray({
    control,
    name: `stays.${index}.guests`,
  });
  return (
    <Box>
      {guests.map((guest, guestIndex) => (
        <GuestRow
          fieldArrayRemove={remove}
          stayIndex={index}
          guestIndex={guestIndex}
          key={`stay-${index}_guestRow-${guest.id}`}
        />
      ))}
      <Button
        onClick={() =>
          append({
            firstName: "",
            lastName: "",
            email: "",
            primaryGuest: guests.length === 0,
          })
        }
        variant="contained"
        startIcon={<Add />}
        disabled={guests.length >= maxGuest}
      >
        Add Guest
      </Button>
    </Box>
  );
};

export default GuestDetailForm;
