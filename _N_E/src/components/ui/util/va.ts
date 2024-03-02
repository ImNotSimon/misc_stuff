export function getUniqueID(prefix: string) {
  return `${prefix}-${new Date().getTime()}`;
}
