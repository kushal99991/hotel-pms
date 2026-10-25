import { Controller, FormProvider, useForm } from "react-hook-form";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Grid,
  Checkbox,
  FormControlLabel,
  TextField,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { yupResolver } from "@hookform/resolvers/yup";

import PrimaryButton from "components/elements/Button/PrimaryButton";

import { useNavigate, useLocation, useParams } from "react-router-dom";
import { addRoomTypeSchema } from "utils/validations.utils";
import { IRoomTypeRequest } from "types/roomTypes";
import FormTextField from "components/forms/FormTextField";
import {
  useGetRoomTypeByIdMutation,
  useUpdateRoomTypeMutation,
} from "services/roomTypeSlice";
import FileUploader from "components/widgets/Files/FileUploader";
import { appConfig } from "config/app.config";
import RichTextEditor from "components/elements/RichTextEditor/RichTextEditor";
import { useDeleteMediaMutation } from "services/propertyMediaSlice";
import ImageSlider from "components/elements/ImageSlider/ImageSlider";
import SecondaryButton from "components/elements/Button/SecondaryButton";
import ImageList from "../component/ImageList";
import { RoomRentalTypes } from "constants/room";

const EditRoomType: React.FC = () => {
  const Navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const params = useParams<{ id: string }>();

  const searchParams = new URLSearchParams(location.search);
  const property_id = searchParams.get("property_id");

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [mediaList, setMediaList] = useState<string[]>([]);
  const [currentSlider, setCurrentSlider] = useState<number | null>(null);
  const [isSliderOpen, setSliderOpen] = useState<boolean>(false);

  const [
    getRoomTypeById,
    { data: roomTypeDetail, isLoading: roomDetailLoading },
  ] = useGetRoomTypeByIdMutation();
  const [updateRoomType, { isLoading: isSubmitLoading }] =
    useUpdateRoomTypeMutation();
  const [deleteMedia] = useDeleteMediaMutation();

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
    formState: { errors },
    reset,
    setValue,
    watch,
  } = methods;
  const typeIcon = watch("type_icon");

  useEffect(() => {
    if (params?.id) {
      getRoomTypeById({ id: params.id });
    }
  }, [params]);

  useEffect(() => {
    if (roomTypeDetail) {
      reset({
        id: roomTypeDetail.id,
        name: roomTypeDetail.name ?? "",
        type: roomTypeDetail.type ?? "",
        type_description: roomTypeDetail.typeDescription ?? "",
        size_area: roomTypeDetail.sizeArea ?? "",
        adults: roomTypeDetail.adults ?? 0,
        children: roomTypeDetail.children ?? 0,
        smoking: roomTypeDetail.smoking ?? false,
        size_beds: roomTypeDetail.sizeBeds ?? 2,
        property_id: roomTypeDetail?.propertyId?.toString(),
        type_icon: roomTypeDetail.typeIcon ?? "",
        rental_type: roomTypeDetail.rentalType,
      });
      if (roomTypeDetail?.image && roomTypeDetail?.image?.length > 0) {
        setMediaList(roomTypeDetail.image);
      }
    }
  }, [roomTypeDetail]);

  const onUpdateImage = async (url: string) => {
    const newImageUrl = url.replace(`${appConfig.mediaPath}/`, "");
    setMediaList((prev) => [...prev, newImageUrl]);
  };

  const onSubmit = useCallback(
    async (data: IRoomTypeRequest) => {
      if (property_id) {
        data.property_id = property_id;
      }
      const otherImages = mediaList ?? [];
      if (otherImages?.length > 0) {
        data.image = otherImages.join(",");
      } else {
        data.image = null;
      }
      const existingImages = roomTypeDetail?.image ?? [];
      const imagesToDelete = existingImages.filter(
        (img) => !otherImages.includes(img)
      );
      // Delete images that are no longer part of otherImages
      for (const url of imagesToDelete) {
        await deleteMedia({ url });
      }

      data.id = Number(params.id);
      const response = await updateRoomType(data);
      if (response.error) {
        setError("root", {
          type: "manual",
          message: response.error as string,
        });
        setSuccessMessage(null);
        return false;
      }
      reset();
      setSuccessMessage("Room Type updated successfully!");
      setTimeout(() => {
        Navigate(
          `/booking-engine/admin/property/detail/${data.property_id}?type=room-configuration`
        );
      }, 1000);
    },
    [reset, Navigate, setError, roomTypeDetail, mediaList]
  );

  const handleSliderOpen = useCallback((currentIndex: number) => {
    setSliderOpen(true);
    setCurrentSlider(currentIndex);
  }, []);

  const handleDeleteImage = async (index: number) => {
    if (index === 0) {
      setValue("type_icon", "", {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    }
    const updatedMediaList = mediaList.filter((_, i) => i !== index);
    setMediaList(updatedMediaList);
  };
  const handleSetPrimaryImage = useCallback(
    (index: number) => {
      const updatePrimaryImage = mediaList.find((_, i) => i === index);
      if (updatePrimaryImage) {
        setValue("type_icon", updatePrimaryImage, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });
      }
    },
    [mediaList]
  );

  return (
    <FormProvider {...methods}>
      <Grid container style={{ height: "100vh" }}>
        <Grid item xs={12} md={6} p={2}>
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
              label="Room Type Name"
              textFieldProps={{
                placeholder: "Enter Room Type Name",
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
            {/* <FormTextField
              name="inventory"
              sm={6}
              label="Inventory"
              textFieldProps={{
                fullWidth: true,
                placeholder: "Enter Inventory",
                type: "number",
              }}
              required
              gridProps={{ mb: 2 }}
            />
            <FormTextField
              name="occupancy"
              sm={6}
              label="Occupancy"
              textFieldProps={{
                fullWidth: true,
                placeholder: "Enter Occupancy",
                type: "number",
              }}
              required
              gridProps={{ mb: 2 }}
            /> */}
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
            <Grid item xs={12} md={6}>
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

            <Grid item xs={12} display="flex" alignItems="center">
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
            {!isMobile && (
              <Grid item xs={12} display="flex" alignItems="center" gap={2}>
                <PrimaryButton
                  label="Back"
                  buttonStyles={{
                    backgroundColor: "white",
                    color: "black",
                  }}
                  variant="outlined"
                  isLoading={false}
                  type="button"
                  onClick={() =>
                    Navigate(
                      `/booking-engine/admin/property/detail/${roomTypeDetail?.propertyId}?type=room-configuration`
                    )
                  }
                />
                <PrimaryButton
                  label="Update"
                  disabled={isSubmitLoading}
                  type="submit"
                  loadingText="Updating..."
                  isLoading={isSubmitLoading}
                  onClick={handleSubmit(onSubmit)}
                />
              </Grid>
            )}
          </Grid>
        </Grid>

        {/* FileUploader Section */}
        {!isMobile && (
          <Grid item xs={12} md={6} p={2}>
            <Box>
              <FileUploader
                keyPath={`${appConfig.getCookie("domain")}/${roomTypeDetail?.propertyId}/room_types/${roomTypeDetail?.id}/images`}
                accept="image/*"
                title=""
                onUploadComplete={onUpdateImage}
                mode="drag-drop"
              />
              {/* Image List */}
              <ImageList
                mediaListLoading={roomDetailLoading}
                mediaList={mediaList}
                typeIcon={typeIcon}
                handleSliderOpen={handleSliderOpen}
                handleDeleteImage={handleDeleteImage}
                handlePrimaryImage={handleSetPrimaryImage}
              />
            </Box>
          </Grid>
        )}

        {/* For Mobile, FileUploader at the bottom */}
        {isMobile && (
          <>
            <Grid item xs={12} md={6} p={2}>
              <FileUploader
                keyPath={`${appConfig.getCookie("domain")}/${roomTypeDetail?.propertyId}/room_types/${roomTypeDetail?.id}/images`}
                accept="image/*"
                title=""
                onUploadComplete={onUpdateImage}
                mode="drag-drop"
              />
              {/* Image List */}
              <ImageList
                mediaListLoading={roomDetailLoading}
                mediaList={mediaList}
                typeIcon={typeIcon}
                handleSliderOpen={handleSliderOpen}
                handleDeleteImage={handleDeleteImage}
                handlePrimaryImage={handleSetPrimaryImage}
              />
            </Grid>
            <Grid item xs={12} display="flex" alignItems="center" gap={2}>
              <SecondaryButton
                label="Back"
                size="small"
                isLoading={false}
                type="button"
                onClick={() =>
                  Navigate(
                    `/booking-engine/admin/property/detail/${roomTypeDetail?.propertyId}?type=room-configuration`
                  )
                }
              />
              <PrimaryButton
                label="Update"
                disabled={isSubmitLoading}
                type="submit"
                loadingText="Loading..."
                isLoading={isSubmitLoading}
                onClick={handleSubmit(onSubmit)}
              />
            </Grid>
          </>
        )}
        {currentSlider !== null && (
          <ImageSlider
            current={currentSlider}
            isOpen={isSliderOpen}
            onClose={() => {
              setSliderOpen(false);
              setCurrentSlider(null);
            }}
            mediaList={mediaList}
          />
        )}
      </Grid>
    </FormProvider>
  );
};
export default EditRoomType;
