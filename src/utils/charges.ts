import { PostingCodeTypes } from "constants/payments";
import { IChargeResponse } from "types/charges";

export function parentChargeIsAdjustment(
  charge?: IChargeResponse,
  allCharges?: IChargeResponse[]
) {
  if (!charge) {
    return false;
  }
  if (charge.parent_charge_id) {
    const parentCharge = (allCharges ?? []).find(
      (parentC) => parentC.id === charge.parent_charge_id
    );
    if (parentCharge) {
      return chargeIsAdjustment(parentCharge);
    }
  }
  return false;
}

export function chargeIsAdjustment(charge: IChargeResponse) {
  return (
    charge.posting_code.type === PostingCodeTypes.ADJUSTMENT_CHARGE ||
    charge.posting_code.type === PostingCodeTypes.ADJUSTMENT_FEE ||
    charge.posting_code.type === PostingCodeTypes.ADJUSTMENT_TAX
  );
}

export function isAdjustment(
  c: IChargeResponse,
  allCharges?: IChargeResponse[]
) {
  if (chargeIsAdjustment(c)) {
    return true;
  }
  if (parentChargeIsAdjustment(c, allCharges)) {
    return true;
  }
  return false;
}
