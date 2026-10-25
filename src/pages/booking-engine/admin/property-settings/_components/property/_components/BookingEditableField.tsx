import React, { useState } from "react";
import {
  Box,
  IconButton,
  Skeleton,
  TextField,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { useUpdatePropertyByIdMutation } from "services/propertySlice";
import { IProperty } from "types/property";
import useSnackbar from "hooks/useSnackbar";

interface BookingEditableFieldProps {
  label: string;
  value?: number | string | null;
  fieldKey:
    | "max_stay_duration_days"
    | "incidentals_per_night"
    | "max_reservations_per_request"
    | "booking_window";
  property: IProperty | null;
  onRefresh?: () => void;
}

const BookingEditableFieldSkeleton: React.FC<{ fieldsCount?: number }> = ({
  fieldsCount = 4,
}) => {
  return (
    <Box mt={2}>
      <Box mt={2}>
        {Array.from({ length: fieldsCount }).map((_, idx) => (
          <Box
            key={idx}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              py: 1,
            }}
          >
            {/* Label placeholder */}
            <Skeleton variant="text" width={180} height={25} />
            {/* Value + action buttons placeholder */}
            <Skeleton variant="rectangular" width={120} height={35} />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

// Inline editable field
const BookingEditableField: React.FC<BookingEditableFieldProps> = ({
  label,
  value,
  fieldKey,
  property,
  onRefresh,
}) => {
  const { openSnackbar } = useSnackbar();
  const [editing, setEditing] = useState<boolean>(false);
  const [draft, setDraft] = useState<string | number | "">(value ?? "");
  const [updateProperty, { isLoading }] = useUpdatePropertyByIdMutation();

  const handleSave = async () => {
    if (property?.id) {
      const response = await updateProperty({
        id: property.id,
        data: {
          [fieldKey]: draft,
          name: property.name,
          description: property.description,
        },
      });
      if (response?.error) {
        openSnackbar(response.error?.message as string, "error");
        return false;
      }
      setEditing(false);
      onRefresh?.();
    }
  };

  const handleCancel = () => {
    setDraft(value ?? "");
    setEditing(false);
  };

  if (isLoading) return <BookingEditableFieldSkeleton fieldsCount={1} />;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        py: 1,
      }}
    >
      <Typography variant="body1">{label}</Typography>
      {editing ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <TextField
            size="small"
            type="number"
            value={draft}
            onChange={(e) => {
              const val = e.target.value;
              // Keep empty string allowed (for cancel/reset), otherwise parse number
              setDraft(val === "" ? "" : Number(val));
            }}
            sx={{ width: 120 }}
            inputProps={{ min: 0 }}
          />
          <IconButton size="small" color="success" onClick={handleSave}>
            <CheckIcon />
          </IconButton>
          <IconButton size="small" color="error" onClick={handleCancel}>
            <CloseIcon />
          </IconButton>
        </Box>
      ) : (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="body2" sx={{ minWidth: 80, textAlign: "right" }}>
            {value ?? "-"}
          </Typography>
          <IconButton size="small" onClick={() => setEditing(true)}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

export default BookingEditableField;
