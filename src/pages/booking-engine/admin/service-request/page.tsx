import React, { useState, useEffect } from "react";
import { Box, IconButton, Stack, styled, Tooltip } from "@mui/material";

import Input from "components/elements/TextInput/TextInput";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import ConfirmationDialog from "components/elements/ConfirmationDialog/ConfirmationDialog";
import {
  useDeleteServiceRequestMutation,
  useServiceRequestQuery,
} from "services/serviceRequestSlice";
import { IServiceRequest } from "types/serviceRequestTypes";
import { useLazyGetPostingcodeListQueryQuery } from "services/financeSlice";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import useSnackbar from "hooks/useSnackbar";
import useAuth from "hooks/useAuth";

const ServiceRequestTable: React.FC = () => {
  const Navigate = useNavigate();
  const { openSnackbar } = useSnackbar();
  const { users } = useAuth();

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState<string>("");

  const {
    isLoading,
    data: serivceRequestList,
    refetch,
  } = useServiceRequestQuery({
    property_id: users?.defaultPropertyId,
  });
  const [getPostingcodeList, { data: postingCodeList }] =
    useLazyGetPostingcodeListQueryQuery();
  const [deleteServiceRequest] = useDeleteServiceRequestMutation();

  useEffect(() => {
    refetch();
    getPostingcodeList({});
  }, []);

  const filteredRows = serivceRequestList?.filter((row) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      row.request.toLowerCase().includes(searchLower) ||
      row.description.toLowerCase().includes(searchLower) ||
      row.rate.toString().toLowerCase().includes(searchLower)
    );
  });

  const handleDelete = async () => {
    if (selectedServiceId !== null) {
      try {
        const response = await deleteServiceRequest({ id: selectedServiceId });
        if (response.error) {
          openSnackbar(response.error as string, "error");
          return false;
        }
        refetch();
        setOpenDialog(false);
        setSelectedServiceId(null);
        openSnackbar(
          `Service Request has been deleted successfully!`,
          "success"
        );
      } catch (error) {
        openSnackbar(`Failed to delete Service Request: ${error}`, "error");
      }
    }
  };

  const handleDialogOpen = (id: number) => {
    setSelectedServiceId(id);
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedServiceId(null);
  };

  const columns: GridColDef<IServiceRequest>[] = [
    {
      field: "request",
      headerName: "Name",
      flex: 1,
      minWidth: 100,
      filterable: false,
    },
    {
      field: "rate",
      headerName: "Rate",
      flex: 1,
      minWidth: 100,
      filterable: false,
      renderCell: (params) =>
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(params.row.rate),
    },
    {
      field: "posting_code_id",
      headerName: "Posting Code",
      flex: 1,
      minWidth: 100,
      filterable: false,
      renderCell: (value) => {
        const selectedPostingCode = (postingCodeList ?? []).find(
          (a) => a.id === value.row.posting_code_id
        );

        const postingCodeDeptName = `${selectedPostingCode?.code} - ${selectedPostingCode?.name}`;
        return postingCodeDeptName ?? value?.row?.posting_code_id;
      },
    },
    {
      field: "description",
      headerName: "Description",
      flex: 1,
      minWidth: 100,
      filterable: false,
    },
    // {
    //   field: "status",
    //   headerName: "Status",
    //   flex: 1,
    //   minWidth: 100,
    //   filterable: false,
    // },
    {
      field: "id",
      headerName: "Action",
      flex: 1,
      minWidth: 100,
      filterable: false,
      sortable: false,
      editable: false,
      renderCell: (params) => (
        <Box display="flex" gap={1}>
          <Tooltip title="Edit">
            <IconButton
              onClick={() =>
                Navigate(
                  `/booking-engine/admin/service-request/${params.row.id}/edit`
                )
              }
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton onClick={() => handleDialogOpen(params.row.id)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
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
          label="Add Guest Request"
          isLoading={isLoading}
          onClick={() => Navigate("/booking-engine/admin/service-request/add")}
        />
      </Stack>
      <DataGrid
        getRowId={(row) => row.id}
        rows={filteredRows ?? []}
        loading={isLoading}
        columns={columns}
        pageSizeOptions={[5, 10, 25]}
        autoHeight
        checkboxSelection={false}
      />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={openDialog}
        title="Confirm Deletion"
        description={`Are you sure you want to delete #${selectedServiceId} service request?`}
        buttons={[
          { label: "Yes", onClick: handleDelete },
          { label: "No", onClick: handleDialogClose },
        ]}
        onClose={handleDialogClose}
      />
    </MainWrapper>
  );
};

export default ServiceRequestTable;

const MainWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  padding: "15px",
  margin: "15px 10px",
}));
