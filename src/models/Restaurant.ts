import { Schema, model } from "mongoose";
import { IRestaurant } from "../types/restaurant.types";

const RestaurantSchema = new Schema<IRestaurant>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    uniqueUrl: { type: String, required: true, unique: true },
    profile: {
      address: String,
      description: String,
      logoUrl: String,
    },
    products: [{ type: Schema.Types.ObjectId, ref: "Product", default: [] }],
    ownerAuthId: { type: Schema.Types.ObjectId, ref: "Auth", required: true },
    chairId: [{ type: Schema.Types.ObjectId, ref: "Chair", require: [] }],
  },
  { timestamps: true }
);

export default model<IRestaurant>("Restaurant", RestaurantSchema);
