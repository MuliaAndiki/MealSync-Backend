import { Request, Response } from "express";
import Product from "../models/Product";
import Restaurant from "../models/Restaurant";
import Order from "../models/Order";
import { created, ok, badRequest, notFound } from "../utils/response";
import { JwtPayload } from "../types/auth.types";
import { verifyToken } from "../middlewares/auth";
import { CreateProduct } from "../types/product.types";
import mongoose from "mongoose";

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
  // public createProduct = async (req: Request, res: Response) => {
  //   try {
  //     const { name, price, description } = req.body as any;
  //     const user = req.user as JwtPayload;
  //     const restaurant = await Restaurant.findOne({ ownerAuthId: user._id });
  //     if (!restaurant)
  //       return res.status(404).json(notFound("Restaurant not found"));
  //     if (!name || price == null)
  //       return res.status(400).json(badRequest("name and price are required"));
  //     const product = await Product.create({
  //       name,
  //       price,
  //       description,
  //       restaurantId: restaurant._id,
  //     });
  //     // fix
  //     // restaurant.products.push(product._id);
  //     await restaurant.save();
  //     return res.status(201).json(created("Product created", product));
  //   } catch (err: any) {
  //     return res.status(500).json({ status: 500, message: err.message });
  //   }
  // };

  // PUT /api/restaurant/products/:id
  // Fix
  public updateProduct = async (req: Request, res: Response) => {
    try {
      const user = req.user as JwtPayload;
      const restaurant = await Restaurant.findOne({ ownerAuthId: user._id });
      if (!restaurant)
        return res.status(404).json(notFound("Restaurant not found"));
      const product = await Product.findOneAndUpdate(
        { _id: req.params.id, restaurantId: restaurant._id },
        req.body,
        { new: true }
      );
      if (!product) return res.status(404).json(notFound("Product not found"));
      return res.status(200).json(ok("Product updated", product));
    } catch (err: any) {
      return res.status(500).json({ status: 500, message: err.message });
    }
  };

  // DELETE /api/restaurant/products/:id
  // Fix
  public deleteProduct = async (req: Request, res: Response) => {
    try {
      const user = req.user as JwtPayload;
      const restaurant = await Restaurant.findOne({ ownerAuthId: user._id });
      if (!restaurant)
        return res.status(404).json(notFound("Restaurant not found"));
      const product = await Product.findOneAndDelete({
        _id: req.params.id,
        restaurantId: restaurant._id,
      });
      if (!product) return res.status(404).json(notFound("Product not found"));
      restaurant.products = restaurant.products.filter(
        (p) => p.toString() !== req.params.id
      );
      await restaurant.save();
      return res.status(200).json(ok("Product deleted", product));
    } catch (err: any) {
      return res.status(500).json({ status: 500, message: err.message });
    }
  };

  // GET /api/restaurant/orders
  // Fix
  public listOrders = async (req: Request, res: Response) => {
    try {
      const user = req.user as JwtPayload;
      const restaurant = await Restaurant.findOne({ ownerAuthId: user._id });
      if (!restaurant)
        return res.status(404).json(notFound("Restaurant not found"));
      const orders = await Order.find({ restaurantId: restaurant._id }).sort({
        createdAt: -1,
      });
      return res.status(200).json(ok("Orders fetched", orders));
    } catch (err: any) {
      return res.status(500).json({ status: 500, message: err.message });
    }
  };

  // GET /api/restaurant/orders/history
  // Fix
  public ordersHistory = async (req: Request, res: Response) => {
    try {
      const user = req.user as JwtPayload;
      const restaurant = await Restaurant.findOne({ ownerAuthId: user._id });
      if (!restaurant)
        return res.status(404).json(notFound("Restaurant not found"));
      const orders = await Order.find({
        restaurantId: restaurant._id,
        status: { $in: ["paid", "failed"] },
      }).sort({ createdAt: -1 });
      return res.status(200).json(ok("Orders history fetched", orders));
    } catch (err: any) {
      return res.status(500).json({ status: 500, message: err.message });
    }
  };

  // PUT /api/restaurant/profile
  // Fix
  public updateProfile = async (req: Request, res: Response) => {
    try {
      const user = req.user as JwtPayload;
      const restaurant = await Restaurant.findOneAndUpdate(
        { ownerAuthId: user._id },
        { $set: { profile: req.body } },
        { new: true }
      );
      if (!restaurant)
        return res.status(404).json(notFound("Restaurant not found"));
      return res.status(200).json(ok("Profile updated", restaurant));
    } catch (err: any) {
      return res.status(500).json({ status: 500, message: err.message });
    }
  };
}

export default new RestaurantController();
