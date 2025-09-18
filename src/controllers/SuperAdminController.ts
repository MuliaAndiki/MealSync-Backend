import { Request, Response } from "express";
import Auth from "../models/Auth";
import Restaurant from "../models/Restaurant";
import bcrypt from "bcryptjs";
import { created, ok, badRequest, notFound } from "../utils/response";
import { CreateRestaurantBody } from "../types/restaurant.types";
import { verifyToken } from "../middlewares/auth";

class SuperAdminController {
  // POST /api/superadmin/restaurant

  public createRestaurant = [
    verifyToken,
    async (req: Request, res: Response): Promise<any> => {
      try {
        const { name, email, password, uniqueUrl, profile } =
          req.body as CreateRestaurantBody;
        if (!name || !email || !password || !uniqueUrl) {
          res.status(400).json({
            status: 400,
            message: "Body Invalid",
          });
          return;
        }

        const existingUser = await Auth.findOne({ email });
        const existingRest = await Restaurant.findOne({
          $or: [{ email }, { uniqueUrl }],
        });
        if (existingUser || existingRest) {
          return res.status(400).json({
            status: 400,
            message: "Email or URL already used",
          });
        }
        const hash = await bcrypt.hash(password, 10);
        const user = await Auth.create({
          email,
          fullName: name,
          password: hash,
          role: "restaurant",
        });
        const restaurant = await Restaurant.create({
          name,
          email,
          uniqueUrl,
          profile,
          products: [],
          ownerAuthId: user._id,
        });
        const newRestaurant = restaurant;
        res.status(201).json({
          status: 201,
          message: "Succesfully Create Restaurant",
          data: newRestaurant,
        });
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

  // GET /api/superadmin/restaurants
  // Fix
  public listRestaurants = async (_req: Request, res: Response) => {
    try {
      const restaurants = await Restaurant.find().populate("products");
      return res.status(200).json(ok("Restaurants fetched", restaurants));
    } catch (err: any) {
      return res.status(500).json({ status: 500, message: err.message });
    }
  };
}

export default new SuperAdminController();
