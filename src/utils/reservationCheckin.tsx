import { CheckinState, CheckinStateKey } from "types/reservationCheckIn";

export function allStepsComplete(checkinState: CheckinState) {
  const isComplete = Object.keys(checkinState).reduce(
    (allComplete: boolean, stateKey: string) => {
      if (!allComplete) {
        return false;
      }
      const stateVal = checkinState[stateKey as CheckinStateKey];
      return stateVal?.completed ?? false;
    },
    true
  );
  return isComplete;
}
