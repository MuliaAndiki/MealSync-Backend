import { Schema, model } from "mongoose";
import { IProduct } from "../types/product.types";

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String },
    pictProduct: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["makanan", "minuman"],
      required: true,
    },
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
  },
  { timestamps: true }
);

export default model<IProduct>("Product", ProductSchema);
