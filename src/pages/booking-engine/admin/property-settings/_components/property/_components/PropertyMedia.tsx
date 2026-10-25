import { useState } from "react";
import {
  Box,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Skeleton,
  styled,
  TextField,
} from "@mui/material";
import { DeleteForeverRounded, Upload, Edit } from "@mui/icons-material";
import FileUploader from "components/widgets/Files/FileUploader";
import { useDeleteMediaMutation } from "services/propertyMediaSlice";
import {
  useDeletePropertyMediaMutation,
  useGetPropertiesMediaQuery,
  useUpdatePropertyMediaMutation,
} from "services/propertySlice";
import { IPropertyMediaResponse } from "types/propertyMediaTypes";
import { appConfig } from "config/app.config";
import FullScreenModal from "components/widgets/ModalWindows/FullScreenModal";
import AddPropertyMedia from "./AddPropertyMedia";
import useAuth from "hooks/useAuth";

function PropertyMedia(props: { propertyId: string | number }) {
  const { users } = useAuth();
  const organizationId = users?.id ?? 0;
  const { propertyId } = props;

  // State to manage images currently being deleted
  const [deletingImages, setDeletingImages] = useState<number[]>([]);
  const [viewCaptionModal, setViewCaptionModal] = useState<boolean>(false);
  const [viewImageModal, setViewImageModal] = useState<boolean>(false);
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const [caption, setCaption] = useState<string>("");
  const [category, setCategory] = useState<string>("");

  // Fetching media using RTK Query
  const {
    data: mediaLists,
    isLoading,
    refetch,
  } = useGetPropertiesMediaQuery({
    propertyId: Number(propertyId),
  });

  // Mutation hooks for deleting and adding media
  const [deleteMedia] = useDeleteMediaMutation();
  const [deletePropertyMedia] = useDeletePropertyMediaMutation();
  const [updatePropertyMedia, { isLoading: isUpdatePropertyLoading }] =
    useUpdatePropertyMediaMutation();

  const getFileTypeAndMime = (url: string) => {
    const extension = url.split(".").pop(); // Get the file extension
    let fileType = "unknown";
    let fileMime = "application/octet-stream"; // Default MIME type

    switch (extension?.toLowerCase()) {
      case "jpg":
      case "jpeg":
        fileType = "image";
        fileMime = "image/jpeg";
        break;
      case "png":
        fileType = "image";
        fileMime = "image/png";
        break;
      case "gif":
        fileType = "image";
        fileMime = "image/gif";
        break;
      case "webp":
        fileType = "image";
        fileMime = "image/webp";
        break;
      // Add more cases as needed for different file types
      default:
        fileType = "unknown";
        fileMime = "application/octet-stream";
    }

    return { fileType, fileMime };
  };

  // Function for updating existing media
  const onUpdateImage = async (url?: string) => {
    if (selectedImageId !== null) {
      const imageToUpdate = mediaLists?.find(
        (media) => media.id === selectedImageId
      );

      if (imageToUpdate?.id && imageToUpdate.path && url) {
        await deleteMedia({ url: imageToUpdate.path });
        const { fileType, fileMime } = getFileTypeAndMime(url);

        await updatePropertyMedia({
          media_id: imageToUpdate.id,
          path: url.replace(`${appConfig.mediaPath}/`, ""),
          property_id: imageToUpdate.property_id,
          file_type: fileType,
          file_mime: fileMime,
          caption: imageToUpdate.caption,
          category: imageToUpdate.category,
        });

        refetch();
        setViewImageModal(false); // Close image update modal
      }
    }
  };

  // Update caption and category only
  const onUpdateCaptionCategory = async () => {
    if (selectedImageId !== null) {
      const imageToUpdate = mediaLists?.find(
        (media) => media.id === selectedImageId
      );

      if (imageToUpdate?.id) {
        await updatePropertyMedia({
          media_id: imageToUpdate.id,
          path: imageToUpdate?.path ?? "",
          property_id: imageToUpdate.property_id,
          file_type: imageToUpdate.file_type,
          file_mime: imageToUpdate.file_mime,
          caption,
          category,
        });

        refetch();
        setViewCaptionModal(false); // Close caption/category update modal
        setCaption("");
        setCategory("");
      }
    }
  };

  const onDeleteImage = async (id: number, url: string) => {
    setDeletingImages((prev) => [...prev, id]); // Add image to deleting state
    await deleteMedia({ url });
    await deletePropertyMedia({ media_id: id });
    setDeletingImages((prev) => prev.filter((imageId) => imageId !== id)); // Remove from deleting state after deletion
    refetch();
  };

  const MediaView = (props: { items: IPropertyMediaResponse[] }) => {
    const { items } = props;
    return (
      <ImageList cols={3} gap={16} rowHeight={200}>
        {items.map((item: IPropertyMediaResponse, index: number) => {
          const fullImageUrl = `${appConfig.mediaPath}/${item.path}`;

          return (
            <ImageListItem key={index.toString()}>
              {deletingImages.includes(item?.id ?? 0) ? (
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height={200}
                  sx={{ borderRadius: "8px" }}
                />
              ) : (
                <StyledImageBox
                  component="div"
                  sx={{ backgroundImage: `url(${fullImageUrl})` }}
                  onClick={() => {
                    setSelectedImageId(item?.id ?? null);
                    setViewImageModal(true); // Open image update modal
                  }}
                >
                  <StyledUploadIcon />
                </StyledImageBox>
              )}
              <ImageListItemBar
                title={item.caption}
                subtitle={item.category}
                sx={{ background: fadedBg }}
                position="top"
                actionPosition="right"
                actionIcon={
                  <>
                    <IconButton
                      sx={{ color: "white" }}
                      onClick={() => {
                        setCaption(item?.caption ?? "");
                        setCategory(item?.category ?? "");
                        setSelectedImageId(item?.id ?? null); // Set selected image
                        setViewCaptionModal(true); // Open caption/category modal
                      }}
                      aria-label="edit"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      sx={{ color: "white" }}
                      onClick={() =>
                        onDeleteImage(item?.id ?? 0, item?.path ?? "")
                      }
                      aria-label="delete"
                      disabled={deletingImages.includes(item?.id ?? 0)}
                    >
                      <DeleteForeverRounded />
                    </IconButton>
                  </>
                }
              />
            </ImageListItem>
          );
        })}
      </ImageList>
    );
  };

  const MediaSkeletonLoader = () => {
    return (
      <ImageList cols={3} gap={16} rowHeight={200}>
        {[...Array(6)].map((_, index) => (
          <ImageListItem key={index}>
            <Skeleton
              variant="rectangular"
              width="100%"
              height={200}
              sx={{ borderRadius: "8px" }}
            />
          </ImageListItem>
        ))}
      </ImageList>
    );
  };

  const fadedBg =
    "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)";

  return (
    <MainWrapper>
      {/* Inputs for caption and category */}
      <AddPropertyMedia
        propertyId={propertyId}
        organizationId={organizationId}
        refetch={refetch}
      />
      {isLoading || isUpdatePropertyLoading ? (
        <MediaSkeletonLoader />
      ) : (
        <MediaView items={mediaLists ?? []} />
      )}

      {/* Modal for updating caption and category */}
      <FullScreenModal
        title="Update Caption and Category"
        open={viewCaptionModal}
        onClose={() => {
          setViewCaptionModal(false);
          setCaption("");
          setCategory("");
        }}
        primaryActionLabel="Update"
        onPrimaryAction={onUpdateCaptionCategory}
        isPrimaryButtonLoading={isUpdatePropertyLoading}
      >
        <TextField
          label="Caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          fullWidth
          margin="normal"
        />
      </FullScreenModal>

      {/* Modal for updating the image */}
      <FullScreenModal
        title="Update Property Media Image"
        open={viewImageModal}
        onClose={() => setViewImageModal(false)}
      >
        <FileUploader
          keyPath={appConfig.getMediaKey(
            organizationId,
            `p-${propertyId}`,
            "imgs"
          )}
          accept="image/*"
          title=""
          onUploadComplete={onUpdateImage} // Handler for updating the image
          mode="drag-drop"
        />
      </FullScreenModal>
    </MainWrapper>
  );
}

export default PropertyMedia;

// Styled components
const MainWrapper = styled(Box)(() => ({
  background: "#FFFFFF",
  padding: "16px",
}));

const StyledImageBox = styled(Box)(() => ({
  backgroundPosition: "center",
  borderRadius: "8px",
  objectFit: "contain",
  width: "100%",
  height: "200px",
  cursor: "pointer",
  backgroundSize: "cover", // Ensure the image covers the whole area

  // Transition for smooth hover effect
  transition: "all 0.3s ease-in-out",
  position: "relative",

  // Hover effect to show the upload icon
  "&:hover": {
    filter: "brightness(0.5)",
    "& svg": {
      opacity: 1, // Show the upload icon on hover
    },
  },
}));

const StyledUploadIcon = styled(Upload)(() => ({
  color: "white",
  fontSize: "40px",
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  opacity: 0, // Initially hidden
  transition: "opacity 0.3s ease-in-out",
}));
