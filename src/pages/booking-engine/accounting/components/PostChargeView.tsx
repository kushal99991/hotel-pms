import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Grid,
  DialogActions,
  DialogContent,
  Divider,
  Alert,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import CustomDropdown from "components/widgets/CustomDropdown/CustomDropdown";
import { useLazyGetPostingcodeListQueryQuery } from "services/financeSlice";
import {
  useLazyGetTaxQuery,
  useGetPostcodeDeptListQuery,
} from "services/financeSlice";
import { useMakeChargeMutation } from "services/paymentsSlice";
import { appConfig } from "config/app.config";
import { currencyString } from "utils/helperFunctions/numbers";
import { TaxRateType } from "constants/taxes";
import useAuth from "hooks/useAuth";
import { PostingCodeTypes } from "constants/payments";
import { AccountModalViewProps } from "types/ui/accounting";
import { getMoment } from "utils/helperFunctions/common";

type AmountStrings = {
  total: string;
  taxes: string;
};

const PostChargeView: React.FC<AccountModalViewProps> = ({
  onClose,
  account,
}) => {
  const { users: currentUser, currentTimeZone } = useAuth();
  const [error, setError] = useState("");
  const [department, setDepartment] = useState(-1);
  const [amount, setAmount] = useState("");
  const [invalidAmountMsg, setInvalidAmountMsg] = useState("");
  const [invalidDept, setInvalidDept] = useState(false);
  const [invalidPostingCode, setInvalidPostingCode] = useState(false);
  const [postingCodeId, setPostingCodeId] = useState(-1);
  const [postingCodeOptions, setPostingCodeOptions] = useState<any[]>([]);
  const [notes, setNotes] = useState("");
  const { data: departments } = useGetPostcodeDeptListQuery();
  const [
    getCodesForDepartment,
    { data: postingCodes, isLoading: codesLoading },
  ] = useLazyGetPostingcodeListQueryQuery();
  const [getTax, { data: taxData, error: getTaxError }] = useLazyGetTaxQuery();
  const [makeCharge, { isLoading: chargeLoading }] = useMakeChargeMutation();

  useEffect(() => {
    if (getTaxError) {
      setError(
        `${error ? `${error}. ` : ""}Error fetching taxes for posting code: ${getTaxError.message}`
      );
    }
  }, [getTaxError]);

  useEffect(() => {
    if (!codesLoading && postingCodes) {
      const opts = postingCodes.reduce((codes: any[], pc) => {
        if (
          pc.type === PostingCodeTypes.CHARGE ||
          pc.type === PostingCodeTypes.ADJUSTMENT_CHARGE ||
          pc.type === PostingCodeTypes.FEE ||
          pc.type === PostingCodeTypes.ADJUSTMENT_FEE ||
          !pc.type
        ) {
          const dropdownOption = {
            value: pc.id.toString(),
            label: `${pc.code} -- ${pc.name}`,
          };
          codes.push(dropdownOption);
        }
        return codes;
      }, []);
      setPostingCodeOptions(opts);
    }
  }, [postingCodes, codesLoading]);

  const handleAddClick = async () => {
    if (!departments || !postingCodes) {
      setInvalidDept(true);
      return;
    }
    if (department < 0) {
      setInvalidDept(true);
    }
    if (postingCodeId < 0) {
      setInvalidPostingCode(true);
    }
    if (department < 0 || postingCodeId < 0) {
      return;
    }
    const amt = +amount;
    if (Number.isNaN(amt)) {
      setInvalidAmountMsg("Valid amount required");
      return;
    } else if (amt === 0) {
      setInvalidAmountMsg("Amount should be greater than 0");
      return;
    }

    // ensure date sending is between start date and end date - 1
    const todayMoment = getMoment(null, currentTimeZone);
    const chargeResponse = await makeCharge({
      direct_billing_account_id: account?.id,
      description: notes,
      amount: amt,
      posting_code_id: postingCodeId,
      date: todayMoment.format(appConfig.dateApiFormat),
    });
    if (chargeResponse?.data?.id) {
      handleCloseClick(true);
    } else if (chargeResponse.error) {
      setError(chargeResponse.error.toString());
    }
  };

  function handleCloseClick(successfulAdd?: boolean) {
    setError("");
    setAmount("");
    setDepartment(-1);
    setPostingCodeId(-1);
    setNotes("");
    onClose?.(successfulAdd);
  }

  function onDeptChange(evt: any) {
    const selectedDept = +evt.target.value;
    if (!departments?.length) {
      return;
    }
    if (department === selectedDept) {
      return;
    }
    const selectedDepartment = departments[selectedDept - 1];
    getCodesForDepartment({
      posting_code_department_id: selectedDepartment.id,
    });
    setError("");
    setInvalidDept(false);
    setPostingCodeId(-1);
    setDepartment(selectedDept);
  }

  function onPostingCodeChange(evt: any) {
    setError("");
    setInvalidPostingCode(false);
    setPostingCodeId(+evt.target.value);
    getTax({
      posting_code_id: +evt.target.value,
      property_id: currentUser?.defaultPropertyId ?? -1,
    });
  }

  function onNotesChange(evt: any) {
    setError("");
    setNotes(evt.target.value);
  }

  function onAmountChange(evt: any) {
    setError("");
    setInvalidAmountMsg("");
    setAmount(evt.target.value);
  }

  function getAmountStrings() {
    const amt = +amount;
    const totals = {
      total: "---",
      taxes: "$0.00",
    };
    if (Number.isNaN(amt)) {
      return totals;
    }
    totals.total = currencyString(amt);
    if (taxData) {
      const taxesTotal = taxData.reduce((total, t) => {
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
  }

  const deptOptions = (departments ?? []).map((d) => ({
    label: `${d.code} -- ${d.name}`,
    value: d.id.toString(),
  }));
  const amounts: AmountStrings = getAmountStrings();
  return (
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

        <Grid item>
          <CustomDropdown
            label="Posting Code Department *"
            placeholder="Posting Code Department"
            disabled={codesLoading}
            options={deptOptions}
            onChange={onDeptChange}
            isInvalid={invalidDept}
            helperText={invalidDept ? "Department Required" : undefined}
            value={department > -1 ? department : ""}
            defaultValue=""
            fullWidth
            aria-label="Select Posting Code Department"
            data-testid="posting-code-dept-dropdown"
          />
          <Box mt={2}>
            <CustomDropdown
              label="Posting Code *"
              placeholder="Posting Code"
              options={postingCodeOptions}
              isInvalid={invalidPostingCode}
              disabled={department < 0}
              helperText={
                invalidPostingCode ? "Posting Code Required" : undefined
              }
              onChange={onPostingCodeChange}
              value={postingCodeId > -1 ? postingCodeId : ""}
              defaultValue=""
              fullWidth
              aria-label="Select Posting Code"
              data-testid="posting-code-dropdown"
            />
          </Box>
          <TextField
            multiline
            fullWidth
            rows={2}
            label="Notes"
            placeholder="Add any notes or a description to the charge"
            onChange={onNotesChange}
            value={notes}
            sx={{ mt: 2 }}
          />
        </Grid>
      </Grid>
      <Box
        display="flex"
        alignItems="flex-end"
        flexDirection="column"
        px={3}
        mt={2}
      >
        <Box display="flex" alignItems="center" width="238px">
          <Typography>Amount: </Typography>
          <TextField
            onChange={onAmountChange}
            error={!!invalidAmountMsg}
            helperText={invalidAmountMsg}
            placeholder="0.00"
            size="small"
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
            mt: invalidAmountMsg ? 6 : 1,
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
        sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}
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
    </DialogContent>
  );
};

export default PostChargeView;
