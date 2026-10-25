import React, { useState } from "react";
import { Grid, Typography, Box, Skeleton, styled } from "@mui/material";
import Label from "components/elements/Label/Label";
import { PhotoCamera } from "@mui/icons-material";
import { useUpdateOrgLogoMutation } from "services/organizationSlice";
import { IOrg } from "types/org";
import { appConfig } from "config/app.config";
import FullScreenModal from "components/widgets/ModalWindows/FullScreenModal";
import FileUploader from "components/widgets/Files/FileUploader";
import { useNavigate } from "react-router-dom";
import PrimaryButton from "components/elements/Button/PrimaryButton";

interface OrganizationDetailProps {
  organization: IOrg | null;
  onEditClick: () => void;
  isLoading: boolean;
  onRefresh: () => void;
}

const OrganizationDetail: React.FC<OrganizationDetailProps> = ({
  organization,
  onEditClick,
  isLoading,
  onRefresh,
}) => {
  const Navigate = useNavigate();
  const [modal, setModal] = useState<boolean>(false);
  const [updateOrgLogo] = useUpdateOrgLogoMutation();

  const onUploadMedia = async (url: string) => {
    if (organization?.id) {
      await updateOrgLogo({
        id: organization.id,
        data: { key: "logo", value: url },
      });
      setModal(false);
      onRefresh();
    }
  };

  const handleAvatarClick = () => {
    if (!isLoading) {
      setModal(true);
    }
  };

  return (
    <>
      <Grid container spacing={2}>
        {/* Organization Logo - span across 4 rows */}
        <Grid item xs={12} md={3}>
          {isLoading ? (
            <Skeleton variant="rectangular" width={150} height={150} />
          ) : (
            <StyledAvatarWrapper>
              <StyledAvatar
                alt={organization?.name}
                src={organization?.logo}
                onClick={handleAvatarClick}
              />
              <UploadIcon className="uploadIcon" onClick={handleAvatarClick} />
            </StyledAvatarWrapper>
          )}
        </Grid>

        {/* Organization Details */}
        <Grid item xs={12} md={9}>
          <Grid container gap={2}>
            {/* Row 1: Name and Email Address */}
            <Grid item xs={6} md={3}>
              <Label>Name</Label>
              {isLoading ? (
                <Skeleton width="80%" />
              ) : (
                <Typography>{organization?.name}</Typography>
              )}
            </Grid>
            <Grid item xs={6} md={3}>
              <Label>Email Address</Label>
              {isLoading ? (
                <Skeleton width="80%" />
              ) : (
                <Typography>{organization?.email}</Typography>
              )}
            </Grid>
            <Grid item xs={6} md={4}>
              <Label>Phone Number</Label>
              {isLoading ? (
                <Skeleton width="80%" />
              ) : (
                <Typography>{organization?.phone ?? ""}</Typography>
              )}
            </Grid>

            {/* Row 2: Website and Address */}
            <Grid item xs={12} sm={3}>
              <Label>Website</Label>
              {isLoading ? (
                <Skeleton width="80%" />
              ) : (
                <Typography>{organization?.website ?? ""}</Typography>
              )}
            </Grid>
            <Grid item xs={12} sm={7}>
              <Label>Address</Label>
              {isLoading ? (
                <Skeleton width="100%" />
              ) : (
                <Typography>{organization?.address}</Typography>
              )}
            </Grid>

            {/* Row 3: Description */}
            <Grid item xs={12}>
              <Label>Description</Label>
              {isLoading ? (
                <Skeleton width="100%" />
              ) : (
                <Typography>{organization?.description}</Typography>
              )}
            </Grid>

            {/* Row 4: Buttons - Add Property and Edit Organization */}
            <Grid item xs={12}>
              <Box display="flex" gap={2}>
                <PrimaryButton
                  label="Add Property"
                  color="secondary"
                  onClick={() =>
                    Navigate(`/booking-engine/admin/add-new-property`)
                  }
                  isLoading={isLoading}
                  loadingText="Loading..."
                  buttonStyles={{
                    backgroundColor: "#32A1AE",
                    color: "#FFFFFF",
                  }}
                />
                <PrimaryButton
                  label="Edit Organization"
                  color="secondary"
                  onClick={onEditClick}
                  isLoading={isLoading}
                  loadingText="Loading..."
                  buttonStyles={{
                    backgroundColor: "#32A1AE",
                    color: "#FFFFFF",
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <FullScreenModal
        title="Add Company Logo"
        open={modal}
        onClose={() => {
          setModal(false);
        }}
      >
        <FileUploader
          keyPath={appConfig.getMediaKey(`${organization?.id}`, "org", "logo")}
          fileName="logo"
          accept="image/*"
          title="Upload Property Media"
          onUploadComplete={onUploadMedia}
          mode="drag-drop"
        />
      </FullScreenModal>
    </>
  );
};

export default OrganizationDetail;

const StyledAvatarWrapper = styled("div")(() => ({
  position: "relative",
  display: "inline-block",
  width: "fit-content",
  "&:hover .uploadIcon": {
    opacity: 1,
  },
}));

const StyledAvatar = styled("img")(() => ({
  objectFit: "cover",
  minWidth: 128,
  maxWidth: 128,
  cursor: "pointer",
  borderRadius: 8,
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
