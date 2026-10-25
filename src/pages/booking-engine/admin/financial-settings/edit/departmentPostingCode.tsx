import React, { useState } from "react";
import {
  Alert,
  Grid,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  Button,
  Autocomplete,
  Typography,
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
  Divider,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import { UseFormSetError } from "react-hook-form";
import {
  useLazyGetPostingcodeListQueryQuery,
  useIncludePostingCodeToTaxMutation,
  useExcludePostingCodeToTaxMutation,
  useDeletePostingCodeDepartmentFromTaxMutation,
  useDeletePostingCodeIncludeFromTaxMutation,
  useDeletePostingCodeExcludeFromTaxMutation,
} from "services/financeSlice";
import {
  IEditTaxTypes,
  PostingCodeDepartment,
} from "types/financialSettingTypes";
import Label from "components/elements/Label/Label";
import ConfirmationDialog from "components/elements/ConfirmationDialog/ConfirmationDialog";
import { IPostingCodeDept, IPostingCode } from "types/financialSettingTypes";

interface AttachPostingCodeDeptProps {
  codeDeptList: IPostingCodeDept[];
  tax_id: number;
  departmentId?: number;
  getTaxByid: () => void;
  incPostingCodeId: PostingCodeDepartment["inc_posting_codes"]; // Full array of included posting codes
  excPostingCodeId: PostingCodeDepartment["exc_posting_codes"];
  setSuccessMessage: (message: string | null) => void;
  setError: UseFormSetError<IEditTaxTypes>;
  isLast: boolean;
}

const AttachPostingCodeDept: React.FC<AttachPostingCodeDeptProps> = ({
  codeDeptList,
  tax_id,
  departmentId,
  getTaxByid,
  incPostingCodeId,
  excPostingCodeId,
  setSuccessMessage,
  setError,
  isLast,
}) => {
  const theme = useTheme();
  const [openIncludeExcludeDialog, setOpenIncludeExcludeDialog] =
    useState(false);
  const [selectedPostingCode, setSelectedPostingCode] = useState<{
    label: string;
    id: number;
  } | null>(null);
  const [includeExcludeVal, setIncludeExcludeVal] = useState("");
  const [incExcError, setIncExcError] = useState("");

  const [openDeleteAttachDeptDialog, setOpenDeleteAttachDeptDialog] =
    useState(false);
  const [openDeleteIncludeCodeDialog, setOpenDeleteIncludeCodeDialog] =
    useState(false);
  const [openDeleteExcludeCodeDialog, setOpenDeleteExcludeCodeDialog] =
    useState(false);

  const [deleteId, setDeleteId] = useState<number | null>(null);

  // API Hooks
  const [deletePostingCodeDepartmentFromTax] =
    useDeletePostingCodeDepartmentFromTaxMutation();
  const [deletePostingCodeIncludeFromTax] =
    useDeletePostingCodeIncludeFromTaxMutation();
  const [deletePostingCodeExcludeFromTax] =
    useDeletePostingCodeExcludeFromTaxMutation();

  const [getPostingcodeList, { data: postingCodeList }] =
    useLazyGetPostingcodeListQueryQuery();
  const [includePostingCodeToTax] = useIncludePostingCodeToTaxMutation();
  const [excludePostingCodeToTax] = useExcludePostingCodeToTaxMutation();

  const handleOpenIncludeExcludeDialog = () => {
    if (departmentId) {
      getPostingcodeList({ id: Number(departmentId), type: "CHARGE" });
      setOpenIncludeExcludeDialog(true);
    }
  };
  const handleCloseIncludeExcludeDialog = () => {
    setOpenIncludeExcludeDialog(false);
  };

  const handleIncludeExcludeSubmit = async () => {
    const payload = {
      tax_id,
      posting_code_id: Number(selectedPostingCode?.id),
    };
    if (!includeExcludeVal) {
      setIncExcError(
        "You must choose whether to include or exclude this posting code from this tax/fee."
      );
      return;
    }
    const isInclude = includeExcludeVal === "include";
    const response = isInclude
      ? await includePostingCodeToTax(payload)
      : await excludePostingCodeToTax(payload);

    if (!response.error) {
      setSuccessMessage("Posting Code updated successfully!");
      getTaxByid();
      handleCloseIncludeExcludeDialog();
    } else {
      setSuccessMessage(null);
      setError(
        "root",
        { message: response.error as string },
        { shouldFocus: true }
      );
    }
    handleCloseIncludeExcludeDialog();
  };

  const postingCodeOptions = (postingCodeList ?? []).map(
    (code: IPostingCode) => ({
      label: `${code.code} - ${code.name}`,
      id: code.id,
    })
  );

  //delete functionality
  // const handleOpenDeleteAttachDeptDialog = (id: number) => {
  //   setDeleteId(id);
  //   setOpenDeleteAttachDeptDialog(true);
  // };

  const handleCloseDeleteAttachDeptDialog = () => {
    setDeleteId(null);
    setOpenDeleteAttachDeptDialog(false);
  };

  const handleOpenDeleteIncludeCodeDialog = (id: number) => {
    setDeleteId(id);
    setOpenDeleteIncludeCodeDialog(true);
  };

  const handleCloseDeleteIncludeCodeDialog = () => {
    setDeleteId(null);
    setOpenDeleteIncludeCodeDialog(false);
  };

  const handleOpenDeleteExcludeCodeDialog = (id: number) => {
    setDeleteId(id);
    setOpenDeleteExcludeCodeDialog(true);
  };

  const handleCloseDeleteExcludeCodeDialog = () => {
    setDeleteId(null);
    setOpenDeleteExcludeCodeDialog(false);
  };

  // Delete Functions
  const deleteAttachDept = async () => {
    if (deleteId === null) return;

    const response = await deletePostingCodeDepartmentFromTax({
      posting_code_department_id: deleteId,
      tax_id,
    });

    if (!response.error) {
      setSuccessMessage("Department deleted successfully!");
      getTaxByid();
    } else {
      setSuccessMessage(null);
      setError(
        "root",
        { message: response.error as string },
        { shouldFocus: true }
      );
    }
    handleCloseDeleteAttachDeptDialog();
  };

  const deleteIncludePostingCode = async () => {
    if (deleteId === null) return;

    const response = await deletePostingCodeIncludeFromTax({
      posting_code_id: deleteId,
      tax_id,
    });

    if (!response.error) {
      setSuccessMessage("Included Posting Code deleted successfully!");
      getTaxByid();
    } else {
      setSuccessMessage(null);
      setError(
        "root",
        { message: response.error as string },
        { shouldFocus: true }
      );
    }
    handleCloseDeleteIncludeCodeDialog();
  };

  const deleteExcludePostingCode = async () => {
    if (deleteId === null) return;

    const response = await deletePostingCodeExcludeFromTax({
      posting_code_id: deleteId,
      tax_id,
    });

    if (!response.error) {
      setSuccessMessage("Excluded Posting Code deleted successfully!");
      getTaxByid();
    } else {
      setSuccessMessage(null);
      setError(
        "root",
        { message: response.error as string },
        { shouldFocus: true }
      );
    }
    handleCloseDeleteExcludeCodeDialog();
  };
  const department = codeDeptList.find((dept) => dept.id === departmentId);
  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={12}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mt={1}
          >
            {/* Label and Department Name */}
            <Box display="flex" alignItems="center" gap={1}>
              <Label
                style={{
                  fontSize: "18px",
                  lineHeight: "normal",
                  margin: 0,
                  padding: 0,
                }}
              >
                Department:
              </Label>
              <Typography
                sx={{
                  fontSize: "18px",
                  lineHeight: "normal",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {department ? `${department.code} - ${department.name}` : "N/A"}
              </Typography>
            </Box>

            {/* Delete Icon */}
            {/* <IconButton
              size="small"
              onClick={() =>
                handleOpenDeleteAttachDeptDialog(Number(departmentId))
              }
            >
              <DeleteIcon fontSize="small" />
            </IconButton> */}
          </Box>

          <Box display="flex" flexDirection="column" mt={1} gap={2}>
            <div>
              {incPostingCodeId.length > 0 && (
                <>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    mt={1}
                  >
                    <Label>Included Posting Codes:</Label>
                  </Box>
                  {incPostingCodeId.map((code) => (
                    <Box
                      key={code.id}
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      mt={1}
                    >
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography
                          sx={{
                            fontWeight: "bold",
                            fontSize: "1.5rem",
                            lineHeight: 1,
                          }}
                        >
                          •
                        </Typography>
                        <Typography>{`${code.code} - ${code.name}`}</Typography>
                      </Box>
                      {/* <Typography>{code.name}</Typography> */}
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleOpenDeleteIncludeCodeDialog(code.id)
                        }
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </>
              )}

              {excPostingCodeId.length > 0 && (
                <>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    mt={3}
                  >
                    <Label>Excluded Posting Codes:</Label>
                  </Box>
                  {excPostingCodeId.map((code) => (
                    <Box
                      key={code.id}
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      mt={1}
                    >
                      <Box display="flex" alignItems="center" gap={1}>
                        {/* Bullet point */}
                        <Typography
                          sx={{
                            fontWeight: "bold",
                            fontSize: "1.5rem",
                            lineHeight: 1,
                          }}
                        >
                          •
                        </Typography>
                        <Typography>{`${code.code} - ${code.name}`}</Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleOpenDeleteExcludeCodeDialog(code.id)
                        }
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </>
              )}
            </div>
            <Grid item xs={12} md={9}>
              {departmentId && (
                <Button
                  onClick={handleOpenIncludeExcludeDialog}
                  color="secondary"
                  variant="outlined"
                  size="small"
                >
                  Include/Exclude Posting Code
                </Button>
              )}
            </Grid>
          </Box>
          {!isLast && (
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
        </Grid>
      </Grid>

      <ConfirmationDialog
        open={openDeleteAttachDeptDialog}
        title="Confirm Deletion"
        description="Are you sure you want to delete this Department?"
        buttons={[
          { label: "No", onClick: handleCloseDeleteAttachDeptDialog },
          { label: "Yes", onClick: deleteAttachDept },
        ]}
        onClose={handleCloseDeleteAttachDeptDialog}
      />

      <ConfirmationDialog
        open={openDeleteIncludeCodeDialog}
        title="Confirm Deletion"
        description="Are you sure you want to delete this Included Posting Code?"
        buttons={[
          { label: "No", onClick: handleCloseDeleteIncludeCodeDialog },
          { label: "Yes", onClick: deleteIncludePostingCode },
        ]}
        onClose={handleCloseDeleteIncludeCodeDialog}
      />

      <ConfirmationDialog
        open={openDeleteExcludeCodeDialog}
        title="Confirm Deletion"
        description="Are you sure you want to delete this Excluded Posting Code?"
        buttons={[
          { label: "No", onClick: handleCloseDeleteExcludeCodeDialog },
          { label: "Yes", onClick: deleteExcludePostingCode },
        ]}
        onClose={handleCloseDeleteExcludeCodeDialog}
      />

      <Dialog
        fullWidth
        maxWidth="xs"
        open={openIncludeExcludeDialog}
        onClose={handleCloseIncludeExcludeDialog}
      >
        <DialogTitle>
          <IconButton
            aria-label="close"
            onClick={handleCloseIncludeExcludeDialog}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
          Include/Exclude Posting Code
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} direction="column">
            <Typography mt={2} mx={2}>
              Department:{" "}
              {department ? `${department.code} - ${department.name}` : "N/A"}
            </Typography>
            <Grid item>
              <Autocomplete
                value={selectedPostingCode}
                onChange={(_, selectedOption) =>
                  setSelectedPostingCode(selectedOption)
                }
                options={postingCodeOptions}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Posting Codes"
                    fullWidth
                    margin="dense"
                  />
                )}
              />
            </Grid>
            <Grid item>
              <FormControl>
                <RadioGroup
                  value={includeExcludeVal}
                  onChange={(e) => {
                    setIncExcError("");
                    setIncludeExcludeVal(e.target.value);
                  }}
                >
                  <FormControlLabel
                    value="include"
                    control={<Radio />}
                    label="Apply tax to this posting code"
                  />
                  <FormControlLabel
                    value="exclude"
                    control={<Radio />}
                    label="DO NOT apply tax to this posting code"
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        {incExcError && <Alert severity="error">{incExcError}</Alert>}
        <DialogActions>
          <Button onClick={handleCloseIncludeExcludeDialog} color="primary">
            Cancel
          </Button>
          <PrimaryButton
            label="Submit"
            onClick={handleIncludeExcludeSubmit}
            buttonStyles={{
              backgroundColor: theme.palette.secondary.main,
            }}
          />
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AttachPostingCodeDept;
