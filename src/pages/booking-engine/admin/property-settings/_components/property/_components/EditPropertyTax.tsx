import {
  Grid,
  Checkbox,
  FormControlLabel,
  Box,
  Typography,
  Link,
} from "@mui/material";
import ConfirmationDialog from "components/elements/ConfirmationDialog/ConfirmationDialog";
import Modal from "components/widgets/ModalWindows/Modal";
import useSnackbar from "hooks/useSnackbar";
import React, { useEffect, useState } from "react";
import {
  useGetTaxListQuery,
  useUpdateTaxMutation,
} from "services/financeSlice";
import { ITaxTypes } from "types/financialSettingTypes";
import TaxDetailModal from "./TaxDetailModal";

interface IEditPropertyTax {
  property_id?: number | null;
  onRefresh?: () => void;
}

const EditPropertyTax: React.FC<IEditPropertyTax> = ({
  property_id,
  onRefresh,
}) => {
  const { openSnackbar } = useSnackbar();
  const { data: propertyTaxesList, refetch } = useGetTaxListQuery({
    property_id: property_id ?? 0,
  });
  const [updateTax, { isLoading }] = useUpdateTaxMutation();

  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
  const [taxToUpdate, setTaxToUpdate] = useState<ITaxTypes | null>(null);
  const [openTaxDetailModal, setOpenTaxDetailModal] = useState(false);

  useEffect(() => {
    if (property_id && property_id > 0) {
      refetch();
    }
  }, [property_id]);

  const handleToggleTaxActiveStatus = (tax: ITaxTypes) => {
    setTaxToUpdate(tax);
    setOpenConfirmationDialog(true);
  };

  const handleConfirmTaxStatusChange = async () => {
    if (taxToUpdate) {
      const response = await updateTax({
        active: !taxToUpdate.active,
        description: taxToUpdate.description,
        name: taxToUpdate.name,
        property_id: property_id?.toString() ?? "",
        type: taxToUpdate.type?.toString() ?? "",
        id: taxToUpdate.id,
      });
      if (response?.error) {
        openSnackbar(`Error: ${response.error}`, "error");
      }
      openSnackbar(`Your tax has been updated successfully!`, "success");
      onRefresh?.();
      refetch();
      setOpenConfirmationDialog(false);
    }
  };

  const handleCloseConfirmationDialog = () => {
    setOpenConfirmationDialog(false);
    setTaxToUpdate(null);
  };

  const handleOpenTaxDetailModal = (tax: ITaxTypes) => {
    setTaxToUpdate(tax);
    setOpenTaxDetailModal(true);
  };

  const handleCloseTaxDetailModal = () => {
    setOpenTaxDetailModal(false);
    setTaxToUpdate(null);
  };

  return (
    <Grid container spacing={2}>
      {(propertyTaxesList ?? []).map((tax: ITaxTypes, index: number) => (
        <Grid item md={3} sm={4} xs={12} key={index.toString()}>
          <Box display="flex" alignItems="flex-start" flexDirection="column">
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={tax.active}
                    onChange={() => handleToggleTaxActiveStatus(tax)} // Trigger dialog on toggle
                    color="primary"
                  />
                }
                label={tax.name}
              />
            </Box>
            <Typography variant="caption" color="text.secondary">
              Start From:{" "}
              {tax?.versions?.[0]?.starts_from &&
                new Date(tax?.versions?.[0]?.starts_from).toLocaleDateString()}
            </Typography>
            <Link
              href="#"
              onClick={() => handleOpenTaxDetailModal(tax)}
              variant="body2"
              color="primary"
            >
              View Details
            </Link>
          </Box>
        </Grid>
      ))}

      <ConfirmationDialog
        open={openConfirmationDialog}
        title={`Confirm Status Change`}
        description={`Are you sure you want to set the tax "${taxToUpdate?.name}" to ${taxToUpdate?.active ? "inactive" : "active"}?`}
        buttons={[
          {
            label: isLoading
              ? "Loading..."
              : taxToUpdate?.active
                ? "Delete"
                : "Activate",
            onClick: handleConfirmTaxStatusChange,
          },
          { label: "Cancel", onClick: handleCloseConfirmationDialog },
        ]}
        onClose={handleCloseConfirmationDialog}
      />

      {/* Tax Detail Modal */}
      <Modal
        open={openTaxDetailModal}
        title={`Tax Detail: ${taxToUpdate?.name}`}
        size="sm"
        onClose={handleCloseTaxDetailModal}
        isHideCloseButton={true}
      >
        <TaxDetailModal taxToUpdate={taxToUpdate} />
      </Modal>
    </Grid>
  );
};

export default EditPropertyTax;
