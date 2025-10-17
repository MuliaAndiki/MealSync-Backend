"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const OrderSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Auth", required: true },
    restaurantId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Restaurant",
        required: true,
    },
    items: [
        {
            productId: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: "Product",
                required: true,
            },
            name: { type: String, required: true },
            price: { type: Number, required: true },
            quantity: { type: Number, required: true, min: 1 },
        },
    ],
    total: { type: Number, required: true },
    status: {
        type: String,
        enum: ["pending", "paid", "failed", "completed", "cancelled"],
        default: "pending",
    },
    snapToken: { type: String },
    chairNo: { type: Number },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("Order", OrderSchema);
