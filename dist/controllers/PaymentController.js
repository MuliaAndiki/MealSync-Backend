"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const midtrans_client_1 = __importDefault(require("midtrans-client"));
const Cart_1 = __importDefault(require("../models/Cart"));
const Order_1 = __importDefault(require("../models/Order"));
const Product_1 = __importDefault(require("../models/Product"));
class PaymentController {
    constructor() {
        // POST /api/user/checkout
        this.checkout = async (req, res) => {
            try {
                const user = req.user;
                const cart = await Cart_1.default.findOne({ userId: user._id });
                if (!cart || cart.items.length === 0) {
                    return res.status(400).json({ status: 400, message: "Cart is empty" });
                }
                // assume cart items are from single restaurant (simplification)
                const firstProduct = await Product_1.default.findById(cart.items[0].productId);
                if (!firstProduct)
                    return res
                        .status(400)
                        .json({ status: 400, message: "Invalid cart items" });
                const restaurantId = firstProduct.restaurantId;
                const itemsDetail = [];
                let total = 0;
                for (const it of cart.items) {
                    const p = await Product_1.default.findById(it.productId);
                    if (!p)
                        continue;
                    itemsDetail.push({
                        id: p._id.toString(),
                        price: p.price,
                        quantity: it.quantity,
                        name: p.name,
                    });
                    total += p.price * it.quantity;
                }
                const order = await Order_1.default.create({
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
                const snap = new midtrans_client_1.default.Snap({
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
            }
            catch (err) {
                return res.status(500).json({ status: 500, message: err.message });
            }
        };
    }
}
exports.default = new PaymentController();
