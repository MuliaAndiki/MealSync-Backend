import { Request, Response } from "express";
import Auth from "../models/Auth";
import Restaurant from "../models/Restaurant";
import bcrypt from "bcryptjs";
import { verifyToken } from "../middlewares/auth";
import { requireRole } from "../middlewares/auth";
import { uploadCloudinary } from "../utils/uploadsClodinary";
import { uploadImages } from "../middlewares/multer";
import { generateUniqueRestaurantUrl } from "../utils/slug";

class SuperAdminController {
  // POST /api/superadmin/restaurant
  public createRestaurant = [
    verifyToken,
    uploadImages,
    requireRole(["superadmin"]),
    async (req: Request, res: Response): Promise<any> => {
      try {
        const { name, email, password, profile } = req.body;

        if (!name || !email || !password) {
          return res.status(400).json({
            message:
              "Body Invalid. Mohon isi semua field wajib (name, email, password).",
          });
        }

        const uniqueUrl = await generateUniqueRestaurantUrl(name);

        let documentUrl: { logoUrl: string; banner: string; pitch: string } = {
          logoUrl: "",
          banner: "",
          pitch: "",
        };

        if (req.files && (req.files as any).logoRestaurant?.[0]) {
          const file = (req.files as any).logoRestaurant[0];
          const buffer = file.buffer;

          const result = await uploadCloudinary(
            buffer,
            "logoRestaurant",
            file.originalname
          );
          documentUrl.logoUrl = result.secure_url;
        } else if (req.body.logoRestaurant) {
          const base64Data = req.body.logoRestaurant;
          const buffer = Buffer.from(base64Data.split(",")[1], "base64");

          const result = await uploadCloudinary(
            buffer,
            "logoRestaurant",
            "image.png"
          );
          documentUrl.logoUrl = result.secure_url;
        }

        if (req.files && (req.files as any).bannerRestaurant?.[0]) {
          const file = (req.files as any).bannerRestaurant[0];
          const buffer = file.buffer;

          const result = await uploadCloudinary(
            buffer,
            "bannerRestaurant",
            file.originalname
          );
          documentUrl.banner = result.secure_url;
        } else if (req.body.bannerRestaurant) {
          const base64Data = req.body.bannerRestaurant;
          const buffer = Buffer.from(base64Data.split(",")[1], "base64");

          const result = await uploadCloudinary(
            buffer,
            "bannerRestaurant",
            "image.png"
          );
          documentUrl.banner = result.secure_url;
        }

        if (req.files && (req.files as any).pitchRestaurant?.[0]) {
          const file = (req.files as any).pitchRestaurant[0];
          const buffer = file.buffer;

          const result = await uploadCloudinary(
            buffer,
            "pitchRestaurant",
            file.originalname
          );
          documentUrl.pitch = result.secure_url;
        } else if (req.body.pitchRestaurant) {
          const base64Data = req.body.pitchRestaurant;
          const buffer = Buffer.from(base64Data.split(",")[1], "base64");

          const result = await uploadCloudinary(
            buffer,
            "pitchRestaurant",
            "image.png"
          );
          documentUrl.pitch = result.secure_url;
        }

        const hash = await bcrypt.hash(password, 10);
        const restaurantAuth = await Auth.create({
          email,
          fullName: name,
          password: hash,
          role: "restaurant",
        });

        const finalProfile = {
          ...profile,
          logoUrl: documentUrl.logoUrl || profile?.logoUrl || "",
          banner: documentUrl.banner || profile?.banner || "",
          pitch: documentUrl.pitch || profile.pitch || "",
        };

        const restaurant = await Restaurant.create({
          name,
          email,
          uniqueUrl,
          profile: finalProfile,
          products: [],
          chairId: [],
          ownerAuthId: restaurantAuth._id,
          createdBy: req.user?._id,
        });

        res.status(201).json({
          message: "Restaurant created successfully",
          data: {
            restaurant,
            account: {
              email: restaurantAuth.email,
              password,
              role: restaurantAuth.role,
            },
          },
        });
      } catch (error) {
        res.status(500).json({
          status: 500,
          message: "Server Internal Error",
          error: error instanceof Error ? error.message : error,
        });
      }
    },
  ];

  // GET /api/superadmin/restaurants
  public listRestaurants = [
    verifyToken,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const restaurant = await Restaurant.find().populate("products");
        res.status(200).json({
          status: 200,
          message: "Succesfuly Restaurants fetched ",
          data: restaurant,
        });
      } catch (error) {
        res.status(500).json({
          status: 500,
          message: "Server Internal Error",
          error: error instanceof Error ? error.message : error,
        });
      }
    },
  ];
}

export default new SuperAdminController();
