import { uploadCloudinary } from "./uploadsClodinary";
export const handleUpload = async (
  file: Express.Multer.File | undefined,
  base64String: string | undefined,
  folder: string
) => {
  if (file) {
    const buffer = file.buffer;
    const result = await uploadCloudinary(buffer, folder, file.originalname);
    return result.secure_url;
  } else if (base64String) {
    const buffer = Buffer.from(base64String.split(",")[1], "base64");
    const result = await uploadCloudinary(buffer, folder, "image.png");
    return result.secure_url;
  }
  return undefined;
};
