import React, { useState, useMemo } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Box,
  CircularProgress,
  Grid,
  TextField,
  Button,
  Autocomplete,
  Typography,
} from "@mui/material";
import { Search, ExpandMore } from "@mui/icons-material";
import useAuth from "hooks/useAuth";
import { useGetDBAccountQuery } from "services/paymentsSlice";

interface DirectBillFormProps {
  buttonDisabled?: boolean;
  successMessage?: string;
  errorMessage?: string;
  buttonLabel?: string;
  successButtonLabel?: string;
  loading?: boolean;
  onSubmit?: (accountId: number) => void;
  onContinue?: () => void;
}

type ErrorState = {
  name: boolean;
  number: boolean;
};

type AccountValue = {
  name: string;
  id: string;
};

const DirectBillForm: React.FC<DirectBillFormProps> = ({
  buttonDisabled,
  successMessage,
  errorMessage,
  buttonLabel,
  successButtonLabel,
  loading,
  onSubmit,
  onContinue,
}) => {
  const { users } = useAuth();
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [valFromSearch, setValFromSearch] = useState<AccountValue | null>(null);
  const [searchText, setSearchText] = useState("");
  const [errors, setErrors] = useState<ErrorState>({
    name: false,
    number: false,
  });
  const { data: accounts, isLoading: resultsLoading } = useGetDBAccountQuery({
    property_id: users?.defaultPropertyId,
  });

  function handleNameChange(evt: any) {
    setErrors({
      ...errors,
      name: false,
    });
    setName(evt.target.value);
  }

  function handleNumberChange(evt: any) {
    setErrors({
      ...errors,
      number: false,
    });
    setNumber(evt.target.value);
  }

  const options = useMemo<AccountValue[]>(() => {
    if (!accounts) {
      return [];
    }
    return accounts.map((acc) => ({
      name: acc.billing_name,
      id: acc.id?.toString(),
    }));
  }, [valFromSearch, searchText, accounts]);

  function getButtonLabel() {
    if (!successMessage) {
      return buttonLabel ?? "Charge Room and Tax to Folio D";
    } else if (successMessage) {
      return successButtonLabel ?? "Continue";
    }
    return "Charge Room and Tax to Folio D";
  }

  function handleSubmit() {
    if (!onSubmit) {
      return;
    }
    const errors = {
      name: !(valFromSearch?.name ?? name),
      number: !(valFromSearch?.id ?? number),
    };
    if (Object.values(errors).some(Boolean)) {
      setErrors(errors);
      return;
    }
    if (successMessage && onContinue) {
      onContinue();
      return;
    }
    const accountFromSearch = valFromSearch ? +valFromSearch.id : -1;
    const accountId = number ? +number : accountFromSearch;
    onSubmit(accountId);
  }
  return (
    <Box mt={4}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            label="Account Name"
            value={valFromSearch?.name ?? name}
            onChange={handleNameChange}
            size="small"
            error={errors.name}
            helperText={errors.name ? "Account name is required" : ""}
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={12} md={6} sx={{ paddingRight: -2 }}>
          <TextField
            label="Account Number"
            value={valFromSearch?.id ?? number}
            onChange={handleNumberChange}
            size="small"
            error={errors.name}
            helperText={errors.number ? "Account number is required" : ""}
            fullWidth
            required
          />
        </Grid>
      </Grid>
      <Accordion
        sx={{
          mt: 2,
          boxShadow: "none",
          borderTop: "1px solid #e5e7eb", // input outlines grey
          borderBottom: "1px solid #e5e7eb",
          "&:before": {
            display: "none",
          },
          "&:first-of-type": {
            borderTopRightRadius: 0,
            borderTopLeftRadius: 0,
          },
          "&:last-of-type": {
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
          },
        }}
      >
        <AccordionSummary
          aria-controls="search-accounts-section"
          sx={{
            height: "32px",
            minHeight: "32px",
            "&.Mui-expanded": {
              height: "32px",
              minHeight: "32px",
            },
            "& .MuiAccordionSummary-content": {
              justifyContent: "flex-end",
            },
          }}
          expandIcon={<ExpandMore />}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Search sx={{ fontSize: "0.8rem", color: "grey.600" }} />
            <Typography
              sx={{ textAlign: "right", ml: 1, color: "grey.600" }}
              variant="caption"
            >
              Search for account
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box display="flex" justifyContent="center">
            <Autocomplete
              id="account-search"
              sx={{ width: 300 }}
              getOptionLabel={(option) => `${option.name} (${option.id})`}
              loading={resultsLoading}
              options={options}
              autoComplete
              includeInputInList
              filterSelectedOptions
              value={valFromSearch}
              size="small"
              noOptionsText={
                searchText ? "No matches" : "Start typing to search"
              }
              onChange={(_, newValue: AccountValue | null) => {
                setValFromSearch(newValue);
                setErrors({ ...errors, name: false, number: false });
              }}
              onInputChange={(_, newInputValue) => {
                setSearchText(newInputValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search by name or number"
                  fullWidth
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {resultsLoading ? (
                          <CircularProgress color="inherit" size={20} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </Box>
        </AccordionDetails>
      </Accordion>
      <Box textAlign="center" mt={4}>
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}
        <Button
          variant={successMessage ? "outlined" : "contained"}
          onClick={handleSubmit}
          disabled={buttonDisabled || loading}
        >
          {getButtonLabel()}
        </Button>
      </Box>
    </Box>
  );
};

export default DirectBillForm;
