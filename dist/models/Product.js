"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ProductSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String },
    restaurantId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Restaurant",
        required: true,
    },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("Product", ProductSchema);
