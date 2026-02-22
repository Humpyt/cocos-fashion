export interface MergeableLineItem {
  variantId: string;
  quantity: number;
}

export const mergeCartLineItems = (
  base: MergeableLineItem[],
  incoming: MergeableLineItem[],
): MergeableLineItem[] => {
  const merged = new Map<string, number>();

  for (const item of base) {
    merged.set(item.variantId, (merged.get(item.variantId) ?? 0) + item.quantity);
  }
  for (const item of incoming) {
    merged.set(item.variantId, (merged.get(item.variantId) ?? 0) + item.quantity);
  }

  return Array.from(merged.entries()).map(([variantId, quantity]) => ({
    variantId,
    quantity,
  }));
};
