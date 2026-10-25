"use client";
import { Controller, FormProvider, useForm } from "react-hook-form";
import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  useAddTaxVersionMutation,
  useAttachPostingCodeDepartmentToTaxMutation,
  useDeleteTaxVersionMutation,
  useGetPostcodeDeptListQuery,
  useLazyGetPostingcodeListQueryQuery,
  useGetTaxByidMutation,
  useUpdateTaxMutation,
  useUpdateTaxVersionMutation,
} from "services/financeSlice";
import CustomTextInput from "components/widgets/CustomTextInput/CustomTextInput";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate, useParams } from "react-router-dom";
import { IEditTaxTypes, IPostingCodeDept } from "types/financialSettingTypes";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { yupResolver } from "@hookform/resolvers/yup";
import AttachPostingCodeDept from "./departmentPostingCode";
import CustomDropdown from "components/widgets/CustomDropdown/CustomDropdown";
import FormTextField from "components/forms/FormTextField";
import useAuth from "hooks/useAuth";
import ReservationDetailBox from "pages/booking-engine/reservations/components/ReservationDetail/components/ReservationDetailBox";
import Label from "components/elements/Label/Label";
import { editRateSchema } from "utils/validations.utils";
import ConfirmationDialog from "components/elements/ConfirmationDialog/ConfirmationDialog";
import { appConfig } from "config/app.config";
import dayjs, { Dayjs } from "dayjs";
import {
  assignmentTypeOptions,
  occurrenceOptions,
  TaxRateType,
} from "constants/taxes";
import { isAdjustment } from "utils/postingCodes";

const EditTax: React.FC = () => {
  const { users } = useAuth();

  const Navigate = useNavigate();
  const params = useParams();
  const [getPostingcodeList, { data: postingCodeList }] =
    useLazyGetPostingcodeListQueryQuery();
  const [attachPostingCodeDepartmentToTax] =
    useAttachPostingCodeDepartmentToTaxMutation();
  const { data: codeDeptList = [] } = useGetPostcodeDeptListQuery();

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [updateTax, { isLoading: isSubmitLoading }] = useUpdateTaxMutation();
  const [addTaxVersion] = useAddTaxVersionMutation();
  const [deleteTaxVersion] = useDeleteTaxVersionMutation();

  const [updateTaxVersion] = useUpdateTaxVersionMutation();
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

  const [getTaxByid, { data: taxDetailData }] = useGetTaxByidMutation();
  const taxDetail = taxDetailData?.[0];

  const departmentOptions = codeDeptList?.map((department) => ({
    label: department.name,
    id: department.id,
  }));

  useEffect(() => {
    if (params?.id) {
      getTaxByid({
        id: params.id as string,
        property_id: users?.defaultPropertyId ?? 0,
      });
    }
  }, [params?.id]);

  const methods = useForm<IEditTaxTypes>({
    mode: "all",
    resolver: yupResolver(editRateSchema),
    defaultValues: {
      description: "",
      starts_from: undefined,
      name: "",
      rate: "",
      active: false,
      posting_department: "",
      posting_code_id: 0,
      type: TaxRateType.PERCENTAGE,
      taxable: false,
      assignment_type: "AUTO_APPLIED",
      occurrence: "PER_NIGHT",
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
  const selectedType = watch("type");
  const isFee = useMemo(() => selectedType === "RATE", [selectedType]);

  useEffect(() => {
    if (departmentId) {
      getPostingcodeList({
        id: Number(departmentId),
        // type: isFee ? "FEE" : "TAX",
      });
    }
  }, [departmentId, selectedType, getPostingcodeList]);

  useEffect(() => {
    if (taxDetail) {
      const type = taxDetail?.type;
      const isFees = type === TaxRateType.RATE;
      setValue("name", taxDetail?.name, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("description", taxDetail?.description, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });

      setValue("type", taxDetail?.type, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue(
        "posting_department",
        taxDetail?.posting_code?.posting_code_department_id?.toString(),
        {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        }
      );
      if (taxDetail?.posting_code?.posting_code_department_id) {
        setValue(
          "posting_department",
          taxDetail?.posting_code?.posting_code_department_id.toString(),
          {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          }
        );
      }
      setValue("posting_code_id", taxDetail?.posting_code_id, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue("active", taxDetail?.active, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      if (isFees) {
        setValue("assignment_type", taxDetail?.assignment_type, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });
        setValue("occurrence", taxDetail?.occurrence, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });
        setValue("taxable", taxDetail?.taxable, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });
      }
    }
  }, [taxDetail]);

  const onSubmit = useCallback(
    async (data: IEditTaxTypes) => {
      const basePayload = {
        id: Number(params?.id),
        description: data.description,
        name: data.name,
        posting_code_id: data.posting_code_id,
        property_id: users?.defaultPropertyId.toString() ?? "0",
        active: data.active,
        type: data.type as string,
      };

      const payload = isFee
        ? {
            ...basePayload,
            taxable: data.taxable,
            assignment_type: data.assignment_type,
            occurrence: data.occurrence,
          }
        : basePayload;
      const response = await updateTax(payload);
      if (response.error) {
        setError("root", { message: "Field Required" }, { shouldFocus: true });
        setSuccessMessage(null);
        return;
      } else {
        reset();
        setSuccessMessage("Financial Settings Updated Successfully!");
        Navigate("/booking-engine/admin/financial-settings/tax");
      }
    },
    [updateTax, reset, Navigate, setError, isFee]
  );

  const addVersion = async () => {
    const payload = {
      tax_id: Number(params?.id),
      rate: Number(rate),
      starts_from: dayjs(startsFrom).format("YYYY-MM-DD"),
    };
    const response = await addTaxVersion(payload);
    if (!response.error) {
      setSuccessMessage("version Added Successfully!");
      getTaxByid({
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
      tax_id: Number(params?.id),
      rate: Number(rate),
      starts_from: dayjs(startsFrom).format("YYYY-MM-DD"),
    };
    const response = await updateTaxVersion(payload);
    if (!response.error) {
      setSuccessMessage("version Updated Successfully!");
      getTaxByid({
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

    const response = await deleteTaxVersion({ id: versionId });
    if (!response.error) {
      setSuccessMessage("version Deleted Successfully!");
      setVersionId(null);
      getTaxByid({
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

  // const handleOpenDialogDept = () => setOpenDialogDept(true);
  const handleCloseDialogDept = () => {
    setOpenDialogDept(false);
    setSelectedDepartment(null);
  };

  const handleDialogSubmit = async () => {
    const payload = {
      tax_id: Number(params.id),
      posting_code_dept_id: Number(selectedDepartment?.id),
    };
    const response = await attachPostingCodeDepartmentToTax(payload);
    if (!response.error) {
      getTaxByid({
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
            <Grid item xs={12} md={4} p={2}>
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
                  <Label>Type</Label>
                  <Box display="flex" gap={0}>
                    <Controller
                      name="type"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <FormControlLabel
                          sx={{ marginBottom: 0 }}
                          control={
                            <Checkbox
                              checked={value === "PERCENTAGE"}
                              onChange={() => onChange("PERCENTAGE")}
                              sx={{ marginBottom: 0 }}
                            />
                          }
                          label="%"
                        />
                      )}
                    />
                    <Controller
                      name="type"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={value === "RATE"}
                              onChange={() => onChange("RATE")}
                            />
                          }
                          label="$"
                        />
                      )}
                    />
                  </Box>
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
                        rows: 6,
                        placeholder: "Enter Description",
                      }}
                      gridProps={{ mb: 2 }}
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} md={12} gap={5}>
                  <Box mb={3}>
                    <Controller
                      name="posting_department"
                      control={control}
                      render={({
                        field: { onChange, value },
                        fieldState: { error, invalid },
                      }) => {
                        return (
                          <CustomDropdown
                            label="Posting Code Department"
                            placeholder="Select Posting Code Department"
                            onChange={(event) => {
                              const selectedValue = event.target
                                .value as number;
                              onChange(selectedValue);
                            }}
                            value={value}
                            isInvalid={invalid}
                            helperText={error?.message ?? ""}
                            options={(codeDeptList ?? []).map(
                              (department: IPostingCodeDept) => ({
                                label: `${department.code} - ${department.name}`,
                                value: department?.id?.toString(),
                              })
                            )}
                            fullWidth
                            aria-label="Department"
                            data-testid="Department"
                          />
                        );
                      }}
                    />
                  </Box>
                  <Box>
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
                              const selectedValue = event.target
                                .value as number; // Extract the string value
                              onChange(selectedValue); // Update React Hook Form state
                            }}
                            value={value}
                            isInvalid={invalid}
                            helperText={error?.message ?? ""}
                            options={(postingCodeList ?? [])
                              .filter((pc) => !isAdjustment(pc))
                              .map((department: IPostingCodeDept) => ({
                                label: `${department.code} - ${department.name}`,
                                value: department?.id?.toString(),
                              }))}
                            fullWidth
                            aria-label="Type"
                            data-testid="Type"
                          />
                        </div>
                      )}
                    />
                  </Box>
                  {isFee && (
                    <>
                      {/* assignment_type Autocomplete */}
                      <Box mt={2}>
                        <Controller
                          name="assignment_type"
                          control={control}
                          render={({
                            field: { onChange, value },
                            fieldState: { invalid, error },
                          }) => (
                            <CustomDropdown
                              label="Assignment Type"
                              placeholder="Select Assignment Type"
                              onChange={(event) => {
                                const selectedValue = event.target
                                  .value as number;
                                onChange(selectedValue);
                              }}
                              value={value}
                              isInvalid={invalid}
                              helperText={error?.message ?? ""}
                              options={assignmentTypeOptions}
                              fullWidth
                              aria-label="Assignment Type"
                              data-testid="Assignment Type"
                            />
                          )}
                        />
                      </Box>

                      {/* occurrence Autocomplete */}
                      <Box mt={2}>
                        <Controller
                          name="occurrence"
                          control={control}
                          render={({
                            field: { onChange, value },
                            fieldState: { invalid, error },
                          }) => (
                            <CustomDropdown
                              label="Occurrence"
                              placeholder="Select Occurrence"
                              onChange={(event) => {
                                const selectedValue = event.target
                                  .value as number;
                                onChange(selectedValue);
                              }}
                              value={value}
                              isInvalid={invalid}
                              helperText={error?.message ?? ""}
                              options={occurrenceOptions}
                              fullWidth
                              aria-label="Occurrence"
                              data-testid="Occurrence"
                            />
                          )}
                        />
                      </Box>
                      <Grid item xs={12}>
                        <Box p={2} pl={0} pb={0}>
                          <Controller
                            name="taxable"
                            control={control}
                            render={({ field }) => (
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={field.value}
                                    onChange={(e) =>
                                      field.onChange(e.target.checked)
                                    }
                                  />
                                }
                                label="Taxable"
                              />
                            )}
                          />
                        </Box>
                      </Grid>
                    </>
                  )}
                  <Box mt={2}>
                    <Box display="flex" alignItems="center">
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
                    </Box>
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
                        Navigate("/booking-engine/admin/financial-settings/tax")
                      }
                    />
                    <PrimaryButton
                      label="Update"
                      buttonStyles={{
                        backgroundColor: "#32A1AE",
                        color: "#FFFFFF",
                        fontWeight: "bold",
                      }}
                      isLoading={isSubmitLoading}
                      type="submit"
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} md={5} sm={12} p={2}>
              <ReservationDetailBox
                label="Attached Departments"
                isLoading={false}
              >
                {taxDetail?.posting_code_departments.map(
                  (department, index) => (
                    <AttachPostingCodeDept
                      key={department.posting_code_department.id}
                      getTaxByid={() =>
                        getTaxByid({
                          id: params.id as string,
                          property_id: users?.defaultPropertyId ?? 0,
                        })
                      }
                      tax_id={Number(params.id)}
                      codeDeptList={codeDeptList || []}
                      departmentId={department.posting_code_department.id} // Pass department ID
                      incPostingCodeId={department.inc_posting_codes} // Pass full inc posting codes array
                      excPostingCodeId={department.exc_posting_codes} // Pass full exc posting codes array
                      setSuccessMessage={setSuccessMessage}
                      setError={setError}
                      isLast={
                        index === taxDetail.posting_code_departments.length - 1
                      }
                    />
                  )
                )}
              </ReservationDetailBox>
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
                  {taxDetail?.versions &&
                    taxDetail?.versions?.length > 0 &&
                    taxDetail.versions.map((version, index) => (
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
                        {index !== taxDetail?.versions?.length - 1 && ( // Avoid Divider for the last item
                          <Grid item xs={12}>
                            <Divider
                              sx={{
                                mt: 2,
                                height: "1px", // Thickness of the divider
                                backgroundColor: "black", // Bold color
                              }}
                            />
                          </Grid>
                        )}
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
                  { label: "No", onClick: handleDeleteDialog },
                  { label: "Yes", onClick: deleteVersion },
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

export default EditTax;

const MainWrapper = styled(Grid)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  padding: "15px",
  height: "100%",
  marginTop: "10px",
}));
