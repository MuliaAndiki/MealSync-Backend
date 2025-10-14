import { Request, Response } from "express";
import Cart from "../models/Cart";
import Product from "../models/Product";
import Order from "../models/Order";
import { JwtPayload } from "../types/auth.types";
import { verifyToken, requireRole } from "../middlewares/auth";
import Restaurant from "../models/Restaurant";
import Chair from "../models/Chair";
import { getIO } from "../utils/socket";
import mongoose from "mongoose";

class UserController {
  // POST /api/user/cart
  public AddToCart = [
    verifyToken,
    async (req: Request, res: Response): Promise<any> => {
      try {
        const user = req.user as JwtPayload;
        const { quantity } = req.body;
        const { productId } = req.params;

        if (!productId || !quantity) {
          return res.status(400).json({
            status: 400,
            message: "productId (params) and quantity (body) are required",
          });
        }

        const product = await Product.findById(productId);
        if (!product) {
          return res.status(404).json({
            status: 404,
            message: "Product not found",
          });
        }

        let cart = await Cart.findOne({ userId: user._id });
        if (!cart)
          cart = await Cart.create({ userId: user._id, items: [], total: 0 });

        const existing = cart.items.find(
          (i) => i.productId.toString() === productId
        );

        if (existing) existing.quantity += quantity;
        else
          cart.items.push({
            productId: new mongoose.Types.ObjectId(productId),
            quantity,
          });

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

  // GET /api/user/cart
  public getCart = [
    verifyToken,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const user = req.user as JwtPayload;

        let cart = await Cart.findOne({ userId: user._id }).populate({
          path: "items.productId",
          select: "name description price pictProduct category",
        });

        if (!cart) {
          cart = await Cart.create({ userId: user._id, items: [], total: 0 });
        }

        let grandTotal = 0;

        const itemsWithSubtotal = cart.items.map((item: any) => {
          const product = item.productId;
          const quantity = item.quantity;
          const price = product?.price || 0;

          const subtotal = price * quantity;
          grandTotal += subtotal;

          return {
            _id: item._id,
            quantity,
            subtotal,
            product: {
              _id: product._id,
              name: product.name,
              description: product.description,
              price: product.price,
              pictProduct: product.pictProduct,
              category: product.category,
            },
          };
        });

        cart.total = grandTotal;
        await cart.save();

        res.status(200).json({
          status: 200,
          message: "Successfully Get Cart",
          data: {
            _id: cart._id,
            userId: cart.userId,
            items: itemsWithSubtotal,
            total: grandTotal,
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

  // DELETE /api/user/cart
  public deleteAllCartItem = [
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
        cart.items = [];
        cart.total = 0;
        await cart.save();
        res.status(200).json({
          status: 200,
          message: "SuccesesFully Remove All Items Card",
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

  // POST /api/user/order
  public createOrder = [
    verifyToken,
    requireRole(["user", "restaurant"]),
    async (req: Request, res: Response): Promise<void> => {
      try {
        const user = req.user as JwtPayload;
        const { uniqueUrl, items, chairNo } = req.body as any;

        if (
          !uniqueUrl ||
          !Array.isArray(items) ||
          items.length === 0 ||
          !chairNo
        ) {
          res.status(400).json({
            status: 400,
            message: "uniqueUrl, items[], and chairNo are required",
          });
          return;
        }

        const restaurant = await Restaurant.findOne({ uniqueUrl });
        if (!restaurant) {
          res.status(404).json({
            status: 404,
            message: "Invalid QR / restaurant not found",
          });
          return;
        }

        const chair = await Chair.findOne({
          restaurantId: restaurant._id,
          noChair: chairNo,
        });
        if (!chair) {
          res.status(404).json({ status: 404, message: "Chair not found" });
          return;
        }
        if (chair.status === "full") {
          res.status(409).json({
            status: 409,
            message: `Chair ${chairNo} is already taken`,
          });
          return;
        }

        const productIds = items.map((i: any) => i.productId);
        const products = await Product.find({
          _id: { $in: productIds },
          restaurantId: restaurant._id,
          isAvailable: true,
        });
        if (products.length !== items.length) {
          res.status(400).json({
            status: 400,
            message: "One or more products are invalid or unavailable",
          });
          return;
        }

        const orderItems = items.map((i: any) => {
          const p = products.find((pp) => pp._id.toString() === i.productId);
          return {
            productId: p!._id,
            name: p!.name,
            price: p!.price,
            quantity: i.quantity,
          };
        });
        const total = orderItems.reduce(
          (sum: number, it: any) => sum + it.price * it.quantity,
          0
        );

        const order = await Order.create({
          userId: user._id,
          restaurantId: restaurant._id,
          items: orderItems,
          total,
          status: "pending",
          chairNo,
        });

        await Cart.findOneAndUpdate(
          { userId: user._id },
          { items: [], total: 0 }
        );

        chair.status = "full";
        await chair.save();

        try {
          const io = getIO();
          io.to(restaurant._id.toString()).emit("order:new", { order });
          io.to(restaurant._id.toString()).emit("chair:update", {
            chairNo,
            status: "full",
          });
        } catch (_) {
          // do nothing
        }

        res
          .status(201)
          .json({ status: 201, message: "Order created", data: order });
      } catch (error) {
        res.status(500).json({
          status: 500,
          message: "Server Internal Error",
          error: error instanceof Error ? error.message : error,
        });
      }
    },
  ];

  // GET /api/user/orders
  public getOrdersUserRestaurant = [
    verifyToken,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const user = req.user as JwtPayload;
        const orders = await Order.find({
          userId: user._id,
          status: { $in: ["pending", "paid"] },
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
          message: "Succesfuly Get Orders",
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

  // GET /api/user/order/:id
  public getOrderById = [
    verifyToken,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const user = req.user as JwtPayload;
        const { orderId } = req.params;
        if (!orderId) {
          res.status(400).json({
            status: 400,
            message: "Order Id Tidak Ditemukan",
          });
          return;
        }
        const order = await Order.findOne({
          _id: orderId,
          userId: user._id,
        });
        if (!order) {
          res.status(404).json({
            status: 404,
            message: "Order Not Found",
          });
          return;
        }
        res.status(200).json({
          status: 200,
          message: "Succesfuly Get Order",
          data: order,
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

  // DELETE /api/user/order/cancel/:orderId
  public cancelOrder = [
    verifyToken,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const user = req.user as JwtPayload;
        const { orderId } = req.params;
        if (!orderId) {
          res.status(400).json({
            status: 400,
            message: "Order Id is Required",
          });
          return;
        }
        const order = await Order.findOne({
          _id: orderId,
          userId: user._id,
        });
        if (!order) {
          res.status(404).json({
            status: 404,
            message: "Order Not Found",
          });
          return;
        }
        if (order.status !== "pending") {
          res.status(409).json({
            status: 409,
            message: "Only Pending Order can be Canceled",
          });
          return;
        }
        order.status = "failed";
        await order.save();
        res.status(200).json({
          status: 200,
          message: "Succesfuly Cancel Order",
          data: order,
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
