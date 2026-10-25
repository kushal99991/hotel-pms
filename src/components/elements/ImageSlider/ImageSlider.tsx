import { ArrowBack, ArrowForward, Close } from "@mui/icons-material";
import {
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  Typography,
} from "@mui/material";
import { appConfig } from "config/app.config";
import React, { useEffect, useState } from "react";

export interface IImageSliderProps {
  current: number;
  mediaList: string[];
  isOpen: boolean;
  onClose: () => void;
}

const ImageSlider: React.FC<IImageSliderProps> = ({
  current,
  mediaList,
  isOpen,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(current);

  useEffect(() => {
    setCurrentIndex(current);
  }, [current]);

  const handleNext = () => {
    if (currentIndex < mediaList.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={onClose}
        maxWidth="xl"
        fullWidth
        fullScreen
      >
        <DialogContent
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "black",
            padding: 2,
            position: "relative",
          }}
        >
          {/* Close Button */}
          <IconButton
            onClick={onClose}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: "white",
              background: "rgba(0, 0, 0, 0.5)",
              "&:hover": { background: "rgba(0, 0, 0, 0.7)" },
            }}
          >
            <Close />
          </IconButton>

          {/* Prev Button */}
          {currentIndex > 0 && (
            <IconButton
              onClick={handlePrev}
              sx={{
                position: "absolute",
                left: 16,
                top: "50%",
                transform: "translateY(-50%)",
                color: "white",
                background: "rgba(0, 0, 0, 0.5)",
                "&:hover": { background: "rgba(0, 0, 0, 0.7)" },
              }}
            >
              <ArrowBack />
            </IconButton>
          )}

          {/* Image */}
          <img
            src={`${appConfig.mediaPath}/${mediaList[currentIndex] ?? ""}`}
            alt={`Media ${currentIndex + 1}`}
            style={{
              maxWidth: "100%",
              maxHeight: "80vh",
              objectFit: "contain",
            }}
          />

          {/* Next Button */}
          {currentIndex < mediaList.length - 1 && (
            <IconButton
              onClick={handleNext}
              sx={{
                position: "absolute",
                right: 16,
                top: "50%",
                transform: "translateY(-50%)",
                color: "white",
                background: "rgba(0, 0, 0, 0.5)",
                "&:hover": { background: "rgba(0, 0, 0, 0.7)" },
              }}
            >
              <ArrowForward />
            </IconButton>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "black",
            padding: 2,
          }}
        >
          <Typography color="white">
            {currentIndex + 1}/{mediaList?.length ?? 0}
          </Typography>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ImageSlider;
