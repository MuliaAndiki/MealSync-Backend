import { Request, Response } from "express";
import midtransClient from "midtrans-client";
import Cart from "../models/Cart";
import Order from "../models/Order";
import Product from "../models/Product";
import Restaurant from "../models/Restaurant";
import { JwtPayload } from "../types/auth.types";

class PaymentController {
  // POST /api/user/checkout
  public checkout = async (req: Request, res: Response) => {
    try {
      const user = req.user as JwtPayload;
      const cart = await Cart.findOne({ userId: user._id });
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ status: 400, message: "Cart is empty" });
      }
      const firstProduct = await Product.findById(cart.items[0].productId);
      if (!firstProduct)
        return res
          .status(400)
          .json({ status: 400, message: "Invalid cart items" });
      const restaurantId = firstProduct.restaurantId;

      const itemsDetail = [] as any[];
      let total = 0;
      for (const it of cart.items) {
        const p = await Product.findById(it.productId);
        if (!p) continue;
        itemsDetail.push({
          id: p._id.toString(),
          price: p.price,
          quantity: it.quantity,
          name: p.name,
        });
        total += p.price * it.quantity;
      }

      const order = await Order.create({
        userId: user._id,
        restaurantId,
        items: itemsDetail.map((i) => ({
          productId: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
        total,
        status: "pending",
      });

      const snap = new (midtransClient as any).Snap({
        isProduction: false,
        serverKey: process.env.MIDTRANS_SERVER_KEY,
        clientKey: process.env.MIDTRANS_CLIENT_KEY,
      });

      const transaction = await snap.createTransaction({
        transaction_details: {
          // order_id: order._id.toString(),
          gross_amount: total,
        },
        item_details: itemsDetail,
        customer_details: {
          first_name: user.fullName,
          email: user.email,
          // phone: user.phone,
        },
      });

      order.snapToken = transaction.token;
      await order.save();

      // clear cart after creating transaction
      cart.items = [];
      cart.total = 0;
      await cart.save();

      return res.status(200).json({
        status: 200,
        message: "Checkout created",
        data: {
          orderId: order._id,
          snapToken: transaction.token,
          redirect_url: transaction.redirect_url,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ status: 500, message: err.message });
    }
  };
}

export default new PaymentController();
