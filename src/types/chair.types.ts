import { Document, Types } from "mongoose";

export interface IChair extends Document {
  _id: any;
  noChair: number;
  status: string;
  restaurantId: Types.ObjectId;
}

export type CreateChair = Pick<IChair, "noChair" | "status">;
