"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const CartSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Auth",
        required: true,
        unique: true,
    },
    items: [
        {
            productId: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: "Product",
                required: true,
            },
            quantity: { type: Number, required: true, min: 1 },
        },
    ],
    total: { type: Number, required: true, default: 0 },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("Cart", CartSchema);
