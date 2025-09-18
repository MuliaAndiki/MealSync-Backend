"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImages = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const storage = multer_1.default.memoryStorage();
const fileFilter = (req, file, cb) => {
    const ext = path_1.default.extname(file.originalname).toLowerCase();
    const allowed = [".jpg", ".jpeg", ".png", ".webp", ".pdf", ".doc", ".docx"];
    if (allowed.includes(ext)) {
        cb(null, true);
    }
    else {
        cb(new Error("File Tidak Mendukung!"));
    }
};
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024,
    },
});
exports.uploadImages = upload.fields([
    { name: "fotoProfile", maxCount: 1 },
]);
exports.default = upload;
