import React, { useCallback, useState } from "react";
import { Box, IconButton } from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import { appConfig } from "config/app.config";
import FullScreenModal from "components/widgets/ModalWindows/FullScreenModal";
import FileUploader from "components/widgets/Files/FileUploader";
import { useUpdatePropertyByIdMutation } from "services/propertySlice";
import { IProperty } from "types/property";

interface PropertyCoverPhotoProps {
  coverPhoto: string | null;
  property?: IProperty | null;
  onRefresh?: () => void;
}

const PropertyCoverPhoto: React.FC<PropertyCoverPhotoProps> = ({
  coverPhoto,
  property,
  onRefresh,
}) => {
  const [hover, setHover] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);
  const [model, setModal] = useState<boolean>(false);

  const [updatePropertyById] = useUpdatePropertyByIdMutation();

  const onUpdateCoverPhoto = useCallback(async (url: string) => {
    /* Handle upload property cover photo */
    const payload = {
      cover_photo: url.replace(`${appConfig.mediaPath}/`, ""),
      name: property?.name ?? "",
      description: property?.description ?? "",
    };
    const response = await updatePropertyById({
      id: `${property?.id}`,
      data: payload,
    });
    if (response?.error) {
      return false;
    }
    onRefresh?.();
    setModal(false);
  }, []);

  const coverPhotoUrl = coverPhoto
    ? `${appConfig.mediaPath}/${coverPhoto || ""}`
    : null;

  return (
    <>
      {!coverPhotoUrl || imageError ? (
        <Box>
          <FileUploader
            keyPath={appConfig.getMediaKey(
              "property",
              `${property?.id ?? ""}`,
              "cover_photo"
            )}
            fileName="cover_photo"
            accept="image/*"
            title=""
            onUploadComplete={onUpdateCoverPhoto}
            mode="drag-drop"
            checkFileResolution={true}
            maxWidth={1920}
            maxHeight={250}
          />
        </Box>
      ) : (
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: "250px",
            mb: 3,
            backgroundImage: coverPhotoUrl ? `url(${coverPhotoUrl})` : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            objectFit: "cover",
            borderRadius: "8px",
            transition: "all 0.3s ease",
            border: coverPhotoUrl ? "none" : "2px dashed #ccc",
            "&:after": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.1)",
            },
          }}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onError={() => setImageError(true)}
        >
          {/* Camera Icon on Hover */}
          {hover && coverPhotoUrl && (
            <IconButton
              onClick={() => setModal(true)}
              sx={{
                position: "absolute",
                bottom: "10px",
                right: "10px",
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                color: "white",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.8)",
                },
                zIndex: 9,
              }}
            >
              <CameraAltIcon />
            </IconButton>
          )}
        </Box>
      )}
      <FullScreenModal
        title="Update Property Cover Photo"
        open={model}
        onClose={() => {
          setModal(false);
        }}
      >
        <FileUploader
          keyPath={appConfig.getMediaKey(
            "property",
            `${property?.id ?? ""}`,
            "cover_photo"
          )}
          fileName="cover_photo"
          accept="image/*"
          title=""
          onUploadComplete={onUpdateCoverPhoto}
          mode="drag-drop"
          checkFileResolution={true}
          maxWidth={1920}
          maxHeight={250}
        />
      </FullScreenModal>
    </>
  );
};

export default PropertyCoverPhoto;
