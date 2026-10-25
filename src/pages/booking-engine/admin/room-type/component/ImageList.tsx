import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  IconButton,
  Skeleton,
  Tooltip,
  Typography,
} from "@mui/material";
import { Delete, Star } from "@mui/icons-material";
import { appConfig } from "config/app.config";

interface ImageListProps {
  mediaList: string[];
  mediaListLoading?: boolean;
  typeIcon?: string | null;
  handleSliderOpen: (index: number) => void;
  handleDeleteImage: (index: number) => void;
  handlePrimaryImage?: (index: number) => void;
}

interface ImageItemProps {
  src: string;
  alt: string;
  width?: string;
  height?: string;
  onClick: () => void;
  onDelete: () => void;
  index: number;
  isPrimary: boolean; // New prop to check if the image is primary
  onSetPrimary: () => void; // Callback to set as primary
}

const ImageItem: React.FC<ImageItemProps> = ({
  src,
  alt,
  onClick,
  onDelete,
  isPrimary,
  width = "25%",
  height = "100px",
  onSetPrimary,
}) => {
  return (
    <Box
      width={width}
      sx={{
        position: "relative",
        "&:hover .overlay": { opacity: 1 },
        "&:hover .delete-btn": { display: "flex" },
      }}
    >
      <Avatar
        src={`${appConfig.mediaPath}/${src}`}
        alt={alt}
        variant="square"
        sx={{
          height: height,
          width: "100%",
          objectFit: "contain",
          cursor: "pointer",
          border: isPrimary ? "3px solid gold" : "none", // Highlight primary image
        }}
        onClick={onClick}
      />

      {/* Star icon to indicate primary image */}
      {isPrimary && (
        <Tooltip title="Primary Image">
          <IconButton
            sx={{
              position: "absolute",
              top: "8px",
              right: "8px",
              color: "gold",
              backgroundColor: "rgba(0, 0, 0, 0.4)",
            }}
          >
            <Star />
          </IconButton>
        </Tooltip>
      )}

      <IconButton
        aria-label="delete"
        onClick={onDelete}
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          height: "40px",
          width: "40px",
          transform: "translate(-50%, -50%)",
          color: "white",
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          display: "none",
          "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.8)" },
        }}
        className="delete-btn"
      >
        <Delete />
      </IconButton>

      {/* Set Primary Button */}
      {!isPrimary && (
        <IconButton
          aria-label="set-primary"
          onClick={onSetPrimary}
          sx={{
            position: "absolute",
            top: "5px",
            left: "5px",
            color: "white",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.8)" },
          }}
        >
          <Star />
        </IconButton>
      )}
    </Box>
  );
};

const ImageList: React.FC<ImageListProps> = ({
  mediaList,
  mediaListLoading,
  typeIcon,
  handleSliderOpen,
  handleDeleteImage,
  handlePrimaryImage,
}) => {
  const [primaryImageIndex, setPrimaryImageIndex] = useState<number | null>(
    null
  );
  useEffect(() => {
    const primaryIndex = mediaList.findIndex((a) => a === typeIcon);
    if (primaryIndex > -1) {
      setPrimaryImageIndex(primaryIndex);
    }
  }, [typeIcon, mediaList]);

  const handleSetPrimaryImage = (url: string) => {
    const primaryIndex = mediaList.findIndex((a) => a === url);
    setPrimaryImageIndex(primaryIndex);
    handlePrimaryImage?.(primaryIndex);
  };

  return (
    <Box display="flex" alignItems="center" flexWrap="wrap" gap={1} mt={2}>
      {/* Row 1 */}
      <Box width="100%" display="flex" gap={1}>
        {/* Left Column */}
        <Box width="40%" display="flex" gap={1} flexWrap="wrap">
          {mediaList.slice(1, 3).length > 0 ? (
            <>
              {mediaList.slice(1, 3).length === 1 ? (
                <>
                  {mediaList.slice(1, 3).map((media, index) => (
                    <ImageItem
                      key={index}
                      src={media}
                      width="100%"
                      alt={`Image ${index + 1}`}
                      onClick={() => handleSliderOpen(index + 1)}
                      onDelete={() => handleDeleteImage(index + 1)}
                      index={index + 1}
                      isPrimary={primaryImageIndex === index + 1}
                      onSetPrimary={() => handleSetPrimaryImage(media)}
                    />
                  ))}
                  {mediaListLoading && (
                    <Skeleton
                      variant="rectangular"
                      height="100px"
                      width="100%"
                    />
                  )}
                </>
              ) : (
                <>
                  {mediaList.slice(1, 3).map((media, index) => (
                    <ImageItem
                      key={index}
                      src={media}
                      width="100%"
                      alt={`Image ${index + 1}`}
                      onClick={() => handleSliderOpen(index + 1)}
                      onDelete={() => handleDeleteImage(index + 1)}
                      index={index + 1}
                      isPrimary={primaryImageIndex === index + 1}
                      onSetPrimary={() => handleSetPrimaryImage(media)}
                    />
                  ))}
                </>
              )}
            </>
          ) : (
            <>
              {mediaListLoading && (
                <>
                  <Skeleton variant="rectangular" height="100px" width="100%" />
                  <Skeleton variant="rectangular" height="100px" width="100%" />
                </>
              )}
            </>
          )}
        </Box>

        {/* Right Column */}
        <Box width="60%">
          {mediaList?.[0] ? (
            <ImageItem
              src={mediaList?.[0]}
              width="100%"
              height="205px"
              alt={``}
              onClick={() => handleSliderOpen(0)}
              onDelete={() => handleDeleteImage(0)}
              index={0}
              isPrimary={primaryImageIndex === 0}
              onSetPrimary={() => handleSetPrimaryImage(mediaList?.[0])}
            />
          ) : (
            <>
              {mediaListLoading && (
                <Skeleton variant="rectangular" height="200px" width="100%" />
              )}
            </>
          )}
        </Box>
      </Box>

      {/* Row 2 */}
      <Box width="100%" display="flex" gap={1}>
        {mediaList.slice(3, 7).map((media, index) => (
          <ImageItem
            key={index}
            src={media}
            alt={`Image ${index + 3}`}
            onClick={() => handleSliderOpen(index + 3)}
            onDelete={() => handleDeleteImage(index + 3)}
            index={index + 3}
            isPrimary={primaryImageIndex === index + 3}
            onSetPrimary={() => handleSetPrimaryImage(media)}
          />
        ))}

        {/* "+X Photos" Overlay */}
        {mediaList.length > 7 && (
          <Box
            width="25%"
            sx={{
              position: "relative",
              height: "100px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#f0f0f0",
              cursor: "pointer",
            }}
            onClick={() => handleSliderOpen(mediaList.length - 1)}
          >
            <Avatar
              src={`${appConfig.mediaPath}/${mediaList[mediaList.length - 1]}`}
              alt="View All Images"
              variant="square"
              sx={{
                height: "100px",
                width: "100%",
                objectFit: "contain",
                cursor: "pointer",
              }}
              onClick={() => handleSliderOpen(mediaList.length - 1)}
            />
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "white",
                fontSize: "16px",
                fontWeight: "bold",
              }}
            >
              +{mediaList.length - 7} Photos
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ImageList;
