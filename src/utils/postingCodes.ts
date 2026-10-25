import { PostingCodeTypes } from "constants/payments";
import { IPostingCode } from "types/financialSettingTypes";

export function isAdjustment(postingCode?: IPostingCode): boolean {
  if (
    postingCode &&
    (postingCode.type === PostingCodeTypes.ADJUSTMENT_CHARGE ||
      postingCode.type == PostingCodeTypes.ADJUSTMENT_TAX ||
      postingCode.type === PostingCodeTypes.ADJUSTMENT_FEE)
  ) {
    return true;
  }
  return false;
}
