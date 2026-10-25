import { Controller, FormProvider, useForm } from "react-hook-form";
import React, { useCallback, useEffect, useMemo } from "react";
import { Box, Grid, TextField, Autocomplete } from "@mui/material";
import { yupResolver } from "@hookform/resolvers/yup";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import { useNavigate } from "react-router-dom";
import { addServiceRequestSchema } from "utils/validations.utils";
import FormTextField from "components/forms/FormTextField";
import { useAddServiceRequestMutation } from "services/serviceRequestSlice";
import { IAddServiceRequest } from "types/serviceRequestTypes";
import {
  useGetPostcodeDeptListQuery,
  useLazyGetPostingcodeListQueryQuery,
} from "services/financeSlice";
import { IPostingCodeDept } from "types/financialSettingTypes";
import useSnackbar from "hooks/useSnackbar";

const AddServiceRequest: React.FC = () => {
  const navigate = useNavigate();
  const { openSnackbar } = useSnackbar();
  const [addServiceRequest, { isLoading: isSubmitLoading }] =
    useAddServiceRequestMutation();
  const { data: postingCodeDeptList, refetch: getPostingcodeDeptList } =
    useGetPostcodeDeptListQuery();
  const [getPostingcodeListQuery, { data: postingCodes }] =
    useLazyGetPostingcodeListQueryQuery();

  const methods = useForm<IAddServiceRequest>({
    mode: "all",
    resolver: yupResolver(addServiceRequestSchema),
    defaultValues: {
      request: "",
      description: "",
      posting_code_department_id: 0,
      rate: 0,
    },
  });

  const { handleSubmit, control, setError, reset, watch } = methods;
  const selectedPostCodeDept = watch("posting_code_department_id");

  useEffect(() => {
    if (selectedPostCodeDept) {
      getPostingcodeListQuery({
        posting_code_department_id: selectedPostCodeDept,
      });
    }
  }, [selectedPostCodeDept]);
  useEffect(() => {
    getPostingcodeDeptList();
  }, []);

  const onSubmit = useCallback(
    async (data: IAddServiceRequest) => {
      const response = await addServiceRequest(data);
      if (response?.error) {
        openSnackbar(response.error as string, "error");
        return false;
      }
      reset();
      openSnackbar(`Service Request Added Successfully!`, "success");
      setTimeout(() => {
        navigate(`/booking-engine/admin/service-request`);
      }, 1000);
    },
    [reset, navigate, setError, addServiceRequest]
  );

  const postingCodeDeptOptionList = useMemo(() => {
    return (postingCodeDeptList ?? []).map(
      (postingCodeDept: IPostingCodeDept) => ({
        label: `${postingCodeDept?.code} - ${postingCodeDept?.name}`,
        value: postingCodeDept?.id?.toString(),
      })
    );
  }, [postingCodeDeptList]);

  const postingCodeOptionList = useMemo(() => {
    return (postingCodes ?? []).map((postingCode: IPostingCodeDept) => ({
      label: `${postingCode?.code} - ${postingCode?.name}`,
      value: postingCode?.id?.toString(),
    }));
  }, [postingCodes]);

  return (
    <FormProvider {...methods}>
      <Grid container spacing={2}>
        <FormTextField
          name="request"
          sm={6}
          label="Name"
          textFieldProps={{
            placeholder: "Enter Name",
            fullWidth: true,
          }}
          required
          gridProps={{ mb: 2 }}
        />
        <FormTextField
          name="rate"
          sm={6}
          label="Rate"
          textFieldProps={{
            placeholder: "Enter Rate",
            type: "number",
            fullWidth: true,
          }}
          required
        />
        <Grid item xs={12} md={6}>
          <Box mb={2}>
            <Controller
              name="posting_code_department_id"
              control={control}
              render={({
                field: { onChange, value },
                fieldState: { error, invalid },
              }) => {
                return (
                  <Autocomplete
                    value={
                      postingCodeDeptOptionList.find(
                        (option) => option.value === value?.toString()
                      ) || null
                    }
                    onChange={(_, selectedOption) => {
                      onChange(selectedOption?.value);
                    }}
                    options={postingCodeDeptOptionList}
                    getOptionLabel={(option) => option.label}
                    isOptionEqualToValue={(option, value) =>
                      option.value === value.value
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        name="posting_code_department_id"
                        label="Posting Code Department"
                        placeholder="Posting Code Department"
                        error={invalid}
                        helperText={error?.message}
                        required={true}
                      />
                    )}
                    fullWidth
                  />
                );
              }}
            />
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box mb={2}>
            <Controller
              name="posting_code_id"
              control={control}
              render={({
                field: { onChange, value },
                fieldState: { error, invalid },
              }) => {
                return (
                  <Autocomplete
                    value={
                      postingCodeOptionList.find(
                        (option) => option.value === value?.toString()
                      ) || null
                    }
                    onChange={(_, selectedOption) => {
                      onChange(selectedOption?.value);
                    }}
                    options={postingCodeOptionList}
                    getOptionLabel={(option) => option.label}
                    isOptionEqualToValue={(option, value) =>
                      option.value === value.value
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        name="posting_code_id"
                        label="Posting Code"
                        placeholder="Posting Code"
                        error={invalid}
                        helperText={error?.message}
                        required={true}
                      />
                    )}
                    fullWidth
                  />
                );
              }}
            />
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Controller
            name="description"
            control={control}
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Description"
                placeholder="Enter Description"
                value={value}
                onChange={onChange}
                error={Boolean(error)}
                helperText={error?.message}
              />
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="flex-end"
            gap={2}
          >
            <PrimaryButton
              label="Back"
              buttonStyles={{
                backgroundColor: "#F5F5F5",
                color: "#000",
                fontWeight: "bold",
              }}
              isLoading={false}
              type="button"
              onClick={() => navigate("/booking-engine/admin/service-request")}
            />
            <PrimaryButton
              label="Save"
              disabled={isSubmitLoading}
              loadingText="Loading..."
              isLoading={isSubmitLoading}
              onClick={handleSubmit(onSubmit)}
            />
          </Box>
        </Grid>
      </Grid>
    </FormProvider>
  );
};
export default AddServiceRequest;
