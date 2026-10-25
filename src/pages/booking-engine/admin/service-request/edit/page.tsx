import { Controller, FormProvider, useForm } from "react-hook-form";
import React, { useCallback, useEffect, useMemo } from "react";
import { Box, Grid, TextField, Autocomplete } from "@mui/material";
import { yupResolver } from "@hookform/resolvers/yup";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import { useNavigate, useParams } from "react-router-dom";
import { addServiceRequestSchema } from "utils/validations.utils";
import FormTextField from "components/forms/FormTextField";
import {
  useGetServiceRequestByIdMutation,
  useUpdateServiceRequestMutation,
} from "services/serviceRequestSlice";
import { IAddServiceRequest } from "types/serviceRequestTypes";
import {
  useGetPostcodeDeptListQuery,
  useLazyGetPostingcodeListQueryQuery,
} from "services/financeSlice";
import { IPostingCodeDept } from "types/financialSettingTypes";
import useSnackbar from "hooks/useSnackbar";

const EditServiceRequest: React.FC = () => {
  const navigate = useNavigate();
  const { service_request_id } = useParams<{ service_request_id: string }>();
  const { openSnackbar } = useSnackbar();
  const [updateServiceRequest, { isLoading: isSubmitLoading }] =
    useUpdateServiceRequestMutation();
  const [getServiceRequestById] = useGetServiceRequestByIdMutation();
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
      posting_code_id: 0,
      posting_code_department_id: 0,
      rate: 0,
    },
  });

  const { handleSubmit, control, setError, reset, watch, setValue } = methods;
  const selectedPostCodeDept = watch("posting_code_department_id");
  const posting_code_id = watch("posting_code_id");

  useEffect(() => {
    if (service_request_id) {
      getServiceRequestDetail(Number(service_request_id));
    }
  }, [service_request_id]);

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

  useEffect(() => {
    if (postingCodes && posting_code_id) {
      const selectedPostingCode = (postingCodes ?? []).find(
        (a) => a.id === posting_code_id
      );
      if (selectedPostingCode?.posting_code_department_id) {
        setValue(
          "posting_code_department_id",
          selectedPostingCode.posting_code_department_id,
          {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          }
        );
      }
    }
  }, [postingCodes, posting_code_id]);

  const getServiceRequestDetail = async (id: number) => {
    await getPostingcodeDeptList();
    await getPostingcodeListQuery({});
    const response = await getServiceRequestById({ id });
    if (response?.error) {
      return false;
    }
    const sources = response?.data;
    reset({
      description: sources.description,
      rate: sources.rate,
      request: sources.request,
      posting_code_id: sources.posting_code_id,
    });
  };

  const onSubmit = useCallback(
    async (data: IAddServiceRequest) => {
      const response = await updateServiceRequest({
        ...data,
        id: Number(service_request_id),
      });
      if (response?.error) {
        openSnackbar(response.error as string, "error");
        return false;
      }
      reset();
      openSnackbar(`Service Request Updated Successfully!`, "success");
      setTimeout(() => {
        navigate(`/booking-engine/admin/service-request`);
      }, 1000);
    },
    [reset, navigate, setError, updateServiceRequest]
  );

  const postingCodeDeptOptionList = useMemo(() => {
    return (postingCodeDeptList ?? []).map((department: IPostingCodeDept) => ({
      label: `${department?.code} - ${department?.name}`,
      value: department?.id?.toString(),
    }));
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
              label="Update"
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
export default EditServiceRequest;
