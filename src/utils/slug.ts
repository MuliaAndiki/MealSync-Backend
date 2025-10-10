import Restaurant from "../models/Restaurant";

export const createSlug = (name: string) => {
  const random = Math.floor(Math.random() * 1000);
  return name.toLowerCase().trim().replace(/\s+/g, "-") + "-" + random;
};

/**
 * Generate a unique URL for a restaurant based on its name
 * @param name - Restaurant name
 * @returns A unique URL string
 */
export const generateUniqueRestaurantUrl = async (
  name: string
): Promise<string> => {
  // Create base slug from name
  const baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens

  let uniqueUrl = baseSlug;
  let counter = 0;

  // Keep checking until we find a unique URL
  while (true) {
    const existing = await Restaurant.findOne({ uniqueUrl });

    if (!existing) {
      // URL is unique, return it
      return uniqueUrl;
    }

    // URL exists, generate a new one with random suffix
    counter++;
    const randomSuffix = Math.random().toString(36).substring(2, 8); // 6 random chars
    uniqueUrl = `${baseSlug}-${randomSuffix}`;

    // Safety check to prevent infinite loop (unlikely but good practice)
    if (counter > 50) {
      // If we've tried 50 times, add timestamp to ensure uniqueness
      uniqueUrl = `${baseSlug}-${Date.now()}`;
      break;
    }
  }

  return uniqueUrl;
};
