import { TaxRateType } from "constants/taxes";
import { ITaxVersion } from "types/financialSettingTypes";
import moment from "moment";

function getNumRateFromVersion(taxVersion: ITaxVersion, type: TaxRateType) {
  if (type === TaxRateType.PERCENTAGE) {
    return parseFloat(taxVersion.rate);
  } else if (type === TaxRateType.RATE) {
    return +taxVersion.rate;
  }
  return 0;
}

export function getCurrentTaxRate(
  type: TaxRateType,
  taxVersions?: ITaxVersion[]
): number {
  // Return 0 if the array is empty, null, or undefined or if type not given
  if (!taxVersions?.length) {
    return 0;
  }
  const currentMoment = moment();
  if (taxVersions.length === 1) {
    const versionStartMoment = moment(taxVersions[0].starts_from);
    if (versionStartMoment.isSameOrBefore(currentMoment, "day")) {
      return getNumRateFromVersion(taxVersions[0], type);
    }
    return 0;
  }

  let applicableRate: ITaxVersion = {
    rate: "-1",
    starts_from: "",
    id: -1,
    tax_id: -1,
  };

  for (const rate of taxVersions) {
    const rateStartMoment = moment(rate.starts_from);
    if (rateStartMoment.isSameOrBefore(currentMoment, "day")) {
      if (applicableRate.id === -1) {
        // applicable rate is unset
        applicableRate = rate;
        continue;
      }
      const applicableRateMoment = moment(applicableRate.starts_from);
      if (rateStartMoment.isAfter(applicableRateMoment, "day")) {
        applicableRate = rate;
      }
    }
  }

  if (applicableRate.id === -1) {
    // no applicable rate was found
    return 0;
  }

  return getNumRateFromVersion(applicableRate, type);
}

export const formatRule = (key: string, value: string) => {
  const toTitleCase = (str: string) =>
    str.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
  const title = toTitleCase(key);
  switch (key) {
    case "min_stay":
      return {
        message: `Minimum stay: ${value} night${value === "1" ? "" : "s"}`,
        isPositive: true,
      };
    case "allow_to_extend_stay":
      return {
        message:
          value === "true"
            ? `Guests can extend their stay (${title})`
            : `Guests can't extend their stay (${title})`,
        isPositive: value === "true",
      };
    case "breakfast_included":
      return {
        message:
          value === "true"
            ? `Exceptional breakfast included`
            : `Breakfast not included`,
        isPositive: value === "true",
      };
    case "suppressed_rates":
      return {
        message:
          value === "true"
            ? `Rate hidden from public view (${title})`
            : `Rate visible to public (${title})`,
        isPositive: value === "true",
      };
    case "parking_included":
      return {
        message: value === "true" ? `Parking included` : `No parking included`,
        isPositive: value === "true",
      };
    case "rate_discount":
      return {
        message:
          Number(value) > 0 ? `Rate discount of ${value}` : `No rate discount`,
        isPositive: Number(value) > 0,
      };
    case "refundable":
      return {
        message: value === "true" ? "Refundable" : "Non-refundable",
        isPositive: value === "true",
      };
    default:
      if (value === "true" || value === "false") {
        return {
          message: value === "true" ? `${title}` : `Not ${title}`,
          isPositive: value === "true",
        };
      }
      return {
        message: `${title}: ${value}`,
        isPositive: false,
      };
  }
};
