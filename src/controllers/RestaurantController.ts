import { Request, Response } from "express";
import Product from "../models/Product";
import Restaurant from "../models/Restaurant";
import Order from "../models/Order";
import Chair from "../models/Chair";
import { JwtPayload } from "../types/auth.types";
import { requireRole, verifyToken } from "../middlewares/auth";
import { CreateProduct } from "../types/product.types";
import mongoose from "mongoose";
import { uploadImages } from "../middlewares/multer";
import { uploadCloudinary } from "../utils/uploadsClodinary";

class RestaurantController {
  // POST /api/restaurant/products
  public createProduct = [
    verifyToken,
    uploadImages,
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
            message: "name and price and category are required",
          });
          return;
        }

        // Ilmu
        let documentUrl: { pictProduct: string } = { pictProduct: "" };
        const base64Data = req.body.pictProduct;
        if (base64Data) {
          const buffer = Buffer.from(base64Data.split(",")[1], "base64");
          const result = await uploadCloudinary(
            buffer,
            "pictProduct",
            "image.png"
          );
          documentUrl.pictProduct = result.secure_url;
        }
        const newProdouct = await Product.create({
          name: prodouct.name,
          price: prodouct.price,
          category: prodouct.category,
          description: prodouct.description,
          restaurantId: restaurant._id,
          pictProduct: documentUrl.pictProduct,
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
            message: "Restaurant Not Found",
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

  // Get /api/restaurant/products/:_id
  public getProductId = [
    verifyToken,
    requireRole(["restaurant"]),
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
        const prodouct = await Product.findById(req.params._id);
        if (!prodouct) {
          res.status(404).json({
            status: 404,
            message: "product id not found",
          });
          return;
        }

        res.status(200).json({
          status: 200,
          message: "Succesfilly Get Product By Id",
          data: prodouct,
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
  public createChair = [
    verifyToken,

    async (req: Request, res: Response): Promise<void> => {
      try {
        const { noChair, status } = req.body;
        const userId = req.user?._id;

        const restaurant = await Restaurant.findOne({ ownerAuthId: userId });
        if (!restaurant) {
          res
            .status(404)
            .json({ message: "Restaurant untuk user ini tidak ditemukan" });
          return;
        }

        const existingChair = await Chair.findOne({
          restaurantId: restaurant._id,
          noChair,
        });
        if (existingChair) {
          res.status(409).json({
            message: `Kursi nomor ${noChair} sudah terdaftar di restoran ini`,
          });
          return;
        }

        const newChair = new Chair({
          noChair,
          status: status || "empty",
          restaurantId: restaurant._id,
        });

        await newChair.save();
        await restaurant.save();

        res.status(201).json({
          status: 201,
          message: "Success Create Chair",
          data: newChair,
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
