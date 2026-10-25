import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Grid,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  Divider,
  Alert,
  InputAdornment,
  TextField,
  Typography,
  Autocomplete,
} from "@mui/material";
import {
  useGetPostcodeDeptListQuery,
  useLazyGetPostingcodeListQueryQuery,
  useLazyGetPropertyTaxQuery,
} from "services/financeSlice";
import { useMakeChargeMutation } from "services/paymentsSlice";
import moment from "moment";
import { appConfig } from "config/app.config";
import { currencyString } from "utils/helperFunctions/numbers";
import { ISimpleFolio } from "types/payments";
import { TaxRateType } from "constants/taxes";
import useAuth from "hooks/useAuth";
import { IReservationResponse } from "types/reservationTypes";
import { IPostingCodeDept } from "types/financialSettingTypes";
import { IServiceRequestResponse } from "types/serviceRequestTypes";

interface IFormData {
  postingCodeId: number;
  postingCodeDeptId: number;
  note: string;
  amount: number;
  folioId: ISimpleFolio | null;
}

interface AddChargeModalProps {
  open: boolean;
  reservation?: IReservationResponse;
  folio: ISimpleFolio[];
  onClose: (addSuccess?: boolean) => void;
  refreshData: () => void;
  serviceRequest: IServiceRequestResponse | null;
}

type AmountStrings = {
  total: string;
  taxes: string;
};

const AddServiceChargeModal: React.FC<AddChargeModalProps> = ({
  open,
  onClose,
  reservation,
  refreshData,
  folio,
  serviceRequest,
}) => {
  const { users: currentUser } = useAuth();
  const [formData, setFormData] = useState<IFormData>({
    postingCodeDeptId: 0,
    postingCodeId: 0,
    note: "",
    amount: 0,
    folioId: folio[0] || null,
  });
  const [error, setError] = useState("");

  const { data: postingCodeDeptList, refetch: getPostingcodeDeptList } =
    useGetPostcodeDeptListQuery();
  const [getPostingcodeListQuery, { data: postingCodes }] =
    useLazyGetPostingcodeListQueryQuery();
  const [getTaxesForPostingCode, { data: taxes }] =
    useLazyGetPropertyTaxQuery();
  const [makeCharge, { isLoading: chargeLoading }] = useMakeChargeMutation();

  useEffect(() => {
    if (serviceRequest) {
      getServiceRequestDetail(serviceRequest.service_request.posting_code_id);
    }
  }, [serviceRequest]);

  useEffect(() => {
    if (postingCodes && serviceRequest?.service_request.posting_code_id) {
      const selectedPostingCode = (postingCodes ?? []).find(
        (a) => a.id === serviceRequest.service_request.posting_code_id
      );
      if (selectedPostingCode?.posting_code_department_id) {
        setFormData((prev) => ({
          ...prev,
          postingCodeDeptId: selectedPostingCode.posting_code_department_id,
        }));
      }
    }
  }, [postingCodes, serviceRequest?.service_request.posting_code_id]);

  const getServiceRequestDetail = async (posting_code_id: number) => {
    await getPostingcodeDeptList();
    await getPostingcodeListQuery({});
    await setFormData((prev) => ({
      ...prev,
      amount: Number(serviceRequest?.service_request.rate ?? "0"),
      note: `${serviceRequest?.service_request?.description ?? ""}`,
    }));
    onPostingCodeChange(posting_code_id.toString());
  };

  const handleAddClick = async () => {
    const chargeResponse = await makeCharge({
      description: formData.note,
      folio_id: formData.folioId?.id ?? 0,
      reservation_id: reservation?.id ?? -1,
      amount: formData.amount,
      posting_code_id: formData.postingCodeId,
      date: moment(new Date()).format(appConfig.dateApiFormat),
    });
    if (chargeResponse?.error) {
      setError(chargeResponse.error.toString());
      return false;
    }
    if (chargeResponse?.data?.id) {
      refreshData();
      handleCloseClick(true);
    }
  };

  function handleCloseClick(successfulAdd?: boolean) {
    setError("");
    onClose?.(successfulAdd);
  }

  function onNotesChange(evt: any) {
    setError("");
    setFormData((prev) => ({ ...prev, note: evt.target.value }));
  }

  function onAmountChange(evt: any) {
    setError("");
    setFormData((prev) => ({ ...prev, amount: evt.target.value }));
  }

  function onPostingCodeChange(value?: string) {
    setError("");
    const postingCodeId = Number(value ?? "0");
    setFormData((prev) => ({
      ...prev,
      postingCodeId: postingCodeId,
    }));
    getTaxesForPostingCode({
      posting_code_id: postingCodeId,
      property_id: currentUser?.defaultPropertyId ?? -1,
      rate_code_id: reservation?.rate_code?.id ?? -1,
      date: moment(new Date()).format(appConfig.dateApiFormat),
    });
  }

  const amounts: AmountStrings = useMemo(() => {
    const amt = +formData.amount;
    const totals = {
      total: "---",
      taxes: "$0.00",
    };
    if (Number.isNaN(amt)) {
      return totals;
    }
    totals.total = currencyString(amt);
    if (taxes) {
      const taxesTotal = taxes.reduce((total, t) => {
        let taxValue = 0;
        const rate = parseFloat(t.rate);
        if (t.type === TaxRateType.PERCENTAGE) {
          taxValue = amt * (rate / 100);
        } else if (t.type === TaxRateType.RATE) {
          taxValue = rate;
        }
        return total + taxValue;
      }, 0);
      totals.taxes = currencyString(taxesTotal);
      totals.total = currencyString(amt + taxesTotal);
    } else {
      totals.total = currencyString(amt);
    }
    return totals;
  }, [formData.amount, serviceRequest]);

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
    <Dialog
      open={open}
      onClose={() => handleCloseClick()}
      PaperProps={{ sx: { width: "400px" } }}
    >
      <DialogTitle mb={3}>Add Charge</DialogTitle>
      <DialogContent>
        <Grid container direction="column">
          {error && (
            <Alert
              sx={{ mb: 2 }}
              severity="error"
              onClose={() => {
                setError("");
              }}
            >
              {`Error adding charge: ${error}.`}
            </Alert>
          )}

          {/* Select Folio Dropdown */}
          <Box mt={2}>
            <Autocomplete
              options={folio}
              getOptionLabel={(option) => `Folio ${option.type}`}
              value={formData.folioId}
              onChange={(_, newValue) =>
                setFormData((prev) => ({ ...prev, folioId: newValue }))
              }
              renderInput={(params) => (
                <TextField {...params} label="Select Folio" />
              )}
              fullWidth
            />
          </Box>

          <Grid item mt={2}>
            <Autocomplete
              value={
                postingCodeDeptOptionList.find(
                  (option: { value: string }) =>
                    option.value === formData.postingCodeDeptId?.toString()
                ) || null
              }
              onChange={(_, selectedOption) => {
                setFormData((prev) => ({
                  ...prev,
                  postingCodeDeptId: Number(selectedOption?.value ?? "0"),
                }));
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
                  required={true}
                />
              )}
              disabled={true}
              fullWidth
            />
            <Box mt={2}>
              <Autocomplete
                value={
                  postingCodeOptionList.find(
                    (option) =>
                      option.value === formData.postingCodeId?.toString()
                  ) || null
                }
                onChange={(_, selectedOption) => {
                  onPostingCodeChange(selectedOption?.value);
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
                    label="Posting Code *"
                    placeholder="Posting Code"
                    required={true}
                  />
                )}
                disabled={true}
                fullWidth
              />
            </Box>
            <TextField
              multiline
              fullWidth
              rows={2}
              label="Notes"
              placeholder="Add any notes or a description to the charge"
              onChange={onNotesChange}
              value={formData.note}
              sx={{ mt: 3 }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <Box display="flex" alignItems="flex-end" flexDirection="column" px={3}>
        <Box display="flex" alignItems="center" width="238px">
          <Typography>Amount: </Typography>
          <TextField
            onChange={onAmountChange}
            placeholder="0.00"
            size="small"
            value={formData.amount}
            InputProps={{
              sx: { maxWidth: "140px" },
              startAdornment: (
                <InputAdornment position="start">$</InputAdornment>
              ),
            }}
            FormHelperTextProps={{ sx: { marginRight: 0, textAlign: "right" } }}
            sx={{
              ml: 2,
              width: "160px",
              alignItems: "flex-end",
              input: { textAlign: "right" },
            }}
          />
        </Box>
        <Box
          sx={{
            mt: 6,
            width: "238px",
            paddingRight: "14px",
          }}
          display="flex"
          justifyContent="space-between"
        >
          <Typography>Taxes:</Typography>
          <Typography component="div">{amounts.taxes}</Typography>
        </Box>
        <Divider variant="inset" sx={{ my: 1 }} flexItem />
        <Box
          sx={{ width: "238px", paddingRight: "14px" }}
          display="flex"
          justifyContent="space-between"
        >
          <Typography>Total:</Typography>
          <Typography component="div">{amounts.total}</Typography>
        </Box>
      </Box>
      <DialogActions
        sx={{ p: 3, display: "flex", justifyContent: "space-between" }}
      >
        <Button
          onClick={() => {
            handleCloseClick();
          }}
          color="primary"
        >
          Cancel
        </Button>
        <Button
          onClick={handleAddClick}
          variant="contained"
          disabled={chargeLoading}
        >
          Add Charge
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddServiceChargeModal;
