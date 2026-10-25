"use client";
import React, { useEffect, useState } from "react";
import { Box } from "@mui/system";
import DataTable from "components/elements/DataTable/DataTable";
import { reservationTableColumns } from "config/tables/reservations";
import { useFetchGuestsByStayDateMutation } from "services/guestSlice";
import { format } from "date-fns"; // Optional, for date formatting
import { GuestByStayDate } from "types/quickSearch";
import useAuth from "hooks/useAuth";

const Page: React.FC = () => {
  const { users } = useAuth();

  const [dataSource, setDataSource] = useState<GuestByStayDate[]>([]);

  const [fetchGuestsByStayDate, { data: mockReservations, isLoading }] =
    useFetchGuestsByStayDateMutation();

  useEffect(() => {
    if (mockReservations?.data && mockReservations.data?.length > 0) {
      setDataSource(
        mockReservations?.data?.filter(
          (reservation) => reservation.RESERVATION_STATUS === "DEPARTING"
        )
      );
    } else {
      setDataSource([]);
    }
  }, [mockReservations?.data]);

  useEffect(() => {
    fetchGuestsByStayDate({
      date: format(new Date(), "yyyy-MM-dd"),
      propertyId: users?.defaultPropertyId ?? 1,
    });
  }, [fetchGuestsByStayDate]);

  return (
    <Box mt={2}>
      <DataTable
        columns={reservationTableColumns}
        data={dataSource ?? []}
        isLoading={isLoading}
        rowsPerPageOptions={[5, 10, 25]}
        initialRowsPerPage={10}
      />
    </Box>
  );
};

export default Page;
