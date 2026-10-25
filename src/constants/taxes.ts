export enum TaxRateType {
  PERCENTAGE = "PERCENTAGE",
  RATE = "RATE",
}

export enum TaxAssignmentType {
  AUTO_APPLIED = "AUTO_APPLIED",
  MANUALLY_ADDED = "MANUALLY_ADDED",
}

export enum TaxOccurence {
  PER_NIGHT = "PER_NIGHT",
  PER_RESERVATION = "PER_RESERVATION",
  PER_ROOM = "PER_ROOM",
  PER_PERSON = "PER_PERSON",
}

export const assignmentTypeOptions = [
  { label: "Auto Applied", value: "AUTO_APPLIED" },
  { label: "Manually Added", value: "MANUALLY_ADDED" },
];

export const occurrenceOptions = [
  { label: "Per Night", value: "PER_NIGHT" },
  { label: "Per Reservation", value: "PER_RESERVATION" },
  { label: "Per Room", value: "PER_ROOM" },
  { label: "Per Person", value: "PER_PERSON" },
];
