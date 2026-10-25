export function formatPercentage(
  numerator: number,
  denominator: number
): string {
  if (denominator === 0) {
    return "0.00%";
  }
  const percentage = (numerator / denominator) * 100;
  const roundedPercentage = (Math.ceil(percentage * 100) / 100).toFixed(2);
  return `${roundedPercentage}%`;
}

export function formatPhoneNumber(phone: string | undefined): string {
  if (!phone) return "";
  const cleaned = ("" + phone).replace(/\D/g, "");
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
}

export function formatFaxNumber(fax: string | undefined): string {
  if (!fax) return "";
  const cleaned = ("" + fax).replace(/\D/g, "");
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return fax; // return the original if it doesn't match
}
