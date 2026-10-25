import React, { useEffect, useState } from "react";
import {
  Box,
  IconButton,
  Switch,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from "@mui/material";
import {
  useGetPostcodeDeptListQuery,
  useLazyGetPostingcodeListQueryQuery,
  useUpdatePostingCodeMutation,
} from "services/financeSlice";
import useAuth from "hooks/useAuth";
import { useNavigate } from "react-router-dom";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import { Add, Edit } from "@mui/icons-material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { IPostingCode } from "types/financialSettingTypes";
import { CommonPagination } from "utils/FilterComponent";

const PostingCodesList: React.FC = () => {
  const navigate = useNavigate();
  const { users } = useAuth();
  const propertyId = users?.defaultPropertyId ?? 1;
  const [getPostingcodeList, { data: postingCodeList }] =
    useLazyGetPostingcodeListQueryQuery();
  const [updatePostingCode] = useUpdatePostingCodeMutation();

  // State for confirmation dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [newStatus, setNewStatus] = useState(false);

  const { data: departmentsList } = useGetPostcodeDeptListQuery();

  useEffect(() => {
    if (propertyId) {
      getPostingcodeList({});
    }
  }, [propertyId, getPostingcodeList]);

  const handleEdit = (id: number) => {
    navigate(
      `/booking-engine/admin/financial-settings/posting-codes/edit/${id}`
    );
  };

  // Function to get department name by posting_code_department_id
  const getDepartmentName = (departmentId: number) => {
    const department = departmentsList?.find(
      (dept) => dept.id === departmentId
    );
    return department?.name || "";
  };

  const handleStatusChange = (id: number, newStatus: boolean) => {
    setSelectedId(id);
    setNewStatus(newStatus);
    setOpenDialog(true);
  };

  const handleConfirmStatusChange = async () => {
    if (selectedId === null) return;

    // Find the current posting code to preserve its values
    const currentPostingCode = postingCodeList?.find(
      (code) => code.id === selectedId
    );

    if (!currentPostingCode) return;

    try {
      await updatePostingCode({
        id: selectedId,
        is_active: newStatus,
        // Preserve other fields
        name: currentPostingCode.name,
        code: currentPostingCode.code,
        type: currentPostingCode.type,
        posting_code_department_id:
          currentPostingCode.posting_code_department_id,
        property_id: propertyId,
        adjustment: currentPostingCode.adjustment,
        description: currentPostingCode.description,
      });

      // Refresh the list
      getPostingcodeList({});
    } catch {
      /** empty catch error */
    }

    // Close the dialog
    handleCloseDialog();
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedId(null);
  };

  const columns: GridColDef<IPostingCode>[] = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "code", headerName: "Code", flex: 0.5 },
    { field: "type", headerName: "Type", flex: 1 },
    {
      field: "posting_code_department_id",
      headerName: "Department",
      flex: 1,
      valueGetter: getDepartmentName,
    },
    { field: "description", headerName: "Description", flex: 1.7 },
    {
      field: "is_active",
      headerName: "Status",
      flex: 0.6,
      renderCell: (params) => (
        <Switch
          checked={Boolean(params.value)}
          onChange={(e) => handleStatusChange(params.row.id, e.target.checked)}
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.7,
      align: "left",
      renderCell: (params) => (
        <>
          <IconButton size="small" onClick={() => handleEdit(params.row.id)}>
            <Edit fontSize="small" />
          </IconButton>
        </>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <PrimaryButton
          label="Add Posting Code"
          startIcon={<Add />}
          onClick={() =>
            navigate(
              "/booking-engine/admin/financial-settings/posting-codes/add"
            )
          }
        />
      </Box>
      <DataGrid
        rows={postingCodeList || []}
        columns={columns}
        autoHeight
        disableRowSelectionOnClick
        pageSizeOptions={[5, 10, 25]}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 10, page: 0 },
          },
        }}
        slots={{ pagination: CommonPagination }}
      />

      {/* Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {newStatus ? "Activate Posting Code" : "Deactivate Posting Code"}
        </DialogTitle>
        <DialogContent>
          Are you sure you want to {newStatus ? "activate" : "deactivate"} this
          posting code?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleConfirmStatusChange}
            color={newStatus ? "primary" : "error"}
            autoFocus
          >
            {newStatus ? "Activate" : "Deactivate"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PostingCodesList;
