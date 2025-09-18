"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Product_1 = __importDefault(require("../models/Product"));
const Restaurant_1 = __importDefault(require("../models/Restaurant"));
const Order_1 = __importDefault(require("../models/Order"));
const auth_1 = require("../middlewares/auth");
const mongoose_1 = __importDefault(require("mongoose"));
class RestaurantController {
    constructor() {
        // POST /api/restaurant/products
        this.createProduct = [
            auth_1.verifyToken,
            async (req, res) => {
                try {
                    const prodouct = req.body;
                    const user = req.user;
                    const restaurant = await Restaurant_1.default.findOne({
                        ownerAuthId: new mongoose_1.default.Types.ObjectId(user._id),
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
                    const newProdouct = await Product_1.default.create({
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
        // PUT /api/restaurant/products/:id
        this.updateProduct = [
            auth_1.verifyToken,
            async (req, res) => {
                try {
                    const user = req.user;
                    const restaurant = await Restaurant_1.default.findOne({ ownerAuthId: user._id });
                    if (!restaurant) {
                        res.status(404).json({
                            status: 404,
                            message: "Restaurant",
                        });
                        return;
                    }
                    const product = await Product_1.default.findOneAndUpdate({ _id: req.params._id, restaurantId: restaurant._id }, req.body, { new: true });
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
        // GET /api/restaurant/products
        this.getProduct = [
            auth_1.verifyToken,
            async (req, res) => {
                try {
                    const user = req.user;
                    const restaurant = await Restaurant_1.default.findOne({ ownerAuthId: user._id });
                    if (!restaurant) {
                        res.status(404).json({
                            status: 404,
                            message: "Restaurant Not Found",
                        });
                        return;
                    }
                    const product = await Product_1.default.find({ restaurantId: restaurant._id });
                    res.status(200).json({
                        status: 200,
                        message: "Successfully Get Products",
                        data: product,
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
        // DELETE /api/restaurant/products/:id
        this.deleteProduct = [
            auth_1.verifyToken,
            async (req, res) => {
                try {
                    const user = req.user;
                    const restaurant = await Restaurant_1.default.findOne({ ownerAuthId: user._id });
                    if (!restaurant) {
                        res.status(404).json({
                            status: 404,
                            message: "Restaurant NotFound",
                        });
                        return;
                    }
                    const product = await Product_1.default.findByIdAndDelete({
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
                    restaurant.products = restaurant.products.filter((p) => p.toString() !== req.params._id);
                    await restaurant.save();
                    res.status(200).json({
                        status: 200,
                        message: "Succes Product deleted",
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
        // GET /api/restaurant/orders
        this.listOrders = [
            auth_1.verifyToken,
            async (req, res) => {
                try {
                    const user = req.user;
                    const restaurant = await Restaurant_1.default.findOne({ ownerAuthId: user._id });
                    if (!restaurant) {
                        res.status(404).json({
                            status: 404,
                            message: "Restaurant NotFound",
                        });
                        return;
                    }
                    const orders = await Order_1.default.find({ restaurantId: restaurant._id }).sort({
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
        // GET /api/restaurant/orders/history
        this.ordersHistory = [
            auth_1.verifyToken,
            async (req, res) => {
                try {
                    const user = req.user;
                    const restaurant = await Restaurant_1.default.findOne({ ownerAuthId: user._id });
                    if (!restaurant) {
                        res.status(404).json({
                            status: 404,
                            message: "Restaurant NotFound",
                        });
                        return;
                    }
                    const orders = await Order_1.default.find({
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
        // PUT /api/restaurant/profile
        this.updateProfile = [
            auth_1.verifyToken,
            async (req, res) => {
                try {
                    const user = req.user;
                    const restaurant = await Restaurant_1.default.findOneAndUpdate({ ownerAuthId: user._id }, { $set: req.body }, { new: true });
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
exports.default = new RestaurantController();
