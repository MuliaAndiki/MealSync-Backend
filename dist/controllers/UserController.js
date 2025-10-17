"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Cart_1 = __importDefault(require("../models/Cart"));
const Product_1 = __importDefault(require("../models/Product"));
const Order_1 = __importDefault(require("../models/Order"));
const auth_1 = require("../middlewares/auth");
const Restaurant_1 = __importDefault(require("../models/Restaurant"));
const Chair_1 = __importDefault(require("../models/Chair"));
const socket_1 = require("../utils/socket");
const mongoose_1 = __importDefault(require("mongoose"));
class UserController {
    constructor() {
        // POST /api/user/cart
        this.AddToCart = [
            auth_1.verifyToken,
            async (req, res) => {
                try {
                    const user = req.user;
                    const { quantity } = req.body;
                    const { productId } = req.params;
                    if (!productId || !quantity) {
                        return res.status(400).json({
                            status: 400,
                            message: "productId (params) and quantity (body) are required",
                        });
                    }
                    const product = await Product_1.default.findById(productId);
                    if (!product) {
                        return res.status(404).json({
                            status: 404,
                            message: "Product not found",
                        });
                    }
                    let cart = await Cart_1.default.findOne({ userId: user._id });
                    if (!cart)
                        cart = await Cart_1.default.create({ userId: user._id, items: [], total: 0 });
                    const existing = cart.items.find((i) => i.productId.toString() === productId);
                    if (existing)
                        existing.quantity += quantity;
                    else
                        cart.items.push({
                            productId: new mongoose_1.default.Types.ObjectId(productId),
                            quantity,
                        });
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
        // GET /api/user/cart
        this.getCart = [
            auth_1.verifyToken,
            async (req, res) => {
                try {
                    const user = req.user;
                    let cart = await Cart_1.default.findOne({ userId: user._id }).populate({
                        path: "items.productId",
                        select: "name description price pictProduct category",
                    });
                    if (!cart) {
                        cart = await Cart_1.default.create({ userId: user._id, items: [], total: 0 });
                    }
                    let grandTotal = 0;
                    const itemsWithSubtotal = cart.items.map((item) => {
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
        // DELETE /api/user/cart
        this.deleteAllCartItem = [
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
                    cart.items = [];
                    cart.total = 0;
                    await cart.save();
                    res.status(200).json({
                        status: 200,
                        message: "SuccesesFully Remove All Items Card",
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
        // POST /api/user/order
        this.createOrder = [
            auth_1.verifyToken,
            (0, auth_1.requireRole)(["user", "restaurant"]),
            async (req, res) => {
                try {
                    const user = req.user;
                    const { uniqueUrl, items, chairNo } = req.body;
                    if (!uniqueUrl ||
                        !Array.isArray(items) ||
                        items.length === 0 ||
                        !chairNo) {
                        res.status(400).json({
                            status: 400,
                            message: "uniqueUrl, items[], and chairNo are required",
                        });
                        return;
                    }
                    const restaurant = await Restaurant_1.default.findOne({ uniqueUrl });
                    if (!restaurant) {
                        res.status(404).json({
                            status: 404,
                            message: "Invalid QR / restaurant not found",
                        });
                        return;
                    }
                    const chair = await Chair_1.default.findOne({
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
                    const productIds = items.map((i) => i.productId);
                    const products = await Product_1.default.find({
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
                    const orderItems = items.map((i) => {
                        const p = products.find((pp) => pp._id.toString() === i.productId);
                        return {
                            productId: p._id,
                            name: p.name,
                            price: p.price,
                            quantity: i.quantity,
                        };
                    });
                    const total = orderItems.reduce((sum, it) => sum + it.price * it.quantity, 0);
                    const order = await Order_1.default.create({
                        userId: user._id,
                        restaurantId: restaurant._id,
                        items: orderItems,
                        total,
                        status: "pending",
                        chairNo,
                    });
                    await Cart_1.default.findOneAndUpdate({ userId: user._id }, { items: [], total: 0 });
                    chair.status = "full";
                    await chair.save();
                    try {
                        const io = (0, socket_1.getIO)();
                        io.to(restaurant._id.toString()).emit("order:new", { order });
                        io.to(restaurant._id.toString()).emit("chair:update", {
                            chairNo,
                            status: "full",
                        });
                    }
                    catch (_) {
                        // do nothing
                    }
                    res
                        .status(201)
                        .json({ status: 201, message: "Order created", data: order });
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
        // GET /api/user/orders
        this.getOrdersUser = [
            auth_1.verifyToken,
            async (req, res) => {
                try {
                    const user = req.user;
                    const orders = await Order_1.default.find({
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
        // GET /api/user/order/:id
        this.getOrderById = [
            auth_1.verifyToken,
            async (req, res) => {
                try {
                    const user = req.user;
                    const { orderId } = req.params;
                    if (!orderId) {
                        res.status(400).json({
                            status: 400,
                            message: "Order Id Tidak Ditemukan",
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
                        message: "Succesfuly Get Order",
                        data: order,
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
        // DELETE /api/user/order/cancel/:orderId
        this.cancelOrder = [
            auth_1.verifyToken,
            async (req, res) => {
                try {
                    const user = req.user;
                    const { orderId } = req.params;
                    if (!orderId) {
                        res.status(400).json({
                            status: 400,
                            message: "Order Id is Required",
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
