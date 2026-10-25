import React, { useEffect, useMemo, useState, useContext } from "react";
import { Control, useWatch } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";

import StripePayment from "components/ui/StripePayment/StripePayment";

import AddReservationViewContext from "contexts/AddReservationViewContext";
import { useGlobalMethods } from "hooks/useGlobalMethods";
import useAuth from "hooks/useAuth";

import { IReservation } from "types/reservationTypes";
import { IGetRoomTypeAvailability } from "types/roomTypes";
import { TaxRateType } from "constants/taxes";
import { PaymentMethodTypesEnum } from "constants/paymentMethods";

interface PaymentDetailProps {
  control: Control<IReservation>;
  paymentIntent?: any;
  availabilityData?: IGetRoomTypeAvailability[];
}

const PaymentDetail: React.FC<PaymentDetailProps> = ({
  control,
  availabilityData,
}) => {
  const { users: currentUser } = useAuth();
  const globalMethods = useGlobalMethods(currentUser?.defaultPropertyId);
  const [selectedRoomPrices, setSelectedRoomPrices] = useState<number[]>([]);
  const [stays, fees, taxes] = useWatch({
    control,
    name: ["stays", "fees", "taxes"],
  });
  const { viewState } = useContext(AddReservationViewContext)!;
  const reservationData = viewState?.reservationCreationResponse?.data ?? {
    payment_intent: { client_secret: "", amount: 0 },
    reservations: [
      {
        folio_id: -1,
        reservation_id: -1,
      },
    ],
  };
  const navigate = useNavigate();

  useEffect(() => {
    const updatedPrices = (stays ?? [])
      ?.filter((a) => a.noOfRooms && a.noOfRooms > 0)
      .map(
        (stay) => Number(stay?.totalPrice ?? 0) * Number(stay?.noOfRooms ?? 0)
      );
    setSelectedRoomPrices(updatedPrices);
  }, [stays, setSelectedRoomPrices]);
  const subtotal = useMemo(
    () => selectedRoomPrices.reduce((sum, price) => sum + price, 0),
    [selectedRoomPrices]
  );
  const discount = 0;
  const total = subtotal - discount;
  function navigateToDetails() {
    const createdReservationId =
      viewState.reservationCreationResponse?.data.reservations?.[0]
        ?.reservation_id;
    navigate(`/booking-engine/reservations/${createdReservationId}`);
  }
  const totalFees = (fees ?? []).reduce((currentTotal, fee) => {
    if (total === 0 || Number.isNaN(fee.rate)) {
      return 0;
    }
    return +fee.rate + currentTotal;
  }, 0);
  const totalTaxes = (taxes ?? []).reduce((currentTotal, tax) => {
    if (total === 0 || Number.isNaN(tax.rate)) {
      return 0;
    }
    if (tax.type === TaxRateType.PERCENTAGE) {
      let taxCalc = total * (+tax.rate / 100);
      if (availabilityData) {
        const rate = +tax.rate;
        const allStaysHaveData = stays.every((s) => {
          const pricingDataIdx = availabilityData.findIndex(
            (a) => a.roomTypeId === s.roomTypeId
          );
          return pricingDataIdx > -1;
        });
        if (allStaysHaveData) {
          let allNightsIncluded = true;
          const taxPerStayCalc = stays.reduce((total, s) => {
            const pricingData = availabilityData.find(
              (a) => a.roomTypeId === s.roomTypeId
            );
            if (!pricingData?.pricing) {
              allNightsIncluded = false;
              return total;
            }
            const perNight = Object.keys(pricingData.pricing).reduce(
              (total, dateKey) => {
                let price =
                  pricingData.pricing[dateKey] != null
                    ? +pricingData.pricing[dateKey]
                    : 0;
                if (s.custom_rates?.[dateKey] != null) {
                  price = s.custom_rates?.[dateKey] ?? 0;
                }
                const taxPrice = Math.round(price * rate) / 100;
                return (total * 100 + taxPrice * 100) / 100;
              },
              0
            );
            return total + perNight;
          }, 0);
          if (allNightsIncluded) {
            taxCalc = taxPerStayCalc;
          }
        }
      }
      return currentTotal + taxCalc;
    }
    return currentTotal + +tax.rate;
  }, 0);
  const createdFolioAId = reservationData?.reservations?.[0]?.folio_id;
  return (
    <Box border={1} borderColor="grey.300" borderRadius={2}>
      <Typography variant="h6" gutterBottom px={3} pt={3}>
        Payment Details
      </Typography>
      <StripePayment
        allowDirectBill
        hideDirectBillCancel
        cashMethod={globalMethods.find(
          (m) => m.payment_type === PaymentMethodTypesEnum.CASH
        )}
        totalsData={{
          subtotal,
          discount,
          taxes: totalTaxes,
          fees: totalFees,
          total: total + totalFees + totalTaxes,
          balance: total + totalFees + totalTaxes,
        }}
        stripeIntent={reservationData.payment_intent}
        boxSx={{
          border: "none",
        }}
        onCompleteClick={navigateToDetails}
        // completeInformation={{
        //   message: "Click below to go to reservation details",
        //   buttonLabel: "Go To Reservation Details",
        // }}
        paymentDisabled={
          !viewState.reservationCreationResponse?.data.payment_intent
            .client_secret
        }
        reservationId={reservationData.reservations?.[0]?.reservation_id}
        folioId={createdFolioAId}
        directBillPayButtonProps={{
          actions: {
            cancel: navigateToDetails,
          },
          buttonLabels: {
            action: 'Charge Room and Tax to Folio "D"',
            cancel: "Go to Details",
          },
        }}
      />
    </Box>
  );
};

export default PaymentDetail;
