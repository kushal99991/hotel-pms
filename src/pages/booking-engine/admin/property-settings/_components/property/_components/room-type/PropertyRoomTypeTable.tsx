import React, { useState, useEffect, useCallback } from "react";
import {
  Avatar,
  Box,
  IconButton,
  Stack,
  styled,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

import DataTable, { Column } from "components/elements/DataTable/DataTable";
import { useNavigate } from "react-router-dom";
import Input from "components/elements/TextInput/TextInput";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import { useGetRoomTypeByPropertyIdMutation } from "services/roomTypeSlice";
import { IRoomTypes } from "types/roomTypes";
import { IProperty } from "types/property";
import { appConfig } from "config/app.config";

const PropertyRoomTypeTable: React.FC<{ property: IProperty | null }> = ({
  property,
}) => {
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
    getRoomTypeByPropertyId({ propertyId: property?.id ?? 0 });
  }, []);

  const columns: Column<IRoomTypes>[] = [
    {
      field: "typeIcon",
      label: "",
      renderCell: (value: IRoomTypes) => {
        return value?.typeIcon ? (
          <Avatar
            alt={`${appConfig.mediaPath}/${value.typeIcon}`}
            variant="square"
            src={`${appConfig.mediaPath}/${value.typeIcon}`}
            sx={{ width: 100, height: 60 }}
          />
        ) : (
          <Avatar variant="square" sx={{ width: 100, height: 60 }}>
            {value.name?.[0]?.toUpperCase() || "?"}
          </Avatar>
        );
      },
    },
    {
      field: "name",
      label: "Name",
      align: "center",
    },
    {
      field: "type",
      label: "Room Type",
      align: "center",
    },
    {
      field: "typeDescription",
      label: "Description",
      renderCell: (value: IRoomTypes) => (
        <Typography
          component="div"
          dangerouslySetInnerHTML={{ __html: value.typeDescription }}
        />
      ),
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
      field: "children",
      label: "Adults/Children",
      renderCell: (value: IRoomTypes) => `${value.adults}/${value.children}`,
    },
    {
      field: "sizeBeds",
      label: "No. of Beds",
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
            |
            <IconButton
              aria-label="edit"
              color="primary"
              onClick={() =>
                Navigate(
                  `/booking-engine/admin/rooms-type/room-assign/${value.id}`
                )
              }
            >
              <Typography>Rooms</Typography>
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
          onClick={() =>
            Navigate(
              `/booking-engine/admin/rooms-type/add?property_id=${property?.id ?? ""}`
            )
          }
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
