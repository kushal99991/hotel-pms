import React, { useEffect, useState } from "react";
import {
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import useAuth from "hooks/useAuth";
import {
  useLazyGetPropertyQuery,
  useUpdatePropertyByIdMutation,
} from "services/propertySlice";
import useSnackbar from "hooks/useSnackbar";
import { IProperty } from "types/property";

interface Hold {
  id: string;
  hold_name: string;
  hold_key: string;
  value: number;
}

const AuthHoldList: React.FC = () => {
  const { users } = useAuth();
  const { openSnackbar } = useSnackbar();
  const [getProperty] = useLazyGetPropertyQuery();
  const [updateProperty, { isLoading }] = useUpdatePropertyByIdMutation();
  const [rows, setRows] = useState<Hold[]>([]);

  // dialog state
  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<Hold | null>(null);
  const [newValue, setNewValue] = useState<number | string>("");
  const [selectedProperty, setSelectedProperty] = useState<IProperty | null>(
    null
  );

  useEffect(() => {
    onRefresh();
  }, []);

  const onRefresh = async () => {
    if (users?.defaultPropertyId) {
      const response = await getProperty({
        id: users.defaultPropertyId?.toString(),
      });
      if (response?.error) {
        openSnackbar(response.error?.message as string, "error");
        return false;
      }

      const result = response?.data;

      if (result) {
        setSelectedProperty(result);
        const newRows: Hold[] = [];

        if (result.incidentals_per_night) {
          newRows.push({
            id: "2",
            hold_name: "Incidentals Per Night",
            hold_key: "incidentals_per_night",
            value: result.incidentals_per_night,
          });
        }

        setRows(newRows);
      }
    }
  };

  const handleEditClick = (row: Hold) => {
    setSelectedRow(row);
    setNewValue(row.value);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRow(null);
    setNewValue("");
  };

  const handleSave = async () => {
    if (!selectedRow) return;

    if (selectedProperty?.id) {
      const response = await updateProperty({
        id: selectedProperty.id,
        data: {
          [selectedRow.hold_key]: newValue,
          name: selectedProperty.name,
          description: selectedProperty.description,
        },
      });
      if (response?.error) {
        openSnackbar(
          `Failed to update ${selectedRow.hold_name}. Please try again.`,
          "error"
        );
        return false;
      }
      onRefresh();
      openSnackbar(`${selectedRow.hold_name} updated successfully.`, "success");

      handleClose();
    }
  };

  const columns: GridColDef[] = [
    { field: "hold_name", headerName: "Hold Name", flex: 1 },
    { field: "hold_key", headerName: "Hold Key", flex: 1 },
    { field: "value", headerName: "Value", flex: 1 },
    {
      field: "action",
      headerName: "Action",
      flex: 0.5,
      renderCell: (params) => (
        <IconButton onClick={() => handleEditClick(params.row)}>
          <EditIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <Box mt={2}>
      <DataGrid
        autoHeight
        rows={rows}
        columns={columns}
        pageSizeOptions={[10]}
        disableRowSelectionOnClick
      />

      {/* Edit Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Update {selectedRow?.hold_name}</DialogTitle>
        <DialogContent>
          <Box mt={1}>
            <TextField
              fullWidth
              label={selectedRow?.hold_name}
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              type="number"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            color="primary"
            disabled={isLoading}
            startIcon={
              isLoading ? <CircularProgress size={18} color="inherit" /> : null
            }
          >
            {isLoading ? "Updating..." : "Update"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AuthHoldList;
