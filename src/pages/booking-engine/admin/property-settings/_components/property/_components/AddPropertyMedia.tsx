import React, { useState } from "react";
import { TextField, Divider, Box } from "@mui/material";
import FileUploader from "components/widgets/Files/FileUploader";
import { useAddPropertyMediaMutation } from "services/propertySlice";
import { appConfig } from "config/app.config";

interface AddPropertyMediaProps {
  propertyId: string | number;
  organizationId: string | number;
  refetch: () => void;
}

const AddPropertyMedia: React.FC<AddPropertyMediaProps> = ({
  propertyId,
  organizationId,
  refetch,
}) => {
  const [caption, setCaption] = useState<string>("");
  const [category, setCategory] = useState<string>("");

  const [addPropertyMedia] = useAddPropertyMediaMutation();

  const getFileTypeAndMime = (url: string) => {
    const extension = url.split(".").pop();
    let fileType = "unknown";
    let fileMime = "application/octet-stream";

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
      default:
        fileType = "unknown";
        fileMime = "application/octet-stream";
    }

    return { fileType, fileMime };
  };

  const handleFileUploadComplete = async (uploadedFileUrl: string) => {
    const { fileType, fileMime } = getFileTypeAndMime(uploadedFileUrl);

    await addPropertyMedia({
      property_id: Number(propertyId),
      path: uploadedFileUrl.replace(`${appConfig.mediaPath}/`, ""),
      file_type: fileType,
      file_mime: fileMime,
      caption,
      category,
    });

    refetch();
    resetForm();
  };

  const resetForm = () => {
    setCaption("");
    setCategory("");
  };

  return (
    <Box>
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
      <FileUploader
        keyPath={appConfig.getMediaKey(
          organizationId,
          `p-${propertyId}`,
          "imgs"
        )}
        accept="image/*"
        mode="drag-drop"
        title=""
        onUploadComplete={handleFileUploadComplete}
      />
      <Divider style={{ marginBottom: 20, marginTop: 20 }} />
    </Box>
  );
};

export default AddPropertyMedia;
