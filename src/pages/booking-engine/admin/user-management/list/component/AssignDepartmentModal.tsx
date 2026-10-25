import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import { useGetDepartmentQuery } from "services/departmentSlice";
import {
  useUserDepartmentAssignMutation,
  useUserDepartmentRemoveMutation,
} from "services/userSlice";
import ComboBox, { TComboBoxOptions } from "components/widgets/Form/ComboBox";
import { Department } from "types/authTypes";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import { IUserResponse } from "types/authTypes";
import useAuth from "hooks/useAuth";

interface AssignDepartmentModalProps {
  open: boolean;
  onClose: () => void;
  selectedUser: IUserResponse | null;
  reFetchUser: () => void;
}

const AssignDepartmentModal: React.FC<AssignDepartmentModalProps> = ({
  open,
  onClose,
  selectedUser,
  reFetchUser,
}) => {
  const { users } = useAuth();
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(
    null
  );
  const [departmentAccess, setDepartmentAccess] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { data: departmentList } = useGetDepartmentQuery(
    {
      property_id: users?.defaultPropertyId,
    },
    {
      refetchOnMountOrArgChange: true,
      skip: false,
    }
  );
  const [userDepartmentAssign, { isLoading: isAssignDepartmentLoading }] =
    useUserDepartmentAssignMutation();
  const [userDepartmentRemove] = useUserDepartmentRemoveMutation();

  useEffect(() => {
    if (selectedUser) {
      const DA = selectedUser.departments?.map((dept) => dept.id) ?? [];
      setDepartmentAccess(DA);
    }
  }, [selectedUser]);

  const optionList: TComboBoxOptions[] = useMemo(() => {
    const dataT = (departmentList?.data ?? [])
      .filter(
        (department: Department) =>
          !departmentAccess.includes(Number(department.id))
      )
      .map((department: Department) => ({
        label: department?.department_name,
        id: department.id?.toString() ?? "",
      }));
    if (dataT.length > 0) {
      return [{ label: "Select Department", id: "" }, ...dataT];
    }
    return dataT;
  }, [departmentList, departmentAccess]);

  const selectDepartment = useMemo(() => {
    return optionList.find((a) => a.id === selectedDepartment?.toString());
  }, [optionList, selectedDepartment]);

  const handleAddDepartment = async () => {
    if (selectedDepartment !== null && selectedUser) {
      const resp = await userDepartmentAssign({
        user_id: selectedUser.id,
        department_id: selectedDepartment,
      }).unwrap();

      if (resp.error) {
        setError(resp.error as string);
        return false;
      }
      reFetchUser();
      setSelectedDepartment(null);
      setError(null);
    }
  };

  const handleRemoveDepartment = async (departmentId: number) => {
    if (selectedUser) {
      const resp = await userDepartmentRemove({
        user_id: selectedUser.id,
        department_id: departmentId,
      }).unwrap();

      if (resp.error) {
        setError(resp.error as string);
        return false;
      }

      setSelectedDepartment(null);
      reFetchUser();
      setError(null);
    }
  };

  const name = selectedUser?.userName ? `To ${selectedUser?.userName}` : "";
  const title = "Assign Departments " + name;

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          flexDirection="row"
          gap={2}
        >
          <ComboBox
            label="Select Department"
            value={selectDepartment ?? null}
            items={optionList}
            onChange={(event, selectedOption) =>
              setSelectedDepartment(Number(selectedOption?.id ?? 0))
            }
            width="100%"
          />
          <PrimaryButton
            isLoading={isAssignDepartmentLoading}
            loadingText="Loading..."
            label="Assign Department"
            onClick={handleAddDepartment}
            disabled={selectDepartment === null}
            sx={{ textTransform: "initial" }}
          />
        </Stack>
        {error && (
          <Typography color="error" variant="body2" mt={2}>
            {error}
          </Typography>
        )}
        <Stack
          display="flex"
          alignItems="center"
          justifyContent="flex-start"
          flexDirection="row"
          flexWrap="wrap"
          gap={1.5}
          mt={2}
        >
          {departmentAccess.length === 0 ? (
            <Typography variant="body2" color="textSecondary">
              No departments assigned.
            </Typography>
          ) : (
            departmentAccess.map((departmentId) => {
              const selectedDepartment = (departmentList?.data ?? []).find(
                (department) => department.id == departmentId
              );

              return (
                <Chip
                  key={departmentId}
                  label={selectedDepartment?.department_name ?? ""}
                  onDelete={() => handleRemoveDepartment(departmentId)}
                  clickable
                  sx={{
                    padding: "4px 8px",
                    fontSize: "0.875rem",
                    backgroundColor: "#f5f5f5",
                    "& .MuiChip-label": {
                      padding: "0 8px",
                    },
                  }}
                />
              );
            })
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default AssignDepartmentModal;
