import React, { useEffect, useState } from "react";
import {
  Box,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from "@mui/material";
import {
  useGetPostcodeDeptListQuery,
  useDeletePostcodeDeptMutation,
} from "services/financeSlice";
import { useNavigate } from "react-router-dom";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import { Add, Edit, DeleteOutline } from "@mui/icons-material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { IPostingCodeDept } from "types/financialSettingTypes";
import { CommonPagination } from "utils/FilterComponent";

const PostingCodeDeptList: React.FC = () => {
  const navigate = useNavigate();
  const { data: departmentsList, refetch } = useGetPostcodeDeptListQuery();
  const [deletePostcodeDept] = useDeletePostcodeDeptMutation();

  // State for confirmation dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleEdit = (id: number) => {
    navigate(
      `/booking-engine/admin/financial-settings/posting-code-departments/edit/${id}`
    );
  };

  const handleDeleteConfirm = (id: number) => {
    setSelectedId(id);
    setOpenDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedId === null) return;

    try {
      await deletePostcodeDept({ id: selectedId });
      // Refresh the list
      refetch();
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

  const columns: GridColDef<IPostingCodeDept>[] = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "code", headerName: "Code", flex: 1 },
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
          <IconButton
            size="small"
            title="Delete"
            onClick={() => handleDeleteConfirm(params.row.id)}
          >
            <DeleteOutline fontSize="small" color="error" />
          </IconButton>
        </>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <PrimaryButton
          label="Add Department"
          startIcon={<Add />}
          onClick={() =>
            navigate(
              "/booking-engine/admin/financial-settings/posting-code-departments/add"
            )
          }
        />
      </Box>
      <DataGrid
        rows={departmentsList || []}
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
        <DialogTitle id="alert-dialog-title">Delete Department</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this department? This action cannot be
          undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PostingCodeDeptList;
