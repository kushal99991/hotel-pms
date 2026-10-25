import React, { useState } from "react";
import {
  Typography,
  Grid,
  TextField,
  Avatar,
  MenuItem,
  IconButton,
  styled,
  Box,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import EditIcon from "@mui/icons-material/Edit";
import useAuth from "hooks/useAuth";
import FullScreenModal from "components/widgets/ModalWindows/FullScreenModal";
import FileUploader from "components/widgets/Files/FileUploader";
import { PhotoCamera } from "@mui/icons-material";
import { appConfig } from "config/app.config";
import {
  useUpdateUserImageMutation,
  useUpdateUserNameMutation,
  useUpdateUserStatusMutation,
} from "services/userSlice";

const UserDetails: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { users, onRefreshToken } = useAuth();
  const [userName, setUserName] = useState<string>(
    `${users?.firstName ?? ""} ${users?.lastName ?? ""}`
  );
  const [originalUserName, setOriginalUserName] = useState<string>(userName);
  const [userStatus, setUserStatus] = useState<string>(
    users?.profileStatus || "At Work"
  );
  const [originalUserStatus, setOriginalUserStatus] =
    useState<string>(userStatus);

  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [isEditingStatus, setIsEditingStatus] = useState<boolean>(false);
  const [modal, setModal] = useState<boolean>(false);

  const statusOptions = ["At Lunch", "At Work", "At Break"];

  const [updateUserName] = useUpdateUserNameMutation();
  const [updateUserStatus] = useUpdateUserStatusMutation();
  const [updateUserImage] = useUpdateUserImageMutation();

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(event.target.value);
  };

  const handleStatusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserStatus(event.target.value);
  };

  const saveUserName = async () => {
    const [firstName, ...lastNameParts] = userName.split(" ");
    const lastName = lastNameParts.join(" ");
    const response = await updateUserName({
      first_name: firstName,
      last_name: lastName,
    });
    if (response.error) {
      setIsEditingName(false);
      return false;
    }
    setOriginalUserName(userName);
    setIsEditingName(false);
    onRefreshToken(false);
  };

  const saveUserStatus = async () => {
    const response = await updateUserStatus({ value: userStatus });
    if (response.error) {
      setIsEditingStatus(false);
      return false;
    }
    setOriginalUserStatus(userStatus);
    setIsEditingStatus(false);
    onRefreshToken(false);
  };

  const cancelEditName = () => {
    setUserName(originalUserName);
    setIsEditingName(false);
  };

  const cancelEditStatus = () => {
    setUserStatus(originalUserStatus);
    setIsEditingStatus(false);
  };

  const firstLetter = userName.charAt(0).toUpperCase();

  const onUploadMedia = async (fileUrl: string) => {
    const response = await updateUserImage({ path: fileUrl });
    if (response.error) {
      setModal(false);
      return false;
    }
    setModal(false);
    onRefreshToken(false);
  };

  const handleAvatarClick = () => {
    setModal(true);
  };

  return (
    <Grid container spacing={isMobile ? 1 : 2} mb={2} alignItems="center">
      {/* Left Side - User Details */}
      <Grid
        item
        xs={12}
        md={4}
        display="flex"
        alignItems="center"
        gap={2}
        flexDirection={isMobile ? "row" : "row"}
        justifyContent={isMobile ? "center" : "flex-start"}
      >
        <Box position="relative">
          <StyledAvatarWrapper>
            <StyledAvatar
              src={users?.profileImage ?? ""}
              alt={userName}
              onClick={handleAvatarClick}
              variant="circular"
              sx={{
                width: isMobile ? 60 : 100,
                height: isMobile ? 60 : 100,
              }}
            >
              {users?.profileImage ? null : (
                <Typography
                  variant="h6"
                  sx={{
                    color: "white",
                    fontSize: isMobile ? "1.2rem" : "1.5rem",
                  }}
                >
                  {firstLetter}
                </Typography>
              )}
            </StyledAvatar>
            <UploadIcon className="uploadIcon" onClick={handleAvatarClick} />
          </StyledAvatarWrapper>
        </Box>
        <Box textAlign={isMobile ? "center" : "left"}>
          {isEditingName ? (
            <Box display="flex" alignItems="center">
              <TextField
                value={userName}
                onChange={handleNameChange}
                variant="outlined"
                size="small"
                sx={{
                  marginRight: isMobile ? 0 : "8px",
                  flex: 1,
                  width: isMobile ? "100%" : "auto",
                }}
              />
              <IconButton onClick={saveUserName} color="primary">
                <CheckIcon />
              </IconButton>
              <IconButton onClick={cancelEditName} color="secondary">
                <CloseIcon />
              </IconButton>
            </Box>
          ) : (
            <Box display="flex" alignItems="center">
              <Typography
                variant="h6"
                onClick={() => {
                  setOriginalUserName(userName);
                  setIsEditingName(true);
                }}
                sx={{
                  cursor: "pointer",
                  marginRight: "8px",
                  fontSize: isMobile ? "1rem" : "1.25rem",
                }}
              >
                {userName}
              </Typography>
              <IconButton
                onClick={() => {
                  setOriginalUserName(userName);
                  setIsEditingName(true);
                }}
                color="primary"
              >
                <EditIcon />
              </IconButton>
            </Box>
          )}
          {isEditingStatus ? (
            <Box display="flex" alignItems="center">
              <TextField
                select
                value={userStatus}
                onChange={handleStatusChange}
                variant="outlined"
                size="small"
                sx={{ marginRight: "8px", width: isMobile ? "100%" : "auto" }}
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
              <IconButton onClick={saveUserStatus} color="primary">
                <CheckIcon />
              </IconButton>
              <IconButton onClick={cancelEditStatus} color="secondary">
                <CloseIcon />
              </IconButton>
            </Box>
          ) : (
            <Box display="flex" alignItems="center">
              <Typography
                variant="body2"
                color="textSecondary"
                onClick={() => {
                  setOriginalUserStatus(userStatus);
                  setIsEditingStatus(true);
                }}
                sx={{
                  cursor: "pointer",
                  marginRight: "8px",
                  fontSize: isMobile ? "0.9rem" : "1rem",
                }}
              >
                {userStatus}
              </Typography>
              <IconButton
                onClick={() => {
                  setOriginalUserStatus(userStatus);
                  setIsEditingStatus(true);
                }}
                color="primary"
              >
                <EditIcon />
              </IconButton>
            </Box>
          )}
        </Box>
      </Grid>

      {/* Right Side - User Role */}
      <Grid item xs={12} md={8} textAlign={isMobile ? "center" : "right"}>
        <Typography
          variant="h6"
          sx={{ fontSize: isMobile ? "1rem" : "1.25rem" }}
        >
          User Role:{" "}
          {users?.roles
            ?.map((role) => {
              if (role.name) {
                const lowerCasedRole = role.name.toLowerCase();
                return (
                  lowerCasedRole.charAt(0).toUpperCase() +
                  lowerCasedRole.slice(1)
                );
              }
              return null;
            })
            ?.filter(Boolean)
            ?.join(",")}
        </Typography>
      </Grid>

      {/* Modal for updating profile picture */}
      <FullScreenModal
        title="Update Profile Picture"
        open={modal}
        onClose={() => setModal(false)}
      >
        {/** TODO: add the orginization id to user table. */}
        <FileUploader
          keyPath={appConfig.getMediaKey(`u`, `${users?.id}`, "profile")}
          accept="image/*"
          title="Upload Profile Picture"
          onUploadComplete={onUploadMedia}
          mode="drag-drop"
        />
      </FullScreenModal>
    </Grid>
  );
};

export default UserDetails;

const StyledAvatarWrapper = styled("div")(() => ({
  position: "relative",
  display: "inline-block",
  width: "fit-content",
  height: "fit-content",

  "&:hover .uploadIcon": {
    opacity: 1,
  },
}));

const StyledAvatar = styled(Avatar)(() => ({
  cursor: "pointer",
}));

const UploadIcon = styled(PhotoCamera)(({ theme }) => ({
  position: "absolute",
  cursor: "pointer",
  color: "gray",
  bottom: 0,
  right: 0,
  opacity: 0,

  [theme.breakpoints.up("sm")]: {
    opacity: 0,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  },
  [theme.breakpoints.down("sm")]: {
    opacity: 1,
    transition: "opacity 0.3s ease-in-out",
    "&:hover": {
      opacity: 1,
    },
  },
  "&:hover": {
    opacity: 1,
  },
}));
