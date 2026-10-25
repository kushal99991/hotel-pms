import React, { useState, ChangeEvent, useCallback } from "react";
import {
  Button,
  Paper,
  Typography,
  Box,
  CircularProgress,
  IconButton,
  ImageListItem,
} from "@mui/material";
import { Upload, Delete } from "@mui/icons-material";
import { useDropzone, Accept } from "react-dropzone";
import { appConfig } from "config/app.config";
import { slugify } from "utils/helperFunctions/strings";

type MediaUploaderProps = {
  keyPath: string;
  fileName?: string | null;
  title?: string;
  onUploadComplete: (url: string) => void;
  accept?: Accept | string | null;
  mode: "drag-drop" | "select-file";
  useDateInName?: boolean;
  checkFileResolution?: boolean; // New prop to check file resolution
  maxWidth?: number; // Optional maxWidth for resolution check
  maxHeight?: number; // Optional maxHeight for resolution check
};

const FileUploader: React.FC<MediaUploaderProps> = ({
  keyPath,
  fileName,
  title,
  onUploadComplete,
  accept,
  mode,
  useDateInName = false,
  checkFileResolution = false,
  maxWidth = 1920, // Default max width
  maxHeight = 1080, // Default max height
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const dropzoneAccept: Accept | undefined =
    typeof accept === "string" ? { [accept]: [] } : accept || undefined;

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const selectedFile = acceptedFiles[0];

      if (checkFileResolution) {
        // Check the resolution of the image file
        const img = new Image();
        const objectUrl = URL.createObjectURL(selectedFile);
        img.onload = () => {
          if (img.width < maxWidth || img.height < maxHeight) {
            setError(
              `File resolution is too small. The minimum allowed resolution is ${maxWidth}x${maxHeight}, but the selected image has a resolution of ${img.width}x${img.height}.`
            );
          } else {
            setError(null); // Clear the error if valid
            setFile(selectedFile);
            setFilePreview(objectUrl); // Generate preview URL
          }
        };
        img.src = objectUrl;
      } else {
        // If no resolution check is needed, just update the file state
        setFile(selectedFile);
        setFilePreview(URL.createObjectURL(selectedFile)); // Generate preview URL
      }
    },
    [checkFileResolution, maxWidth, maxHeight]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: dropzoneAccept,
    maxFiles: 1,
  });

  const getFileName = (f: File) => {
    if (useDateInName) {
      const currentDateTime = new Date().toISOString().replace(/[:.]/g, "-");
      return `${keyPath}/${currentDateTime}-${slugify(f.name)}`;
    } else if (fileName) {
      const fileExtension = f.name.split(".").pop();
      return `${keyPath}/${fileName}.${fileExtension}`;
    } else {
      return `${keyPath}/${slugify(f.name)}`;
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = event.target.files ? event.target.files[0] : null;
    if (selectedFile) {
      if (accept) {
        const acceptedTypes = Array.isArray(accept) ? accept : [accept];
        const isValidType = acceptedTypes.some((type) =>
          selectedFile.type.startsWith(type)
        );

        if (!isValidType) {
          alert(`Please select a valid ${accept} file!`);
          return;
        }
      }
      setFile(selectedFile);
      setFilePreview(URL.createObjectURL(selectedFile)); // Generate preview URL
    }
  };

  const onUploadFile = async () => {
    if (!file) {
      setError("Failed to upload image");
      return;
    }
    setUploading(true);
    setError(null);

    try {
      const response = await fetch(
        `${appConfig.mediaAPI}/presigned/url?key=${getFileName(file)}&type=${file.type}`,
        {
          headers: {
            "Content-Type": file.type,
            "x-api-key": appConfig.mediaAPIKey,
          },
        }
      );
      const data = await response.json();
      const presignedUrl = data.results.url;
      const uploadResponse = await fetch(presignedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (uploadResponse.ok) {
        const newUrl = presignedUrl.split("?")[0];
        onUploadComplete(newUrl);
        setFile(null);
        setFilePreview(null); // Clear the preview after upload
      } else {
        setError("Failed to upload image");
      }
    } catch {
      setError("Error during image upload");
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setFilePreview(null); // Clear preview
  };

  return (
    <Paper style={{ padding: 30 }} elevation={2}>
      {title && (
        <Typography variant="h6">
          <Upload /> {title || "File Upload"}
        </Typography>
      )}

      {!filePreview && (
        <>
          {mode === "drag-drop" ? (
            // Drag-and-drop mode UI
            <Box
              {...getRootProps()}
              sx={{
                border: "2px dashed #ccc",
                borderRadius: "8px",
                padding: "20px",
                textAlign: "center",
                cursor: "pointer",
                marginBottom: 2,
              }}
            >
              <input {...getInputProps()} />
              {isDragActive ? (
                <Typography>Drop the file here...</Typography>
              ) : (
                <Typography>
                  Drag and drop a file here, or click to select one{" "}
                  {file?.name ? `selected file: ${file.name}` : ""}
                </Typography>
              )}
            </Box>
          ) : (
            // Select-file mode UI
            <>
              <input
                type="file"
                onChange={handleFileChange}
                style={{ display: "none" }}
                id="file-input"
              />
              <label htmlFor="file-input">
                <Button
                  startIcon={<Upload />}
                  variant="outlined"
                  size="large"
                  disabled={uploading}
                >
                  {uploading ? <CircularProgress size={24} /> : "Select File"}
                </Button>
              </label>
            </>
          )}
        </>
      )}

      {/* File preview */}
      {filePreview && (
        <Box
          sx={{
            position: "relative",
            border: "2px dashed #ccc",
            borderRadius: "8px",
            padding: "20px",
            textAlign: "center",
            marginBottom: 2,
            marginTop: 2,
          }}
        >
          <ImageListItem>
            <img
              src={filePreview}
              alt={file?.name ?? ""}
              style={{
                maxHeight: "200px",
                maxWidth: "100%",
                objectFit: "contain",
              }}
            />
          </ImageListItem>
          <IconButton
            onClick={clearFile}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              backgroundColor: "rgba(255, 255, 255, 0.7)",
            }}
          >
            <Delete color="error" />
          </IconButton>
        </Box>
      )}

      {/* Upload button */}
      {file && !error && (
        <Button
          startIcon={<Upload />}
          variant="outlined"
          size="large"
          onClick={onUploadFile}
          disabled={uploading}
        >
          {uploading ? (
            <CircularProgress size={24} />
          ) : mode === "select-file" ? (
            "Select File"
          ) : (
            "Submit"
          )}
        </Button>
      )}

      {/* Display error message */}
      {error && <Typography color="error">{error}</Typography>}
    </Paper>
  );
};

export default FileUploader;
