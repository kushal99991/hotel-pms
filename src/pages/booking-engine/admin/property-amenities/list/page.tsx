import React, { useEffect, useState } from "react";
import { Box, IconButton, Stack, styled } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

import Input from "components/elements/TextInput/TextInput";
import DataTable, { Column } from "components/elements/DataTable/DataTable";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import { useGetPropertyAmenitiesQuery } from "services/propertySlice";
import { IAmenityAssignedProperty } from "types/property";
import { useNavigate } from "react-router-dom";
import DynamicIcon from "components/ui/DynamicIcon/DynamicIcon";

const PropertyAmenitiesTable: React.FC = () => {
  const Navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(0);

  const {
    isLoading,
    data: propertyAmenitiesList,
    refetch,
  } = useGetPropertyAmenitiesQuery();

  useEffect(() => {
    refetch();
  }, []);

  const handleSearchChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const searchQuery = e.target.value;
    setCurrentPage(0);

    setSearchTerm(searchQuery.toLowerCase());
  };

  const columns: Column<IAmenityAssignedProperty>[] = [
    {
      field: "name",
      label: "Name",
    },
    {
      field: "icon_path",
      label: "Icon",
      renderCell: (value: IAmenityAssignedProperty) => {
        return value?.icon_path ? <DynamicIcon name={value.icon_path} /> : "-";
      },
    },
    {
      field: "description",
      label: "Description",
    },
    {
      field: "additional_charge",
      label: "Type",
      renderCell: (value: IAmenityAssignedProperty) => {
        const labels: string[] = [];

        if (value?.additional_charge) {
          labels.push("Additional Charge");
        }

        if (value?.featured) {
          labels.push("Featured");
        }
        return labels.join(", ");
      },
    },
    {
      field: "category",
      label: "Category Name",
      renderCell: (value: IAmenityAssignedProperty) =>
        `${value?.category?.name ?? ""}`,
    },
    {
      field: "id",
      label: "Action",
      renderCell: (value: IAmenityAssignedProperty) => {
        return (
          <>
            <IconButton
              aria-label="edit"
              color="primary"
              onClick={() => {
                Navigate(
                  `/booking-engine/admin/property-amenities/edit/${value.id}`
                );
              }}
            >
              <EditIcon />
            </IconButton>
          </>
        );
      },
    },
  ];

  // Filter the data based on search term
  const filteredData = propertyAmenitiesList?.filter(
    (amenity) =>
      amenity.name.toLowerCase().includes(searchTerm) ||
      amenity.description?.toLowerCase().includes(searchTerm) ||
      amenity.category?.name?.toLowerCase().includes(searchTerm)
  );

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
          onChange={handleSearchChange}
          placeholder="Search"
        />
        <PrimaryButton
          buttonStyles={{
            backgroundColor: "#32A1AE",
            color: "#FFFFFF",
            fontWeight: "bold",
          }}
          onClick={() =>
            Navigate(`/booking-engine/admin/property-amenities/add`)
          }
          label="Add Amenities"
          isLoading={isLoading}
        />
      </Stack>
      <DataTable
        columns={columns}
        data={filteredData ?? []}
        isLoading={isLoading}
        rowsPerPageOptions={[5, 10, 25]}
        initialRowsPerPage={10}
        currentPage={currentPage}
        onChangePage={(newPage: number) => setCurrentPage(newPage)}
      />
    </MainWrapper>
  );
};

export default PropertyAmenitiesTable;

const MainWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  padding: "15px",
  margin: "15px 10px",
}));
