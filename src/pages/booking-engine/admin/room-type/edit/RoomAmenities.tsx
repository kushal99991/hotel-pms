import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Chip,
  Tooltip,
  Autocomplete,
  TextField,
  MenuItem,
  Card,
  CardContent,
  Skeleton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";

import DynamicIcon from "components/ui/DynamicIcon/DynamicIcon";
import { useParams } from "react-router-dom";
import { useGetRoomTypeByIdMutation } from "services/roomTypeSlice";
import { IRoomAmenity } from "types/roomAmenitiesTypes";
import useSnackbar from "hooks/useSnackbar";
import { useGetRoomAmenitiesCategoryQuery } from "services/roomSlice";
import {
  useAttachRoomAmenityMutation,
  useDetachRoomAmenityMutation,
  useGetRoomAmenitiesQuery,
} from "services/roomAmenitiesSlice";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import useAuth from "hooks/useAuth";

interface AmenityByCategory {
  [category: number]: IRoomAmenity[];
}

const RoomAmenitiesSkeleton: React.FC = () => {
  return (
    <>
      {[1, 2].map((categoryIndex) => (
        <Box key={categoryIndex} mb={2}>
          <Typography variant="h6">
            <Skeleton width={150} />
          </Typography>
          <Grid container spacing={2}>
            {[1, 2, 3].map((amenityIndex) => (
              <Grid item xs={3} key={amenityIndex}>
                <Skeleton variant="rounded" width="100%" height={40} />
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}
    </>
  );
};

const RoomAmenities: React.FC = () => {
  const params = useParams<{ id: string }>();
  const { users } = useAuth();
  const { openSnackbar } = useSnackbar();
  const [loadingAmenities, setLoadingAmenities] = useState<{
    [key: number]: boolean;
  }>({});
  const [amenitiesList, setAmenitiesList] = useState<IRoomAmenity[]>([]);
  const [amenitiesByCategory, setAmenitiesByCategory] =
    useState<AmenityByCategory>({});
  const [selectedAmenity, setSelectedAmenity] = useState<IRoomAmenity | null>(
    null
  );

  const [getRoomTypeById, { isLoading: isLoadingRoomType }] =
    useGetRoomTypeByIdMutation();
  const { data: amenitiesCategoriesList } = useGetRoomAmenitiesCategoryQuery(
    {
      property_id: users?.defaultPropertyId,
    },
    {
      refetchOnMountOrArgChange: true,
      skip: false,
    }
  );
  const { data: roomAmenitiesList, refetch } = useGetRoomAmenitiesQuery(
    {
      property_id: users?.defaultPropertyId,
    },
    {
      refetchOnMountOrArgChange: true,
      skip: false,
    }
  );
  const [attachRoomAmenity, { isLoading }] = useAttachRoomAmenityMutation();
  const [detachRoomAmenity] = useDetachRoomAmenityMutation();

  useEffect(() => {
    if (params?.id) {
      onRefresh();
    }
  }, [params]);

  const onRefresh = async () => {
    if (params?.id) {
      refetch();
      const response = await getRoomTypeById({ id: params.id });
      if (response?.error) {
        openSnackbar(response.error as string, "error");
        return;
      }
      const amenities = response?.data?.amenities ?? [];
      const amenitiesByCategories = amenities.reduce(
        (acc, amenity) => {
          const categoryId = amenity.category_id;
          if (!acc[categoryId]) {
            acc[categoryId] = [];
          }
          acc[categoryId].push(amenity);
          return acc;
        },
        {} as Record<number, IRoomAmenity[]>
      );
      setAmenitiesByCategory(amenitiesByCategories);
      setAmenitiesList(amenities);
    }
  };

  const onAmenityAppend = async () => {
    if (params?.id && selectedAmenity?.id) {
      setLoadingAmenities((prev) => ({ ...prev, [selectedAmenity.id]: true }));
      const response = await attachRoomAmenity({
        room_amenity_id: Number(selectedAmenity.id),
        room_type_id: Number(params.id),
      });
      setLoadingAmenities((prev) => ({ ...prev, [selectedAmenity.id]: false }));
      if (response?.error) {
        openSnackbar(response.error as string, "error");
        return;
      }
      openSnackbar("Room Amenity added successfully!", "success");
      setSelectedAmenity(null);
      onRefresh();
    }
  };

  const onAmenityRemove = async (amenityId: number) => {
    // console.log(params?.id, amenityId, "amenityId");
    if (params?.id && amenityId) {
      setLoadingAmenities((prev) => ({ ...prev, [amenityId]: true }));
      const response = await detachRoomAmenity({
        room_amenity_id: amenityId,
        room_type_id: Number(params.id),
      });
      setLoadingAmenities((prev) => ({ ...prev, [amenityId]: false }));
      if (response?.error) {
        openSnackbar(response.error as string, "error");
        return;
      }
      openSnackbar("Room Amenity detach successfully!", "success");
      onRefresh();
    }
  };

  const truncateLabel = (text: string, maxLength: number = 255) => {
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center">
          <LocalOfferIcon />
          <Typography variant="h6" sx={{ ml: 1 }}>
            Amenities
          </Typography>
        </Box>
        <Grid container spacing={2} mb={4} mt={2}>
          <Grid item xs={12} md={6}>
            <Autocomplete
              options={
                (roomAmenitiesList ?? []).filter(
                  (amenity) => !amenitiesList.some((a) => a.id === amenity.id)
                ) ?? []
              }
              getOptionLabel={(option) => option.name}
              groupBy={(option) => {
                // Group by category name
                return (
                  amenitiesCategoriesList?.find(
                    (cat) => cat.id === option.category_id
                  )?.name ?? "Other"
                );
              }}
              renderOption={(props, option) => {
                const category = amenitiesCategoriesList?.find(
                  (cat) => cat.id === option.category_id
                );

                return (
                  <MenuItem {...props} key={option.id}>
                    <Box display="flex" alignItems="center" gap={1}>
                      {/* Display category icon if available */}
                      {category?.icon_path && (
                        <DynamicIcon name={category.icon_path} />
                      )}
                      <DynamicIcon name={option.icon_path} />
                      <Typography>{option.name}</Typography>
                    </Box>
                  </MenuItem>
                );
              }}
              value={selectedAmenity}
              onChange={(_event, newValue) => setSelectedAmenity(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Amenities"
                  placeholder="Select Amenities"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: selectedAmenity ? (
                      <DynamicIcon name={selectedAmenity.icon_path} />
                    ) : null,
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <PrimaryButton
              label={`Add ${truncateLabel(selectedAmenity?.name ?? "", 20)}`}
              buttonStyles={{
                backgroundColor: "#32A1AE",
                color: "#FFFFFF",
                fontWeight: "bold",
              }}
              onClick={onAmenityAppend}
              isLoading={isLoading}
              disabled={!selectedAmenity}
              startIcon={<AddIcon />}
            />
          </Grid>
        </Grid>

        {isLoadingRoomType ? (
          <RoomAmenitiesSkeleton />
        ) : amenitiesList && amenitiesList.length > 0 ? (
          Object.entries(amenitiesByCategory).map(([category, amenities]) => {
            const categoryName = amenitiesCategoriesList?.find(
              (a) => a.id === Number(category)
            )?.name;

            return (
              <Box key={category} mb={2}>
                <Typography variant="h6" gutterBottom>
                  {categoryName ?? ""}
                </Typography>
                <Grid container spacing={2}>
                  {amenities.map((amenity: IRoomAmenity) => (
                    <Grid item xs={3} key={amenity.id}>
                      <Tooltip title={amenity.name} arrow>
                        <Chip
                          label={amenity.name}
                          icon={<DynamicIcon name={amenity.icon_path ?? ""} />}
                          deleteIcon={
                            <DeleteIcon aria-label={`Delete ${amenity.name}`} />
                          }
                          onDelete={() => onAmenityRemove(amenity.id)}
                          sx={{ fontWeight: 700, padding: "10px" }}
                          color={
                            loadingAmenities[amenity.id]
                              ? "secondary"
                              : "default"
                          }
                          disabled={loadingAmenities[amenity.id]}
                        />
                      </Tooltip>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            );
          })
        ) : (
          <Typography variant="h6" color="textSecondary" align="center">
            No amenities linked. Please add.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default RoomAmenities;
