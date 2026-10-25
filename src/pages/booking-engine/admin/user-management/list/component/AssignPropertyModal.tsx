import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Chip,
  Stack,
  Avatar,
  Typography,
} from "@mui/material";
import { useGetPropertiesQuery } from "services/propertySlice";
import { useUserPropertyAssignMutation } from "services/userSlice";
import ComboBox, { TComboBoxOptions } from "components/widgets/Form/ComboBox";
import { IProperty } from "types/property";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import { IUserResponse } from "types/authTypes";
import { Link } from "react-router-dom";

interface AssignPropertyModalProps {
  open: boolean;
  onClose: () => void;
  selectedUser: IUserResponse | null;
  reFetchUser: () => void;
}

const AssignPropertyModal: React.FC<AssignPropertyModalProps> = ({
  open,
  onClose,
  selectedUser,
  reFetchUser,
}) => {
  const [selectedProperty, setSelectProperty] = useState<number | null>(null);
  const [propertyAccess, setPropertyAccess] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { data: propertyList } = useGetPropertiesQuery();
  const [userPropertyAssign, { isLoading: isAssignPropertyLoading }] =
    useUserPropertyAssignMutation();

  useEffect(() => {
    if (selectedUser) {
      const PA = (selectedUser?.propertyAccess ?? []).map((id) => Number(id));
      setPropertyAccess(PA);
    }
  }, [selectedUser]);

  const optionList: TComboBoxOptions[] = useMemo(() => {
    const dataT = (propertyList?.data ?? [])
      .filter(
        (property: IProperty) => !propertyAccess.includes(Number(property.id))
      )
      .map((property: IProperty) => ({
        label: property.name,
        id: property.id?.toString() ?? "",
      }));
    if (dataT.length > 0) {
      return [{ label: "Select Property", id: "" }, ...dataT];
    }
    return dataT;
  }, [propertyList, propertyAccess]);

  const selectProperty = useMemo(() => {
    return optionList.find((a) => a.id === selectedProperty?.toString());
  }, [optionList, selectedProperty]);

  const handleAddProperty = async () => {
    if (selectedProperty !== null && selectedUser) {
      const resp = await userPropertyAssign({
        user_id: selectedUser.id,
        property_id: selectedProperty,
        action: "ADD",
      });
      if (resp.error) {
        setError(resp.error as string);
        return false;
      }
      reFetchUser();
      setPropertyAccess(resp.data?.result ?? []);
      setSelectProperty(null);
      setError(null);
    }
  };

  const handleRemoveProperty = async (propertyId: number) => {
    if (selectedUser) {
      const resp = await userPropertyAssign({
        user_id: selectedUser.id,
        property_id: propertyId,
        action: "REMOVE",
      });
      if (resp.error) {
        setError(resp.error as string);
      }
      setPropertyAccess(resp.data?.result ?? []);
      setSelectProperty(null);
      reFetchUser();
      setError(null);
    }
  };

  const name = selectedUser?.userName ? `To ${selectedUser?.userName}` : "";
  const title = "Assign Properties " + name;

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
            label="Select Property"
            value={selectProperty ?? null}
            items={optionList}
            onChange={(event, selectedOption) =>
              setSelectProperty(Number(selectedOption?.id ?? 0))
            }
            width="100%"
          />
          <PrimaryButton
            isLoading={isAssignPropertyLoading}
            loadingText="Loading..."
            label="Assign Property"
            onClick={handleAddProperty}
            disabled={selectProperty === null}
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
          {propertyAccess.length === 0 ? (
            <Typography variant="body2" color="textSecondary">
              No properties assigned.
            </Typography>
          ) : (
            propertyAccess.map((propertyId) => {
              const selectedProperty = (propertyList?.data ?? []).find(
                (property) => property.id === propertyId
              );
              return (
                <Chip
                  key={propertyId}
                  avatar={
                    <Link
                      to={`/booking-engine/admin/property/detail/${propertyId}`}
                    >
                      <Avatar
                        src={selectedProperty?.logo ?? ""}
                        alt={selectedProperty?.name}
                        sx={{ width: 24, height: 24 }}
                        component="a"
                      >
                        {!selectedProperty?.logo &&
                          selectedProperty?.name?.[0]?.toUpperCase()}
                      </Avatar>
                    </Link>
                  }
                  label={
                    <Link
                      to={`/booking-engine/admin/property/detail/${propertyId}`}
                    >
                      {selectedProperty?.name ?? ""}
                    </Link>
                  }
                  onDelete={() => handleRemoveProperty(propertyId)}
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

export default AssignPropertyModal;
