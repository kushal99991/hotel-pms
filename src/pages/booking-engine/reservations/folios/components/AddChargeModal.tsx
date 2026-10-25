import React, { useEffect, useState } from "react";
import { Moment } from "moment";
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
} from "@mui/material";
import CustomDropdown from "components/widgets/CustomDropdown/CustomDropdown";
import { IPostingCodeDept } from "types/financialSettingTypes";
import {
  useLazyGetPostingcodeListQueryQuery,
  useLazyGetPropertyTaxQuery,
} from "services/financeSlice";
import { useMakeChargeMutation } from "services/paymentsSlice";
import { appConfig } from "config/app.config";
import { currencyString } from "utils/helperFunctions/numbers";
import { ISimpleFolio } from "types/payments";
import { TaxRateType } from "constants/taxes";
import useAuth from "hooks/useAuth";
import { IReservationResponse } from "types/reservationTypes";
import { PostingCodeTypes } from "constants/payments";
import AddChargeIntendedDate from "./AddChargeIntendedDate";
import { getMoment } from "utils/helperFunctions/common";
import { ALL_FOLIOS_ID } from "constants/ui/folios";
import { paymentApiIdFromParent } from "utils/payments";
import { PaymentParent } from "types/ui/payments";
import { PaymentParentEnum } from "constants/ui/payments";
import { IFolioResponse } from "types/folios";

interface AddChargeModalProps {
  open: boolean;
  reservation?: IReservationResponse;
  departments?: IPostingCodeDept[];
  folio: ISimpleFolio;
  allFolios?: IFolioResponse[];
  taxRateCode?: number;
  onClose: (addSuccess?: boolean) => void;
  refreshData: (refreshReservation?: boolean) => void;
  parent?: PaymentParent;
}

type AmountStrings = {
  total: string;
  taxes: string;
};

const AddChargeModal: React.FC<AddChargeModalProps> = ({
  open,
  onClose,
  departments,
  allFolios,
  taxRateCode,
  reservation,
  refreshData,
  folio,
  parent,
}) => {
  const { users: currentUser, currentTimeZone } = useAuth();
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(-1);
  const [department, setDepartment] = useState(-1);
  const [amount, setAmount] = useState("");
  const [dateFromPicker, setDateFromPicker] = useState<Moment | undefined>(
    undefined
  );
  const [invalidAmountMsg, setInvalidAmountMsg] = useState("");
  const [invalidDept, setInvalidDept] = useState(false);
  const [invalidPostingCode, setInvalidPostingCode] = useState(false);
  const [postingCodeId, setPostingCodeId] = useState(-1);
  const [postingCodeOptions, setPostingCodeOptions] = useState<any[]>([]);
  const [notes, setNotes] = useState("");
  const [
    getCodesForDepartment,
    { data: postingCodes, isLoading: codesLoading },
  ] = useLazyGetPostingcodeListQueryQuery();
  const [getTaxesForPostingCode, { data: taxes }] =
    useLazyGetPropertyTaxQuery();
  const [makeCharge, { isLoading: chargeLoading }] = useMakeChargeMutation();
  const showSelectFolio = folio?.id === ALL_FOLIOS_ID;
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
    if (showSelectFolio && selectedId === -1) {
      setError("Please select a folio to attach this charge to");
      return;
    }

    // ensure date sending is between start date and end date - 1
    const todayMoment = getMoment("", currentTimeZone);
    let intendedDate = todayMoment;
    if (parent?.type === PaymentParentEnum.RESERVATION || !!reservation) {
      if (dateFromPicker) {
        intendedDate = dateFromPicker;
      } else {
        const startMoment = getMoment(
          `${reservation!.start_date}T00:00`,
          currentTimeZone,
          true
        );
        const endMoment = getMoment(
          `${reservation?.end_date}T23:59`,
          currentTimeZone,
          true
        );
        if (todayMoment.isBefore(startMoment, "day")) {
          intendedDate = startMoment;
        } else if (todayMoment.isSameOrAfter(endMoment, "day")) {
          intendedDate = endMoment.clone().subtract(1, "day");
        }
      }
    }
    const fId = showSelectFolio ? selectedId : folio.id;
    let makeChargeBody = {
      description: notes,
      folio_id: fId,
      reservation_id: reservation?.id ?? undefined,
      amount: amt,
      posting_code_id: postingCodeId,
      date: intendedDate.format(appConfig.dateApiFormat),
    };
    if (parent) {
      const idBodyPart = paymentApiIdFromParent(parent, {
        sales_group: "group_id",
      });
      makeChargeBody = {
        ...makeChargeBody,
        ...idBodyPart,
      };
    }
    const chargeResponse = await makeCharge(makeChargeBody);
    if (chargeResponse?.data?.id) {
      const refreshReservation = folio.id === ALL_FOLIOS_ID;
      refreshData(refreshReservation);
      handleCloseClick(true);
    } else if (chargeResponse.error) {
      setError(chargeResponse.error.toString());
    }
  };

  function handleCloseClick(successfulAdd?: boolean) {
    setError("");
    setAmount("");
    setDateFromPicker(undefined);
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
    let rateCodeId = reservation?.rate_code?.id;
    if (taxRateCode && taxRateCode > 0) {
      rateCodeId = taxRateCode;
    } else if (parent) {
      if (
        parent.type === PaymentParentEnum.RESERVATION ||
        parent.type === PaymentParentEnum.SALES_GROUP
      ) {
        rateCodeId = parent.rate_code_id;
      }
    }
    getTaxesForPostingCode({
      posting_code_id: +evt.target.value,
      property_id: currentUser?.defaultPropertyId ?? -1,
      rate_code_id: rateCodeId ?? -1,
      date: getMoment(new Date(), currentTimeZone).format(
        appConfig.dateApiFormat
      ),
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

  function handleIntendedChange(date: Moment) {
    setDateFromPicker(date);
  }

  function makeFolioOptions() {
    const rawFolios = reservation?.folios
      ? reservation?.folios
      : (allFolios ?? []);
    return rawFolios.map((f) => ({
      value: f.id.toString(),
      label: `Folio ${f.type}`,
    }));
  }

  function handleFolioChange(evt: any) {
    const value = evt.target.value;
    setError("");
    setSelectedId(+value);
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
  }

  const folioOptions = showSelectFolio ? makeFolioOptions() : [];
  const deptOptions = (departments ?? []).map((d) => ({
    label: `${d.code} -- ${d.name}`,
    value: d.id.toString(),
  }));
  const amounts: AmountStrings = getAmountStrings();
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

          <Grid item>
            {showSelectFolio && (
              <Box mb={2}>
                <CustomDropdown
                  label={"Folio"}
                  placeholder="Choose folio"
                  disabled={folioOptions.length < 1}
                  options={folioOptions}
                  onChange={handleFolioChange}
                  value={selectedId > 0 ? selectedId.toString() : ""}
                  defaultValue=""
                  fullWidth
                  aria-label="Select Folio to Post to"
                  data-testid="add-folio-select-dropdown"
                />
              </Box>
            )}
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
            {(parent?.type === PaymentParentEnum.RESERVATION ||
              !!reservation) && (
              <Box mt={1}>
                <AddChargeIntendedDate
                  reservation={reservation}
                  intendedDate={dateFromPicker}
                  onDateChange={handleIntendedChange}
                />
              </Box>
            )}
            <TextField
              multiline
              fullWidth
              rows={2}
              label="Notes"
              placeholder="Add any notes or a description to the charge"
              onChange={onNotesChange}
              value={notes}
              sx={{ mt: 1 }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <Box display="flex" alignItems="flex-end" flexDirection="column" px={3}>
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

export default AddChargeModal;
