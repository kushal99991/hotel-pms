import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  styled,
  Grid,
  Skeleton,
  Chip,
  Tooltip,
  Snackbar,
  Alert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

import {
  useGetPropertyAmenitiesByIdQuery,
  useGetPropertyAmenitiesQuery,
  usePropertyAmenitiesToPropertyLinkMutation,
  usePropertyAmenitiesToPropertyUnLinkMutation,
} from "services/propertySlice";
import {
  IAmenityAssignedProperty,
  TAmendPropertyAmenityRequest,
} from "types/property";

import ComboBox, { TComboBoxOptions } from "components/widgets/Form/ComboBox";
import SecondaryButton from "components/elements/Button/SecondaryButton";
import DynamicIcon from "components/ui/DynamicIcon/DynamicIcon";

interface AmenityByCategory {
  [category: string]: IAmenityAssignedProperty[]; // Array of amenities
}

function PropertyAmenity(props: { propertyId: string | number }) {
  const { propertyId } = props;

  const [pendingLinkAmenity, setPendingLinkAmenity] = useState<{
    name: string | null;
    id: string | number;
  } | null>(null);

  const [deletingAmenityIds, setDeletingAmenityIds] = useState<
    (string | number)[]
  >([]);
  const [error, setError] = useState<string | null>(null);

  // API hooks
  const {
    data: propertyAmenitiesData,
    isLoading,
    refetch: refetchPropertyAmenitiesById,
  } = useGetPropertyAmenitiesByIdQuery({
    propertyId: `${propertyId}`,
  });
  const { data: amenities, refetch: fetchPropertyAmenities } =
    useGetPropertyAmenitiesQuery();

  const [unLinkAmenity] = usePropertyAmenitiesToPropertyUnLinkMutation();
  const [
    propertyAmenitiesToPropertyLink,
    { isLoading: isPropertyAmenitiesLoading },
  ] = usePropertyAmenitiesToPropertyLinkMutation();

  useEffect(() => {
    fetchPropertyAmenities();
    refetchPropertyAmenitiesById();
  }, []);

  const onRemoveAmenity = async (amenityId: string | number) => {
    setDeletingAmenityIds((prev) => [...prev, amenityId]);
    const payload = {
      propertyId: `${propertyId}`,
      propertyAmenityId: `${amenityId}`,
    };

    try {
      await unLinkAmenity(payload);
      refetchPropertyAmenitiesById();
    } catch {
      setError("Failed to delete amenity.");
    } finally {
      setDeletingAmenityIds((prev) => prev.filter((id) => id !== amenityId));
    }
  };

  const deduplicate = (arr: any[]) => {
    const unique = arr.filter(
      (item, index, self) => index === self.findIndex((a) => a.id === item.id)
    );
    return unique;
  };

  const onAmenityChange = (
    _event: React.SyntheticEvent,
    val: TComboBoxOptions
  ) => {
    const amenity: {
      name: string | null;
      id: string | number;
    } = { name: val.label, id: val.id };
    setPendingLinkAmenity(amenity);
  };

  const onAmenityAppend = async () => {
    if (pendingLinkAmenity?.id === 0) {
      return;
    }
    const payload: TAmendPropertyAmenityRequest = {
      propertyId: propertyId,
      propertyAmenityId: `${pendingLinkAmenity?.id}`,
    };
    const response = await propertyAmenitiesToPropertyLink(payload);
    if (response?.error) {
      setError((response?.error as string) ?? "Failed to add amenity");
      return;
    }
    refetchPropertyAmenitiesById();
    setPendingLinkAmenity(null);
  };

  const uniqueAmenitiesList = deduplicate(amenities ?? []);
  const propertyAmenitiesList =
    propertyAmenitiesData && propertyAmenitiesData?.length > 0
      ? propertyAmenitiesData
      : [];

  const filteredAmenitiesList = uniqueAmenitiesList.filter(
    (amenity) =>
      !propertyAmenitiesList.some(
        (propertyAmenity: IAmenityAssignedProperty) =>
          propertyAmenity.id === amenity.id
      )
  );

  // Group amenities by category
  const amenitiesByCategory = propertyAmenitiesList.reduce(
    (acc: AmenityByCategory, amenity) => {
      const category = amenity.category?.name || "Uncategorized";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(amenity);
      return acc;
    },
    {} as AmenityByCategory
  );

  return (
    <MainWrapper>
      <Box sx={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
        <ComboBox
          label="Amenities"
          onChange={onAmenityChange}
          width={400}
          value={filteredAmenitiesList
            .map((a) => ({
              label: a.name,
              id: a.id,
            }))
            ?.find((a) => a.id === pendingLinkAmenity?.id)}
          items={filteredAmenitiesList.map((a) => ({
            label: a.name,
            id: a.id,
          }))}
        />
        <SecondaryButton
          label={`Add ${pendingLinkAmenity?.name ?? ""}`}
          color="secondary"
          isLoading={isPropertyAmenitiesLoading}
          loadingText="Loading..."
          size="small"
          startIcon={<AddIcon />}
          variant="outlined"
          disabled={
            pendingLinkAmenity?.id === 0 ||
            pendingLinkAmenity === null ||
            isPropertyAmenitiesLoading
          }
          onClick={onAmenityAppend}
        />
      </Box>

      {isLoading ? (
        <Grid container spacing={3}>
          {[...Array(4)].map((_, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Skeleton variant="rectangular" height={50} />
              <Skeleton variant="text" />
              <Skeleton variant="text" />
            </Grid>
          ))}
        </Grid>
      ) : propertyAmenitiesData && propertyAmenitiesData.length > 0 ? (
        <>
          {/* Display amenities by category */}
          {Object.entries(amenitiesByCategory).map(([category, amenities]) => (
            <Box key={category} mb={4}>
              <Typography variant="h6" gutterBottom>
                {category}
              </Typography>
              <Grid container columnSpacing={2} rowSpacing={1}>
                {(amenities as IAmenityAssignedProperty[]).map(
                  (amenity: IAmenityAssignedProperty, index: number) => {
                    // Define label suffixes for featured and additional charge amenities
                    const labelSuffix = `${
                      amenity.featured ? " *" : ""
                    }${amenity.additional_charge ? " $" : ""}`;

                    return (
                      <Grid item xs={3} key={index.toString()}>
                        <StyledGridItem>
                          <Tooltip title={amenity.name} arrow>
                            <Chip
                              onDelete={() => onRemoveAmenity(amenity.id)}
                              deleteIcon={<DeleteIcon />}
                              label={`${labelSuffix} ${amenity.name}`}
                              icon={
                                <DynamicIcon
                                  name={amenity?.icon_path ?? ""}
                                  size={28}
                                />
                              }
                              sx={{
                                fontWeight: "700",
                                padding: "10px",
                                borderRadius: "16px",
                                backgroundColor: "transparent",
                              }}
                              disabled={deletingAmenityIds.includes(amenity.id)}
                            />
                          </Tooltip>
                        </StyledGridItem>
                      </Grid>
                    );
                  }
                )}
              </Grid>
            </Box>
          ))}
        </>
      ) : (
        <Typography variant="h6" color="textSecondary" align="center">
          No amenities linked. Please add.
        </Typography>
      )}

      {/* Snackbar for error display */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </MainWrapper>
  );
}

export default PropertyAmenity;

const MainWrapper = styled(Box)(() => ({
  padding: "20px 0",
}));

const StyledGridItem = styled(Box)(() => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "auto",
  backgroundColor: "#f0f0f0",
  borderRadius: "16px",
}));
