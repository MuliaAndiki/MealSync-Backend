import { Request, Response } from "express";
import Auth from "../models/Auth";
import {
  IAuth,
  PickLogin,
  PickRegister,
  JwtPayload,
  PickLogout,
  PickId,
  PickForgotPasswordByEmail,
  PickVerifyOtp,
  PickResetPassword,
} from "../types/auth.types";
import { verifyToken } from "../middlewares/auth";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateOtp } from "../utils/otp-handler";
import { sendOTPEmail } from "../utils/mailer";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

class AuthController {
  public register = async (req: Request, res: Response): Promise<void> => {
    try {
      const auth: PickRegister = req.body;

      if (!auth.email || !auth.fullName || !auth.password) {
        res.status(400).json({
          status: 400,
          message: "All field is required",
        });
        return;
      }

      const isAlreadyRegistered: IAuth | null = await Auth.findOne({
        email: auth.email,
      });

      if (isAlreadyRegistered) {
        res.status(400).json({
          status: 400,
          message: "This email is already registered, try another email",
        });
        return;
      }
      const otp = generateOtp(6);
      const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

      bcryptjs.hash(auth.password, 10, async (err, hash): Promise<void> => {
        if (err) {
          res.status(500).json(err);
          return;
        }
        const newAuth = new Auth({
          email: auth.email,
          fullName: auth.fullName,
          password: hash,
          role: auth.role || "user",
          otp: otp,
          isVerify: false,
        });
        newAuth.expOtp = otpExpires;

        await newAuth.save();
        await sendOTPEmail(auth.email, otp);

        res.status(201).json({
          status: 200,
          data: newAuth,
          message: "account successfully registered",
        });

        return;
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: "Internal server error",
      });
      return;
    }
  };

  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const auth: PickLogin = req.body;

      if (!auth.email || !auth.password) {
        res.status(400).json({
          status: 400,
          message: "All field is required",
        });
        return;
      }

      const isAuthExist: IAuth | null = await Auth.findOne({
        email: auth.email,
      });
      if (!isAuthExist) {
        res.status(404).json({
          status: 404,
          message: "Account not found",
        });
        return;
      }

      const validateAuth = await bcryptjs.compare(
        auth.password,
        isAuthExist.password
      );

      if (!validateAuth) {
        res
          .status(400)
          .json({ status: 400, message: "Wrong email or password" });
        return;
      }

      const payload: JwtPayload = {
        _id: isAuthExist._id,
        email: isAuthExist.email,
        fullName: isAuthExist.fullName,
        role: (isAuthExist as any).role,
      };

      if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is not defined in environment variables");
        res.status(500).json({
          status: 500,
          message: "Server configuration error.",
        });
        return;
      }

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: "1d" },
        async (err, token): Promise<void> => {
          if (err) {
            res.status(500).json(err);
            return;
          }

          isAuthExist.set("token", token);
          await isAuthExist.save();
          res.status(200).json({
            status: 200,
            data: isAuthExist,
            message: "Login successfully",
          });

          return;
        }
      );
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: "Internal server error",
      });
      return;
    }
  };

  public logout = [
    verifyToken,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { _id }: PickLogout = req.user as JwtPayload;

        const auth: IAuth | null = await Auth.findById(_id);

        if (!auth) {
          res.status(404).json({
            status: 404,
            message: "Account not found",
          });
          return;
        }

        auth.set("token", null);
        await auth.save();

        res.status(200).json({
          status: 2000,
          message: "Account logut successfully",
        });

        return;
      } catch (error) {
        res.status(500).json({
          status: 500,
          message: "Internal server error",
        });
        return;
      }
    },
  ];
  public getProfileByUser = [
    verifyToken,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { _id }: PickId = req.user as JwtPayload;

        const auth: IAuth | null = await Auth.findById(_id);

        if (!auth) {
          res.status(400).json({
            status: 400,
            message: "Account not found",
          });
          return;
        }

        res.status(200).json({
          status: 200,
          message: "User Profile Found",
          data: auth,
        });
        return;
      } catch (error) {
        res.status(500).json({
          status: 500,
          message: "Server Internal Error",
          error: error instanceof Error ? error.message : error,
        });
        return;
      }
    },
  ];
  public forgotPasswordByEmail = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const auth: PickForgotPasswordByEmail = req.body;
      const user = await Auth.findOne({ email: auth.email });
      if (!user) {
        res.status(404).json({
          status: 404,
          message: "Server Internal Error",
        });
        return;
      }
      const otp = generateOtp(6);
      const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

      (user.otp = otp), (user.expOtp = otpExpires), await user.save();
      await sendOTPEmail(auth.email, otp);

      res.status(200).json({
        status: 200,
        message: "Otp Send",
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: "Server Internal Error",
        error: error instanceof Error ? error.message : error,
      });
      return;
    }
  };

  public verifyOtp = async (req: Request, res: Response): Promise<void> => {
    try {
      const auth: PickVerifyOtp = req.body;

      if (!auth.email) {
        res.status(404).json({
          status: 404,
          message: "Email Is Requared",
        });
        return;
      }
      const user = await Auth.findOne({ email: auth.email });

      if (!user) {
        res.status(404).json({
          status: 404,
          message: "Email Not Found",
        });
        return;
      }

      if (user.otp !== auth.otp) {
        res.status(400).json({
          status: 400,
          message: "Otp Failed",
        });
        return;
      }
      user.isVerify = true;
      user.otp = undefined;
      await user.save();
      res.status(201).json({
        status: 201,
        message: "Otp IsVerify",
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: "Server Internal Error",
        error: error instanceof Error ? error.message : error,
      });
    }
  };
  public resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const auth: PickResetPassword = req.body;
      if (!auth.email) {
        res.status(404).json({
          status: 404,
          message: "Email Body IsRequired",
        });
        return;
      }
      const user = await Auth.findOne({ email: auth.email });
      if (!user) {
        res.status(400).json({
          status: 404,
          message: "Email User Not Found",
        });
        return;
      }

      if (!user.isVerify) {
        res.status(403).json({
          status: 403,
          message: "Account Costumer Not Verify",
        });
        return;
      }
      const hash = await bcryptjs.hash(auth.password, 10);
      user.password = hash;
      (user.otp = undefined), (user.expOtp = undefined);
      await user.save();

      res.status(200).json({
        status: "200",
        message: "New Password Is Create",
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: "Server Internal Error",
        error: error instanceof Error ? error.message : error,
      });
    }
  };
}

export default new AuthController();
