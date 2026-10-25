export const fixedNumber = (
  num: number | string,
  precision: number = 2
): string => {
  return Number.parseFloat(num.toString()).toFixed(precision);
};

export const castNumber = (
  num: number | string,
  cast: string = "float"
): number => {
  const output = num.toString().replace(/[^0-9.]/g, "");
  return cast === "float" ? parseFloat(output) : parseInt(output);
};

export const currencyString = (num: number): string => {
  return num.toLocaleString("en-US", { style: "currency", currency: "USD" });
};
