import mongoose, { Document, Schema } from "mongoose";
import { IAuth } from "../types/auth.types";

type partialAuth = Partial<IAuth>;

const Auth = new Schema<partialAuth>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    fullName: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
      match: [
        /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
        "Password must be at least 8 characters, include an uppercase letter, a number, and a special character.",
      ],
    },
    token: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ["superadmin", "restaurant", "user"],
      default: "user",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Auth", Auth);
