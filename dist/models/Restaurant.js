"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const RestaurantSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    uniqueUrl: { type: String, required: true, unique: true },
    vocher: [{ type: String, default: null }],
    profile: {
        address: { type: String, default: null },
        description: { type: String, default: null },
        logoUrl: { type: String, default: null },
        banner: { type: String, default: null },
        pitch: { type: String, default: null },
        certi: [{ type: String, default: null }],
    },
    products: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Product", default: [] }],
    ownerAuthId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Auth", required: true },
    chairId: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Chair", default: [] }],
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("Restaurant", RestaurantSchema);
