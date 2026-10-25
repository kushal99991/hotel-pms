import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { FormProvider, useForm } from "react-hook-form";
import { Alert, Grid, Button, Box, Snackbar } from "@mui/material";
import { useNavigate } from "react-router-dom";
import GroupDateRangeSelect from "./GroupDateRangeSelect";
import StayDetail from "./StayDetail";
import { yupResolver } from "@hookform/resolvers/yup";
import { roomingSchema } from "utils/validations.utils";
import { IRoomingSchema, ISalesGroupDetail } from "types/salesTypes";
import { IReservation } from "types/reservationTypes";
import { getMoment } from "utils/helperFunctions/common";
import useAuth from "hooks/useAuth";
import { PaymentChargeTypeEnum } from "constants/payments";
import { useCreateReservationMutation } from "services/reservationSlice";

interface SalesRoomingDetailFormProps {
  group?: ISalesGroupDetail;
  onSuccessfulCreate?: () => void;
}

const SalesRoomingDetailForm: React.FC<SalesRoomingDetailFormProps> = ({
  group,
  onSuccessfulCreate,
}) => {
  const { currentProperty, currentTimeZone } = useAuth();
  const navigate = useNavigate();
  const [createReservation, { isLoading }] = useCreateReservationMutation();
  const [resUuid, setResUuid] = useState<string>(uuidv4());
  const [successMessage, setSuccessMessage] = useState<string>();

  // Parse group dates for form defaults
  const groupArrival = group?.group_arrival_date
    ? getMoment(group.group_arrival_date, currentTimeZone, true).toDate()
    : new Date();
  const groupDeparture = group?.group_departure_date
    ? getMoment(group.group_departure_date, currentTimeZone, true).toDate()
    : new Date();

  const methods = useForm<IRoomingSchema>({
    resolver: yupResolver(roomingSchema),
    defaultValues: {
      startDate: groupArrival,
      endDate: groupDeparture,
      stay: [
        {
          room_type_id: 0,
          rate_code_id: group?.rate_code_id ?? 0,
          primary_guest: false,
          guests: [{ first_name: "", last_name: "", email: "" }],
          special_requests: "",
          children_count: 0,
          adults_count: 1,
          tax_exemption_id: 0,
        },
      ],
    },
  });

  const { reset } = methods;

  useEffect(() => {
    if (group) {
      const arrival = group.group_arrival_date
        ? getMoment(group.group_arrival_date, currentTimeZone, true).toDate()
        : new Date();
      const departure = group.group_departure_date
        ? getMoment(group.group_departure_date, currentTimeZone, true).toDate()
        : new Date();

      reset({
        startDate: arrival,
        endDate: departure,
        stay: [
          {
            room_type_id: 0,
            rate_code_id: group.rate_code_id ?? 0,
            primary_guest: false,
            guests: [{ first_name: "", last_name: "", email: "" }],
            special_requests: "",
            children_count: 0,
            adults_count: 1,
            tax_exemption_id: 0,
          },
        ],
      });
    }
  }, [group, currentTimeZone, reset]);

  const handleCancel = () => {
    navigate(-1); // Go back to previous page
  };

  function handleMessageClose() {
    setSuccessMessage("");
  }

  function onSuccessfulReservation() {
    methods.reset();
    methods.clearErrors();
    setResUuid(uuidv4());
    setSuccessMessage("Reservation created successfully.");
    onSuccessfulCreate?.();
  }

  const handleSaveAndAddRes = async () => {
    // validate & get values
    const isValid = await methods.trigger();
    if (!isValid) return;
    methods.clearErrors();
    const formData = methods.getValues();
    const stay = formData.stay[0];
    // First guest is being used as reservation holder so remove them from
    // the stay's guest array
    const reservationGuests =
      stay.guests.length > 1 ? stay.guests.slice(1) : null;
    const reservationData: IReservation = {
      bookingChannel: "GROUPS",
      marketSegment: "GROUP",
      startDate: formData.startDate,
      endDate: formData.endDate,
      propId: currentProperty?.id ?? -1,
      rateCode: stay.rate_code_id,
      roomTypeIds: [`${stay.room_type_id}`],
      reservationUuid: resUuid,
      guest: {
        first_name: stay.guests[0].first_name,
        last_name: stay.guests[0].last_name,
        email: stay.guests[0].email,
      },
      stays: [
        {
          childrenCount: stay.children_count,
          adultCount: stay.adults_count,
          roomTypeId: stay.room_type_id,
          reservation_holder_is_also_guest: true,
          reservation_holder_is_primary_guest: true,
          guests: reservationGuests?.map((g) => {
            return {
              firstName: g.first_name,
              lastName: g.last_name,
              email: g.email,
            };
          }),
        },
      ],
      groupId: group?.id,
      payment: PaymentChargeTypeEnum.NO_PAYMENT,
    };

    const response = await createReservation(reservationData);
    if (response.error) {
      methods.setError("root", {
        type: "manual",
        message: response?.error as string,
      });
      return;
    }
    onSuccessfulReservation();
  };

  return (
    <FormProvider {...methods}>
      <Snackbar
        autoHideDuration={3000}
        onClose={handleMessageClose}
        open={!!successMessage}
      >
        <Alert severity="success">{successMessage}</Alert>
      </Snackbar>
      <form>
        <GroupDateRangeSelect group={group} />
        <StayDetail group={group} />
        {methods.formState.errors.root?.message && (
          <Alert severity="error" sx={{ mt: 2, width: "50%" }}>
            {methods.formState.errors.root.message}
          </Alert>
        )}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Box display="flex" justifyContent="space-between" gap={2} mt={3}>
              <Button type="button" variant="outlined" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="contained"
                color="primary"
                disabled={isLoading}
                onClick={handleSaveAndAddRes}
              >
                {isLoading ? "Saving..." : "Save & Add Res"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </FormProvider>
  );
};

export default SalesRoomingDetailForm;
