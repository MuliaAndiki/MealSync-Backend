import multer, { FileFilterCallback } from "multer";
import path from "path";
import { Request } from "express";

const storage = multer.memoryStorage();

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowed = [".jpg", ".jpeg", ".png", ".webp", ".pdf", ".doc", ".docx"];
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("File Tidak Mendukung!"));
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});

export const uploadImages = upload.fields([
  { name: "fotoProfile", maxCount: 1 },
]);

export default upload;
