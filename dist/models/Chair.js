"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ChairSchema = new mongoose_1.Schema({
    noChair: {
        type: Number,
        required: true,
    },
    restaurantId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Restaurant",
        required: true,
    },
    status: {
        type: String,
        enum: ["empty", "full"],
        default: "empty",
    },
}, {
    timestamps: true,
});
exports.default = (0, mongoose_1.model)("Chair", ChairSchema);
