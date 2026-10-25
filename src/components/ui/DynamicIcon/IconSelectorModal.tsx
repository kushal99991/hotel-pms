import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  TablePagination,
  Grid,
  Button,
  styled,
  CircularProgress,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import Delete from "@mui/icons-material/Delete";
import DynamicIcon, {
  getAllReactIcons,
  IconEntry,
} from "components/ui/DynamicIcon/DynamicIcon";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import { Link } from "react-router-dom";
import ReactDOMServer from "react-dom/server";
import { appConfig } from "config/app.config";
import { useDeleteMediaMutation } from "services/propertyMediaSlice";

interface IconSelectorModalProps {
  onSelect: (iconId: string) => void;
  selectedIconId?: string;
  search?: string;
  path?: string;
}

const IconSelectorModal: React.FC<IconSelectorModalProps> = ({
  onSelect,
  selectedIconId,
  search,
  path,
}) => {
  const allIcons = getAllReactIcons();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(search ?? "");
  const [filteredIcons, setFilteredIcons] = useState<IconEntry[]>(allIcons);
  const [pagination, setPagination] = useState({ page: 0, rowsPerPage: 100 });
  const [uploading, setUploading] = useState<boolean>(false);
  const [dragState, setDragState] = useState({
    isDragging: false,
    type: null as "icon" | "file" | null,
    name: null as string | null,
    fileSvg: null as string | null,
    file: null as File | null,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteMedia] = useDeleteMediaMutation();

  useEffect(() => {
    setSearchTerm(search ?? "");
  }, [search]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const value = searchTerm.trim().toLowerCase();
      if (value.length <= 2) return setFilteredIcons(allIcons);

      const filtered = allIcons.filter(
        (icon) =>
          icon.id.toLowerCase().includes(value) ||
          icon.id.toLowerCase().includes(value.replace(/s$/, ""))
      );
      setFilteredIcons(filtered);
      setPagination((prev) => ({ ...prev, page: 0 }));
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const selectedFileName = useMemo(() => {
    if (selectedIconId) {
      const fileWithQuery = selectedIconId.substring(
        selectedIconId.lastIndexOf("/") + 1
      );
      const fileName = fileWithQuery.split("?")[0];
      return fileName;
    }
    return null;
  }, [selectedIconId]);

  const convertSvgToPngBlob = (
    svgString: string,
    width = 200,
    height = 200
  ): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const svgBlob = new Blob([svgString], { type: "image/svg+xml" });
      const url = URL.createObjectURL(svgBlob);

      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject("Canvas context is null");
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject("Failed to convert canvas to blob");
          }
        }, "image/png");
      };
      img.onerror = (err: T) => reject(err);
      img.src = url;
    });
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragState((s) => ({ ...s, isDragging: false }));

    const iconId = e.dataTransfer.getData("iconId");
    const files = e.dataTransfer.files;
    const timestamp = Math.floor(Date.now() / 1000);

    if (iconId) {
      const fileName = selectedFileName
        ? selectedFileName
        : `${iconId}-${timestamp}.png`;
      const selectedIcon = allIcons.find((a) => a.id === iconId);
      if (selectedIcon) {
        const IconComponent = selectedIcon.component;
        const svgString = ReactDOMServer.renderToStaticMarkup(
          <IconComponent size={200} />
        );
        setDragState({
          isDragging: false,
          name: fileName,
          type: "icon",
          fileSvg: svgString,
          file: null,
        });
      }
    } else if (files.length > 0) {
      const file = files[0];
      const fileName = selectedFileName
        ? selectedFileName
        : `${timestamp}-${file.name}`;
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const svg = `
          <svg xmlns="https://www.w3.org/2000/svg" width="200" height="200">
            <image href="${base64}" width="200" height="200"/>
          </svg>`;
        setDragState({
          isDragging: false,
          name: fileName,
          type: "file",
          fileSvg: svg,
          file,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFileFromS3 = async (url: string) => {
    await deleteMedia({ url: url });
    onSelect("");
    handleClose();
  };

  const uploadOnS3 = async (file: File | Blob, fileName: string) => {
    // Get presigned URL
    const fullPath = `icons/${appConfig.getCookie("domain")}${path}/${fileName}`;
    const presignedRes = await fetch(
      `${appConfig.mediaAPI}/presigned/url?key=${fullPath}&type=image/png`,
      {
        headers: {
          "x-api-key": appConfig.mediaAPIKey,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await presignedRes.json();
    const presignedUrl = data.results.url;

    // Upload to S3
    const uploadRes = await fetch(presignedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "image/png",
      },
      body: file,
    });

    if (uploadRes.ok) {
      const uploadedUrl = presignedUrl.split("?")[0];
      return uploadedUrl;
    }
    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDragState((s) => ({ ...s, isDragging: true }));
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const svg = `
          <svg xmlns="https://www.w3.org/2000/svg" width="200" height="200">
            <image href="${base64}" width="200" height="200"/>
          </svg>`;
        setDragState({
          isDragging: false,
          name: file.name,
          type: "file",
          fileSvg: svg,
          file,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadFile = async () => {
    setUploading(true);
    let file: File | Blob | null = dragState.file;
    if (dragState.type === "icon" && dragState.name && dragState?.fileSvg) {
      file = await convertSvgToPngBlob(dragState.fileSvg);
    }
    if (file && dragState.name) {
      const uploadedUrl = await uploadOnS3(file, dragState.name);
      const iconUrl = uploadedUrl + `?v=${Date.now()}`;
      onSelect(iconUrl);
      handleClose();
    }
    setUploading(false);
  };

  const handleClose = () => {
    setOpen(false);
    setDragState({
      isDragging: false,
      name: null,
      type: null,
      fileSvg: null,
      file: null,
    });
  };

  return (
    <>
      {selectedIconId ? (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          gap={2}
        >
          <Link
            to="#"
            style={{ color: "#1976d2", textDecoration: "none" }}
            onClick={() => setOpen(true)}
          >
            Change Icons
          </Link>
          <Link
            to="#"
            style={{ color: "#1976d2", textDecoration: "none" }}
            onClick={() => removeFileFromS3(selectedIconId)}
          >
            Remove Icon
          </Link>
        </Box>
      ) : (
        <Link
          to="#"
          style={{ color: "#1976d2", textDecoration: "none" }}
          onClick={() => setOpen(true)}
        >
          Select Icons
        </Link>
      )}

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg">
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography fontWeight="700">
              Select an Icon or Upload File
            </Typography>
            <TextField
              variant="outlined"
              placeholder="Search icons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Box>
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={5}>
              <Box
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragState((s) => ({ ...s, isDragging: true }));
                }}
                onDragLeave={() =>
                  setDragState((s) => ({ ...s, isDragging: false }))
                }
                onDrop={handleDrop}
                sx={{
                  border: `2px dashed ${dragState.isDragging ? "#1565c0" : "#1976d2"}`,
                  borderRadius: 2,
                  height: "300px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  backgroundColor: dragState.isDragging
                    ? "#e3f2fd"
                    : "transparent",
                  p: 2,
                  textAlign: "center",
                }}
              >
                {dragState.isDragging ? (
                  <>
                    <CircularProgress />
                    <Typography mt={2} color="textSecondary">
                      Processing drop...
                    </Typography>
                  </>
                ) : dragState.name ? (
                  <>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="h6">📄 {dragState.name}</Typography>
                      <IconButton
                        size="small"
                        onClick={() =>
                          setDragState({
                            isDragging: false,
                            name: "",
                            fileSvg: null,
                            file: null,
                            type: "icon",
                          })
                        }
                      >
                        <Delete fontSize="small" color="error" />
                      </IconButton>
                    </Box>

                    {dragState.fileSvg && (
                      <Image
                        dangerouslySetInnerHTML={{
                          __html: dragState.fileSvg,
                        }}
                      />
                    )}
                  </>
                ) : (
                  <Typography color="textSecondary">
                    Drag an icon or file here
                  </Typography>
                )}
              </Box>

              <input
                type="file"
                style={{ display: "none" }}
                ref={fileInputRef}
                onChange={handleFileChange}
              />

              <Box mt={2} display="flex" gap={1}>
                <PrimaryButton
                  label="Upload"
                  isLoading={uploading}
                  loadingText="Uploading..."
                  type="button"
                  onClick={handleUploadFile}
                />
                <Button
                  variant="outlined"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Select File
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12} md={7} maxHeight={"350px"} overflow="auto">
              {filteredIcons.length === 0 ? (
                <Typography textAlign="center" color="textSecondary">
                  No icons found
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {filteredIcons
                    .slice(
                      pagination.page * pagination.rowsPerPage,
                      pagination.page * pagination.rowsPerPage +
                        pagination.rowsPerPage
                    )
                    .map((icon) => {
                      const isSelected = selectedIconId === icon.id;
                      return (
                        <Grid
                          item
                          xs={4}
                          sm={3}
                          md={2}
                          key={icon.id}
                          draggable
                          onDragStart={(e) =>
                            e.dataTransfer.setData("iconId", icon.id)
                          }
                          sx={{
                            cursor: "grab",
                            backgroundColor: isSelected
                              ? "#1976d2"
                              : "transparent",
                            color: isSelected ? "#fff" : "inherit",
                            borderRadius: "10px",
                            p: 1,
                            "&:hover": {
                              backgroundColor: isSelected
                                ? "#1565c0"
                                : "#f0f0f0",
                            },
                          }}
                          onClick={() => {
                            onSelect(icon.id);
                            handleClose();
                          }}
                        >
                          <Box
                            display="flex"
                            flexDirection="column"
                            alignItems="center"
                            justifyContent="center"
                          >
                            <DynamicIcon
                              name={icon.id}
                              size={24}
                              color={isSelected ? "#fff" : "inherit"}
                            />
                            <Typography
                              variant="caption"
                              textAlign="center"
                              noWrap
                              maxWidth={80}
                            >
                              {icon.type}-{icon.label}
                            </Typography>
                          </Box>
                        </Grid>
                      );
                    })}
                </Grid>
              )}
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "space-between" }}>
          <PrimaryButton
            label="Close"
            buttonStyles={{
              backgroundColor: "#F5F5F5",
              color: "#000",
              fontWeight: "bold",
            }}
            isLoading={false}
            type="button"
            onClick={handleClose}
          />
          <TablePagination
            component="div"
            count={filteredIcons.length}
            page={pagination.page}
            onPageChange={(_, newPage) =>
              setPagination((prev) => ({ ...prev, page: newPage }))
            }
            rowsPerPage={pagination.rowsPerPage}
            rowsPerPageOptions={[10, 25, 50, 100, 200, 500]}
            onRowsPerPageChange={(e) =>
              setPagination({
                page: 0,
                rowsPerPage: parseInt(e.target.value, 10),
              })
            }
          />
        </DialogActions>
      </Dialog>
    </>
  );
};

export default IconSelectorModal;

const Image = styled(Box)(() => ({
  maxWidth: "100%",
  maxHeight: "100%",
  borderRadius: "25px",
  padding: "10px",
}));
