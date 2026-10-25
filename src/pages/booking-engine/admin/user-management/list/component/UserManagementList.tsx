import React, { useEffect, useMemo, useState } from "react";
import {
  IconButton,
  Link,
  Stack,
  Tooltip,
  Switch,
  FormControlLabel,
  Box,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddHomeWorkIcon from "@mui/icons-material/AddHomeWork";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import DomainIcon from "@mui/icons-material/Domain";
import { IUserResponse } from "types/authTypes";
import Input from "components/elements/TextInput/TextInput";
import AssignRoleModal from "../../edit/component/AssignRoleModal";
import DataTable, { Column } from "components/elements/DataTable/DataTable";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import { useUpdateUserAttrMutation, useUsersQuery } from "services/userSlice";
import ConfirmationDialog from "components/elements/ConfirmationDialog/ConfirmationDialog";
// import AssignPropertyModal from "./AssignPropertyModal";
import AssignDepartmentModal from "./AssignDepartmentModal";
import AssignPropertyModal from "./AssignPropertyModal";

const UserManagementList: React.FC = () => {
  const { isLoading, data: userList, refetch } = useUsersQuery();
  const [updateUserAttr] = useUpdateUserAttrMutation();

  const [searchTerm, setSearchTerm] = useState<string>("");
  // Header filter switch: checked (right) => show INACTIVE users; unchecked (left) => show ACTIVE users
  const [showInactiveUsers, setShowInactiveUsers] = useState<boolean>(true);
  const [openRoleDialog, setOpenRoleDialog] = useState<boolean>(false);
  const [userId, setUsersId] = useState<number>(1);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [openPropertyDialog, setOpenPropertyDialog] = useState<boolean>(false);
  const [openDeptDialog, setOpenDeptDialog] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<IUserResponse | null>(null);
  const [statusUpdate, setStatusUpdate] = useState<{
    userId: number | null;
    isActive: boolean;
  }>({
    userId: null,
    isActive: false,
  });
  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (userId) {
      setSelectedUser(userList?.find((user) => user.id == userId) || null);
    }
  }, [userList]);

  const filteredUsers = useMemo(() => {
    return userList?.filter((user: IUserResponse) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        user.userName.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.userDepartment?.toLowerCase().includes(term) ||
        user.roles?.some(
          (role) =>
            role.name.toLowerCase().includes(term) ||
            role.description.toLowerCase().includes(term)
        );

      // Filter by active status based on toggle
      // Checked (right) => label "Show Inactive" => show ACTIVE list
      // Unchecked (left) => label "Show Active" => show INACTIVE list
      const matchesActiveFilter = showInactiveUsers
        ? user.isActive
        : !user.isActive;

      return matchesSearch && matchesActiveFilter;
    });
  }, [userList, searchTerm, showInactiveUsers]);

  const handleOpenRoleDialog = (id: number) => {
    setOpenRoleDialog(true);
    setUsersId(id);
  };

  const handleCloseRoleDialog = () => {
    setOpenRoleDialog(false);
  };

  const handleOpenPropertyDialog = (value: IUserResponse) => {
    setUsersId(value.id);
    setSelectedUser(value);
    setOpenPropertyDialog(true);
  };

  const handleClosePropertyDialog = () => {
    setOpenPropertyDialog(false);
    setSelectedUser(null);
  };

  const handleOpenDeptDialog = (value: IUserResponse) => {
    setUsersId(value.id);
    setSelectedUser(value);
    setOpenDeptDialog(true);
  };

  const handleCloseDeptDialog = () => {
    setOpenDeptDialog(false);
    setSelectedUser(null);
  };

  const handleStatusChange = (userId: number, isActive: boolean) => {
    setStatusUpdate({ userId, isActive: !isActive });
    setOpenDialog(true);
  };

  const handleConfirmYes = async () => {
    if (statusUpdate.userId !== null) {
      try {
        await updateUserAttr({
          id: statusUpdate.userId,
          data: { key: "is_active", value: statusUpdate.isActive },
        }).unwrap();
        refetch();
      } catch {
        /** empty catch error */
      } finally {
        handleDialogClose();
      }
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setStatusUpdate({ userId: null, isActive: false });
  };

  // Ensure header and table switches look identical
  const consistentSwitchSx = {
    "& .MuiSwitch-thumb": {
      backgroundColor: "#9e9e9e", // gray when OFF
    },
    "& .MuiSwitch-track": {
      backgroundColor: "#e0e0e0", // light gray when OFF
      opacity: 1,
    },
    "& .MuiSwitch-switchBase.Mui-checked .MuiSwitch-thumb": {
      backgroundColor: "#2e7d32", // dim green thumb ON
    },
    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
      backgroundColor: "#a5d6a7", // dim green track ON
      opacity: 1,
    },
  } as const;

  const columns: Column<IUserResponse>[] = [
    {
      field: "userName",
      label: "User Name",
      align: "center",
    },
    {
      field: "email",
      label: "Email",
      align: "center",
    },
    {
      field: "userDepartment",
      label: "Department",
      align: "center",
      renderCell: (value: IUserResponse) => {
        // Extract department names
        const departments =
          value.departments?.map((d) => d.department_name) || [];
        const displayText = departments.join(", ") || "-";

        // Truncate if text exceeds 30 characters
        const truncatedText =
          displayText.length > 30
            ? `${displayText.slice(0, 30)}...`
            : displayText;

        return (
          <Tooltip title={displayText} arrow placement="top">
            <span>{truncatedText}</span>
          </Tooltip>
        );
      },
    },

    // Inside your DataTable column definitions
    {
      field: "name",
      label: "Access",
      align: "center",
      renderCell: (value: IUserResponse) => {
        // Combine all roles into a single string
        const roles = value.roles?.map((a) => a.description) || [];
        const isFullAccess =
          roles.includes("Super User Access") || roles.includes("Admin Access");

        // Decide what text to show based on the roles
        const displayText = isFullAccess ? "Full Access" : roles.join(", ");

        // Truncate if text exceeds 30 characters
        const truncatedText =
          displayText.length > 30
            ? `${displayText.slice(0, 30)}...`
            : displayText;

        return (
          <Tooltip title={displayText} arrow placement="top">
            <span>{truncatedText}</span>
          </Tooltip>
        );
      },
    },

    {
      field: "isActive",
      label: "Active",
      align: "center",
      renderCell: (value: IUserResponse) => (
        <Switch
          checked={value.isActive}
          onChange={() => handleStatusChange(value.id, value.isActive)}
          color="default"
          size="small"
          inputProps={{ "aria-label": "status toggle" }}
          sx={consistentSwitchSx}
        />
      ),
    },
    {
      field: "id",
      label: "Action",
      align: "center",
      renderCell: (value: IUserResponse) => (
        <>
          <Tooltip title="Assign Properties">
            <IconButton
              aria-label="assign-properties"
              color="primary"
              onClick={() => handleOpenPropertyDialog(value)}
            >
              <AddHomeWorkIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Assign Departments">
            <IconButton
              aria-label="assign-dept"
              color="primary"
              onClick={() => handleOpenDeptDialog(value)}
            >
              <DomainIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Assign Role">
            <IconButton
              aria-label="assign-role"
              color="primary"
              onClick={() => handleOpenRoleDialog(value.id)}
            >
              <AssignmentIndIcon />
            </IconButton>
          </Tooltip>
          <Link href={`/booking-engine/admin/user-management/${value.id}`}>
            <Tooltip title="Edit">
              <IconButton aria-label="edit" color="primary">
                <EditIcon />
              </IconButton>
            </Tooltip>
          </Link>
        </>
      ),
    },
  ];

  return (
    <>
      <Stack
        flexDirection="row"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        pb={3}
        gap={2}
      >
        <Box sx={{ flex: 1, maxWidth: "300px" }}>
          <Input
            isInvalid={false}
            label="Search"
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search"
          />
        </Box>

        <Stack flexDirection="row" alignItems="center" gap={2}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#f8f9fa",
              borderRadius: "8px",
              padding: "8px 16px",
              border: "1px solid #e9ecef",
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={showInactiveUsers}
                  onChange={(e) => setShowInactiveUsers(e.target.checked)}
                  color="default"
                  size="small"
                  sx={consistentSwitchSx}
                />
              }
              label={
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    color: "#495057",
                    fontSize: "0.875rem",
                  }}
                >
                  {showInactiveUsers ? "Show Inactive" : "Show Active"}
                </Typography>
              }
              sx={{
                margin: 0,
                "& .MuiFormControlLabel-label": {
                  marginLeft: "8px",
                },
              }}
            />
          </Box>

          <Link href="/booking-engine/admin/user-management/add">
            <PrimaryButton
              buttonStyles={{
                backgroundColor: "#32A1AE",
                color: "#FFFFFF",
                fontWeight: "bold",
              }}
              label="Add User"
              isLoading={isLoading}
              loadingText="Loading..."
            />
          </Link>
        </Stack>
      </Stack>
      <DataTable
        columns={columns}
        data={filteredUsers ?? []}
        isLoading={isLoading}
        rowsPerPageOptions={[10, 20, 50, 100]}
        initialRowsPerPage={20}
      />
      <AssignRoleModal
        open={openRoleDialog}
        onClose={handleCloseRoleDialog}
        userId={userId}
        reFetchUser={refetch}
      />
      <ConfirmationDialog
        open={openDialog}
        title="Change Acitve Status"
        description="Are you sure you want to change this Users Acitve Status?"
        buttons={[
          { label: "Yes", onClick: handleConfirmYes },
          { label: "No", onClick: handleDialogClose },
        ]}
        onClose={handleDialogClose}
      />
      <AssignPropertyModal
        open={openPropertyDialog}
        onClose={handleClosePropertyDialog}
        reFetchUser={() => refetch()}
        selectedUser={selectedUser}
      />
      <AssignDepartmentModal
        open={openDeptDialog}
        onClose={handleCloseDeptDialog}
        reFetchUser={() => refetch()}
        selectedUser={selectedUser}
      />
    </>
  );
};

export default UserManagementList;
