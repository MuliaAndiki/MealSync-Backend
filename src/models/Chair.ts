import { Schema, model } from "mongoose";
import { IChair } from "../types/chair.types";

const ChairSchema = new Schema<IChair>(
  {
    noChair: { type: Number, required: true },
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    status: { type: String, enum: ["empty", "full"], default: "empty" },
  },
  { timestamps: true }
);

export default model<IChair>("Chair", ChairSchema);
