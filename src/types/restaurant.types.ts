import { Types, Document } from "mongoose";
export interface IRestaurant extends Document {
  _id: any;
  name: string;
  email: string;
  uniqueUrl: string;
  password?: string;
  vocher: string;
  profile?: {
    address?: string;
    description?: string;
    logoUrl?: string;
    banner?: string;
    pitch?: string;
  };
  products: Types.ObjectId[];
  ownerAuthId: Types.ObjectId;
  chairId: Types.ObjectId[];
}

export type PickRestaurantPayload = Pick<
  IRestaurant,
  "_id" | "name" | "email" | "uniqueUrl" | "profile"
>;
