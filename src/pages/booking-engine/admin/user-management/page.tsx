import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Button,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import EditUserForm from "./_components/UserCard/UserEditForm";
import UserDetails from "./_components/UserCard/UserDetails";
import AddUserModal from "./_components/AddUserModal";
import AddRoleModal from "./_components/AddRoleModal";

const mockUsers = [
  { name: "John Doe", email: "john.doe@example.com", details: "User Detail 1" },
  {
    name: "Jane Smith",
    email: "jane.smith@example.com",
    details: "User Detail 2",
  },
  {
    name: "Alice Johnson",
    email: "alice.johnson@example.com",
    details: "User Detail 3",
  },
];

const UserAdmin: React.FC = () => {
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [editMode, setEditMode] = useState<number | null>(null);
  const [snackbarState, setSnackbarState] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [openRoleDialog, setOpenRoleDialog] = useState(false);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleEditClick = (index: number) => {
    setEditMode(index);
  };

  const handleCancelClick = () => {
    setEditMode(null);
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number
  ) => {
    const { name, value } = event.target;
    setUsers((prevUsers) =>
      prevUsers.map((user, i) =>
        i === index ? { ...user, [name]: value } : user
      )
    );
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEditMode(null);
    setSnackbarState({
      open: true,
      message: "User details updated successfully!",
      severity: "success",
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbarState((prevState) => ({ ...prevState, open: false }));
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenUserDialog = () => {
    setOpenUserDialog(true);
  };

  const handleCloseUserDialog = () => {
    setOpenUserDialog(false);
  };

  const handleOpenRoleDialog = () => {
    setOpenRoleDialog(true);
  };

  const handleCloseRoleDialog = () => {
    setOpenRoleDialog(false);
  };

  const handleSaveUser = () => {
    setOpenUserDialog(false);
    setSnackbarState({
      open: true,
      message: "User added successfully!",
      severity: "success",
    });
  };

  const handleSaveRole = () => {
    setOpenRoleDialog(false);
    setSnackbarState({
      open: true,
      message: "Role added successfully!",
      severity: "success",
    });
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        User Admin
      </Typography>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Box display="flex" alignItems="center">
          <TextField
            variant="outlined"
            placeholder="Search"
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </Box>
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenRoleDialog}
          >
            Add Role
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            sx={{ ml: 2 }}
            onClick={handleOpenUserDialog}
          >
            Add User
          </Button>
        </Box>
      </Box>
      <Grid container spacing={2}>
        {filteredUsers.map((user, index) => (
          <Grid item xs={12} key={index}>
            {editMode === index ? (
              <EditUserForm
                user={user}
                handleChange={(event) => handleChange(event, index)}
                handleSubmit={(event) => handleSubmit(event)}
                handleCancelClick={handleCancelClick}
              />
            ) : (
              <UserDetails
                user={user}
                handleEditClick={() => handleEditClick(index)}
              />
            )}
          </Grid>
        ))}
      </Grid>
      <Snackbar
        open={snackbarState.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarState.severity}>
          {snackbarState.message}
        </Alert>
      </Snackbar>
      <AddUserModal
        open={openUserDialog}
        onClose={handleCloseUserDialog}
        onSave={handleSaveUser}
      />
      <AddRoleModal
        open={openRoleDialog}
        onClose={handleCloseRoleDialog}
        onSave={handleSaveRole}
      />
    </Container>
  );
};

export default UserAdmin;
