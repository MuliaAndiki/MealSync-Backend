"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Cart_1 = __importDefault(require("../models/Cart"));
const Product_1 = __importDefault(require("../models/Product"));
const Order_1 = __importDefault(require("../models/Order"));
const auth_1 = require("../middlewares/auth");
class UserController {
    constructor() {
        // POST /api/user/cart
        this.AddToCart = [
            auth_1.verifyToken,
            async (req, res) => {
                try {
                    const user = req.user;
                    const { productId, quantity } = req.body;
                    if (!productId || !quantity) {
                        res.status(400).json({
                            status: 400,
                            message: "productId and quantity are required",
                        });
                        return;
                    }
                    const product = await Product_1.default.findOne({ userId: user._id });
                    if (!product) {
                        res.status(404).json({
                            status: 404,
                            message: "Prodouct Not Found",
                        });
                        return;
                    }
                    let cart = await Cart_1.default.findOne({ userId: user._id });
                    if (!cart)
                        cart = await Cart_1.default.create({ userId: user._id, items: [], total: 0 });
                    const existing = cart.items.find((i) => i.productId.toString() === productId);
                    if (existing)
                        existing.quantity += quantity;
                    else
                        cart.items.push({ productId, quantity });
                    cart.total = await this.calculateTotal(cart);
                    await cart.save();
                    res.status(201).json({
                        status: 201,
                        message: "Added to cart",
                        data: cart,
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
        // PUT /api/user/cart/:id
        this.updateCartItem = [
            auth_1.verifyToken,
            async (req, res) => {
                try {
                    const user = req.user;
                    const { quantity } = req.body;
                    let cart = await Cart_1.default.findOne({ userId: user._id });
                    if (!cart) {
                        res.status(404).json({
                            status: 404,
                            message: "Cart Not Found",
                        });
                        return;
                    }
                    const item = cart.items.find((i) => i.productId.toString() === req.params._id);
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
        // DELETE /api/user/cart/:id
        this.deleteCartItem = [
            auth_1.verifyToken,
            async (req, res) => {
                try {
                    const user = req.user;
                    let cart = await Cart_1.default.findOne({ userId: user._id });
                    if (!cart) {
                        res.status(404).json({
                            status: 404,
                            message: "Cart Not Found",
                        });
                        return;
                    }
                    cart.items = cart.items.filter((i) => i.productId.toString() !== req.params._id);
                    cart.total = await this.calculateTotal(cart);
                    await cart.save();
                    res.status(200).json({
                        status: 200,
                        message: "SuccesesFully Remove Items Card",
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
        // GET /api/user/orders/history
        this.ordersHistory = [
            auth_1.verifyToken,
            async (req, res) => {
                try {
                    const user = req.user;
                    const orders = await Order_1.default.find({
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
    // helper
    async calculateTotal(cart) {
        let total = 0;
        for (const item of cart.items) {
            const product = await Product_1.default.findById(item.productId);
            if (product)
                total += product.price * item.quantity;
        }
        return total;
    }
}
exports.default = new UserController();
