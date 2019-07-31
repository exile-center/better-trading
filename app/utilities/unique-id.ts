// Constants
const RADIX = 36;

export const uniqueId = (): string => {
  return (
    Math.random()
      .toString(RADIX)
      .substring(2) + Date.now().toString(RADIX)
  );
};
