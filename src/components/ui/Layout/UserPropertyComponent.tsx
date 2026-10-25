import React, { useState } from "react";
import {
  Box,
  Typography,
  Modal,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  SelectChangeEvent,
  styled,
} from "@mui/material";

import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import useAuth from "hooks/useAuth";
import { useUpdateUserAttrMutation } from "services/userSlice";

const UserPropertyComponent = (props: {
  displayItem: boolean;
  closeItem: () => void;
}) => {
  const { users, properties, onRefreshToken } = useAuth();
  const [userProperty, setUserProperty] = useState<string>(
    users?.defaultPropertyId?.toString() || ""
  );

  const [updateUserAttr] = useUpdateUserAttrMutation();

  const handlePropertyChange = (e: SelectChangeEvent<string>) => {
    setUserProperty(e.target.value);
  };

  const { closeItem, displayItem } = props;
  // TODO: Fetch this on long once so you dont have to hit the database every reload
  const handleSaveProperty = async () => {
    const response = await updateUserAttr({
      id: users?.id ?? 0,
      data: {
        key: "default_property_id",
        value: userProperty,
      },
    });
    if (response.error) {
      return false;
    }
    onRefreshToken();
    closeItem();
  };

  const handleCancelPropertyChange = () => {
    closeItem();
  };

  return (
    <>
      {/* Modal for changing user property */}
      <StyledModal
        open={displayItem}
        onClose={handleCancelPropertyChange}
        aria-labelledby="change-property-modal"
        aria-describedby="select-new-property"
      >
        <ModalContent>
          <Typography variant="h6" gutterBottom>
            Change Property
          </Typography>
          <FormControl fullWidth>
            <InputLabel id="property-select-label">Property</InputLabel>
            <Select
              labelId="property-select-label"
              value={userProperty}
              label="Property"
              onChange={handlePropertyChange}
            >
              {(properties ?? [])
                .filter((option) => {
                  const isRootUser =
                    (users?.userName ?? "").toLowerCase() === "root";
                  const isSudoUser = (users?.roles ?? []).some(
                    (r) => (r?.name ?? "").toLowerCase() === "sudo"
                  );
                  if (isRootUser || isSudoUser) return true; // bypass
                  return (users?.propertyAccess ?? []).includes(
                    Number(option.id)
                  );
                })
                .map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <ButtonContainer>
            <Button
              variant="contained"
              onClick={handleCancelPropertyChange}
              startIcon={<CloseIcon />}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={handleSaveProperty}
              startIcon={<CheckIcon />}
            >
              Change
            </Button>
          </ButtonContainer>
        </ModalContent>
      </StyledModal>
    </>
  );
};

export default UserPropertyComponent;

const StyledModal = styled(Modal)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const ModalContent = styled(Box)({
  backgroundColor: "white",
  padding: "20px",
  width: 300,
  borderRadius: "8px",
  boxShadow: "24px",
});

const ButtonContainer = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  marginTop: "16px",
});
