import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Button,
  Grid,
  Typography,
  Chip,
  Paper,
  CircularProgress,
  Alert,
  TextField,
  FormControl,
  FormHelperText,
  Switch,
  FormControlLabel,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ReservationDetailBox from "pages/booking-engine/reservations/components/ReservationDetail/components/ReservationDetailBox";
import CustomDropdown from "components/widgets/CustomDropdown/CustomDropdown";
import {
  useGetRatePlanRulebyIdMutation,
  useAttachRuleMutation,
  useUpdateRuleMutation,
  useDeleteRuleMutation,
} from "services/roomRateSlice";
import { IRatePlanRule } from "types/roomRateTypes";
import ConfirmationDialog from "components/elements/ConfirmationDialog/ConfirmationDialog";

interface IRuleFormData {
  rate_plan_id: number;
  rule_key: string;
  rule_value: string;
}

const ruleSchema = yup.object().shape({
  rate_plan_id: yup.number().required("Rate plan ID is required"),
  rule_key: yup.string().required("Rule key is required"),
  rule_value: yup.string().required("Rule value is required"),
});

const ManageRules: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedRuleType, setSelectedRuleType] = useState<string | null>(null);
  const [getRatePlanRulebyId, { data: rules, isLoading, isError }] =
    useGetRatePlanRulebyIdMutation();
  const [attachRule] = useAttachRuleMutation();
  const [updateRule] = useUpdateRuleMutation();
  const [deleteRule] = useDeleteRuleMutation();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingRule, setEditingRule] = useState<IRatePlanRule | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<IRatePlanRule | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<IRuleFormData>({
    mode: "all",
    resolver: yupResolver(ruleSchema),
    defaultValues: {
      rate_plan_id: id ? parseInt(id) : 0,
      rule_key: "",
      rule_value: "",
    },
  });

  useEffect(() => {
    if (id) {
      getRatePlanRulebyId({});
      setValue("rate_plan_id", parseInt(id));
    }
  }, [id, getRatePlanRulebyId, setValue]);

  const RulesEnum = useMemo(() => {
    const uniqueRules: IRatePlanRule[] = Object.values(
      (rules)
    );
    return uniqueRules;
  }, [rules]);

  const RulesTypeMap = useMemo(() => {
    const map: Record<string, string> = {};
    rules?.forEach(({ rule_key, rule_value }) => {
      if (!(rule_key in map)) {
        let type: string;
        if (!isNaN(Number(rule_value))) {
          type = "integer";
        } else if (rule_value === "true" || rule_value === "false") {
          type = "boolean";
        } else {
          type = "str";
        }
        map[rule_key] = type;
      }
    });
    return map;
  }, [rules]);

  const filteredRules: IRatePlanRule[] = useMemo(() => {
    return (rules ?? []).filter((rule) => rule.rate_plan_id === Number(id));
  }, [rules, id]);

  const isAllRulesAttached = useMemo(() => {
    const ruleKeysAttached = new Set(filteredRules.map((r) => r.rule_key));
    return RulesEnum.every((rule) => ruleKeysAttached.has(rule));
  }, [RulesEnum, filteredRules]);

  const formatRuleKey = (key: string): string =>
    key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const formatRuleValue = (value: string): string => {
    if (value === "true") return "Yes";
    if (value === "false") return "No";
    return value;
  };

  const getChipColor = (value: string): "success" | "error" | "default" => {
    if (value === "true") return "success";
    if (value === "false") return "error";
    return "default";
  };

  const onSubmit = useCallback(
    async (data: IRuleFormData) => {
      let response;
      if (editingRule) {
        response = await updateRule({ ...data});
      } else {
        response = await attachRule(data);
      }

      if (response.error) {
        setError("root", {
          type: "manual",
          message: response.error as string,
        });
        setSuccessMessage(null);
      } else {
        setSuccessMessage(
          editingRule
            ? "Rule Updated Successfully!"
            : "Rule Attached Successfully!"
        );
        setTimeout(() => {
          setSuccessMessage(null);
        }, 2000);
        getRatePlanRulebyId({});
        setValue("rule_key", "");
        setValue("rule_value", "");
        setSelectedRuleType(null);
        setEditingRule(null);
      }
    },
    [
      editingRule,
      attachRule,
      updateRule,
      getRatePlanRulebyId,
      setError,
      setSuccessMessage,
      setValue,
      setSelectedRuleType,
    ]
  );

  const handleRuleKeyChange = (selectedKey?: string) => {
    if (selectedKey) {
      setSelectedRuleType();
      setValue("rule_value", "");
    }
  };

  const handleOpenDeleteDialog = (rule: IRatePlanRule) => {
    setRuleToDelete(rule);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setRuleToDelete(null);
  };

  const handleDeleteRule = async () => {
    if (ruleToDelete) {
      await deleteRule();
      getRatePlanRulebyId({});
      handleCloseDeleteDialog();
    }
  };

  const renderRuleValueInput = () => {
    if (!selectedRuleType) return null;

    switch (selectedRuleType) {
      case "boolean":
        setValue("rule_value", editingRule?.rule_value ?? "false");
        return (
          <Controller
            name="rule_value"
            control={control}
            render={({ field }) => (
              <FormControl
                fullWidth
                margin="normal"
                error={!!errors.rule_value}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={field.value === "true"}
                      onChange={(e) =>
                        field.onChange(e.target.checked ? "true" : "false")
                      }
                    />
                  }
                  label={field.value === "true" ? "Yes" : "No"}
                />
                {errors.rule_value && (
                  <FormHelperText>{errors.rule_value.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        );
      case "integer":
        return (
          <Controller
            name="rule_value"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Value"
                type="number"
                fullWidth
                margin="normal"
                error={!!errors.rule_value}
                helperText={errors.rule_value?.message}
              />
            )}
          />
        );
      case "str":
        return (
          <Controller
            name="rule_value"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Value"
                fullWidth
                margin="normal"
                error={!!errors.rule_value}
                helperText={errors.rule_value?.message}
              />
            )}
          />
        );
      default:
        return null;
    }
  };

  const options = useMemo(() => {
    const ruleKeysAttached = new Set(filteredRules.map((r) => r.rule_key));
    return RulesEnum.filter((rule) => {
      const isAttached = ruleKeysAttached.has(rule.rule_key);
      return !isAttached || editingRule?.rule_key === rule.rule_key;
    }).map((rule) => ({
      label: formatRuleKey(rule.rule_key),
      value: rule.rule_key,
    }));
  }, [RulesEnum, editingRule, filteredRules]);

  return (
    <Box p={3}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          {errors.root && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.root.message}
            </Alert>
          )}
          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          )}
        </Grid>

        <Grid item xs={12} md={7}>
          <ReservationDetailBox label="Rate Plan Rules" isLoading={isLoading}>
            {isLoading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : isError ? (
              <Alert severity="error">Failed to load rules</Alert>
            ) : filteredRules?.length === 0 ? (
              <Typography>No rules found for this rate plan.</Typography>
            ) : (
              <Grid container spacing={2}>
                {filteredRules.map((rule) => (
                  <Grid item xs={12} sm={6} md={4} key={rule.id}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        border: "1px solid #eee",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        mb={1}
                      >
                        <Typography variant="subtitle2" fontWeight="bold">
                          {formatRuleKey(rule.rule_key)}
                        </Typography>
                        <Box>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setEditingRule(rule);
                                setValue("rule_key", rule.rule_key);
                                setValue("rule_value", rule.rule_value);
                                setSelectedRuleType(
                                  RulesTypeMap[rule.rule_key]
                                );
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleOpenDeleteDialog(rule)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                      <Chip
                        label={formatRuleValue(rule.rule_value)}
                        color={getChipColor(rule.rule_value)}
                        size="small"
                        sx={{ alignSelf: "flex-start", mt: 1 }}
                      />
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
          </ReservationDetailBox>
        </Grid>

        <Grid item xs={12} md={5}>
          <ReservationDetailBox
            label={editingRule ? "Edit Rule" : "Attach New Rule"}
            isLoading={false}
          >
            <Box p={2} component="form" onSubmit={handleSubmit(onSubmit)}>
              {!isAllRulesAttached || editingRule ? (
                <>
                  <Box mb={2}>
                    <Controller
                      name="rule_key"
                      control={control}
                      render={({
                        field: { onChange, value },
                        fieldState: { error },
                      }) => (
                        <CustomDropdown
                          label="Rule Key"
                          placeholder="Select Rule Key"
                          onChange={(event) => {
                            const selected = event.target.value as string;
                            onChange(selected);
                            handleRuleKeyChange(selected ?? undefined);
                          }}
                          value={value}
                          isInvalid={!!error}
                          helperText={error?.message || ""}
                          options={options}
                          fullWidth
                        />
                      )}
                    />
                  </Box>

                  {renderRuleValueInput()}

                  <Box mt={3}>
                    <Button variant="contained" fullWidth type="submit">
                      {editingRule ? "Update Rule" : "Add Rule"}
                    </Button>
                    {editingRule && (
                      <Button
                        variant="outlined"
                        fullWidth
                        sx={{ mt: 1 }}
                        onClick={() => {
                          setEditingRule(null);
                          setValue("rule_key", "");
                          setValue("rule_value", "");
                          setSelectedRuleType(null);
                        }}
                      >
                        Cancel Edit
                      </Button>
                    )}
                  </Box>
                </>
              ) : (
                <Alert severity="info">
                  You have attached all the available plan rules. You can modify
                  them.
                </Alert>
              )}
            </Box>
          </ReservationDetailBox>
        </Grid>
      </Grid>

      <ConfirmationDialog
        open={openDeleteDialog}
        title="Confirm Deletion"
        description="Are you sure you want to delete this rule?"
        buttons={[
          {
            label: "Cancel",
            onClick: handleCloseDeleteDialog,
            color: "secondary",
          },
          { label: "Delete", onClick: handleDeleteRule, color: "error" },
        ]}
        onClose={handleCloseDeleteDialog}
      />
    </Box>
  );
};

export default ManageRules;
