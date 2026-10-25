import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { useRoleQuery } from "services/roleSlice";
import {
  useAssignUserRoleMutation,
  useRemoveUserRoleMutation,
  useGetUserByidMutation,
} from "services/userSlice";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/system";
interface AssignRoleModalProps {
  open: boolean;
  onClose: () => void;
  reFetchUser: () => void;
  userId: number;
}

const AssignRoleModal: React.FC<AssignRoleModalProps> = ({
  open,
  onClose,
  userId,
  reFetchUser,
}) => {
  const Navigate = useNavigate();

  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const { data: roleList } = useRoleQuery({});
  const [assignUserRole] = useAssignUserRoleMutation();
  const [removeUserRole] = useRemoveUserRoleMutation();
  const [getUserByid, { data: userDetails }] = useGetUserByidMutation();

  useEffect(() => {
    if (userId) {
      getUserByid({ id: userId.toString() });
    }
  }, [userId]);

  useEffect(() => {
    const ids = userDetails?.roles?.map((item) => item.id);
    setSelectedIds(ids || []);
  }, [userDetails]);

  const assignApiCall = async (id: number, isChecked: boolean) => {
    if (isChecked) {
      const data = {
        user: userId.toString(),
        roles: id.toString(),
      };
      const response = await assignUserRole(data);
      if (response.error) {
        return false;
      }
      Navigate("/booking-engine/admin/user-management");
      reFetchUser();
    } else {
      const data = {
        user: userId.toString(),
        roles: id.toString(),
      };
      const response = await removeUserRole(data);
      if (response.error) {
        return false;
      }
      reFetchUser();
      Navigate("/booking-engine/admin/user-management");
    }

    // You can implement your actual API call here, e.g., using fetch or axios
  };

  // Handle checkbox change
  const handleCheckboxChange =
    (id: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const isChecked = event.target.checked;

      // Update the selectedIds state (optional, for UI tracking)
      setSelectedIds((prevSelectedIds) =>
        isChecked
          ? [...prevSelectedIds, id]
          : prevSelectedIds.filter((selectedId) => selectedId !== id)
      );

      // Call the API with the checkbox id and its new state
      assignApiCall(id, isChecked);
    };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Assign Roles</DialogTitle>
      <DialogContent>
        <Box display={"grid"} gridTemplateColumns={"repeat(3, 1fr)"} gap={0.25}>
          {roleList?.map((item) => (
            <FormControlLabel
              key={item.id}
              control={
                <Checkbox
                  checked={selectedIds.includes(item.id)}
                  onChange={handleCheckboxChange(item.id)}
                />
              }
              label={item.name} // Display checkbox label
            />
          ))}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AssignRoleModal;
