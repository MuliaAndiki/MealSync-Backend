import { Document } from "mongoose";

export interface IAuth extends Document {
  _id: any;
  email: string;
  fullName: string;
  password: string;
  token: string;
  role: UserRole;
  createdAt: Date;
  updateAt: Date;
  otp: string;
  expOtp: Date;
  isVerify: Boolean;
  __v: any;
}

export type JwtPayload = Pick<IAuth, "_id" | "email" | "fullName" | "role">;
export type PickRegister = Pick<
  IAuth,
  "email" | "fullName" | "password" | "role"
>;
export type PickLogin = Pick<IAuth, "email" | "password">;
export type PickLogout = Pick<IAuth, "_id">;

export type UserRole = "superadmin" | "restaurant" | "user";
export type PickForgotPasswordByEmail = Pick<IAuth, "email">;
export type PickId = Pick<IAuth, "_id">;
export type PickVerifyOtp = Pick<IAuth, "email" | "otp">;
export type PickResetPassword = Pick<IAuth, "email" | "password">;
