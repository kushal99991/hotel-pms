import React, { useCallback, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Grid, SnackbarContent, IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";
import { IOraganization, IOrg } from "types/org";
import { updateOrganizationSchema } from "utils/validations.utils";
import { useUpdateOrgByIdMutation } from "services/organizationSlice";
import Input from "components/elements/TextInput/TextInput";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import CancelButton from "components/elements/Button/CancelButton";

interface OrganizationEditFormProps {
  organization: IOrg;
  handleCancelClick: () => void;
}

const OrganizationEditForm: React.FC<OrganizationEditFormProps> = ({
  organization,
  handleCancelClick,
}) => {
  const [snackbarState, setSnackbarState] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });
  const methods = useForm<IOraganization>({
    mode: "onChange",
    resolver: yupResolver(updateOrganizationSchema),
    defaultValues: {
      address: organization.address,
      description: organization.description,
      email: organization.email,
      name: organization.name,
      phone: organization.phone,
    },
  });
  const { handleSubmit, control } = methods;
  const [updateOrgById, { isLoading }] = useUpdateOrgByIdMutation();

  const onSubmit = useCallback(
    async (formData: IOraganization) => {
      try {
        const response = await updateOrgById({
          id: organization.id,
          data: formData,
        });
        if (response.error) {
          setSnackbarState({
            open: true,
            message: "Failed to update property details.",
            severity: "error",
          });
          return false;
        }
        handleCancelClick();
      } catch {
        /** empty */
      }
    },
    [handleCancelClick, organization.id, updateOrgById]
  );
  return (
    <form data-testid="edit-org-form" onSubmit={handleSubmit(onSubmit)}>
      {snackbarState.open && (
        <SnackbarContent
          message={snackbarState.message}
          color="danger"
          style={{ backgroundColor: "red" }}
          action={
            <IconButton
              onClick={() =>
                setSnackbarState((prev) => ({ ...prev, open: false }))
              }
            >
              <Close />
            </IconButton>
          }
        />
      )}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box mb={3}>
            <Controller
              name="name"
              control={control}
              render={({
                field: { onChange, value },
                fieldState: { invalid, isDirty, error },
              }) => {
                return (
                  <Input
                    isInvalid={invalid || isDirty}
                    onChange={(
                      event: React.ChangeEvent<
                        HTMLInputElement | HTMLTextAreaElement
                      >
                    ) => onChange(event.target.value)}
                    value={value}
                    label="Name"
                    key={0}
                    fullWidth
                    helperText={error?.message ?? ""}
                    inputProps={{ "data-testid": "organization-name" }}
                  />
                );
              }}
            />
          </Box>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Box mb={3}>
            <Controller
              name="phone"
              control={control}
              render={({
                field: { onChange, value },
                fieldState: { invalid, isDirty, error },
              }) => {
                return (
                  <Input
                    isInvalid={invalid || isDirty}
                    onChange={(
                      event: React.ChangeEvent<
                        HTMLInputElement | HTMLTextAreaElement
                      >
                    ) => onChange(event.target.value)}
                    value={value}
                    label="Phone"
                    key={0}
                    fullWidth
                    helperText={error?.message ?? ""}
                    inputProps={{ "data-testid": "organization-phone" }}
                  />
                );
              }}
            />
          </Box>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Box mb={3}>
            <Controller
              name="address"
              control={control}
              render={({
                field: { onChange, value },
                fieldState: { invalid, isDirty, error },
              }) => {
                return (
                  <Input
                    isInvalid={invalid || isDirty}
                    onChange={(
                      event: React.ChangeEvent<
                        HTMLInputElement | HTMLTextAreaElement
                      >
                    ) => onChange(event.target.value)}
                    value={value}
                    label="Address"
                    key={0}
                    fullWidth
                    helperText={error?.message ?? ""}
                    inputProps={{ "data-testid": "organization-address" }}
                  />
                );
              }}
            />
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box mb={3}>
            <Controller
              name="email"
              control={control}
              render={({
                field: { onChange, value },
                fieldState: { invalid, isDirty, error },
              }) => {
                return (
                  <Input
                    isInvalid={invalid || isDirty}
                    onChange={(
                      event: React.ChangeEvent<
                        HTMLInputElement | HTMLTextAreaElement
                      >
                    ) => onChange(event.target.value)}
                    value={value}
                    label="Email"
                    key={0}
                    fullWidth
                    helperText={error?.message ?? ""}
                    inputProps={{ "data-testid": "organization-email" }}
                    type="email"
                  />
                );
              }}
            />
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box mb={3}>
            <Controller
              name="description"
              control={control}
              render={({
                field: { onChange, value },
                fieldState: { invalid, isDirty, error },
              }) => {
                return (
                  <Input
                    isInvalid={invalid || isDirty}
                    onChange={(
                      event: React.ChangeEvent<
                        HTMLInputElement | HTMLTextAreaElement
                      >
                    ) => onChange(event.target.value)}
                    value={value}
                    label="Email"
                    key={0}
                    fullWidth
                    multiline
                    rows={4}
                    helperText={error?.message ?? ""}
                    inputProps={{ "data-testid": "organization-description" }}
                    type="email"
                  />
                );
              }}
            />
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <CancelButton onClick={handleCancelClick} />
            <PrimaryButton label="Save" type="submit" isLoading={isLoading} />
          </Box>
        </Grid>
      </Grid>
    </form>
  );
};

export default OrganizationEditForm;
