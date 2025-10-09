import { Document, Types } from "mongoose";
export interface IProduct extends Document {
  _id: any;
  name: string;
  pictProduct: string;
  price: number;
  description?: string;
  category: string;
  restaurantId: Types.ObjectId;
}

export type CreateProduct = Pick<
  IProduct,
  "name" | "price" | "description" | "category" | "pictProduct"
>;
