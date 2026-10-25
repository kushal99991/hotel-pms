import React from "react";
import {
  Alert,
  Grid,
  Button,
  CircularProgress,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { IAddNewGuestForm } from "types/guestTypes";
import FormTextField from "components/forms/FormTextField";
//import PrimaryButton from "components/elements/Button/PrimaryButton";
import {
  addNewSecondaryGuestValidationSchema,
  addNewGuestValidationSchema,
} from "utils/validations.utils";
//import SecondaryButton from "components/elements/Button/SecondaryButton";
import {
  useCreateGuestsMutation,
  useLinkGuestsWithReservationIdMutation,
} from "services/guestSlice";
import useSnackbar from "hooks/useSnackbar";

interface AddNewGuestProps {
  onClose: () => void;
  onRefresh?: () => void;
  reservation_id?: number | null;
}

const AddNewGuest: React.FC<AddNewGuestProps> = ({
  onClose,
  onRefresh,
  reservation_id,
}) => {
  const { openSnackbar } = useSnackbar();
  const [createGuests, { isLoading }] = useCreateGuestsMutation();
  const [linkGuestsWithReservationId, { isLoading: isLinkGuestLoading }] =
    useLinkGuestsWithReservationIdMutation();
  const methods = useForm<IAddNewGuestForm>({
    resolver: yupResolver(
      !reservation_id
        ? addNewGuestValidationSchema
        : addNewSecondaryGuestValidationSchema
    ),
  });
  const {
    handleSubmit,
    setError,
    reset,
    formState: { errors },
    watch,
    setValue,
  } = methods;

  const onSubmit = async (data: IAddNewGuestForm) => {
    const response = await createGuests(data);
    if (response.error) {
      setError(
        "root",
        { message: response.error as string },
        { shouldFocus: true }
      );
      return false;
    }
    if (reservation_id && response?.data?.id) {
      const resp = await linkGuestsWithReservationId({
        reservation_id,
        guest_id: response?.data?.id,
      });
      if (resp?.error) {
        setError(
          "root",
          { message: resp.error as string },
          { shouldFocus: true }
        );
        return false;
      } else {
        openSnackbar(
          resp?.data?.message ?? "Guest successfully linked to reservation!",
          "success"
        );
      }
    }
    reset();
    onRefresh?.();
    onClose();
  };

  return (
    <FormProvider {...methods}>
      {errors?.root && (
        <Alert severity="error">{errors.root?.message ?? ""}</Alert>
      )}
      <Grid container spacing={2}>
        <FormTextField
          name="first_name"
          sm={12}
          label="First Name"
          textFieldProps={{
            fullWidth: true,
            placeholder: "Enter First Name",
          }}
          gridProps={{ mb: 2, mt: 2 }}
        />
        <FormTextField
          name="last_name"
          sm={12}
          label="Last Name"
          textFieldProps={{
            fullWidth: true,
            placeholder: "Enter Last Name",
          }}
          gridProps={{ mb: 2 }}
        />
        <FormTextField
          name="email"
          sm={12}
          label="Email"
          textFieldProps={{
            fullWidth: true,
            placeholder: "Enter Email",
            type: "email",
          }}
          gridProps={{ mb: 2 }}
        />
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={Boolean(watch("vip"))}
                onChange={(_, checked) => setValue("vip", checked)}
              />
            }
            label="VIP"
          />
        </Grid>
        <Grid
          item
          xs={12}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          gap={2}
        >
          <Button
            onClick={() => onClose()}
            color="error"
            variant="outlined"
            size="small"
            sx={{ marginRight: 2 }}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={isLoading || isLinkGuestLoading}
            color="success"
            variant="contained"
            size="small"
          >
            {isLoading || isLinkGuestLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Create"
            )}
          </Button>
        </Grid>
      </Grid>
    </FormProvider>
  );
};

export default AddNewGuest;
