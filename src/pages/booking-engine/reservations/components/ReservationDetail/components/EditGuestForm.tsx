import React, { useEffect, useState } from "react";
import { Box, Typography, Button } from "@mui/material";

import { IFullGuest, IGuestResponse } from "types/reservationTypes";
import GuestForm from "./GuestForm";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { FormProvider, useForm } from "react-hook-form";
import EditGuestFormName from "./EditGuestFormName";
import { Add } from "@mui/icons-material";

interface EditGuestFormProps {
  guests: IGuestResponse[];
  reservationHolder?: IGuestResponse;
  onRefreshNeeded?: () => void;
  addGuestCallback?: () => void;
}

interface EditGuestList {
  reservationHolder: EditGuest;
  guestList: EditGuest[];
}

interface EditGuest {
  first_name: string;
  last_name: string;
  email?: string | null;
  id?: number;
  vip?: boolean;
}

const editGuestSchema = Yup.object().shape({
  first_name: Yup.string().required("First name is required"),
  last_name: Yup.string().required("Last name is required"),
  email: Yup.string().nullable().optional().email("Invalid email"),
  id: Yup.number(),
  vip: Yup.boolean().optional(),
});

const EditGuestForm: React.FC<EditGuestFormProps> = ({
  guests,
  onRefreshNeeded,
  reservationHolder,
  addGuestCallback,
}) => {
  const [editingId, setEditingId] = useState<number | null>();
  const guestArraySchema = Yup.object().shape({
    reservationHolder: editGuestSchema,
    guestList: Yup.array().of(editGuestSchema).required(),
  });

  const formMethods = useForm<EditGuestList>({
    resolver: yupResolver(guestArraySchema),
    mode: "all",
    defaultValues: {
      reservationHolder: reservationHolder as IFullGuest,
      guestList: guests as IFullGuest[],
    },
  });
  const { setValue } = formMethods;

  useEffect(() => {
    if (reservationHolder) {
      setValue("reservationHolder", reservationHolder as IFullGuest, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    }
    if (guests?.length > 0) {
      setValue("guestList", guests as IFullGuest[], {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    }
  }, [guests, reservationHolder]);

  function handleSuccessfulUpdate() {
    // Always trigger refresh after a successful update to ensure data is in sync
    onRefreshNeeded?.();
    setEditingId(null);
  }

  function handleEditClick(guestId?: number) {
    if (!guestId) {
      return;
    }
    setEditingId(guestId);
  }
  function currentEditingGuest() {
    if (!editingId) {
      return undefined;
    }
    if (reservationHolder?.id === editingId) {
      return reservationHolder;
    }
    const editingGuest = guests.find((g) => g.id === editingId);
    return editingGuest;
  }
  function onCancel() {
    setEditingId(null);
  }
  return (
    <FormProvider {...formMethods}>
      {editingId && editingId > 0 && (
        <GuestForm
          guestIndex={guests.findIndex((g) => g.id === editingId)}
          guestData={currentEditingGuest()}
          reservationHolderId={reservationHolder?.id ?? -1}
          onCancel={onCancel}
          onUpdateSuccess={handleSuccessfulUpdate}
        />
      )}
      {!editingId && (
        <>
          <Box>
            <Typography fontWeight="bold" fontSize="1.125rem">
              Booker
            </Typography>
            <Box>
              <EditGuestFormName
                guestData={reservationHolder}
                guestIndex={-1}
                reservationHolderId={reservationHolder?.id ?? -1}
                onEditClick={handleEditClick}
                editReservationHolder
              />
            </Box>
          </Box>
          <Box mt={3}>
            <Typography fontWeight="bold" fontSize="1.125rem">
              Guests
            </Typography>
            {guests.map((g, idx) => (
              <EditGuestFormName
                key={`guestName_${g.id}`}
                guestData={g}
                guestIndex={idx}
                reservationHolderId={reservationHolder?.id ?? -1}
                onEditClick={handleEditClick}
              />
            ))}

            <Button
              onClick={addGuestCallback}
              color="success"
              variant="contained"
              size="small"
              style={{ marginTop: 10 }}
            >
              <Add /> Add Guest
            </Button>
          </Box>
        </>
      )}
    </FormProvider>
  );
};

export default EditGuestForm;
