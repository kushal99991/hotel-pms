import * as React from "react";
import { IconButton, Box, Grid, TextField, Alert } from "@mui/material";
import { Add as AddIcon, Remove as RemoveIcon } from "@mui/icons-material";
import {
  useForm,
  useFieldArray,
  FormProvider,
  Controller,
} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  IReservationEmailConfirmation,
  IReservationResponse,
} from "types/reservationTypes";
import { reservationEmailConfirmationSchema } from "utils/validations.utils";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import { useSendConfirmationEmailMutation } from "services/reservationSlice";
import useSnackbar from "hooks/useSnackbar";

interface ISendMultipleEmails {
  details: IReservationResponse | null;
  onClose?: () => void;
}

const SendMultipleEmails: React.FC<ISendMultipleEmails> = ({
  details,
  onClose,
}) => {
  const { openSnackbar } = useSnackbar();
  const methods = useForm<IReservationEmailConfirmation>({
    mode: "all",
    resolver: yupResolver(reservationEmailConfirmationSchema),
    defaultValues: {
      guest_emails: [],
    },
  });

  const [sendConfirmationEmail, { isLoading }] =
    useSendConfirmationEmailMutation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = methods;

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "guest_emails",
  });

  React.useEffect(() => {
    if (details) {
      const guestEmails: { email: string }[] =
        details.guests
          ?.filter((guest) => guest?.email)
          .map((guest) => ({ email: guest.email ?? "" })) || [];

      const reservationHolderEmail =
        details.reservation_first_guest_info?.email ?? "";
      const filteredGuestEmails = guestEmails.filter(
        (guest) => guest.email !== reservationHolderEmail
      );

      const guest_emails = [
        { email: reservationHolderEmail },
        ...filteredGuestEmails,
      ];
      replace(guest_emails);
    }
  }, [details, replace]);

  const onSubmit = async (data: IReservationEmailConfirmation) => {
    if (!details?.id) return;

    const response = await sendConfirmationEmail({
      reservation_id: details.id,
      guest_emails: data.guest_emails.map((a) => a.email),
    });

    if (response?.error) {
      openSnackbar(response.error as string, "error");
      return;
    }

    reset();
    openSnackbar(
      response?.data?.message ?? "Email has been sent successfully!",
      "success"
    );
    onClose?.();
  };

  return (
    <FormProvider {...methods}>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2} gap={2}>
          {errors?.guest_emails?.root && (
            <Grid item xs={12} md={6} p={2}>
              <Alert severity="error">
                {errors?.guest_emails?.root.message}
              </Alert>
            </Grid>
          )}

          {fields.map((item, index) => (
            <Grid item xs={12} key={item.id}>
              <Box display="flex" alignItems="center" gap={2}>
                <Controller
                  name={`guest_emails.${index}.email`}
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      fullWidth
                      placeholder="Enter Email"
                      error={!!error}
                      {...field}
                      helperText={error?.message ?? ""}
                      inputProps={{
                        "data-testid": `email-input-${index}`,
                      }}
                    />
                  )}
                />

                <Box display="flex" alignItems="center">
                  {fields.length > 1 && index !== 0 && (
                    <IconButton color="error" onClick={() => remove(index)}>
                      <RemoveIcon />
                    </IconButton>
                  )}

                  {index === fields.length - 1 && (
                    <IconButton
                      color="primary"
                      onClick={() => append({ email: "" })}
                    >
                      <AddIcon />
                    </IconButton>
                  )}
                </Box>
              </Box>
            </Grid>
          ))}

          {/* Submit Button */}
          <Grid item xs={12} container justifyContent="center">
            <PrimaryButton
              label="Send Confirmation"
              loadingText="Sending..."
              isLoading={isLoading}
              onClick={handleSubmit(onSubmit)}
            />
          </Grid>
        </Grid>
      </Box>
    </FormProvider>
  );
};

export default SendMultipleEmails;
