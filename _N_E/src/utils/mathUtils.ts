export const clamp = (index: number, max: number, min = 0) =>
  Math.max(min, Math.min(index, max));
