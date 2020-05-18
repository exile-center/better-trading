export const asyncLoop = async <T>(items: T[], callback: (item: T) => void | Promise<void>) => {
  for (const item of items) {
    await callback(item);
  }
};
