import { useEffect, useState } from "react";
import {
  Paper,
  Typography,
  Alert,
  Box,
  IconButton,
  Skeleton,
  TextField,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { IProperty } from "types/property";
import FullScreenModal from "components/widgets/ModalWindows/FullScreenModal";
import { useUpdateCancellationPolicyMutation } from "services/propertySlice";
import RichTextEditor from "components/elements/RichTextEditor/RichTextEditor";

interface PropertyCancellationPolicyProps {
  property: IProperty | null;
  isLoading: boolean;
  refreshView: () => void;
}

const PropertyCancellationPolicy: React.FC<PropertyCancellationPolicyProps> = ({
  property,
  isLoading,
  refreshView,
}) => {
  const [editPolicy, setEditPolicy] = useState(false);
  const [editDuration, setEditDuration] = useState(false);
  const [policyDraft, setPolicyDraft] = useState(
    property?.cancellation_policy || ""
  );
  const [durationDraft, setDurationDraft] = useState<number | string>(
    property?.cancellation_policy_duration_days || 0
  );

  const [updateCancellationPolicy, { isLoading: isCancelButtonLoading }] =
    useUpdateCancellationPolicyMutation();

  useEffect(() => {
    setPolicyDraft(property?.cancellation_policy ?? "");
    setDurationDraft(property?.cancellation_policy_duration_days ?? 0);
  }, [property]);

  const savePolicy = async () => {
    const res = await updateCancellationPolicy({
      id: `${property?.id}`,
      data: { key: "cancellation_policy", value: policyDraft },
    });
    setEditPolicy(false);

    if (res.data?.data.success) {
      refreshView();
    }
  };

  const saveDuration = async () => {
    const res = await updateCancellationPolicy({
      id: `${property?.id}`,
      data: { key: "cancellation_policy_duration_days", value: durationDraft },
    });

    if (res.data?.data.success) {
      refreshView();
    }
    setEditDuration(false); // Close the edit mode after saving
  };

  const cancelEditDuration = () => {
    setDurationDraft(property?.cancellation_policy_duration_days || 0); // Reset value to the original
    setEditDuration(false); // Exit edit mode without saving
  };

  // console.log(editDuration, durationDraft, "editDuration");
  return (
    <Paper elevation={0} sx={{ padding: 2, marginBottom: 5 }}>
      <Typography variant="body1" gutterBottom>
        Cancellation Permitted Before:{" "}
        {isLoading ? (
          <Skeleton variant="text" width="80%" height={30} sx={{ mb: 2 }} />
        ) : editDuration ? (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <TextField
              type="number"
              value={durationDraft}
              placeholder="Cancellation Duration"
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                if (value >= 0) {
                  setDurationDraft(value);
                }
              }}
              size="small"
              sx={{ maxWidth: 100 }}
            />
            <IconButton aria-label="save" onClick={saveDuration} size="small">
              <CheckIcon />
            </IconButton>
            <IconButton
              aria-label="cancel"
              onClick={cancelEditDuration}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        ) : (
          <>
            <Typography
              component="span"
              variant="body1"
              fontWeight="bold"
              sx={{ cursor: "pointer" }}
              onClick={() => setEditDuration(true)}
            >
              {property?.cancellation_policy_duration_days} days
            </Typography>
            <IconButton
              aria-label="edit"
              onClick={() => setEditDuration(true)}
              size="small"
            >
              <EditIcon />
            </IconButton>
          </>
        )}
      </Typography>

      {isLoading ? (
        <Skeleton variant="text" width="80%" height={30} sx={{ mb: 2 }} />
      ) : (
        <>
          {policyDraft !== property?.cancellation_policy && (
            <Alert variant="outlined" color="warning" sx={{ mb: 2 }}>
              Unsaved Draft!
            </Alert>
          )}
        </>
      )}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Cancellation policy display */}
        {isLoading ? (
          <Skeleton variant="text" width="80%" height={30} sx={{ mb: 2 }} />
        ) : (
          <Typography
            variant="body1"
            sx={{ flexGrow: 1 }}
            component="div"
            className="ck-content"
            dangerouslySetInnerHTML={{
              __html: property?.cancellation_policy || "",
            }}
          />
        )}

        {/* Edit button next to the content */}
        {!isLoading && (
          <IconButton
            aria-label="edit"
            onClick={() => setEditPolicy(true)}
            size="small"
            data-testid="edit-cancellation-policy"
          >
            <EditIcon />
          </IconButton>
        )}
      </Box>

      {/* Modal for editing policy with MUI controls */}
      <FullScreenModal
        title="Edit Cancellation Policy"
        open={editPolicy}
        onClose={() => setEditPolicy(false)}
        closeButtonLabel="Cancel"
        isPrimaryButtonLoading={isCancelButtonLoading}
        primaryActionLabel={
          isCancelButtonLoading ? "Saving..." : "Update Policy"
        }
        onPrimaryAction={savePolicy} // Call the savePolicy function when the primary action button is clicked
      >
        <RichTextEditor
          initialData={policyDraft}
          isInvalid={false}
          helperText={""}
          initialLoading={false}
          onChange={(data: string) => setPolicyDraft(data)}
          allowImageUpload={false}
        />
      </FullScreenModal>
    </Paper>
  );
};

export default PropertyCancellationPolicy;
