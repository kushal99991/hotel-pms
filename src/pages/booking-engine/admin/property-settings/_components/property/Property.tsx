import React, { useCallback, useMemo, useState } from "react";
import {
  Box,
  Divider,
  Card,
  CardContent,
  IconButton,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import InfoIcon from "@mui/icons-material/Info";
import { IProperty } from "types/property";
import PropertyDetails from "./_components/PropertyDetails";
import PropertyEditForm from "./_components/PropertyEditForm";
import { useLocation, useNavigate } from "react-router-dom";
import { appConfig } from "config/app.config";
import SecondaryButton from "components/elements/Button/SecondaryButton";
import CommonTabs from "components/elements/Tabs/CommonTabs";
import GeneralConfiguration from "./GeneralConfiguration";
import RoomConfiguration from "./RoomConfiguration";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import PropertyCoverPhoto from "./_components/PropertyCoverPhoto";

interface iPropertyProps {
  property: IProperty | null;
  refresh: () => void;
  isLoading: boolean;
}

const Property: React.FC<iPropertyProps> = ({
  property,
  isLoading,
  refresh,
}) => {
  const Navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const type = searchParams.get("type");

  const [editMode, setEditMode] = useState<number | null>(null);

  const onEditClick = (id: number) => {
    setEditMode(id);
  };

  const onExitEditMode = () => {
    setEditMode(null);
    refresh();
  };

  const onBackClick = useCallback(() => {
    Navigate(`/${appConfig.pmsDir}/admin/property-settings`);
  }, []);

  const CustomCardTitle = ({
    title,
    icon,
    rightContent, // optional content for the right side
  }: {
    title: string;
    icon: React.ReactNode;
    rightContent?: React.ReactNode; // optional right-side content
  }) => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between", // space between the title and right content
        mb: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        {icon}
        <Typography variant="h6" sx={{ ml: 1 }}>
          {title}
        </Typography>
      </Box>
      {rightContent && <Box>{rightContent}</Box>}
    </Box>
  );

  const initialTab = useMemo(() => {
    switch (type) {
      case "room-configuration":
        return 1;
      default:
        return 0;
    }
  }, [type]);

  return (
    <Box style={{ marginBottom: "100px" }}>
      {/* Title with Back Arrow */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 3,
        }}
      >
        <IconButton onClick={onBackClick} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" component="div">
          {property?.name || "Loading..."}
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        {/* Property Details / Edit Form */}
        <Card>
          <CardContent>
            <CustomCardTitle
              title="Property Details"
              icon={<InfoIcon />}
              rightContent={
                !editMode ? (
                  <PrimaryButton
                    label="Edit Property Detail"
                    color="secondary"
                    onClick={() => onEditClick(property?.id || 0)}
                    isLoading={isLoading}
                    loadingText="Loading..."
                    buttonStyles={{
                      backgroundColor: "#32A1AE",
                      color: "#FFFFFF",
                    }}
                  />
                ) : (
                  <SecondaryButton
                    label="View Detail"
                    color="secondary"
                    onClick={onExitEditMode}
                    isLoading={isLoading}
                    loadingText="Loading..."
                  />
                )
              }
            />

            <Box>
              {/* Property Cover Photo */}
              {property?.cover_photo && (
                <PropertyCoverPhoto
                  coverPhoto={
                    isLoading ? null : `${property?.cover_photo ?? ""}`
                  }
                  property={property}
                  onRefresh={refresh}
                />
              )}
            </Box>
            {editMode && property ? (
              <PropertyEditForm
                property={property}
                handleCancelClick={onExitEditMode}
              />
            ) : (
              <PropertyDetails
                property={property}
                isLoading={isLoading}
                onRefresh={refresh}
              />
            )}
          </CardContent>
        </Card>
      </Box>

      <Divider />
      <CommonTabs
        tabs={[
          {
            content: (
              <GeneralConfiguration
                property={property}
                isLoading={isLoading}
                refresh={refresh}
              />
            ),
            label: "General",
          },
          {
            content: (
              <RoomConfiguration isLoading={isLoading} property={property} />
            ),
            label: "Room Configuration",
          },
        ]}
        initialTab={initialTab}
      />
    </Box>
  );
};

export default Property;
