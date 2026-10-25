import React, { useState, useContext, Dispatch, SetStateAction } from "react";
import dayjs from "dayjs";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Grid,
  FormControlLabel,
  Checkbox,
  Typography,
  TextField,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import ReservationDetailsContext from "contexts/ReservationDetailsContext";
import { IReservationResponse, VerifyGuest } from "types/reservationTypes";
import { CheckinState } from "types/reservationCheckIn";
import FormTextField from "components/forms/FormTextField";
import { useUpdateGuestMutation } from "services/guestSlice";
import { FormProvider, useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import VerifyContactInfo from "./VerifyContactInfo";
import { countries } from "utils/countries";
import { appConfig } from "config/app.config";
import { verifyGuestSchema } from "utils/validations.utils";

interface VerifyInformationStepProps {
  reservation?: IReservationResponse | null;
  stepIndex: number;
  onRefresh: () => void;
  updateState: React.Dispatch<React.SetStateAction<CheckinState>>;
  checkInState?: CheckinState;
  setDisableNext?: Dispatch<SetStateAction<boolean>>;
}

const VerifyInformationStep: React.FC<VerifyInformationStepProps> = ({
  reservation,
  onRefresh,
  setDisableNext,
}) => {
  const { viewState: reservationViewState, setViewState } = useContext(
    ReservationDetailsContext
  )!;
  const [editing, setEditing] = useState(false);
  const [updateGuest, { isLoading: isSaving }] = useUpdateGuestMutation();
  const formMethods = useForm<VerifyGuest>({
    resolver: yupResolver(verifyGuestSchema),
    mode: "all",
    defaultValues: {
      first_name: reservation?.reservation_first_guest_info?.first_name,
      last_name: reservation?.reservation_first_guest_info?.last_name,
      email: reservation?.reservation_first_guest_info?.email ?? "",
      document_issuing_country:
        reservation?.reservation_first_guest_info?.document_issuing_country ??
        "",
      document_type:
        reservation?.reservation_first_guest_info?.document_type ?? "",
      document_number:
        reservation?.reservation_first_guest_info?.document_number ?? "",
      document_expiration_date: reservation?.reservation_first_guest_info
        ?.document_expiration_date
        ? new Date(
            reservation?.reservation_first_guest_info?.document_expiration_date
          )
        : null,
      document_issue_date: reservation?.reservation_first_guest_info
        ?.document_issue_date
        ? new Date(
            reservation?.reservation_first_guest_info?.document_issue_date
          )
        : null,
    },
  });
  const { getValues, control } = formMethods;
  const [errorMessage, setErrorMessage] = useState("");
  const verifyChecked = reservationViewState?.guestVerified;
  function handleVerifyChecked() {
    const nextChecked = !verifyChecked;
    setViewState({
      ...reservationViewState,
      guestVerified: nextChecked,
    });
  }
  function handleEditContactInfo(isEditing: boolean) {
    setEditing(isEditing);
  }

  async function updateGuestInformation(info: VerifyGuest) {
    setErrorMessage("");
    setDisableNext?.(true);
    const postBody = {
      id: reservation?.reservation_first_guest_info?.id ?? -1,
      ...info,
    };
    if (info.document_expiration_date) {
      postBody.document_expiration_date = info.document_expiration_date;
    }
    if (info.document_issue_date) {
      postBody.document_issue_date = info.document_issue_date;
    }
    const response = await updateGuest(postBody);
    setDisableNext?.(false);
    if (response.error) {
      setErrorMessage(response.error.toString());
    } else if (response.data) {
      onRefresh();
      setEditing(false);
    }
  }

  function handleSaveContactInfo() {
    const [first_name, last_name, email] = getValues([
      "first_name",
      "last_name",
      "email",
    ]);
    updateGuestInformation({
      first_name,
      last_name,
      email,
    });
  }

  function collectDocumentValues() {
    const valuesKeys = [
      "document_type",
      "document_number",
      "document_issue_date",
      "document_issuing_country",
      "document_expiration_date",
    ];
    const values = getValues([
      "document_type",
      "document_number",
      "document_issue_date",
      "document_issuing_country",
      "document_expiration_date",
    ]);
    const definedValues = values.reduce((agg: any, val: any, idx: number) => {
      if (val) {
        const valKey = valuesKeys[idx];
        agg[valKey] = val;
      }
      return agg;
    }, {});
    return definedValues;
  }

  function handleSaveDocumentInfo() {
    const values = collectDocumentValues();
    if (Object.keys(values).length) {
      updateGuestInformation({
        first_name: reservation?.reservation_first_guest_info?.first_name,
        last_name: reservation?.reservation_first_guest_info?.last_name,
        email: reservation?.reservation_first_guest_info?.email ?? "",
        ...values,
      });
    }
    return;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <FormProvider {...formMethods}>
        {errorMessage && (
          <Alert
            sx={{ mb: 2 }}
            severity="error"
            onClose={() => {
              setErrorMessage("");
            }}
          >
            {`Error updating guest: ${errorMessage}. Please try again`}
          </Alert>
        )}
        <Box mx={-2}>
          <VerifyContactInfo
            onEditUpdate={handleEditContactInfo}
            onUpdate={handleSaveContactInfo}
            editing={editing}
          />
          <Box mt={3}>
            <Typography variant="h6">Document Information</Typography>
            <Grid container mt={1} spacing={2}>
              <FormTextField name="document_type" label="Document Type" />
              <FormTextField name="document_number" label="Document Number" />
            </Grid>
            <Grid container spacing={2}>
              <Grid item md={6} mt={2}>
                <Controller
                  name="document_issue_date"
                  control={control}
                  render={({
                    field: { onChange, value },
                    fieldState: { error, invalid },
                  }) => {
                    return (
                      <DatePicker
                        label="Document Issue Date"
                        value={value ? dayjs(value) : null}
                        onChange={(value) => {
                          onChange(value?.format(appConfig.dateApiFormat));
                        }}
                        format={appConfig.displayDateFormat}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            sx: (theme) => ({
                              [theme.breakpoints.only("sm")]: {
                                marginTop: "16px",
                              },
                            }),
                            error: invalid,
                            helperText: error?.message,
                          },
                        }}
                      />
                    );
                  }}
                />
              </Grid>
              <Grid item md={6} mt={2}>
                <Controller
                  name="document_expiration_date"
                  control={control}
                  render={({
                    field: { onChange, value },
                    fieldState: { error, invalid },
                  }) => {
                    return (
                      <DatePicker
                        label="Document Expiration Date"
                        value={value ? dayjs(value) : null}
                        onChange={(value) => {
                          onChange(value?.format(appConfig.dateApiFormat));
                        }}
                        format={appConfig.displayDateFormat}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            sx: (theme) => ({
                              [theme.breakpoints.only("sm")]: {
                                marginTop: "16px",
                              },
                            }),
                            error: invalid,
                            helperText: error?.message,
                          },
                        }}
                      />
                    );
                  }}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item sm={6} mt={2}>
                <Controller
                  name="document_issuing_country"
                  control={control}
                  render={({
                    field: { onChange, value },
                    fieldState: { error, invalid },
                  }) => {
                    const selectedCountry = countries.find(
                      (c) => c.value === value
                    );

                    return (
                      <Autocomplete
                        value={selectedCountry || null}
                        onChange={(_, selectedOption) =>
                          onChange(selectedOption?.value)
                        }
                        options={countries}
                        getOptionLabel={(option) => option.label}
                        isOptionEqualToValue={(option, value) =>
                          option.value === value.value
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Issuing Country"
                            error={invalid}
                            helperText={error?.message}
                            placeholder="Issuing Country"
                          />
                        )}
                        fullWidth
                      />
                    );
                  }}
                />
              </Grid>
            </Grid>
            <Box textAlign="right" mt={2}>
              <Button
                onClick={() => {
                  handleSaveDocumentInfo();
                }}
                variant="contained"
                color="secondary"
                size="small"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </Box>
          </Box>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            mt={4}
          >
            <FormControlLabel
              label="I have verified the guest's information"
              control={
                <Checkbox
                  onChange={handleVerifyChecked}
                  checked={verifyChecked}
                  size="large"
                />
              }
              sx={{ fontSize: "1.175rem" }}
            />
          </Box>
        </Box>
      </FormProvider>
    </LocalizationProvider>
  );
};

export default VerifyInformationStep;
