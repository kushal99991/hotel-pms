"use client";
import { Controller, FormProvider, useForm } from "react-hook-form";
import React, { useCallback, useState } from "react";
import {
  Alert,
  Box,
  Grid,
  Checkbox,
  FormControlLabel,
  styled,
  Avatar,
  TextField,
} from "@mui/material";
import { yupResolver } from "@hookform/resolvers/yup";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import { useNavigate, useLocation } from "react-router-dom";
import { addRoomTypeSchema } from "utils/validations.utils";
import { IRoomTypeRequest } from "types/roomTypes";
import FormTextField from "components/forms/FormTextField";
import { useAddRoomTypeMutation } from "services/roomTypeSlice";
import FullScreenModal from "components/widgets/ModalWindows/FullScreenModal";
import FileUploader from "components/widgets/Files/FileUploader";
import { appConfig } from "config/app.config";
import { PhotoCamera } from "@mui/icons-material";
import RichTextEditor from "components/elements/RichTextEditor/RichTextEditor";
import useAuth from "hooks/useAuth";
import { RoomRentalTypes } from "constants/room";

const AddRoomType: React.FC = () => {
  const Navigate = useNavigate();
  const location = useLocation();
  const { users } = useAuth();
  const searchParams = new URLSearchParams(location.search);
  const property_id = searchParams.get("property_id");

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [viewModal, setViewModal] = useState<boolean>(false);
  const [addRoomType, { isLoading: isSubmitLoading }] =
    useAddRoomTypeMutation();

  const methods = useForm<IRoomTypeRequest>({
    mode: "all",
    resolver: yupResolver(addRoomTypeSchema),
    defaultValues: {
      name: "",
      type: "",
      type_description: "",
      size_area: "",
      adults: 0,
      children: 0,
      smoking: false,
      size_beds: 2,
      rental_type: RoomRentalTypes.GUEST_ROOM,
    },
  });

  const {
    handleSubmit,
    control,
    setError,
    setValue,
    formState: { errors },
    watch,
    reset,
  } = methods;
  const roomTypeIcon = watch("type_icon");

  const onUpdateImage = async (url: string) => {
    setViewModal(false);
    setValue("type_icon", url.replace(`${appConfig.mediaPath}/`, ""), {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const onSubmit = useCallback(
    async (data: IRoomTypeRequest) => {
      if (property_id) {
        data.property_id = property_id;
      } else {
        data.property_id = users?.defaultPropertyId?.toString() ?? "";
      }
      data.inventory = 0;
      data.occupancy = 0;
      const response = await addRoomType(data);
      if (response.error) {
        setError("root", {
          type: "manual",
          message: response.error as string,
        });
        setSuccessMessage(null);
        return false;
      }
      reset();
      setSuccessMessage("Room Type Added successfully!");
      setTimeout(() => {
        Navigate(
          `/booking-engine/admin/property/detail/${data.property_id}?type=room-configuration`
        );
      }, 1000);
    },
    [reset, Navigate, setError]
  );

  const handleAvatarClick = () => {
    setViewModal(true);
  };

  return (
    <FormProvider {...methods}>
      <Grid container style={{ height: "100vh" }}>
        <Grid item xs={12} md={8} p={2}>
          {errors?.root && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.root.message}
            </Alert>
          )}
          {successMessage && (
            <Alert
              severity="success"
              sx={{ mb: 2 }}
              data-testid="success-message"
            >
              {successMessage}
            </Alert>
          )}
          <Grid container spacing={2}>
            <FormTextField
              name="name"
              sm={6}
              label="Name"
              textFieldProps={{
                placeholder: "Enter Name",
                fullWidth: true,
              }}
              required
              gridProps={{ mb: 2 }}
            />
            <FormTextField
              name="type"
              sm={6}
              label="Room Type"
              textFieldProps={{
                placeholder: "Enter Room Type",
                fullWidth: true,
              }}
              required
              gridProps={{ mb: 2 }}
            />
            <Grid item xs={12}>
              <Controller
                name="type_description"
                control={control}
                render={({
                  field: { value, onChange },
                  fieldState: { invalid, isDirty, error },
                }) => (
                  <RichTextEditor
                    initialData={value}
                    isInvalid={invalid || !isDirty}
                    helperText={error?.message ?? ""}
                    initialLoading={false}
                    onChange={(data: string) => onChange(data)}
                  />
                )}
              />
            </Grid>
            <FormTextField
              name="adults"
              sm={6}
              label="Adults"
              textFieldProps={{
                fullWidth: true,
                placeholder: "Enter Adults",
                type: "number",
              }}
              required
            />
            <FormTextField
              name="children"
              sm={6}
              label="Children"
              textFieldProps={{
                fullWidth: true,
                placeholder: "Enter Children",
                type: "number",
              }}
              required
              gridProps={{ mb: 2 }}
            />

            <Grid
              item
              xs={12}
              sm={6}
              display="flex"
              gap={2}
              justifyContent="space-between"
              flexDirection="column"
            >
              <Controller
                name="size_beds"
                control={control}
                render={({
                  field: { onChange, value },
                  fieldState: { invalid, error },
                }) => {
                  return (
                    <TextField
                      fullWidth
                      error={invalid}
                      onChange={onChange}
                      value={value}
                      label="No. of Beds"
                      key="size_beds"
                      helperText={error?.message ?? ""}
                      inputProps={{
                        "data-testid": `No. of Beds-input`,
                      }}
                      placeholder="Enter No. of Beds"
                      type="number"
                    />
                  );
                }}
              />
            </Grid>
            <Grid item sm={12}>
              <Controller
                name="smoking"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={value}
                        onChange={(e) => onChange(e.target.checked)}
                      />
                    }
                    label="Smoking Allowed"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <StyledAvatarWrapper>
                {roomTypeIcon ? (
                  <StyledAvatar
                    alt={`${appConfig.mediaPath}/${roomTypeIcon}`}
                    variant="square"
                    src={`${appConfig.mediaPath}/${roomTypeIcon}`}
                    onClick={handleAvatarClick}
                  />
                ) : (
                  <Placeholder onClick={handleAvatarClick}>
                    Select Image
                  </Placeholder>
                )}
                <UploadIcon onClick={handleAvatarClick} />
              </StyledAvatarWrapper>
            </Grid>
            <Grid item sm={12}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="flex-end"
                gap={2}
              >
                <PrimaryButton
                  label="Back"
                  buttonStyles={{
                    backgroundColor: "#F5F5F5",
                    color: "#000",
                    fontWeight: "bold",
                  }}
                  isLoading={false}
                  type="button"
                  onClick={() =>
                    Navigate(
                      `/booking-engine/admin/property/detail/${property_id}?type=room-configuration`
                    )
                  }
                />
                <PrimaryButton
                  label="Add Room Type"
                  disabled={isSubmitLoading}
                  loadingText="Saving..."
                  isLoading={isSubmitLoading}
                  onClick={handleSubmit(onSubmit)}
                />
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <FullScreenModal
        title="Add Room Image"
        open={viewModal}
        onClose={() => setViewModal(false)}
      >
        <Box p={2}>
          <FileUploader
            keyPath={appConfig.getMediaKey(
              `room_type`,
              `p-${property_id ?? ""}`,
              "image"
            )}
            accept="image/*"
            title=""
            onUploadComplete={onUpdateImage}
            mode="drag-drop"
          />
        </Box>
      </FullScreenModal>
    </FormProvider>
  );
};
export default AddRoomType;
const StyledAvatarWrapper = styled(Box)<{ error?: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  width: 100%;
  height: 200px;
  border: ${({ error }) => (error ? "2px dashed red" : "1px dashed #BDBDBD")};
  background-color: #f9f9f9;
  transition: border-color 0.3s ease;

  &:hover {
    border-color: ${({ error }) => (error ? "red" : "#9E9E9E")};
  }
`;

const Placeholder = styled("div")({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  height: "100%",
  fontSize: "1.2rem",
  fontWeight: "bold",
  color: "#757575",
  textAlign: "center",
  paddingBottom: "3rem",
  paddingRight: "1rem",
});

const StyledAvatar = styled(Avatar)({
  display: "block",
  cursor: "pointer",
  width: "100%",
  height: "100%",
});

const UploadIcon = styled(PhotoCamera)({
  color: "#757575",
  position: "absolute",
  top: "50%",
  right: "50%",
  cursor: "pointer",
  "&:hover": {
    color: "#616161",
  },
});
