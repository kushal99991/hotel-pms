import React, { useEffect, useState } from "react";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Typography,
  Skeleton,
} from "@mui/material";
import StepContentComponent from "./step/StepContentComponent";
import {
  useGetLatestNightAuditQuery,
  useNightAuditExecuteMutation,
} from "services/nightAuditSlice";
import SecondaryButton from "components/elements/Button/SecondaryButton";
import { Link, useNavigate } from "react-router-dom";
import moment from "moment-timezone";
import { RootState } from "store/store";
import { useAppSelector } from "store/hooks";
import useAuth from "hooks/useAuth";

export interface IStepsProps {
  label: string;
  value:
    | "CREATE_NIGHT_AUDIT"
    | "CREATE_REPORTS"
    | "FIND_REMAINING_ARRIVALS"
    | "FIND_REMAINING_DEPARTURES"
    | "POST_CHARGES"
    | "AUTHORIZE_CHARGES"
    | "SWITCH_STATUSES";
}

const NightAuditStepper: React.FC<{
  propertyId: number;
  auditDate: moment.Moment | null;
}> = ({ propertyId, auditDate }) => {
  const Navigate = useNavigate();
  const { users } = useAuth();
  const selectedNightAudit = useAppSelector(
    (state: RootState) => state?.nightAudit?.selectedNightAudit
  );

  const [activeStep, setActiveStep] = useState<number>(0);
  const [errors, setErrors] = useState<
    Record<
      number,
      {
        hasError: boolean;
        message: string;
        link?: string;
        dependencies_to_resolve?: { id: number; confirmation_id: string }[];
      }
    >
  >({});
  const [canSkipSteps, setCanSkipSteps] = useState<boolean>(false);

  const lastStep = selectedNightAudit?.step ?? "";
  const { data, isLoading: isLatestNightAuditLoading } =
    useGetLatestNightAuditQuery({
      property_id: users?.defaultPropertyId ?? 1,
    });
  const [nightAuditExecute, { isLoading }] = useNightAuditExecuteMutation();

  const steps: IStepsProps[] = [
    { label: "Create Night Audit", value: "CREATE_NIGHT_AUDIT" },
    { label: "Find Remaining Arrivals", value: "FIND_REMAINING_ARRIVALS" },
    { label: "Find Remaining Departures", value: "FIND_REMAINING_DEPARTURES" },
    { label: "Post Charges", value: "POST_CHARGES" },
    { label: "Authorize Charges", value: "AUTHORIZE_CHARGES" },
    { label: "Create Reports", value: "CREATE_REPORTS" },
    { label: "Switch Statuses", value: "SWITCH_STATUSES" },
  ];

  const currentDate = auditDate ?? new Date();
  const lastUpdateAuditDate = data?.audit_date ?? "";

  useEffect(() => {
    if (
      moment(currentDate).format("YYYY-MM-DD") ===
        moment(new Date(lastUpdateAuditDate)).format("YYYY-MM-DD") &&
      data?.status === "FINISHED"
    ) {
      setCanSkipSteps(true);
      setActiveStep(steps.length);
    } else if (lastStep) {
      const stepIndex = steps.findIndex((a) => a.value === lastStep);
      if (stepIndex > 0) {
        setActiveStep(stepIndex);
      }
    }
  }, [data?.status, lastStep, currentDate, lastUpdateAuditDate]);

  const handleNext = async () => {
    const response = await nightAuditExecute({
      audit_date: moment(currentDate).format("YYYY-MM-DD"),
      property_id: Number(propertyId),
      step: steps[activeStep].value,
      description: selectedNightAudit?.comments ?? "",
    });
    if (response.error) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [activeStep]: {
          hasError: true,
          message:
            (response.error as string) ??
            "An unexpected error occurred. Please try again.",
        },
      }));
      return false;
    }
    if (response.data?.dependencies_to_resolve?.length > 0) {
      const errorLinks: Record<string, string> = {
        FIND_REMAINING_ARRIVALS: `/booking-engine/front-office/arrivals?selected_date=${selectedNightAudit?.audit_date}`,
        FIND_REMAINING_DEPARTURES: `/booking-engine/front-office/departures?selected_date=${selectedNightAudit?.audit_date}`,
        POST_CHARGES: `/booking-engine/front-office/in-house?selected_date=${selectedNightAudit?.audit_date}`,
      };
      setErrors((prevErrors) => ({
        ...prevErrors,
        [activeStep]: {
          hasError: true,
          message:
            "Dependencies were detected that must be resolved before proceeding.",
          link: errorLinks?.[steps[activeStep].value] ?? "",
          dependencies_to_resolve: response.data?.dependencies_to_resolve ?? [],
        },
      }));
      return false;
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [activeStep]: { hasError: false, message: "" },
    }));
    if (response.data.status === "FINISHED") {
      setActiveStep(steps.length);
      window.location.href = `/booking-engine/night-audit`;
      return true;
    }
    const stepIndex = steps.findIndex((a) => a.value === response.data.step);
    if (stepIndex >= 0) {
      setActiveStep(stepIndex);
      return true;
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setErrors({});
  };

  return (
    <Box>
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((step, index) => (
          <Step
            key={step.label}
            sx={{
              "& .MuiStepConnector-line": {
                borderColor: errors[index]?.hasError
                  ? "error.main"
                  : "primary.main",
              },
            }}
          >
            <StepLabel
              error={errors[index]?.hasError}
              sx={{ cursor: "pointer" }}
            >
              {isLatestNightAuditLoading ? (
                <Skeleton variant="text" width={150} height={20} />
              ) : (
                step.label
              )}
            </StepLabel>
            <StepContent>
              <StepContentComponent
                data={data}
                isLastStep={steps.length - 1 === index}
                key={index}
                onNext={handleNext}
                isLoading={isLoading || isLatestNightAuditLoading}
              />
              {errors[index]?.hasError && (
                <>
                  <Typography color="error" sx={{ mt: 1 }}>
                    {errors[index].message}
                  </Typography>
                  {errors[index]?.link && (
                    <Link
                      to={`${errors[index].link}`}
                      target="_blank"
                      style={{
                        color: "#1976d2",
                        textDecoration: "underline",
                        display: "block",
                      }}
                    >
                      {`${steps[activeStep].label} List`}
                    </Link>
                  )}

                  {(errors[index].dependencies_to_resolve ?? []).length > 0 && (
                    <Box mt={2}>
                      {(errors[index].dependencies_to_resolve ?? []).map(
                        (link, idx) => {
                          return (
                            <Link
                              to={`/booking-engine/reservations/${link.id}`}
                              target="_blank"
                              style={{
                                color: "#1976d2",
                                textDecoration: "underline",
                                display: "block",
                              }}
                              rel="noreferrer"
                              key={idx}
                            >
                              {`Reservation ${link.confirmation_id.split("/").pop()}`}
                            </Link>
                          );
                        }
                      )}
                    </Box>
                  )}
                </>
              )}
            </StepContent>
          </Step>
        ))}
      </Stepper>
      <Box marginTop={5}>
        {(canSkipSteps || steps.length === activeStep) && (
          <Typography
            variant="body1"
            color="success.main"
            sx={{ textAlign: "center", mt: 2 }}
          >
            You have finished all the steps!
          </Typography>
        )}

        <Box display="flex" alignItems="center" justifyContent="space-between">
          <SecondaryButton
            label="Back"
            onClick={() => Navigate(`/booking-engine/night-audit`)}
          />
          <SecondaryButton
            isDisabled={activeStep === steps.length}
            label="Reset"
            onClick={handleReset}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default NightAuditStepper;
