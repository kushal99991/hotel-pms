import React from "react";
import { Box, Button, TextField, Grid } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

interface EditUserFormProps {
  user: {
    name: string;
    email: string;
    details: string;
  };
  handleChange: (
    _event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleSubmit: (_event: React.FormEvent<HTMLFormElement>) => void;
  handleCancelClick: () => void;
}

const EditUserForm: React.FC<EditUserFormProps> = ({
  user,
  handleChange,
  handleSubmit,
  handleCancelClick,
}) => {
  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            label="Name"
            name="name"
            value={user.name}
            onChange={handleChange}
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Email"
            name="email"
            value={user.email}
            onChange={handleChange}
            fullWidth
            required
            type="email"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Details"
            name="details"
            value={user.details}
            onChange={handleChange}
            fullWidth
            multiline
            rows={4}
          />
        </Grid>
        <Grid item xs={12}>
          <Box display="flex" justifyContent="flex-start">
            <Button
              variant="contained"
              color="primary"
              type="submit"
              startIcon={<SaveIcon />}
              sx={{ marginRight: 2 }}
            >
              Save
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleCancelClick}
              startIcon={<CancelIcon />}
            >
              Cancel
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  );
};

export default EditUserForm;
