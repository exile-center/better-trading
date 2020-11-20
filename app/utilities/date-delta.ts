export const dateDelta = (deltaMs: number): Date => {
  const currentTimestamp = new Date().getTime();
  return new Date(currentTimestamp + deltaMs);
};
