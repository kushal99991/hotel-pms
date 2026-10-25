import React, { useState, useEffect, useCallback } from "react";
import { Box, IconButton, Stack, styled } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

import DataTable, { Column } from "components/elements/DataTable/DataTable";
import { useNavigate } from "react-router-dom";
import { amenityIcons } from "constants/amenities-icons";
import Input from "components/elements/TextInput/TextInput";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import { useGetRoomTypeByPropertyIdMutation } from "services/roomTypeSlice";
import { IRoomTypes } from "types/roomTypes";

const PropertyRoomTypeTable: React.FC = () => {
  const Navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredRoomType, setFilteredRoomType] = useState<IRoomTypes[]>([]);

  const [getRoomTypeByPropertyId, { isLoading, data: roomTypeList }] =
    useGetRoomTypeByPropertyIdMutation();

  useEffect(() => {
    onRefresh();
  }, []);

  useEffect(() => {
    // Filter the amenities list based on the search query across multiple fields
    if (searchQuery === "") {
      setFilteredRoomType(roomTypeList ?? []);
    } else {
      const filteredData = roomTypeList?.filter((roomType: IRoomTypes) => {
        const lowerCasedQuery = searchQuery.toLowerCase();

        // Check if any field matches the search query
        return (
          roomType.type.toLowerCase().includes(lowerCasedQuery) ||
          roomType.typeDescription.toString().includes(lowerCasedQuery) ||
          roomType.typeDescription.toLowerCase().includes(lowerCasedQuery) ||
          roomType?.name?.toLowerCase().includes(lowerCasedQuery)
        );
      });

      setFilteredRoomType(filteredData ?? []);
    }
  }, [searchQuery, roomTypeList]);

  const onRefresh = useCallback(() => {
    getRoomTypeByPropertyId({ propertyId: 1 });
  }, []);

  const columns: Column<IRoomTypes>[] = [
    {
      field: "name",
      label: "Room Type Name",
      align: "center",
    },
    {
      field: "type",
      label: "Room Type",
      align: "center",
    },
    {
      field: "typeIcon",
      label: "Icon",
      renderCell: (value: IRoomTypes) => {
        const selectedIcon = amenityIcons.find(
          (a) => a.value === value.typeIcon
        )?.icon;
        return selectedIcon ?? "-";
      },
    },
    {
      field: "typeDescription",
      label: "Description",
    },
    {
      field: "occupancy",
      label: "Occupancy",
      align: "right",
    },
    {
      field: "inventory",
      label: "Inventory",
      align: "right",
    },
    {
      field: "adults",
      label: "Adults",
    },
    {
      field: "children",
      label: "Children",
    },
    {
      field: "sizeBeds",
      label: "Size Of Beds",
      align: "right",
    },
    {
      field: "id",
      label: "Action",
      renderCell: (value: IRoomTypes) => {
        return (
          <Box display="flex" alignItems="center" justifyContent="center">
            <IconButton
              aria-label="edit"
              color="primary"
              onClick={() =>
                Navigate(`/booking-engine/admin/rooms-type/edit/${value.id}`)
              }
            >
              <EditIcon />
            </IconButton>
          </Box>
        );
      },
    },
  ];

  return (
    <MainWrapper>
      <Stack
        flexDirection="row"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        pb={3}
      >
        <Input
          isInvalid={false}
          label="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by Name, Category, Description, or Charge"
        />
        <PrimaryButton
          buttonStyles={{
            backgroundColor: "#32A1AE",
            color: "#FFFFFF",
            fontWeight: "bold",
          }}
          label="Add Room Type"
          isLoading={isLoading}
          onClick={() => Navigate(`/booking-engine/admin/rooms-type/add`)}
        />
      </Stack>
      <DataTable
        columns={columns}
        data={filteredRoomType ?? []}
        isLoading={isLoading}
        rowsPerPageOptions={[5, 10, 25]}
        initialRowsPerPage={10}
      />
    </MainWrapper>
  );
};

export default PropertyRoomTypeTable;

const MainWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  padding: "15px",
  margin: "15px 10px",
}));
