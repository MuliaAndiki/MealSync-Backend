import { Request, Response } from "express";
import Product from "../models/Product";
import Restaurant from "../models/Restaurant";
import Order from "../models/Order";
import Chair from "../models/Chair";
import { JwtPayload } from "../types/auth.types";
import { verifyToken } from "../middlewares/auth";
import { CreateProduct } from "../types/product.types";
import mongoose from "mongoose";
import { CreateChair } from "../types/chair.types";

class RestaurantController {
  // POST /api/restaurant/products
  public createProduct = [
    verifyToken,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const prodouct: CreateProduct = req.body;
        const user = req.user as JwtPayload;
        const restaurant = await Restaurant.findOne({
          ownerAuthId: new mongoose.Types.ObjectId(user._id),
        });
        if (!restaurant) {
          res.status(404).json({
            status: 404,
            message: "Restaurant Not Found",
          });
          return;
        }
        if (!prodouct.name || prodouct.price == null) {
          res.status(404).json({
            status: 404,
            message: "name and price are required",
          });
          return;
        }
        const newProdouct = await Product.create({
          name: prodouct.name,
          price: prodouct.price,
          description: prodouct.description,
          restaurantId: restaurant._id,
        });
        restaurant.products.push(newProdouct._id);
        await newProdouct.save();

        res.status(201).json({
          status: 201,
          message: "Succesfully Create Product",
          data: newProdouct,
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

  // PUT /api/restaurant/products/:id
  public updateProduct = [
    verifyToken,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const user = req.user as JwtPayload;
        const restaurant = await Restaurant.findOne({ ownerAuthId: user._id });
        if (!restaurant) {
          res.status(404).json({
            status: 404,
            message: "Restaurant",
          });
          return;
        }
        const product = await Product.findOneAndUpdate(
          { _id: req.params._id, restaurantId: restaurant._id },
          req.body,
          { new: true }
        );

        if (!product) {
          res.status(404).json({
            status: 404,
            message: "Product Not Found",
          });
          return;
        }

        res.status(200).json({
          status: 200,
          message: "Succesfully Update Product",
          data: product,
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

  // GET /api/restaurant/products
  public getProduct = [
    verifyToken,
    async (req: Request, res: Response): Promise<any> => {
      try {
        const user = req.user as JwtPayload;

        const restaurant = await Restaurant.findOne({ ownerAuthId: user._id });
        if (!restaurant) {
          res.status(404).json({
            status: 404,
            message: "Restaurant Not Found",
          });
          return;
        }

        const product = await Product.find({ restaurantId: restaurant._id });
        res.status(200).json({
          status: 200,
          message: "Successfully Get Products",
          data: product,
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

  // DELETE /api/restaurant/products/:id
  public deleteProduct = [
    verifyToken,
    async (req: Request, res: Response): Promise<any> => {
      try {
        const user = req.user as JwtPayload;
        const restaurant = await Restaurant.findOne({ ownerAuthId: user._id });
        if (!restaurant) {
          res.status(404).json({
            status: 404,
            message: "Restaurant NotFound",
          });
          return;
        }
        const product = await Product.findByIdAndDelete({
          _id: req.params._id,
          restaurantId: restaurant._id,
        });
        if (!product) {
          res.status(404).json({
            status: 404,
            message: "Product Not Found",
          });
          return;
        }
        restaurant.products = restaurant.products.filter(
          (p) => p.toString() !== req.params._id
        );
        await restaurant.save();
        res.status(200).json({
          status: 200,
          message: "Succes Product deleted",
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

  // GET /api/restaurant/orders

  public listOrders = [
    verifyToken,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const user = req.user as JwtPayload;
        const restaurant = await Restaurant.findOne({ ownerAuthId: user._id });
        if (!restaurant) {
          res.status(404).json({
            status: 404,
            message: "Restaurant NotFound",
          });
          return;
        }
        const orders = await Order.find({ restaurantId: restaurant._id }).sort({
          createdAt: -1,
        });
        if (!orders) {
          res.status(404).json({
            status: 404,
            message: "Orders Not Found",
          });
          return;
        }
        res.status(200).json({
          status: 200,
          message: "Successfully Orders fetched",
          data: orders,
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

  // GET /api/restaurant/orders/history
  public ordersHistory = [
    verifyToken,
    async (req: Request, res: Response): Promise<any> => {
      try {
        const user = req.user as JwtPayload;
        const restaurant = await Restaurant.findOne({ ownerAuthId: user._id });
        if (!restaurant) {
          res.status(404).json({
            status: 404,
            message: "Restaurant NotFound",
          });
          return;
        }
        const orders = await Order.find({
          restaurantId: restaurant._id,
          status: { $in: ["paid", "failed"] },
        }).sort({ createdAt: -1 });

        if (!orders) {
          res.status(404).json({
            status: 404,
            message: "Orders NotFound",
          });
          return;
        }
        res.status(200).json({
          status: 200,
          message: "Succesfully Orders history fetched",
          data: orders,
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

  // PUT /api/restaurant/profile

  public updateProfile = [
    verifyToken,
    async (req: Request, res: Response): Promise<any> => {
      try {
        const user = req.user as JwtPayload;
        const restaurant = await Restaurant.findOneAndUpdate(
          { ownerAuthId: user._id },
          { $set: req.body },
          { new: true }
        );

        if (!restaurant) {
          res.status(404).json({
            status: 404,
            message: "Restaurant NotFound",
          });
          return;
        }
        res.status(200).json({
          status: 200,
          message: "Succesfully Profile updated",
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

  // POST /api/restaurant/chair/:_id
  public createChair = async (req: Request, res: Response): Promise<void> => {
    try {
      const { restaurantId } = req.params;
      const { noChair, status } = req.body;

      // Pastikan restoran ada
      const restaurant = await Restaurant.findById(restaurantId);
      if (!restaurant) {
        res.status(404).json({ message: "Restaurant not found" });
        return;
      }

      // Buat kursi baru
      const chair = new Chair({
        noChair,
        status,
        restaurantId,
      });
      await chair.save();

      await Restaurant.findByIdAndUpdate(restaurantId, {
        $push: { chairId: chair._id },
      });

      res.status(201).json(chair);
    } catch (error) {
      res.status(500).json({ message: "Failed to create chair", error });
    }
  };

  // GET /api/restaurant/chair
  public getChairs = [
    verifyToken,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const user = req.user as JwtPayload;

        const restaurant = await Restaurant.findOne({
          ownerAuthId: new mongoose.Types.ObjectId(user._id),
        });

        if (!restaurant) {
          res
            .status(404)
            .json({ status: 404, message: "Restaurant Not Found" });
          return;
        }

        const chairs = await Chair.find({ restaurantId: restaurant._id });

        res.status(200).json({
          status: 200,
          message: "Successfully Get Chairs",
          data: chairs,
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

  // PUT /api/restaurant/chair/:id
  public updateChair = [
    verifyToken,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const user = req.user as JwtPayload;

        const restaurant = await Restaurant.findOne({
          ownerAuthId: new mongoose.Types.ObjectId(user._id),
        });

        if (!restaurant) {
          res
            .status(404)
            .json({ status: 404, message: "Restaurant Not Found" });
          return;
        }

        const chair = await Chair.findOneAndUpdate(
          { _id: req.params.id, restaurantId: restaurant._id },
          req.body,
          { new: true }
        );

        if (!chair) {
          res.status(404).json({ status: 404, message: "Chair Not Found" });
          return;
        }

        res.status(200).json({
          status: 200,
          message: "Successfully Update Chair",
          data: chair,
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

  // DELETE /api/restaurant/chair/:id
  public deleteChair = [
    verifyToken,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const user = req.user as JwtPayload;

        const restaurant = await Restaurant.findOne({
          ownerAuthId: new mongoose.Types.ObjectId(user._id),
        });

        if (!restaurant) {
          res
            .status(404)
            .json({ status: 404, message: "Restaurant Not Found" });
          return;
        }

        const chair = await Chair.findOneAndDelete({
          _id: req.params.id,
          restaurantId: restaurant._id,
        });

        if (!chair) {
          res.status(404).json({ status: 404, message: "Chair Not Found" });
          return;
        }

        await Restaurant.findByIdAndUpdate(restaurant._id, {
          $pull: { chairId: req.params.id },
        });

        res.status(200).json({
          status: 200,
          message: "Successfully Delete Chair",
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

export default new RestaurantController();
