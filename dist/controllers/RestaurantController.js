"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Product_1 = __importDefault(require("../models/Product"));
const Restaurant_1 = __importDefault(require("../models/Restaurant"));
const Order_1 = __importDefault(require("../models/Order"));
const Chair_1 = __importDefault(require("../models/Chair"));
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
        // POST /api/restaurant/chair/:_id
        this.createChair = async (req, res) => {
            try {
                const { restaurantId } = req.params;
                const { noChair, status } = req.body;
                // Pastikan restoran ada
                const restaurant = await Restaurant_1.default.findById(restaurantId);
                if (!restaurant) {
                    res.status(404).json({ message: "Restaurant not found" });
                    return;
                }
                // Buat kursi baru
                const chair = new Chair_1.default({
                    noChair,
                    status,
                    restaurantId,
                });
                await chair.save();
                await Restaurant_1.default.findByIdAndUpdate(restaurantId, {
                    $push: { chairId: chair._id },
                });
                res.status(201).json(chair);
            }
            catch (error) {
                res.status(500).json({ message: "Failed to create chair", error });
            }
        };
        // GET /api/restaurant/chair
        this.getChairs = [
            auth_1.verifyToken,
            async (req, res) => {
                try {
                    const user = req.user;
                    const restaurant = await Restaurant_1.default.findOne({
                        ownerAuthId: new mongoose_1.default.Types.ObjectId(user._id),
                    });
                    if (!restaurant) {
                        res
                            .status(404)
                            .json({ status: 404, message: "Restaurant Not Found" });
                        return;
                    }
                    const chairs = await Chair_1.default.find({ restaurantId: restaurant._id });
                    res.status(200).json({
                        status: 200,
                        message: "Successfully Get Chairs",
                        data: chairs,
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
        // PUT /api/restaurant/chair/:id
        this.updateChair = [
            auth_1.verifyToken,
            async (req, res) => {
                try {
                    const user = req.user;
                    const restaurant = await Restaurant_1.default.findOne({
                        ownerAuthId: new mongoose_1.default.Types.ObjectId(user._id),
                    });
                    if (!restaurant) {
                        res
                            .status(404)
                            .json({ status: 404, message: "Restaurant Not Found" });
                        return;
                    }
                    const chair = await Chair_1.default.findOneAndUpdate({ _id: req.params.id, restaurantId: restaurant._id }, req.body, { new: true });
                    if (!chair) {
                        res.status(404).json({ status: 404, message: "Chair Not Found" });
                        return;
                    }
                    res.status(200).json({
                        status: 200,
                        message: "Successfully Update Chair",
                        data: chair,
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
        // DELETE /api/restaurant/chair/:id
        this.deleteChair = [
            auth_1.verifyToken,
            async (req, res) => {
                try {
                    const user = req.user;
                    const restaurant = await Restaurant_1.default.findOne({
                        ownerAuthId: new mongoose_1.default.Types.ObjectId(user._id),
                    });
                    if (!restaurant) {
                        res
                            .status(404)
                            .json({ status: 404, message: "Restaurant Not Found" });
                        return;
                    }
                    const chair = await Chair_1.default.findOneAndDelete({
                        _id: req.params.id,
                        restaurantId: restaurant._id,
                    });
                    if (!chair) {
                        res.status(404).json({ status: 404, message: "Chair Not Found" });
                        return;
                    }
                    await Restaurant_1.default.findByIdAndUpdate(restaurant._id, {
                        $pull: { chairId: req.params.id },
                    });
                    res.status(200).json({
                        status: 200,
                        message: "Successfully Delete Chair",
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
