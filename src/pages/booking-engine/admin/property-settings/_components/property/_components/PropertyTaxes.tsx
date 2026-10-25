import { useEffect, useState } from "react";
import {
  Paper,
  Typography,
  Box,
  IconButton,
  Skeleton,
  Grid,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { IProperty } from "types/property";
import FullScreenModal from "components/widgets/ModalWindows/FullScreenModal";
import { useGetTaxListQuery } from "services/financeSlice";
import { ITaxTypes } from "types/financialSettingTypes";
import EditPropertyTax from "./EditPropertyTax";

interface PropertyTaxesProps {
  property: IProperty | null;
}

const PropertyTaxes: React.FC<PropertyTaxesProps> = ({ property }) => {
  const {
    isLoading: isPropertyTaxLoading,
    data: propertyTaxesList,
    refetch: refreshView,
  } = useGetTaxListQuery({
    property_id: property?.id ?? 0,
    active: true,
  });
  const [editPropertyTax, setEditPropertyTax] = useState(false);

  useEffect(() => {
    if (property?.id) {
      refreshView();
    }
  }, [property?.id]);

  return (
    <Paper elevation={0} sx={{ padding: 2, marginBottom: 5 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Property Taxes display */}
        {isPropertyTaxLoading ? (
          <Skeleton variant="text" width="80%" height={30} sx={{ mb: 2 }} />
        ) : (propertyTaxesList ?? []).length > 0 ? (
          <Grid container>
            {(propertyTaxesList ?? []).map(
              (value: ITaxTypes, index: number) => (
                <Grid item md={2} xs={12} key={index.toString()} m={2}>
                  <Box
                    display="flex"
                    alignItems="flex-start"
                    flexDirection="column"
                  >
                    <Box
                      display="flex"
                      alignItems="center"
                      flexDirection="row"
                      gap={2}
                    >
                      <Typography>{value.name}</Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Start From:{" "}
                      {value?.versions?.[0]?.starts_from &&
                        new Date(
                          value?.versions?.[0]?.starts_from
                        ).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Grid>
              )
            )}
          </Grid>
        ) : (
          <Typography>No taxes activated to this property.</Typography>
        )}

        {/* Edit button */}
        {!isPropertyTaxLoading && (
          <IconButton
            aria-label="edit"
            onClick={() => setEditPropertyTax(true)}
            size="small"
          >
            <EditIcon />
          </IconButton>
        )}
      </Box>

      {/* Modal for attaching/detaching taxes */}
      <FullScreenModal
        title="Edit Taxes"
        open={editPropertyTax}
        onClose={() => {
          setEditPropertyTax(false);
        }}
        closeButtonLabel="Cancel"
      >
        <EditPropertyTax
          property_id={property?.id ?? 0}
          onRefresh={() => refreshView()}
        />
      </FullScreenModal>
    </Paper>
  );
};

export default PropertyTaxes;
