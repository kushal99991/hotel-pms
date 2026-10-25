import React from "react";
import { Box, Card, CardContent, Divider, Typography } from "@mui/material";
import RuleFolderIcon from "@mui/icons-material/RuleFolder";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import { IProperty } from "types/property";
import PropertyAmenity from "./_components/PropertyAmenity";
import PropertyMedia from "./_components/PropertyMedia";
import PropertyCancellationPolicy from "./_components/PropertyCancellationPolicy";
import PropertyTaxes from "./_components/PropertyTaxes";

interface GeneralConfigurationProps {
  property: IProperty | null;
  isLoading: boolean;
  refresh: () => void;
}

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

const GeneralConfiguration: React.FC<GeneralConfigurationProps> = ({
  property,
  isLoading,
  refresh,
}) => {
  return (
    <Box mt={2}>
      <Box sx={{ mb: 3 }}>
        {/* Property Cancellation Policy */}
        <Card>
          <CardContent>
            <CustomCardTitle
              title="Cancellation Policy"
              icon={<RuleFolderIcon />}
            />
            <PropertyCancellationPolicy
              property={property}
              refreshView={refresh}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </Box>

      <Divider />

      <Box sx={{ mb: 3 }}>
        {/* Property Taxes */}
        <Card>
          <CardContent>
            <CustomCardTitle title="Taxes" icon={<RuleFolderIcon />} />
            <PropertyTaxes property={property} />
          </CardContent>
        </Card>
      </Box>

      <Divider />

      <Box sx={{ mb: 3 }}>
        {/* Property Amenities */}
        <Card>
          <CardContent>
            <CustomCardTitle title="Amenities" icon={<LocalOfferIcon />} />
            {property?.id && <PropertyAmenity propertyId={property.id} />}
          </CardContent>
        </Card>
      </Box>

      <Divider />

      <Box sx={{ mb: 3 }}>
        {/* Property Media */}
        <Card>
          <CardContent>
            <CustomCardTitle title="Media" icon={<PhotoLibraryIcon />} />
            {property?.id && <PropertyMedia propertyId={property.id} />}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};
export default GeneralConfiguration;
