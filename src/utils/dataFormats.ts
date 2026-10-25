export function hasMoreThanHundredths(value: number) {
  return (value * 100) % 1 !== 0;
}

export function numberToTwoDecimals(value: number) {
  if (hasMoreThanHundredths(value)) {
    return +value.toFixed(2);
  }
  return value;
}

export function apiAmountToNumber(
  amountVal: string | number | null | undefined
) {
  if (amountVal == null) {
    return 0;
  }
  const castedAmount = +amountVal;
  if (isNaN(castedAmount)) {
    return 0;
  }
  return castedAmount;
}
