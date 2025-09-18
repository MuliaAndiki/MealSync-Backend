import { Types, Document } from "mongoose";
export interface IRestaurant extends Document {
  _id: any;
  name: string;
  email: string;
  uniqueUrl: string;
  password?: string;
  profile?: {
    address?: string;
    description?: string;
    logoUrl?: string;
  };
  products: Types.ObjectId[];
  ownerAuthId: Types.ObjectId;
}

export type PickRestaurantPayload = Pick<
  IRestaurant,
  "_id" | "name" | "email" | "uniqueUrl" | "profile"
>;

//
export type CreateRestaurantBody = {
  name: string;
  email: string;
  uniqueUrl: string;
  profile?: {
    address?: string;
    description?: string;
    logoUrl?: string;
  };
  password: string;
};
