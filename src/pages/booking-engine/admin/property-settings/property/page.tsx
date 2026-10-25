import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  IconButton,
  Skeleton,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import InfoIcon from "@mui/icons-material/Info";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useLazyGetPropertyQuery } from "services/propertySlice";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import SecondaryButton from "components/elements/Button/SecondaryButton";
import PropertyCoverPhoto from "../_components/property/_components/PropertyCoverPhoto";
import PropertyEditForm from "../_components/property/_components/PropertyEditForm";
import PropertyDetails from "../_components/property/_components/PropertyDetails";
import CommonTabs from "components/elements/Tabs/CommonTabs";
import GeneralConfiguration from "../_components/property/GeneralConfiguration";
import RoomConfiguration from "../_components/property/RoomConfiguration";
import BookingConfiguration from "../_components/property/BookingConfiguration";

const PropertyDetailSkeleton: React.FC = () => {
  return (
    <Box>
      {/* Title with Back Arrow */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <IconButton sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Skeleton variant="text" width={220} height={32} />
      </Box>

      <Box sx={{ mb: 3 }}>
        <Card>
          <CardContent>
            {/* Header Row */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <InfoIcon sx={{ color: "#ccc" }} />
                <Skeleton
                  data-testid="skeleton"
                  variant="text"
                  width={160}
                  height={28}
                  sx={{ ml: 1 }}
                />
              </Box>
              <Skeleton
                data-testid="skeleton"
                variant="rectangular"
                width={180}
                height={36}
                sx={{ borderRadius: 1 }}
              />
            </Box>

            {/* Cover Photo */}
            <Skeleton
              data-testid="skeleton"
              variant="rectangular"
              width="100%"
              height={250}
              sx={{ borderRadius: 2, mb: 3 }}
            />

            {/* Property Details Grid */}
            <Grid container spacing={2}>
              {/* Left - Avatar */}
              <Grid item xs={12} md={3}>
                <Skeleton variant="rectangular" width="100%" height={200} />
              </Grid>

              {/* Middle - Details */}
              <Grid item xs={12} md={6}>
                <Grid container spacing={2}>
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <Grid item xs={12} md={6} key={idx}>
                      <Skeleton variant="text" width={120} height={20} />
                      <Skeleton variant="text" width="80%" />
                    </Grid>
                  ))}
                </Grid>
              </Grid>

              {/* Right - Map */}
              <Grid item xs={12} md={3}>
                <Skeleton variant="rectangular" width="100%" height={200} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Tabs Skeleton */}
      <Tabs value={0}>
        <Tab label={<Skeleton variant="text" width={100} />} />
        <Tab label={<Skeleton variant="text" width={160} />} />
      </Tabs>

      {/* Tab Content Skeleton */}
      <Box sx={{ mt: 2 }}>
        <Card>
          <CardContent>
            <Grid container spacing={2}>
              {Array.from({ length: 8 }).map((_, idx) => (
                <Grid item xs={12} md={6} key={idx}>
                  <Skeleton variant="text" width={140} height={20} />
                  <Skeleton variant="text" width="90%" />
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

const PropertyDetail: React.FC = () => {
  const params = useParams();
  const Navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const type = searchParams.get("type");

  const [editMode, setEditMode] = useState<number | null>(null);
  const [hasFetched, setHasFetched] = useState<boolean>(false);

  const [getProperty, { isLoading, isFetching, error, data: property }] =
    useLazyGetPropertyQuery();

  useEffect(() => {
    if (property) setHasFetched(true);
  }, [property]);

  useEffect(() => {
    if (params?.id) {
      getProperty({ id: params.id });
    }
  }, [params?.id, type]);
  const onRefresh = useCallback(async () => {
    setHasFetched(true);
    if (params?.id) {
      await getProperty({ id: params.id });
    }
    setHasFetched(false);
  }, [params?.id]);

  const onExitEditMode = () => {
    setEditMode(null);
  };

  const onBackClick = useCallback(() => {
    Navigate(`/booking-engine/admin/property-settings`);
  }, []);

  const initialTab = useMemo(() => {
    switch (type) {
      case "room-configuration":
        return 1;
      default:
        return 0;
    }
  }, [type]);

  if (isLoading || (!hasFetched && !property)) {
    return <PropertyDetailSkeleton />;
  }
  if (!property) {
    return (
      <Box
        sx={{
          textAlign: "center",
          py: 6,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          color: "text.secondary",
        }}
      >
        <SearchOffIcon sx={{ fontSize: 64, mb: 2, color: "grey.400" }} />
        <Typography variant="h6" sx={{ mb: 1, color: "text.primary" }}>
          No Property Details Found
        </Typography>
        <Typography variant="body2" sx={{ maxWidth: 400, mb: 3 }}>
          Please check if the property exists or try refreshing the page.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => Navigate(`/booking-engine/admin/property-settings`)}
        >
          Go Back
        </Button>
      </Box>
    );
  }
  return (
    <Box>
      {error && <Alert severity="error">Error Loading Data</Alert>}
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
            {property.name}
          </Typography>
        </Box>
        <Box sx={{ mb: 3 }}>
          {/* Property Details / Edit Form */}
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between", // space between the title and right content
                  mb: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <InfoIcon />
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    Property Details
                  </Typography>
                </Box>
                <Box>
                  {editMode ? (
                    <SecondaryButton
                      label="View Detail"
                      color="secondary"
                      onClick={() => setEditMode(null)}
                    />
                  ) : (
                    <PrimaryButton
                      label="Edit Property Detail"
                      color="secondary"
                      onClick={() => setEditMode(property?.id ?? null)}
                      buttonStyles={{
                        backgroundColor: "#32A1AE",
                        color: "#FFFFFF",
                      }}
                    />
                  )}
                </Box>
              </Box>

              <Box>
                {/* Property Cover Photo */}
                {property?.cover_photo && (
                  <PropertyCoverPhoto
                    coverPhoto={
                      isLoading ? null : `${property?.cover_photo ?? ""}`
                    }
                    property={property}
                    onRefresh={onRefresh}
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
                  onRefresh={onRefresh}
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
                  refresh={onRefresh}
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
            {
              content: (
                <BookingConfiguration
                  isLoading={isLoading || isFetching}
                  property={property}
                  onRefresh={onRefresh}
                />
              ),
              label: "Booking Configuration",
            },
          ]}
          initialTab={initialTab}
        />
      </Box>
    </Box>
  );
};

export default PropertyDetail;
