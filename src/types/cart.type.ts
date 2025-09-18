import { Document, Types } from "mongoose";
import { ICartItem } from "../partial/cart.partial";

export interface ICart extends Document {
  userId: Types.ObjectId;
  items: ICartItem[];
  total: number;
}
