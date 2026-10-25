import React, { useState } from "react";
import { Grid, Typography, Avatar, Skeleton, styled } from "@mui/material";
import Label from "components/elements/Label/Label";
import { IProperty } from "types/property";
import { getMapImageUri } from "utils/helperFunctions/geo";
import { stripScriptTags } from "utils/helperFunctions/strings";
import FullScreenModal from "components/widgets/ModalWindows/FullScreenModal";
import FileUploader from "components/widgets/Files/FileUploader";
import { useUpdateLogoMutation } from "services/propertySlice";
import { PhotoCamera } from "@mui/icons-material";
import { appConfig } from "config/app.config";

interface PropertyDetailProps {
  property: IProperty | null;
  onRefresh?: () => void;
  isLoading: boolean;
}

const PropertyDetail: React.FC<PropertyDetailProps> = ({
  property,
  onRefresh,
  isLoading,
}) => {
  const [viewModal, setViewModal] = useState<boolean>(false);
  const [updateLogo] = useUpdateLogoMutation();

  const onUploadLogo = async (url: string) => {
    setViewModal(false);
    await updateLogo({
      id: `${property?.id ?? ""}`,
      data: { key: "logo", value: url },
    });
    onRefresh?.();
  };

  const handleAvatarClick = () => {
    if (!isLoading) {
      setViewModal(true);
    }
  };

  return (
    <>
      <Grid container spacing={2}>
        {/* Left Side: Property Image */}
        <Grid item xs={12} md={3}>
          {isLoading ? (
            <Skeleton variant="rectangular" width={200} height={200} />
          ) : (
            <StyledAvatarWrapper>
              <StyledAvatar
                alt={property?.name}
                src={property?.logo}
                onClick={handleAvatarClick}
              />
              <UploadIcon className="uploadIcon" onClick={handleAvatarClick} />
            </StyledAvatarWrapper>
          )}
        </Grid>

        {/* Middle: Property Details */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={2}>
            {/* Row 1: Property Name and Address */}
            <Grid item xs={12} md={6}>
              <Label>Property Name</Label>
              {isLoading ? (
                <Skeleton width="80%" />
              ) : (
                <Typography>{property?.name}</Typography>
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              <Label>Address</Label>
              {isLoading ? (
                <Skeleton width="80%" />
              ) : (
                <Typography>{property?.address_1}</Typography>
              )}
            </Grid>

            {/* Row 2: Description */}
            <Grid item xs={12}>
              <Label>Description</Label>
              {isLoading ? (
                <Skeleton width="100%" />
              ) : (
                <Typography>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: stripScriptTags(property?.description ?? ""),
                    }}
                  />
                </Typography>
              )}
            </Grid>

            {/* Row 3: Room Information */}
            <Grid item xs={12} md={2}>
              <Label>Rooms</Label>
              {isLoading ? (
                <Skeleton width="80%" />
              ) : (
                <Typography>{property?.room_count ?? 0}</Typography>
              )}
            </Grid>
            <Grid item xs={12} md={2}>
              <Label>Check In</Label>
              {isLoading ? (
                <Skeleton width="80%" />
              ) : (
                <Typography>{property?.checkin_time ?? 0}</Typography>
              )}
            </Grid>
            <Grid item xs={12} md={2}>
              <Label>Check Out</Label>
              {isLoading ? (
                <Skeleton width="80%" />
              ) : (
                <Typography>{property?.checkout_time ?? 0}</Typography>
              )}
            </Grid>
            <Grid item xs={12} md={4}>
              <Label>Timezone</Label>
              {isLoading ? (
                <Skeleton width="80%" />
              ) : (
                <Typography>{property?.timezone ?? ""}</Typography>
              )}
            </Grid>
            <Grid item xs={12} md={3}>
              <Label>Property Type</Label>
              {isLoading ? (
                <Skeleton width="80%" />
              ) : (
                <Typography>{property?.property_type ?? ""}</Typography>
              )}
            </Grid>
          </Grid>
        </Grid>

        {/* Right Side: Property Location Map */}
        <Grid item xs={12} md={3}>
          {isLoading ? (
            <Skeleton variant="rectangular" width="100%" height={200} />
          ) : (
            <>
              {property?.lat && property?.lng && (
                <StyledMapAvatar
                  alt={property?.name}
                  src={getMapImageUri(property.lat, property.lng)}
                  sx={{ width: "100%", height: 200 }}
                  variant="square"
                />
              )}
            </>
          )}
        </Grid>
      </Grid>
      <FullScreenModal
        title="Upload Property Main Image"
        open={viewModal}
        onClose={() => {
          setViewModal(false);
        }}
      >
        <FileUploader
          keyPath={appConfig.getMediaKey(
            `${property?.organization_id}`,
            `p-${property?.id}`,
            "logo"
          )}
          fileName="logo"
          accept="image/*"
          title=""
          onUploadComplete={onUploadLogo}
          mode="drag-drop"
        />
      </FullScreenModal>
    </>
  );
};

export default PropertyDetail;

// Styled component for the Avatar
const StyledAvatarWrapper = styled("div")(() => ({
  position: "relative", // Set the parent container to relative
  display: "inline-block", // Ensure it takes the size of the image
  width: "fit-content", // Adjust to the image size
  "&:hover .uploadIcon": {
    opacity: 1, // Make the icon visible on hover
  },
}));

const StyledAvatar = styled("img")(() => ({
  borderRadius: 5,
  "&:hover": {
    cursor: "pointer", // Change cursor on hover
  },
}));

const UploadIcon = styled(PhotoCamera)(() => ({
  position: "absolute", // Position the icon absolutely over the image
  top: "50%", // Center the icon vertically
  left: "50%", // Center the icon horizontally
  transform: "translate(-50%, -50%)", // Adjust for centering
  color: "#fff", // White color for the icon
  opacity: 0, // Start with the icon hidden
  transition: "opacity 0.3s ease", // Smooth transition when showing/hiding the icon
  fontSize: 40, // Adjust the size of the icon
  background: "rgba(0, 0, 0, 0.5)", // Add a semi-transparent background
  borderRadius: "50%", // Make the background circular
  padding: 10, // Space around the icon
}));

const StyledMapAvatar = styled(Avatar)(() => ({
  width: "100%",
  height: 200,
  "&:hover": {
    cursor: "pointer", // Change cursor on hover
  },
}));
