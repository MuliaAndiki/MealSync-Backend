import { Schema, model } from "mongoose";
import { IRestaurant } from "../types/restaurant.types";

const RestaurantSchema = new Schema<IRestaurant>(
  {
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
    products: [{ type: Schema.Types.ObjectId, ref: "Product", default: [] }],
    ownerAuthId: { type: Schema.Types.ObjectId, ref: "Auth", required: true },
    chairId: [{ type: Schema.Types.ObjectId, ref: "Chair", default: [] }],
  },
  { timestamps: true }
);

export default model<IRestaurant>("Restaurant", RestaurantSchema);
