import { Controller, useForm, FormProvider } from "react-hook-form";
import React, { useCallback, useState, useContext } from "react";
import { Box, Grid, Alert, Typography, Button } from "@mui/material";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";

import { reservationSchema } from "utils/validations.utils";
import { useCreateReservationMutation } from "services/reservationSlice";
import { IGetRoomTypeAvailability } from "types/roomTypes";
import { IReservation } from "types/reservationTypes";
import { useAuth } from "hooks";
import PrimaryButton from "components/elements/Button/PrimaryButton";

import AddReservationViewContext from "contexts/AddReservationViewContext";
import StaySection from "./_components/StaySection";
import PaymentDetail from "./_components/PaymentDetail";
import AddAvailableRooms, {
  IUpdateDetail,
} from "./_components/AddAvailableRooms/AddAvailableRooms";
import { PaymentChargeTypeEnum } from "constants/payments";
import PaymentTypeModal from "./_components/PaymentTypeModal";
import { useSocket } from "contexts/SocketContext";

const AddReservationForm: React.FC = () => {
  const { users } = useAuth();
  const { socket } = useSocket();
  const Navigate = useNavigate();
  const { viewState, setViewState } = useContext(AddReservationViewContext)!;
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [roomAvailabilityList, setRoomAvailabilityList] = useState<
    IGetRoomTypeAvailability[]
  >([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [createReservation, { isLoading }] = useCreateReservationMutation();

  const methods = useForm<IReservation>({
    resolver: yupResolver(reservationSchema),
    mode: "all",
    defaultValues: {
      startDate: new Date(),
      endDate: new Date(),
      propId: users?.defaultPropertyId || 0,
      rateCode: 12,
      reservationUuid: "",
      roomTypeIds: [],
      // the reservation holder
      guest: {
        first_name: "",
        last_name: "",
        email: "",
        country: "US",
      },
      paymentDetail: {
        paymentType: "Cash",
      },
      stays: [],
      payment: undefined,
    },
  });
  const { control, handleSubmit, setValue, setError, formState, getValues } =
    methods;
  const onUpdateRoomAvailability = useCallback(
    (data: IGetRoomTypeAvailability[]) => {
      setValue("stays", [], {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setRoomAvailabilityList(data);
    },
    [setValue]
  );
  const handleCreateClick = () => {
    setShowPaymentModal(true);
  };
  const handleModalClose = () => {
    setShowPaymentModal(false);
  };

  const onSubmit = async () => {
    try {
      const data = getValues();
      const response = await createReservation(data).unwrap();
      if (response) {
        setSuccessMessage("Reservation created successfully!");
        setShowPaymentModal(false);
      }
    } catch (e: any) {
      setError("root", { message: e?.message || "Failed to create reservation" });
      setShowPaymentModal(false);
    }
  };
  const createdReservationId =
    viewState.reservationCreationResponse?.data.reservations?.[0]
      ?.reservation_id;
  const createdPaymentType =
    viewState.reservationCreationResponse?.data.payment_intent.object ===
    "setup_intent"
      ? "payment information"
      : "payment";
  return (
    <FormProvider {...methods}>
      <Grid container spacing={2} justifyContent="space-between">
        <Grid item xs={12} md={7}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              paddingBottom: "1.5rem",
            }}
          >
            {formState.errors?.root && (
              <Alert severity="error">{formState.errors.root.message}</Alert>
            )}

            <Grid item xs={12}>
              <Controller
                name="propId"
                control={control}
                render={({ field }) => <input type="hidden" {...field} />}
              />

              <AddAvailableRooms
                onUpdateRoomAvailability={onUpdateRoomAvailability}
                setParentFormValue={setValue}
                errors={formState.errors}
              
              />
              <StaySection
                control={control}
                roomAvailabilityList={roomAvailabilityList}
              />
            </Grid>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          {successMessage && (
            <Alert
              severity="success"
              data-testid="success-message"
              sx={{ mb: 2 }}
            >
              {successMessage}
            </Alert>
          )}
          <PaymentDetail
            control={control}
            availabilityData={roomAvailabilityList}
          />
          <Box mt={2} sx={{ display: "flex", justifyContent: "center" }}>
            {!successMessage?.length && (
              <PrimaryButton
                label="Create Reservation"
                fullWidth
                isLoading={isLoading}
                loadingText="Creating Reservation...."
                onClick={handleSubmit(handleCreateClick)}
                type="submit"
                disabled={!!successMessage?.length}
              />
            )}
            {successMessage?.length && (
              <Box
                display="flex"
                justifyContent="center"
                flexDirection="column"
                alignItems="center"
              >
                <Typography sx={{ mb: 2 }}>
                  If you don`t need to collect {createdPaymentType} at this
                  time,
                </Typography>
                <Box>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() =>
                      Navigate(
                        `/booking-engine/reservations/${createdReservationId}`
                      )
                    }
                    sx={{ mt: 2, px: 4, py: 2 }}
                    fullWidth
                    data-testid="go-to-reservation-details"
                  >
                    Go To Reservation Details
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => window.location.reload()}
                    sx={{ mt: 2, px: 4, py: 2 }}
                    fullWidth
                    data-testid="make-another-reservation"
                  >
                    Make Another Reservation
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>
      <PaymentTypeModal
        open={showPaymentModal}
        onClose={handleModalClose}
        onSubmit={onSubmit}
      />
    </FormProvider>
  );
};

export default AddReservationForm;
