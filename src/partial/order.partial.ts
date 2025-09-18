import { Types } from "mongoose";
export type OrderStatus = "pending" | "paid" | "failed";

export interface IOrderItem {
  productId: Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
}
