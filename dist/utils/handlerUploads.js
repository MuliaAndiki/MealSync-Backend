"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUpload = void 0;
const uploadsClodinary_1 = require("./uploadsClodinary");
const handleUpload = async (file, base64String, folder) => {
    if (file) {
        const buffer = file.buffer;
        const result = await (0, uploadsClodinary_1.uploadCloudinary)(buffer, folder, file.originalname);
        return result.secure_url;
    }
    else if (base64String) {
        const buffer = Buffer.from(base64String.split(",")[1], "base64");
        const result = await (0, uploadsClodinary_1.uploadCloudinary)(buffer, folder, "image.png");
        return result.secure_url;
    }
    return undefined;
};
exports.handleUpload = handleUpload;
