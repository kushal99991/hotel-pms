import React, { useState, useEffect } from "react";
import { Box, IconButton, Stack, styled } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import Input from "components/elements/TextInput/TextInput";
import DataTable, { Column } from "components/elements/DataTable/DataTable";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import { IRoomAmenity } from "types/roomAmenitiesTypes";
import {
  useDeleteRoomAmenityMutation,
  useGetRoomAmenitiesQuery,
} from "services/roomAmenitiesSlice";
import { useNavigate } from "react-router-dom";
import ConfirmationDialog from "components/elements/ConfirmationDialog/ConfirmationDialog";
import DynamicIcon from "components/ui/DynamicIcon/DynamicIcon";
import { useGetRoomAmenitiesCategoryQuery } from "services/roomSlice";
import useAuth from "hooks/useAuth";

const RoomAmenitiesTable: React.FC = () => {
  const Navigate = useNavigate();
  const { users } = useAuth();

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAmenityId, setSelectedAmenityId] = useState<number | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredAmenities, setFilteredAmenities] = useState<IRoomAmenity[]>(
    []
  );
  const [currentPage, setCurrentPage] = useState<number>(0);

  const {
    isLoading,
    data: roomAmenitiesList,
    refetch,
  } = useGetRoomAmenitiesQuery(
    {
      property_id: users?.defaultPropertyId,
    },
    {
      refetchOnMountOrArgChange: true,
      skip: false,
    }
  );
  const { data: amenitiesCategoriesList } = useGetRoomAmenitiesCategoryQuery(
    {
      property_id: users?.defaultPropertyId,
    },
    {
      refetchOnMountOrArgChange: true,
      skip: false,
    }
  );
  const [deleteRoomAmenity] = useDeleteRoomAmenityMutation();

  useEffect(() => {
    refetch();
  }, []);

  useEffect(() => {
    // Filter the amenities list based on the search query across multiple fields
    if (searchQuery === "") {
      setFilteredAmenities(roomAmenitiesList ?? []);
    } else {
      const filteredData = (roomAmenitiesList ?? []).filter((amenity) => {
        const categoryName = amenitiesCategoriesList?.find(
          (category) => category.id === amenity.category_id
        )?.name;

        return (
          amenity.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          categoryName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          amenity.description
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          amenity.charge.toString().includes(searchQuery.toLowerCase())
        );
      });
      setFilteredAmenities(filteredData ?? []);
      setCurrentPage(0);
    }
  }, [searchQuery, roomAmenitiesList]);

  const handleDeleteClick = (id: number) => {
    setSelectedAmenityId(id);
    setOpenDialog(true); // Open the confirmation dialog when delete is clicked
  };

  const handleDelete = async () => {
    if (selectedAmenityId !== null) {
      try {
        // Call the delete API
        await deleteRoomAmenity(selectedAmenityId).unwrap();

        // Close the dialog
        setOpenDialog(false);

        // Refetch the list to reflect changes
        refetch();
      } catch {
        /** empty catch error */
      }
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedAmenityId(null);
  };

  const columns: Column<IRoomAmenity>[] = [
    {
      field: "name",
      label: "Name",
      align: "center",
    },
    {
      field: "icon_path",
      label: "Icon",
      renderCell: (value: IRoomAmenity) => {
        return <DynamicIcon name={value.icon_path} />;
      },
    },
    {
      field: "category_id",
      label: "Category",
      align: "center",
      renderCell: (value: IRoomAmenity) => {
        const selectedAmenity = (amenitiesCategoriesList ?? []).find(
          (a) => a.id === value.category_id
        );
        return `${selectedAmenity?.name ?? ""}`;
      },
    },
    {
      field: "description",
      label: "Description",
    },
    {
      field: "featured",
      label: "Featured",
      renderCell: (value: IRoomAmenity) => (value.featured ? "Yes" : "No"),
    },
    {
      field: "additional_charge",
      label: "Additional Charge",
      renderCell: (value: IRoomAmenity) =>
        value.additional_charge ? "Yes" : "No",
    },
    {
      field: "charge",
      label: "Charge",
    },
    {
      field: "id",
      label: "Action",
      renderCell: (value: IRoomAmenity) => {
        return (
          <Box display="flex" alignItems="center" justifyContent="center">
            <IconButton
              aria-label="edit"
              color="primary"
              onClick={() =>
                Navigate(
                  `/booking-engine/admin/rooms-settings/edit/${value.id}`
                )
              }
            >
              <EditIcon />
            </IconButton>
            <IconButton
              aria-label="delete"
              color="error"
              onClick={() => handleDeleteClick(value.id)}
              style={{ marginLeft: "8px" }}
            >
              <DeleteIcon />
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
          label="Add Room Amenities"
          isLoading={isLoading}
          onClick={() => Navigate("/booking-engine/admin/rooms-settings/add")}
        />
      </Stack>
      <DataTable
        columns={columns}
        data={filteredAmenities ?? []}
        isLoading={isLoading}
        rowsPerPageOptions={[5, 10, 25]}
        initialRowsPerPage={10}
        currentPage={currentPage}
        onChangePage={(newPage: number) => setCurrentPage(newPage)}
      />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={openDialog}
        title="Confirm Deletion"
        description="Are you sure you want to delete this room amenity?"
        buttons={[
          { label: "Yes", onClick: handleDelete },
          { label: "No", onClick: handleDialogClose },
        ]}
        onClose={handleDialogClose}
      />
    </MainWrapper>
  );
};

export default RoomAmenitiesTable;

const MainWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  padding: "15px",
  margin: "15px 10px",
}));
