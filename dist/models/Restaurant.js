"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const RestaurantSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    uniqueUrl: { type: String, required: true, unique: true },
    profile: {
        address: String,
        description: String,
        logoUrl: String,
    },
    products: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Product", default: [] }],
    ownerAuthId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Auth", required: true },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("Restaurant", RestaurantSchema);
