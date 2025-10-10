import { OrderStatus, IOrderItem } from "../partial/order.partial";
import { Types, Document } from "mongoose";

export interface IOrder extends Document {
  userId: Types.ObjectId;
  restaurantId: Types.ObjectId;
  items: IOrderItem[];
  total: number;
  status: OrderStatus;
  snapToken?: string; // midtrans token
  chairNo?: number;
}
