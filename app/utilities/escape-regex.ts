// Source: https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex

export const escapeRegex = (value: string): string => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};
