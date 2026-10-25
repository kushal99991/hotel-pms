import { CheckinStepType } from "constants/reservationCheckin";

interface CheckinStep {
  key: CheckinStepType;
  label: string;
  icon: any;
  index: number;
}

interface CheckinStateValue {
  completed: boolean;
  external?: boolean;
  message: string;
  stepKey: CheckinStepType;
}

interface CheckinState {
  paid?: CheckinStateValue;
  assigned?: CheckinStateValue;
  verified?: CheckinStateValue;
  incidentals?: CheckinStateValue;
}

type CheckinStateKey = keyof CheckinState;
