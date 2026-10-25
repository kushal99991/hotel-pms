import React, { useState } from "react";
import {
  Box,
  Grid,
  IconButton,
  TextField,
  Typography,
  Button,
} from "@mui/material";
import { Add, ArrowBack } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { IPaymentMethodResponse } from "types/reservationTypes";

interface NoMethodOptionsProps {
  onPayWithNewCard?: () => void;
  validMethods?: IPaymentMethodResponse[];
  handleDifferentCardClick?: () => void;
  handlePayWithNew?: () => void;
  manageDescription?: boolean;
  descriptionRequired?: boolean;
  description?: string;
  onDescriptionChange?: (evt?: React.ChangeEvent) => void;
}

const NoMethodOptions: React.FC<NoMethodOptionsProps> = ({
  onPayWithNewCard,
  validMethods,
  handleDifferentCardClick,
  handlePayWithNew,
  manageDescription,
  descriptionRequired,
  description,
  onDescriptionChange,
}) => {
  const [showDescriptionStep, setShowDescriptionStep] = useState(false);
  const theme = useTheme();

  function handleNewCardClick() {
    if (manageDescription) {
      setShowDescriptionStep(true);
      return;
    }
    onPayWithNewCard?.();
  }

  function handleBackClick() {
    setShowDescriptionStep(false);
  }
  return (
    <Box>
      {!showDescriptionStep && (
        <Grid mt={3} container direction="column" alignItems="center">
          <Grid item>
            <Typography fontStyle="italic" fontSize="0.875rem">
              No payment methods have been added to this reservation.
            </Typography>
          </Grid>
          {!!onPayWithNewCard && (
            <Grid item mt={2}>
              <Button
                onClick={handleNewCardClick}
                variant="contained"
                color="secondary"
                startIcon={<Add />}
              >
                Pay with New Card
              </Button>
            </Grid>
          )}
          <Grid item mt={2}>
            <Button
              onClick={handlePayWithNew}
              variant="outlined"
              color="secondary"
            >
              Pay with other method
            </Button>
          </Grid>
          {!!validMethods?.length && (
            <Grid item mt={2}>
              <button
                type="button"
                onClick={handleDifferentCardClick}
                style={{
                  textDecoration: "underline",
                  color: theme.palette.secondary.main,
                  fontSize: "0.875rem",
                }}
              >
                Use Cash or Check
              </button>
            </Grid>
          )}
        </Grid>
      )}
      {showDescriptionStep && (
        <Grid mt={3}>
          <Grid item>
            <IconButton aria-label="back" onClick={handleBackClick}>
              <ArrowBack />
            </IconButton>
            Prepare payment
          </Grid>
          <Typography
            fontSize="0.875rem"
            sx={{ color: "text.secondary", mb: 2 }}
          >
            Before paying with a new card, add an optional description to save
            additional details.
          </Typography>
          <TextField
            fullWidth
            label="Description"
            required={descriptionRequired}
            placeholder={`${descriptionRequired ? "REQUIRED -" : ""} Add any notes or a description to the payment`}
            onChange={onDescriptionChange}
            value={description ?? ""}
            sx={{ mb: 2 }}
          />
          <Box textAlign="right">
            <Button
              onClick={onPayWithNewCard}
              variant="contained"
              color="secondary"
            >
              Collect Card Information
            </Button>
          </Box>
        </Grid>
      )}
    </Box>
  );
};

export default NoMethodOptions;
