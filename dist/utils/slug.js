"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSlug = void 0;
const createSlug = (name) => {
    const random = Math.floor(Math.random() * 1000);
    return name.toLowerCase().trim().replace(/\s+/g, "-") + "-" + random;
};
exports.createSlug = createSlug;
