export const parseUGXPriceToMinor = (value: string): number => {
  const digits = value.replace(/[^0-9]/g, "");
  if (!digits) {
    return 0;
  }
  return Number.parseInt(digits, 10);
};

export const formatUGXMinor = (amountMinor: number): string => {
  return `UGX ${amountMinor.toLocaleString()}`;
};
