"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUniqueRestaurantUrl = exports.createSlug = void 0;
const Restaurant_1 = __importDefault(require("../models/Restaurant"));
const createSlug = (name) => {
    const random = Math.floor(Math.random() * 1000);
    return name.toLowerCase().trim().replace(/\s+/g, "-") + "-" + random;
};
exports.createSlug = createSlug;
const generateUniqueRestaurantUrl = async (name) => {
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
        const existing = await Restaurant_1.default.findOne({ uniqueUrl });
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
exports.generateUniqueRestaurantUrl = generateUniqueRestaurantUrl;
