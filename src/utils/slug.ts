export const createSlug = (name: string) => {
  const random = Math.floor(Math.random() * 1000);
  return name.toLowerCase().trim().replace(/\s+/g, "-") + "-" + random;
};
