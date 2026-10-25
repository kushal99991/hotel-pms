import React, { useState } from "react";
import {
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
  Checkbox,
  FormControlLabel,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import PrimaryButton from "components/elements/Button/PrimaryButton";
import { UseFormSetError } from "react-hook-form";
import {
  useLazyGetPostingcodeListQueryQuery,
  useIncludePostingCodeToFeeMutation,
  useExcludePostingCodeToFeeMutation,
  useDeletePostingCodeDepartmentFromFeeMutation,
  useDeletePostingCodeIncludeFromFeeMutation,
  useDeletePostingCodeExcludeFromFeeMutation,
} from "services/financeSlice";
import { IFeesTypes, PostingCodeDepartment } from "types/financialSettingTypes";
import Label from "components/elements/Label/Label";
import ConfirmationDialog from "components/elements/ConfirmationDialog/ConfirmationDialog";

interface IPostingCodeDept {
  id: number;
  name: string;
}

interface IPostingCode {
  id: number;
  name: string;
}

interface AttachPostingCodeDeptProps {
  codeDeptList: IPostingCodeDept[];
  fee_id: number;
  departmentId?: number;
  getFeeByid: () => void;
  incPostingCodeId: PostingCodeDepartment["inc_posting_codes"];
  excPostingCodeId: PostingCodeDepartment["exc_posting_codes"];
  setSuccessMessage: (message: string | null) => void;
  setError: UseFormSetError<IFeesTypes>;
  isLast: boolean;
}

const AttachPostingCodeDept: React.FC<AttachPostingCodeDeptProps> = ({
  codeDeptList,
  fee_id,
  departmentId,
  getFeeByid,
  incPostingCodeId,
  excPostingCodeId,
  setSuccessMessage,
  setError,
  isLast,
}) => {
  const [openIncludeExcludeDialog, setOpenIncludeExcludeDialog] =
    useState(false);
  const [selectedPostingCode, setSelectedPostingCode] = useState<{
    label: string;
    id: number;
  } | null>(null);
  const [isInclude, setIsInclude] = useState(true);

  const [openDeleteAttachDeptDialog, setOpenDeleteAttachDeptDialog] =
    useState(false);
  const [openDeleteIncludeCodeDialog, setOpenDeleteIncludeCodeDialog] =
    useState(false);
  const [openDeleteExcludeCodeDialog, setOpenDeleteExcludeCodeDialog] =
    useState(false);

  const [deleteId, setDeleteId] = useState<number | null>(null);

  // API Hooks
  const [deletePostingCodeDepartmentFromFee] =
    useDeletePostingCodeDepartmentFromFeeMutation();
  const [deletePostingCodeIncludeFromFee] =
    useDeletePostingCodeIncludeFromFeeMutation();
  const [deletePostingCodeExcludeFromFee] =
    useDeletePostingCodeExcludeFromFeeMutation();

  const [getPostingcodeList, { data: postingCodeList }] =
    useLazyGetPostingcodeListQueryQuery();
  const [includePostingCodeToFee] = useIncludePostingCodeToFeeMutation();
  const [excludePostingCodeToFee] = useExcludePostingCodeToFeeMutation();

  const handleOpenIncludeExcludeDialog = () => {
    if (departmentId) {
      getPostingcodeList({ id: departmentId });
      setOpenIncludeExcludeDialog(true);
    }
  };
  const handleCloseIncludeExcludeDialog = () => {
    setOpenIncludeExcludeDialog(false);
  };

  const handleIncludeExcludeSubmit = async () => {
    const payload = {
      fee_id,
      posting_code_id: Number(selectedPostingCode?.id),
    };
    const response = isInclude
      ? await includePostingCodeToFee(payload)
      : await excludePostingCodeToFee(payload);

    if (!response.error) {
      setSuccessMessage("Posting Code updated successfully!");
      getFeeByid();
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
      label: code.name,
      id: code.id,
    })
  );

  //delete functionality
  const handleOpenDeleteAttachDeptDialog = (id: number) => {
    setDeleteId(id);
    setOpenDeleteAttachDeptDialog(true);
  };

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

    const response = await deletePostingCodeDepartmentFromFee({
      posting_code_department_id: deleteId,
      fee_id,
    });

    if (!response.error) {
      setSuccessMessage("Department deleted successfully!");
      getFeeByid();
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

    const response = await deletePostingCodeIncludeFromFee({
      posting_code_id: deleteId,
      fee_id,
    });

    if (!response.error) {
      setSuccessMessage("Included Posting Code deleted successfully!");
      getFeeByid();
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

    const response = await deletePostingCodeExcludeFromFee({
      posting_code_id: deleteId,
      fee_id,
    });

    if (!response.error) {
      setSuccessMessage("Excluded Posting Code deleted successfully!");
      getFeeByid();
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
                {codeDeptList.find((dept) => dept.id === departmentId)?.name ||
                  "N/A"}
              </Typography>
            </Box>

            {/* Delete Icon */}
            <IconButton
              size="small"
              onClick={() =>
                handleOpenDeleteAttachDeptDialog(Number(departmentId))
              }
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
          <Box display="flex" flexDirection="column" mt={1} gap={2}>
            <div>
              {/* Included Posting Codes */}
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
                        <Typography>{code.name}</Typography>
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

              {/* Excluded Posting Codes */}
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
                        <Typography>{code.name}</Typography>
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

        {/* Divider for styling */}
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

        {/* Dialogs for Deletion and Adding Posting Codes */}
        <Dialog
          open={openIncludeExcludeDialog}
          onClose={handleCloseIncludeExcludeDialog}
          fullWidth
          maxWidth="sm"
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
            <Autocomplete
              options={postingCodeOptions}
              getOptionLabel={(option) => option.label}
              value={selectedPostingCode}
              onChange={(_, value) => setSelectedPostingCode(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Posting Code"
                  variant="outlined"
                  fullWidth
                />
              )}
            />
            <Box mt={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isInclude}
                    onChange={(e) => setIsInclude(e.target.checked)}
                  />
                }
                label="Include"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseIncludeExcludeDialog} color="primary">
              Cancel
            </Button>
            <PrimaryButton
              label="Submit"
              onClick={handleIncludeExcludeSubmit}
              buttonStyles={{
                backgroundColor: isInclude ? "#32A1AE" : "#FF5722",
                color: "#FFFFFF",
                fontWeight: "bold",
              }}
            />
          </DialogActions>
        </Dialog>

        {/* Confirmation Dialogs */}
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
          description="Are you
          sure you want to delete this Included Posting Code?"
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
      </Grid>
    </>
  );
};

export default AttachPostingCodeDept;
