import React, { useEffect, useState } from "react";
import { Alert, Box, IconButton, Link, Stack, styled } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  useGetFeesListQuery,
  useDeleteFeeByidMutation,
} from "services/financeSlice";
import { IFeesTypes } from "types/financialSettingTypes";
import Input from "components/elements/TextInput/TextInput";
import ConfirmationDialog from "components/elements/ConfirmationDialog/ConfirmationDialog";
import DataTable, { Column } from "components/elements/DataTable/DataTable";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import useAuth from "hooks/useAuth";

const FeesList: React.FC = () => {
  const { users } = useAuth();
  const {
    isLoading,
    data: financeList,
    refetch,
  } = useGetFeesListQuery({
    property_id: users?.defaultPropertyId ?? 1,
  });
  const [deleteFeesByid] = useDeleteFeeByidMutation();
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTaxId, setSelectedTaxId] = useState<number | null>(null);

  const filteredTaxes = financeList?.filter((fee: IFeesTypes) => {
    const term = searchTerm.toLowerCase();
    return (
      fee?.name?.toLowerCase().includes(term) ||
      fee?.rate?.toLowerCase().includes(term) ||
      fee?.occurrence?.toLowerCase().includes(term) ||
      fee?.description?.toLowerCase().includes(term)
    );
  });

  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleDelete = async () => {
    if (selectedTaxId === null) return;

    setErrorMessage("");
    const response = await deleteFeesByid({ id: selectedTaxId });
    if (response.error) {
      setErrorMessage(response.error.message || "Failed to Delete Fee");
    } else {
      refetch();
    }
    setOpenDialog(false);
    setSelectedTaxId(null);
  };

  const handleDialogOpen = (id: number) => {
    setSelectedTaxId(id);
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedTaxId(null);
  };

  const columns: Column<IFeesTypes>[] = [
    {
      field: "name",
      label: "Name",
      align: "center",
    },
    {
      field: "rate",
      label: "Rate",
      align: "center",
      renderCell: (value: IFeesTypes) => value?.versions?.[0]?.rate,
    },
    {
      field: "description",
      label: "Description",
      align: "center",
    },
    {
      field: "occurrence",
      label: "Occurrence",
      align: "center",
    },
    {
      field: "starts_from",
      label: "Start Date",
      align: "center",
      renderCell: (value: IFeesTypes) => value?.versions?.[0]?.starts_from,
    },
    {
      field: "id",
      label: "Action",
      align: "center",
      renderCell: (value: IFeesTypes) => {
        return (
          <>
            <Link
              href={`/booking-engine/admin/financial-settings/fee/${value.id}`}
            >
              <IconButton aria-label="edit" color="primary">
                <EditIcon />
              </IconButton>
            </Link>
            <IconButton
              onClick={() => handleDialogOpen(Number(value.id))}
              aria-label="delete"
              color="primary"
            >
              <DeleteIcon />
            </IconButton>
          </>
        );
      },
    },
  ];

  return (
    <MainWrapper>
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}
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
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search"
        />
        <Link href="/booking-engine/admin/financial-settings/fees/add">
          <PrimaryButton
            buttonStyles={{
              backgroundColor: "#32A1AE",
              color: "#FFFFFF",
              fontWeight: "bold",
            }}
            label="Add Fee"
            isLoading={isLoading}
          />
        </Link>
      </Stack>
      <DataTable
        columns={columns}
        data={filteredTaxes ?? []}
        isLoading={isLoading}
        rowsPerPageOptions={[5, 10, 25]}
        initialRowsPerPage={10}
      />
      <ConfirmationDialog
        open={openDialog}
        title="Confirm Deletion"
        description="Are you sure you want to delete this Fee?"
        buttons={[
          { label: "Yes", onClick: handleDelete },
          { label: "No", onClick: handleDialogClose },
        ]}
        onClose={handleDialogClose}
      />
    </MainWrapper>
  );
};

export default FeesList;

const MainWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  padding: "15px",
  margin: "5px 5px",
}));
