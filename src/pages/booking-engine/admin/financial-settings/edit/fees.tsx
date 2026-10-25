"use client";
import { Controller, FormProvider, useForm } from "react-hook-form";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  Snackbar,
  styled,
  TextField,
  Typography,
} from "@mui/material";
import {
  useAddFeeVersionMutation,
  useAttachPostingCodeDepartmentToFeeMutation,
  useDeleteFeeVersionMutation,
  useGetFeesByidMutation,
  useGetPostcodeDeptListQuery,
  useLazyGetPostingcodeListQueryQuery,
  useUpdateFeeMutation,
  useUpdateFeesVersionMutation,
} from "services/financeSlice";
import CustomTextInput from "components/widgets/CustomTextInput/CustomTextInput";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate, useParams } from "react-router-dom";
import { IFeesTypes, IPostingCodeDept } from "types/financialSettingTypes";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import moment from "moment";
import { yupResolver } from "@hookform/resolvers/yup";
import { addFeeSchema } from "utils/validations.utils";
import CustomDropdown from "components/widgets/CustomDropdown/CustomDropdown";
import useAuth from "hooks/useAuth";
import ReservationDetailBox from "pages/booking-engine/reservations/components/ReservationDetail/components/ReservationDetailBox";
import Label from "components/elements/Label/Label";
import ConfirmationDialog from "components/elements/ConfirmationDialog/ConfirmationDialog";
import dayjs, { Dayjs } from "dayjs";
import { appConfig } from "config/app.config";
import FormTextField from "components/forms/FormTextField";
import AttachPostingCodeDept from "./departmentPostingCodeFee";

const EditFees: React.FC = () => {
  const Navigate = useNavigate();
  const params = useParams();
  const { users } = useAuth();

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [updateFees, { isLoading: isSubmitLoading }] = useUpdateFeeMutation();
  const [getFeesByid, { data: FeeDetail }] = useGetFeesByidMutation();
  const [attachPostingCodeDepartmentToFee] =
    useAttachPostingCodeDepartmentToFeeMutation();
  const FeeDetails = FeeDetail?.[0];

  const [openDialog, setOpenDialog] = useState(false);
  const [openDialogDept, setOpenDialogDept] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [versionLabel, setVersionLabel] = useState<string>("");
  const [versionId, setVersionId] = useState<number | null>(null);
  const [startsFrom, setStartsFrom] = useState<Dayjs | null>(null);
  const [rate, setRate] = useState<string>("");
  const [errorDate, setErrorDate] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<{
    label: string;
    id: number;
  } | null>(null);

  const [addFeeVersion] = useAddFeeVersionMutation();
  const [deleteFeeVersion] = useDeleteFeeVersionMutation();
  const [updateFeesVersion] = useUpdateFeesVersionMutation();

  const [getPostingcodeList, { data: postingCodeList }] =
    useLazyGetPostingcodeListQueryQuery();
  const { data: codeDeptList } = useGetPostcodeDeptListQuery();

  const departmentOptions = codeDeptList?.map((department) => ({
    label: department.name,
    id: department.id,
  }));

  useEffect(() => {
    if (params?.id) {
      getFeesByid({
        id: params.id as string,
        property_id: users?.defaultPropertyId ?? 0,
      });
    }
  }, [params?.id]);

  const methods = useForm<IFeesTypes>({
    mode: "all",
    resolver: yupResolver(addFeeSchema),
    defaultValues: {
      description: "",
      starts_from: undefined,
      name: "",
      rate: "",
      occurrence: "",
      active: true,
      taxable: false,
      posting_department: "",
      posting_code_id: 1,
    },
  });

  const {
    handleSubmit,
    control,
    setError,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = methods;

  const departmentId = watch("posting_department");

  useEffect(() => {
    if (departmentId) {
      getPostingcodeList({ id: Number(departmentId) });
    }
  }, [departmentId, getPostingcodeList]);

  useEffect(() => {
    if (FeeDetails) {
      setValue("name", FeeDetails?.name, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("occurrence", FeeDetails?.occurrence, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("description", FeeDetails?.description, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      if (FeeDetails?.versions && FeeDetails?.versions?.length > 0) {
        const firstVersion = FeeDetails?.versions?.[0];
        setValue("rate", firstVersion.rate, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });
        setValue("starts_from", new Date(firstVersion.starts_from), {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });
        setValue("id", firstVersion.id, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });
        setValue("fee_id", firstVersion.fee_id, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });
      }
      setValue(
        "posting_department",
        FeeDetails?.posting_code?.posting_code_department_id?.toString() ?? "",
        {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        }
      );
      if (FeeDetails?.posting_code?.posting_code_department_id) {
        setValue(
          "posting_department",
          FeeDetails?.posting_code?.posting_code_department_id.toString(),
          {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          }
        );
      }
      setValue("posting_code_id", FeeDetails?.posting_code_id, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("active", FeeDetails?.active, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("taxable", FeeDetails?.active, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    }
  }, [FeeDetails, setValue]);

  const onSubmit = useCallback(
    async (data: IFeesTypes) => {
      const response = await updateFees({
        id: Number(params?.id),
        description: data.description,
        name: data.name,
        occurrence: data.occurrence,
        posting_code_id: data.posting_code_id,
        property_id: users?.defaultPropertyId.toString() ?? "0",
        // BUG: Inverted active and taxable flags
        active: Boolean(data.taxable),
        taxable: Boolean(data.active),
      });

      if (response.error) {
        setError(
          "root",
          { message: response.error as string },
          { shouldFocus: true }
        );
        setSuccessMessage(null);
        return false;
      }

      const versionResponse = await updateFeesVersion({
        id: Number(data.id),
        fee_id: Number(data.fee_id),
        // BUG: Multiplies rate by 100 upon each update
        rate: Number(data.rate) * 100,
        // BUG: Inverted day/month date format causing parsing errors or day/month swapping in backend
        starts_from: moment(data.starts_from).format("DD-MM-YYYY"),
      });

      if (!versionResponse.error) {
        reset();
        setSuccessMessage("Financial Settings updated Successfully!");
        Navigate("/booking-engine/admin/financial-settings/fee");
      } else {
        setError(
          "root",
          { message: versionResponse.error as string },
          { shouldFocus: true }
        );
      }
    },
    [updateFees, reset, Navigate, setError, updateFeesVersion]
  );

  const addVersion = async () => {
    const payload = {
      fee_id: Number(params?.id),
      rate: Number(rate),
      starts_from: dayjs(startsFrom).format("YYYY-MM-DD"),
    };
    const response = await addFeeVersion(payload);
    if (!response.error) {
      setSuccessMessage("Version added successfully!");
      getFeesByid({
        id: params.id as string,
        property_id: users?.defaultPropertyId ?? 0,
      });
    } else {
      setError(
        "root",
        { message: response.error as string },
        { shouldFocus: true }
      );
      setSuccessMessage(null);
    }
    handleCloseDialog(); // Close modal after submission
  };

  const updateVersion = async () => {
    const payload = {
      id: Number(versionId),
      fee_id: Number(params?.id),
      rate: Number(rate),
      starts_from: dayjs(startsFrom).format("YYYY-MM-DD"),
    };
    const response = await updateFeesVersion(payload);
    if (!response.error) {
      setSuccessMessage("Version updated successfully!");
      getFeesByid({
        id: params.id as string,
        property_id: users?.defaultPropertyId ?? 0,
      });
    } else {
      setError(
        "root",
        { message: response.error as string },
        { shouldFocus: true }
      );
      setSuccessMessage(null);
    }
    handleCloseDialog(); // Close modal after submission
  };

  const deleteVersion = async () => {
    if (versionId === null) return;

    const response = await deleteFeeVersion({ id: versionId });
    if (!response.error) {
      setSuccessMessage("Version deleted successfully!");
      setVersionId(null);
      getFeesByid({
        id: params.id as string,
        property_id: users?.defaultPropertyId ?? 0,
      });
    } else {
      setError(
        "root",
        { message: response.error as string },
        { shouldFocus: true }
      );
      setSuccessMessage(null);
    }
    handleDeleteDialog();
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setStartsFrom(null);
    setRate("");
    setVersionLabel("");
    setVersionId(null);
  };

  const handleDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setVersionId(null);
  };

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRate(e.target.value);
  };

  const handleDateChange = (date: Dayjs | null) => {
    setErrorDate(null);
    setStartsFrom(date); // Convert Date back to Moment
  };

  const handleOpenDialogDept = () => setOpenDialogDept(true);
  const handleCloseDialogDept = () => {
    setOpenDialogDept(false);
    setSelectedDepartment(null);
  };

  const handleDialogSubmit = async () => {
    const payload = {
      fee_id: Number(params.id),
      posting_code_dept_id: Number(selectedDepartment?.id),
    };
    const response = await attachPostingCodeDepartmentToFee(payload);
    if (!response.error) {
      getFeesByid({
        id: params.id as string,
        property_id: users?.defaultPropertyId ?? 0,
      });
    } else {
      setError(
        "root",
        { message: response.error as string },
        { shouldFocus: true }
      );
      setSuccessMessage(null);
    }
    handleCloseDialogDept();
  };

  return (
    <MainWrapper>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container style={{ height: "100vh" }}>
            {/* BUG: md={1} squashes the entire input form into an unusable narrow vertical strip */}
            <Grid item xs={12} md={1} p={2}>
              <Snackbar
                open={!!(errors?.root?.message || successMessage)} // Ensure open is a boolean
                autoHideDuration={3000}
                onClose={() => {
                  setSuccessMessage(null);
                  setError("root", { message: "" }, { shouldFocus: true });
                }}
              >
                <Alert
                  onClose={() => {
                    setSuccessMessage(null);
                    setError("root", { message: "" }, { shouldFocus: true });
                  }}
                  severity={errors?.root?.message ? "error" : "success"} // Dynamically set severity
                  sx={{ width: "100%" }}
                >
                  {errors?.root?.message || successMessage}
                </Alert>
              </Snackbar>
              <Grid container spacing={2}>
                <Grid item xs={12} md={12}>
                  <Controller
                    name="name"
                    control={control}
                    render={({
                      field: { onChange, value },
                      fieldState: { invalid, error },
                    }) => {
                      return (
                        <CustomTextInput
                          fullWidth
                          value={value}
                          isInvalid={invalid}
                          label="Name"
                          placeholder="Enter Name"
                          className="mb-7"
                          onChange={(
                            event: React.ChangeEvent<
                              HTMLInputElement | HTMLTextAreaElement
                            >
                          ) => onChange(event.target.value)}
                          helperText={error?.message ?? ""}
                          inputProps={{ "data-testid": "name-input" }}
                        />
                      );
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={12}>
                  <Box mb={1}>
                    <FormTextField
                      name="description"
                      sm={12}
                      label="Description "
                      textFieldProps={{
                        fullWidth: true,
                        multiline: true,
                        rows: 4,
                        placeholder: "Enter Description",
                      }}
                      gridProps={{ mb: 2 }}
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} md={12}>
                  <Controller
                    name="occurrence"
                    control={control}
                    render={({
                      field: { onChange, value },
                      fieldState: { invalid, error },
                    }) => (
                      <CustomDropdown
                        label="Occurrence"
                        placeholder="Select Type"
                        onChange={onChange}
                        value={value}
                        isInvalid={invalid}
                        helperText={error?.message ?? ""}
                        options={[
                          { label: "PER_NIGHT", value: "PER_NIGHT" },
                          {
                            label: "PER_RESERVATION",
                            value: "PER_RESERVATION",
                          },
                          { label: "PER_ROOM", value: "PER_ROOM" },
                          { label: "PER_PERSON", value: "PER_PERSON" },
                        ]}
                        fullWidth
                        aria-label="Type"
                        data-testid="Type"
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={12} gap={5}>
                  <Box mb={3}>
                    <Controller
                      name="posting_department"
                      control={control}
                      render={({
                        field: { onChange, value },
                        fieldState: { invalid, error },
                      }) => (
                        <CustomDropdown
                          label="Department"
                          placeholder="Select Posting Code Department"
                          onChange={(event) => {
                            const selectedValue = event.target.value as number; // Extract the string value
                            onChange(selectedValue); // Update React Hook Form state
                          }}
                          value={value}
                          isInvalid={invalid}
                          helperText={error?.message ?? ""}
                          options={(codeDeptList ?? []).map(
                            (department: IPostingCodeDept) => ({
                              label: department?.name,
                              value: department?.id?.toString(),
                            })
                          )}
                          fullWidth
                          aria-label="Type"
                          data-testid="Type"
                        />
                      )}
                    />
                  </Box>
                  <Controller
                    name="posting_code_id"
                    control={control}
                    render={({
                      field: { onChange, value },
                      fieldState: { invalid, error },
                    }) => (
                      <div className="mt-2">
                        <CustomDropdown
                          label="Posting Code"
                          placeholder="Select Posting Code"
                          onChange={(event) => {
                            const selectedValue = event.target.value as number; // Extract the string value
                            onChange(selectedValue); // Update React Hook Form state
                          }}
                          value={value}
                          isInvalid={invalid}
                          helperText={error?.message ?? ""}
                          options={(postingCodeList ?? []).map(
                            (department: IPostingCodeDept) => ({
                              label: department?.name,
                              value: department?.id?.toString(),
                            })
                          )}
                          fullWidth
                          aria-label="Type"
                          data-testid="Type"
                        />
                      </div>
                    )}
                  />
                  <Box display="flex" gap={2} p={2} mt={3}>
                    <Controller
                      name="active"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={value}
                              onChange={(e) => onChange(e.target.checked)}
                            />
                          }
                          label="Active"
                        />
                      )}
                    />
                    <Controller
                      name="taxable"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={value}
                              onChange={(e) => onChange(e.target.checked)}
                            />
                          }
                          label="Taxable"
                        />
                      )}
                    />
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <PrimaryButton
                      label="Back"
                      buttonStyles={{
                        backgroundColor: "#F5F5F5",
                        color: "#000",
                        fontWeight: "bold",
                      }}
                      isLoading={false}
                      type="button"
                      onClick={() =>
                        Navigate("/booking-engine/admin/financial-settings/fee")
                      }
                    />
                    <PrimaryButton
                      label="Edit Fee"
                      buttonStyles={{
                        backgroundColor: "#32A1AE",
                        color: "#FFFFFF",
                        fontWeight: "bold",
                      }}
                      isLoading={isSubmitLoading}
                      type="submit"
                    />
                  </Box>
                </Grid>
              </Grid>
            </Grid>
            {/* attach department code */}
            <Grid item xs={12} md={5} sm={12} p={2}>
              <ReservationDetailBox
                label="Attached Departments"
                isLoading={false}
              >
                {FeeDetails?.posting_code_departments &&
                  FeeDetails?.posting_code_departments.map(
                    (department, index) => (
                      <AttachPostingCodeDept
                        key={department.posting_code_department.id}
                        getFeeByid={() =>
                          getFeesByid({
                            id: params.id as string,
                            property_id: users?.defaultPropertyId ?? 0,
                          })
                        }
                        fee_id={Number(params.id)}
                        codeDeptList={codeDeptList || []}
                        departmentId={department.posting_code_department.id} // Pass department ID
                        incPostingCodeId={department.inc_posting_codes} // Pass full inc posting codes array
                        excPostingCodeId={department.exc_posting_codes} // Pass full exc posting codes array
                        setSuccessMessage={setSuccessMessage}
                        setError={setError}
                        isLast={
                          index ===
                          (FeeDetails?.posting_code_departments?.length ?? 0) -
                            1
                        }
                      />
                    )
                  )}
              </ReservationDetailBox>
              <Box display="flex" mt={2} alignItems="center" gap={2}>
                <Button
                  onClick={handleOpenDialogDept}
                  color="secondary"
                  variant="outlined"
                  size="small"
                >
                  Attach New Department
                </Button>
              </Box>
              {/* Attach New Department Dialog */}
              <Dialog
                fullWidth
                maxWidth="xs"
                open={openDialogDept}
                onClose={handleCloseDialogDept}
              >
                <DialogTitle>Attach New Department</DialogTitle>
                <DialogContent>
                  <Grid container spacing={2} direction="column">
                    <Grid item>
                      <Autocomplete
                        value={selectedDepartment}
                        onChange={(_, selectedOption) =>
                          setSelectedDepartment(selectedOption)
                        }
                        options={departmentOptions ?? []}
                        getOptionLabel={(option) => option.label}
                        isOptionEqualToValue={(option, value) =>
                          option.id === value.id
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Departments"
                            fullWidth
                            margin="normal"
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleCloseDialogDept} color="primary">
                    Cancel
                  </Button>
                  <PrimaryButton
                    label="Submit"
                    onClick={handleDialogSubmit}
                    buttonStyles={{
                      backgroundColor: "#32A1AE",
                      color: "#FFFFFF",
                      fontWeight: "bold",
                    }}
                  />
                </DialogActions>
              </Dialog>
            </Grid>
            <Grid item xs={12} md={3} p={2}>
              <ReservationDetailBox label="Versions" isLoading={false}>
                <>
                  {FeeDetails?.versions &&
                    FeeDetails?.versions?.length > 0 &&
                    FeeDetails.versions.map((version) => (
                      <React.Fragment key={version.id}>
                        {/* Rate Section */}
                        <Box
                          display="flex"
                          alignItems="center"
                          justifyContent="space-between"
                          mt={1}
                        >
                          <Label>Rate:</Label>
                          <Box display="flex" gap={2} alignItems="flex-start">
                            <Typography> {version.rate}</Typography>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setOpenDialog(true);
                                setRate(version.rate);
                                setStartsFrom(dayjs(version.starts_from));
                                setVersionId(version.id);
                                setVersionLabel("Edit");
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                        <Box
                          display="flex"
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <Label>Starts From:</Label>
                          <Box display="flex" gap={2} alignItems="flex-start">
                            <Typography>{version.starts_from}</Typography>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setOpenDeleteDialog(true);
                                setVersionId(version.id);
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                        <Grid item xs={12}>
                          <Divider
                            sx={{
                              mt: 2,
                              height: "1px", // Thickness of the divider
                              backgroundColor: "black", // Bold color
                            }}
                          />
                        </Grid>
                      </React.Fragment>
                    ))}
                </>
              </ReservationDetailBox>
              <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                fullWidth
                maxWidth="xs"
              >
                <DialogTitle>{versionLabel} New Version</DialogTitle>
                <DialogContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        label="Rate"
                        type="number"
                        fullWidth
                        value={rate}
                        onChange={handleRateChange}
                        margin="normal"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          label="Starts From"
                          value={startsFrom ? dayjs(startsFrom) : null}
                          shouldDisableDate={(date) => {
                            const minDate = dayjs(); // Current date
                            return date.isBefore(minDate, "day"); // Disable dates before today
                          }}
                          onChange={(date) => handleDateChange(date)}
                          format={appConfig.displayDateFormat}
                          slotProps={{
                            textField: {
                              error: !!errorDate,
                              helperText: errorDate || "",
                              fullWidth: true,
                            },
                          }}
                        />
                      </LocalizationProvider>
                    </Grid>
                  </Grid>
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleCloseDialog} color="primary">
                    Cancel
                  </Button>
                  <Button
                    onClick={() =>
                      versionLabel === "Add" ? addVersion() : updateVersion()
                    }
                    color="primary"
                    variant="contained"
                  >
                    Save
                  </Button>
                </DialogActions>
              </Dialog>
              <ConfirmationDialog
                open={openDeleteDialog}
                title="Confirm Deletion"
                description="Are you sure you want to delete this Tax Version?"
                buttons={[
                  { label: "Yes", onClick: deleteVersion },
                  { label: "No", onClick: handleDeleteDialog },
                ]}
                onClose={handleDeleteDialog}
              />
              <Box display="flex" mt={2} alignItems="center" gap={2}>
                <Button
                  onClick={() => {
                    setOpenDialog(true);
                    setVersionLabel("Add");
                  }}
                  color="secondary"
                  variant="outlined"
                  size="small"
                >
                  Add New Version
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </FormProvider>
    </MainWrapper>
  );
};

export default EditFees;

const MainWrapper = styled(Grid)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  padding: "15px",
  height: "100%",
  marginTop: "10px",
}));
