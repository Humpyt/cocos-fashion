export interface TotalsInput {
  priceMinor: number;
  quantity: number;
}

export interface OrderTotals {
  subtotalMinor: number;
  taxMinor: number;
  shippingMinor: number;
  totalMinor: number;
}

export const calculateOrderTotals = (
  items: TotalsInput[],
  taxRate = 0.05,
  shippingMinor = 0,
): OrderTotals => {
  const subtotalMinor = items.reduce((sum, item) => sum + item.priceMinor * item.quantity, 0);
  const taxMinor = Math.round(subtotalMinor * taxRate);
  const totalMinor = subtotalMinor + taxMinor + shippingMinor;

  return {
    subtotalMinor,
    taxMinor,
    shippingMinor,
    totalMinor,
  };
};
