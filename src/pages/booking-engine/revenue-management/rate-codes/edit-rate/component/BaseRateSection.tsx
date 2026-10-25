import React, { useEffect, useState } from "react";
import { Box, Typography, TextField, InputAdornment } from "@mui/material";
import ReservationDetailBox from "pages/booking-engine/reservations/components/ReservationDetail/components/ReservationDetailBox";
import { useGetRoomTypeByPropertyIdMutation } from "services/roomTypeSlice";
import { useGetBaseRateMutation } from "services/roomRateSlice";
import useAuth from "hooks/useAuth";
import { IRoomTypes } from "types/roomTypes";

interface BaseRateSectionProps {
  rate_code_id?: number | null;
  onAddUpdateRate: (payload: {
    id?: number;
    rate_code_id: number;
    room_type_id: number;
    rate: number;
    date: string;
    type: "CREATE" | "UPDATE";
  }) => void;
}

const BaseRateSection: React.FC<BaseRateSectionProps> = ({
  rate_code_id,
  onAddUpdateRate,
}) => {
  const { users } = useAuth();

  const [getRoomTypeByPropertyId, { data: roomTypeList }] =
    useGetRoomTypeByPropertyIdMutation();
  const [getBaseRate, { data: baseRateCodeList, isLoading }] =
    useGetBaseRateMutation();

  const [rateInputs, setRateInputs] = useState<Record<number, string>>({});

  useEffect(() => {
    onRefresh();
  }, []);

  const onRefresh = async () => {
    const [baseRateRes, roomTypeRes] = await Promise.all([
      getBaseRate({
        property_id: users?.defaultPropertyId ?? 0,
        rate_code_id: rate_code_id?.toString(),
      }),
      getRoomTypeByPropertyId({
        propertyId: users?.defaultPropertyId ?? 1,
      }),
    ]);

    const roomTypes = roomTypeRes?.data ?? [];
    const baseRates = baseRateRes?.data ?? [];

    const rates: Record<number, string> = {};

    roomTypes.forEach((roomType: IRoomTypes) => {
      const existingRate = baseRates.find(
        (rate) =>
          rate.room_type?.id === roomType.id &&
          rate.rateCode?.id === rate_code_id
      );

      if (existingRate) {
        rates[roomType.id] = existingRate.rate?.toString() ?? "0.00";
      } else {
        // Default rate when no existing rate found
        rates[roomType.id] = "0.00";

        // Only trigger CREATE if rate_code_id exists (or handle null as default 0)
        onAddUpdateRate({
          rate_code_id: rate_code_id ?? 0,
          room_type_id: roomType.id,
          rate: 0,
          date: "1900-01-01",
          type: "CREATE",
        });
      }
    });

    setRateInputs(rates);
  };

  const handleRateChange = (
    roomTypeId: number,
    value: string,
    existingRateId?: number
  ) => {
    if (!/^\d*\.?\d*$/.test(value)) return; // only allow valid number input

    setRateInputs((prev) => ({
      ...prev,
      [roomTypeId]: value,
    }));

    const numericRate = Number(value);
    if (!isNaN(numericRate) && value !== "") {
      onAddUpdateRate({
        id: existingRateId,
        rate_code_id: rate_code_id ?? 0,
        room_type_id: roomTypeId,
        rate: numericRate,
        date: "1900-01-01",
        type: existingRateId ? "UPDATE" : "CREATE",
      });
    }
  };

  return (
    <ReservationDetailBox label="Base Rate" isLoading={isLoading}>
      <Box display="flex" flexDirection="column" gap={2}>
        {(roomTypeList ?? []).map((roomType) => {
          const existingRate = (baseRateCodeList ?? []).find(
            (rate) =>
              rate.room_type?.id === roomType.id &&
              rate.rateCode?.id === rate_code_id
          );

          return (
            <Box key={roomType.id} display="flex" alignItems="center" gap={2}>
              <Typography width="150px">{roomType.type}</Typography>
              <TextField
                type="number"
                size="small"
                value={rateInputs[roomType.id] ?? "0.00"}
                onChange={(e) =>
                  handleRateChange(
                    roomType.id,
                    e.target.value,
                    existingRate?.id
                  )
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                }}
              />
            </Box>
          );
        })}
      </Box>
    </ReservationDetailBox>
  );
};

export default BaseRateSection;
