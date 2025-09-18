import { Request, Response } from "express";
import Cart from "../models/Cart";
import Product from "../models/Product";
import Order from "../models/Order";
import { JwtPayload } from "../types/auth.types";
import { verifyToken } from "../middlewares/auth";

class UserController {
  // POST /api/user/cart
  public AddToCart = [
    verifyToken,
    async (req: Request, res: Response): Promise<any> => {
      try {
        const user = req.user as JwtPayload;
        const { productId, quantity } = req.body as any;

        if (!productId || !quantity) {
          res.status(400).json({
            status: 400,
            message: "productId and quantity are required",
          });
          return;
        }
        const product = await Product.findOne({ userId: user._id });
        if (!product) {
          res.status(404).json({
            status: 404,
            message: "Prodouct Not Found",
          });
          return;
        }
        let cart = await Cart.findOne({ userId: user._id });
        if (!cart)
          cart = await Cart.create({ userId: user._id, items: [], total: 0 });
        const existing = cart.items.find(
          (i) => i.productId.toString() === productId
        );
        if (existing) existing.quantity += quantity;
        else cart.items.push({ productId, quantity });
        cart.total = await this.calculateTotal(cart);
        await cart.save();
        res.status(201).json({
          status: 201,
          message: "Added to cart",
          data: cart,
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

  // PUT /api/user/cart/:id
  public updateCartItem = [
    verifyToken,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const user = req.user as JwtPayload;
        const { quantity } = req.body as any;
        let cart = await Cart.findOne({ userId: user._id });
        if (!cart) {
          res.status(404).json({
            status: 404,
            message: "Cart Not Found",
          });
          return;
        }
        const item = cart.items.find(
          (i) => i.productId.toString() === req.params._id
        );
        if (!item) {
          res.status(404).json({
            status: 404,
            message: "Items Not Found",
          });
          return;
        }
        item.quantity = quantity;
        cart.total = await this.calculateTotal(cart);
        await cart.save();
        res.status(200).json({
          status: 200,
          message: "Card Update",
          data: cart,
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

  // DELETE /api/user/cart/:id
  public deleteCartItem = [
    verifyToken,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const user = req.user as JwtPayload;
        let cart = await Cart.findOne({ userId: user._id });
        if (!cart) {
          res.status(404).json({
            status: 404,
            message: "Cart Not Found",
          });
          return;
        }
        cart.items = cart.items.filter(
          (i) => i.productId.toString() !== req.params._id
        );
        cart.total = await this.calculateTotal(cart);
        await cart.save();
        res.status(200).json({
          status: 200,
          message: "SuccesesFully Remove Items Card",
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

  // GET /api/user/orders/history
  public ordersHistory = [
    verifyToken,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const user = req.user as JwtPayload;
        const orders = await Order.find({
          userId: user._id,
          status: { $in: ["paid", "failed"] },
        }).sort({ createdAt: -1 });
        if (!orders) {
          res.status(404).json({
            status: 404,
            message: "Order Not Found",
          });
          return;
        }
        res.status(200).json({
          status: 200,
          message: "Succesfuly Get Order",
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

  // helper
  private async calculateTotal(cart: any): Promise<number> {
    let total = 0;
    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      if (product) total += product.price * item.quantity;
    }
    return total;
  }
}

export default new UserController();
