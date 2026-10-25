export enum RulesEnum {
  RATE_DISCOUNT = "rate_discount",
  MIN_STAY = "min_stay",
  ALLOW_TO_EXTEND_STAY = "allow_to_extend_stay",
  BREAKFAST_INCLUDED = "breakfast_included",
  SUPPRESSED_RATES = "suppressed_rates",
  PARKING_INCLUDED = "parking_included",
}

export const RulesTypeMap = {
  [RulesEnum.RATE_DISCOUNT]: "str",
  [RulesEnum.MIN_STAY]: "integer",
  [RulesEnum.ALLOW_TO_EXTEND_STAY]: "boolean",
  [RulesEnum.BREAKFAST_INCLUDED]: "boolean",
  [RulesEnum.SUPPRESSED_RATES]: "boolean",
  [RulesEnum.PARKING_INCLUDED]: "boolean",
};
