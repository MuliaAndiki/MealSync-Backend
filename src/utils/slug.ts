import Restaurant from "../models/Restaurant";

export const createSlug = (name: string) => {
  const random = Math.floor(Math.random() * 1000);
  return name.toLowerCase().trim().replace(/\s+/g, "-") + "-" + random;
};

export const generateUniqueRestaurantUrl = async (
  name: string
): Promise<string> => {
  const baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  let uniqueUrl = baseSlug;
  let counter = 0;

  while (true) {
    const existing = await Restaurant.findOne({ uniqueUrl });

    if (!existing) {
      return uniqueUrl;
    }

    counter++;
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    uniqueUrl = `${baseSlug}-${randomSuffix}`;

    if (counter > 50) {
      uniqueUrl = `${baseSlug}-${Date.now()}`;
      break;
    }
  }

  return uniqueUrl;
};
