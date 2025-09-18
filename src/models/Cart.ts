import { Schema, model } from "mongoose";
import { ICart } from "../types/cart.type";

const CartSchema = new Schema<ICart>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
      unique: true,
    },
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    total: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

export default model<ICart>("Cart", CartSchema);
