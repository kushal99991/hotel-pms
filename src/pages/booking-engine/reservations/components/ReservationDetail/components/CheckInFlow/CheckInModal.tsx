import React, { useState, useEffect, useContext } from "react";
import { styled } from "@mui/material/styles";
import {
  Dialog,
  DialogTitle,
  Button,
  Stepper,
  Step,
  StepButton,
  StepConnector,
  Alert,
} from "@mui/material";
import { stepConnectorClasses } from "@mui/material/StepConnector";
import {
  CloseOutlined,
  Checklist,
  Badge,
  TaskAlt,
  RequestQuote,
} from "@mui/icons-material";
import useAuth from "hooks/useAuth";
import ReservationDetailsContext from "contexts/ReservationDetailsContext";
import CheckInModalButtons from "./CheckInModalButtons";
import { IReservationResponse } from "types/reservationTypes";
import CheckInStepsRouter from "./CheckInStepsRouter";
import { CheckinStepType } from "constants/reservationCheckin";
import {
  CheckinStateValue,
  CheckinStep,
  CheckinState,
  CheckinStateKey,
} from "types/reservationCheckIn";
import { allStepsComplete } from "utils/reservationCheckin";
import { useUpdateCheckInReservationMutation } from "services/reservationSlice";
import { methodsHaveValidMethod } from "utils/payments";
import {
  getCurrentRoom,
  incidentalPaymentReady,
  isCompReservation,
} from "utils/reservations";
import { includeIncidentalStep } from "./checkinUtils";

interface CheckinModalProps {
  open: boolean;
  onClose: () => void;
  onCheckedIn: () => void;
  reservation?: IReservationResponse | null;
  balance?: number;
  onRefresh: () => void;
}

const CheckinConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 10,
    left: "calc(-50% + 16px)",
    right: "calc(50% + 16px)",
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: theme.palette.secondary.main,
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: theme.palette.secondary.main,
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor:
      theme.palette.mode === "dark" ? theme.palette.grey[800] : "#eaeaf0",
    borderTopWidth: 3,
    borderRadius: 1,
  },
}));

const stepperStyle = {
  mb: 3,
  "& .MuiStepLabel-root": {
    color: "gray",
  },
  "& .Mui-active": {
    color: "secondary.main",
  },
  "& .Mui-completed": {
    color: "secondary.main",
  },
};

const CheckInModal: React.FC<CheckinModalProps> = ({
  balance,
  open,
  onClose,
  onCheckedIn,
  reservation,
  onRefresh,
}) => {
  const { viewState: reservationViewState } = useContext(
    ReservationDetailsContext
  )!;
  const { currentProperty } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [checkinState, setCheckInState] = useState<CheckinState>({});
  const [checkInError, setCheckinError] = useState<string>("");
  const [disableNext, setDisableNext] = useState<boolean>(false);
  const [steps, setSteps] = useState<CheckinStep[]>([]);
  const [checkIn, { isLoading }] = useUpdateCheckInReservationMutation();

  function generateSteps(reservation: IReservationResponse) {
    if (!reservation) {
      return [];
    }
    const steps = [
      {
        key: CheckinStepType.OVERVIEW,
        label: "Overview",
        icon: <Checklist />,
        index: 0,
      },
      {
        key: CheckinStepType.VERIFY,
        label: "Verify",
        icon: <Badge />,
        index: 1,
      },
      {
        key: CheckinStepType.FINISH,
        label: "Finish",
        icon: <TaskAlt />,
        index: 3,
      },
    ];
    const includeIncidentals = includeIncidentalStep(
      reservation,
      currentProperty
    );
    if (includeIncidentals) {
      steps.splice(steps.length - 1, 0, {
        key: CheckinStepType.INCIDENTALS,
        label: "Incidentals",
        icon: <RequestQuote />,
        index: 2,
      });
    }
    return steps;
  }

  useEffect(() => {
    if (!reservation) {
      return;
    }
    setSteps(generateSteps(reservation));
    const hasValidMethod = methodsHaveValidMethod(reservation.payment_methods);
    const balanceReady = !Number.isNaN(balance) ? balance! <= 0 : false;
    const paymentMade = reservation.payments.length > 0;
    let paymentReady = hasValidMethod && balanceReady && paymentMade;
    let paymentMessage = "Collect a payment method";
    if (!paymentMade && !hasValidMethod) {
      paymentMessage = `${paymentMessage} and process total room payment`;
    } else if (hasValidMethod && !paymentMade) {
      paymentMessage = "Process total room payment";
    } else if (hasValidMethod && paymentMade && !balanceReady) {
      paymentMessage = "Process payment to resolve the reservation balance";
    } else if (paymentMade && balanceReady && !hasValidMethod) {
      // balance covered by a global method
      paymentMessage = "";
      paymentReady = true;
    }
    if (isCompReservation(reservation)) {
      paymentReady = true;
    }
    const room = getCurrentRoom(reservation);
    const incidentalStepIncluded = includeIncidentalStep(
      reservation,
      currentProperty
    );
    setCheckInState({
      paid: {
        stepKey: CheckinStepType.PAYMENT_READY,
        external: true,
        completed: paymentReady,
        message: paymentMessage,
      },
      assigned: {
        stepKey: CheckinStepType.ASSIGNED,
        external: true,
        completed: !!room?.room_number,
        message: "Assign guest a room",
      },
      incidentals: {
        stepKey: CheckinStepType.INCIDENTALS,
        completed: incidentalStepIncluded
          ? incidentalPaymentReady(reservation)
          : true,
        message: "Authorize incidentals charge",
      },
      verified: {
        stepKey: CheckinStepType.VERIFY,
        completed: reservationViewState.guestVerified ?? false,
        message: "Verify guest information",
      },
    });
  }, [
    reservation,
    balance,
    reservationViewState.guestVerified,
    currentProperty,
  ]);

  useEffect(() => {
    const currentVerifiedStep = checkinState.verified;
    const currentIncidentalsStep = checkinState.incidentals;
    if (!currentVerifiedStep && !currentIncidentalsStep) {
      return;
    }
    if (currentVerifiedStep?.completed !== reservationViewState.guestVerified) {
      const updatedVerifyStep = {
        stepKey: checkinState.verified!.stepKey,
        message: checkinState.verified!.message,
        completed: reservationViewState.guestVerified ?? false,
      };
      setCheckInState({
        ...checkinState,
        verified: updatedVerifyStep,
      });
    }
    if (
      currentIncidentalsStep?.completed !==
      reservationViewState.incidentalsCollected
    ) {
      const updateIncidentalsStep = {
        stepKey: checkinState.incidentals!.stepKey,
        message: checkinState.incidentals!.message,
        completed: reservationViewState.incidentalsCollected ?? false,
      };
      setCheckInState({
        ...checkinState,
        incidentals: updateIncidentalsStep,
      });
    }
  }, [reservationViewState]);

  function handleStepForward() {
    setActiveStep((prev) => prev + 1);
  }
  function handleStepBack() {
    setActiveStep((prev) => prev - 1);
  }
  function handlePrevious() {
    if (activeStep === 0) {
      onClose();
      return;
    }
    handleStepBack();
  }
  function handleStepClick(stepIndex: number) {
    return () => {
      setActiveStep(stepIndex);
    };
  }
  async function handleCheckIn() {
    setCheckinError("");
    if (reservation) {
      const checkInResponse = await checkIn({ id: reservation?.id });
      if (checkInResponse.data?.status) {
        onCheckedIn?.();
      } else if (checkInResponse.error) {
        setCheckinError("");
      }
    }
  }
  function getNextHandler(steps: CheckinStep[], activeStep: number) {
    if (activeStep === steps.length - 1) {
      // last step is to actually check in
      return handleCheckIn;
    }
    return handleStepForward;
  }
  function isStepComplete(stepKey: CheckinStepType, stepIndex: number) {
    if (stepIndex === steps.length - 1) {
      return false;
    }
    const stepState = Object.keys(checkinState).reduce(
      (foundState: CheckinStateValue | undefined, stateKey: string) => {
        const stateVal = checkinState[stateKey as CheckinStateKey];
        if (stateVal?.stepKey === stepKey) {
          foundState = stateVal;
        }
        return foundState;
      },
      undefined
    );
    return stepState?.completed ?? true;
  }

  function isNextDisabled() {
    if (disableNext) {
      return true;
    }
    if (activeStep === 0) {
      const outstandingItems = Object.values(checkinState ?? []).filter(
        (preReq) => !preReq.completed && preReq.external
      );
      return outstandingItems.length > 0;
    }
    if (activeStep === steps.length - 1) {
      return !allStepsComplete(checkinState);
    }
    return false;
  }

  function handleDialogClose() {
    if (isLoading) {
      return;
    }
    setCheckinError("");
    onClose();
  }
  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      PaperProps={{ sx: { width: "80%", minHeight: "500px" } }}
    >
      <DialogTitle>
        Check-In
        <Button
          onClick={handleDialogClose}
          color="primary"
          sx={{ float: "right" }}
        >
          <CloseOutlined />
        </Button>
      </DialogTitle>
      <Stepper
        alternativeLabel
        activeStep={activeStep}
        sx={stepperStyle}
        connector={<CheckinConnector />}
      >
        {steps.map((step: CheckinStep, index: number) => {
          return (
            <Step key={step.label} completed={isStepComplete(step.key, index)}>
              <StepButton icon={step.icon} onClick={handleStepClick(index)}>
                {step.label}
              </StepButton>
            </Step>
          );
        })}
      </Stepper>
      <CheckInStepsRouter
        activeStepKey={steps[activeStep]?.key}
        activeStepIndex={activeStep}
        reservation={reservation}
        updateState={setCheckInState}
        checkInState={checkinState}
        refreshReservation={onRefresh}
        setDisableNext={setDisableNext}
      />
      {checkInError && (
        <Alert severity="error">{`There was an error: ${checkInError}. Please try again`}</Alert>
      )}
      <CheckInModalButtons
        onNext={getNextHandler(steps, activeStep)}
        onPrev={handlePrevious}
        nextDisabled={isNextDisabled()}
        activeStep={activeStep}
        totalSteps={steps.length}
        onClose={handleDialogClose}
      />
    </Dialog>
  );
};

export default CheckInModal;
