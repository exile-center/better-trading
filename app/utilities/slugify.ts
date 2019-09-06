export const slugify = (value: string): string => {
  return value
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^-\w]/g, '');
};
