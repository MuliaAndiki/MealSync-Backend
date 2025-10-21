"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const midtrans_client_1 = __importDefault(require("midtrans-client"));
const Order_1 = __importDefault(require("../models/Order"));
const auth_1 = require("../middlewares/auth");
class PaymentController {
    constructor() {
        // POST /api/user/payment
        this.payment = [
            auth_1.verifyToken,
            async (req, res) => {
                try {
                    const user = req.user;
                    const { orderId } = req.body;
                    if (!orderId) {
                        res.status(400).json({
                            status: 400,
                            message: "Order ID is required",
                        });
                        return;
                    }
                    const order = await Order_1.default.findOne({
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
                        res.status(400).json({
                            status: 400,
                            message: "Order is not in pending status",
                        });
                        return;
                    }
                    if (order.snapToken) {
                        res.status(400).json({
                            status: 400,
                            message: "Payment already initiated for this order",
                        });
                        return;
                    }
                    const itemsDetail = order.items.map((item) => ({
                        id: String(item.productId),
                        price: item.price,
                        quantity: item.quantity,
                        name: item.name,
                    }));
                    const snap = new midtrans_client_1.default.Snap({
                        isProduction: false,
                        serverKey: process.env.MIDTRANS_SERVER_KEY,
                        clientKey: process.env.MIDTRANS_CLIENT_KEY,
                    });
                    const transaction = await snap.createTransaction({
                        transaction_details: {
                            order_id: String(order._id),
                            gross_amount: order.total,
                        },
                        item_details: itemsDetail,
                        customer_details: {
                            first_name: user.fullName,
                            email: user.email,
                        },
                    });
                    order.snapToken = transaction.token;
                    await order.updateOne({ status: "paid" });
                    await order.save();
                    res.status(201).json({
                        status: 201,
                        message: "Checkout successfully created",
                        data: {
                            orderId: order._id,
                            snapToken: transaction.token,
                            redirect_url: transaction.redirect_url,
                        },
                    });
                }
                catch (error) {
                    res.status(500).json({
                        status: 500,
                        message: "Server Internal Error",
                        error: error instanceof Error ? error.message : error,
                    });
                }
            },
        ];
        // GET /api/user/checkout/:orderId
        this.getCheckout = [
            auth_1.verifyToken,
            async (req, res) => {
                try {
                    const user = req.user;
                    const { orderId } = req.params;
                    if (!orderId) {
                        res.status(400).json({
                            status: 400,
                            message: "Order ID is required",
                        });
                        return;
                    }
                    const order = await Order_1.default.findOne({
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
                        message: "Successfully Get Checkout",
                        data: {
                            orderId: order._id,
                            snapToken: order.snapToken,
                            total: order.total,
                            status: order.status,
                            items: order.items,
                            createdAt: order.createdAt,
                        },
                    });
                }
                catch (error) {
                    res.status(500).json({
                        status: 500,
                        message: "Server Internal Error",
                        error: error instanceof Error ? error.message : error,
                    });
                }
            },
        ];
        this.getPaidOrders = [
            auth_1.verifyToken,
            async (req, res) => {
                try {
                    const user = req.user;
                    const orders = await Order_1.default.find({
                        userId: user._id,
                        status: "paid",
                    }).sort({ createdAt: -1 });
                    res.status(200).json({
                        status: 200,
                        message: "Successfully Get Paid Orders",
                        data: orders,
                    });
                }
                catch (error) {
                    res.status(500).json({
                        status: 500,
                        message: "Server Internal Error",
                        error: error instanceof Error ? error.message : error,
                    });
                }
            },
        ];
    }
}
exports.default = new PaymentController();
