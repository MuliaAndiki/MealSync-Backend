"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Product_1 = __importDefault(require("../models/Product"));
const Restaurant_1 = __importDefault(require("../models/Restaurant"));
const Order_1 = __importDefault(require("../models/Order"));
const response_1 = require("../utils/response");
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
        this.updateProduct = async (req, res) => {
            try {
                const user = req.user;
                const restaurant = await Restaurant_1.default.findOne({ ownerAuthId: user._id });
                if (!restaurant)
                    return res.status(404).json((0, response_1.notFound)("Restaurant not found"));
                const product = await Product_1.default.findOneAndUpdate({ _id: req.params.id, restaurantId: restaurant._id }, req.body, { new: true });
                if (!product)
                    return res.status(404).json((0, response_1.notFound)("Product not found"));
                return res.status(200).json((0, response_1.ok)("Product updated", product));
            }
            catch (err) {
                return res.status(500).json({ status: 500, message: err.message });
            }
        };
        // DELETE /api/restaurant/products/:id
        // Fix
        this.deleteProduct = async (req, res) => {
            try {
                const user = req.user;
                const restaurant = await Restaurant_1.default.findOne({ ownerAuthId: user._id });
                if (!restaurant)
                    return res.status(404).json((0, response_1.notFound)("Restaurant not found"));
                const product = await Product_1.default.findOneAndDelete({
                    _id: req.params.id,
                    restaurantId: restaurant._id,
                });
                if (!product)
                    return res.status(404).json((0, response_1.notFound)("Product not found"));
                restaurant.products = restaurant.products.filter((p) => p.toString() !== req.params.id);
                await restaurant.save();
                return res.status(200).json((0, response_1.ok)("Product deleted", product));
            }
            catch (err) {
                return res.status(500).json({ status: 500, message: err.message });
            }
        };
        // GET /api/restaurant/orders
        // Fix
        this.listOrders = async (req, res) => {
            try {
                const user = req.user;
                const restaurant = await Restaurant_1.default.findOne({ ownerAuthId: user._id });
                if (!restaurant)
                    return res.status(404).json((0, response_1.notFound)("Restaurant not found"));
                const orders = await Order_1.default.find({ restaurantId: restaurant._id }).sort({
                    createdAt: -1,
                });
                return res.status(200).json((0, response_1.ok)("Orders fetched", orders));
            }
            catch (err) {
                return res.status(500).json({ status: 500, message: err.message });
            }
        };
        // GET /api/restaurant/orders/history
        // Fix
        this.ordersHistory = async (req, res) => {
            try {
                const user = req.user;
                const restaurant = await Restaurant_1.default.findOne({ ownerAuthId: user._id });
                if (!restaurant)
                    return res.status(404).json((0, response_1.notFound)("Restaurant not found"));
                const orders = await Order_1.default.find({
                    restaurantId: restaurant._id,
                    status: { $in: ["paid", "failed"] },
                }).sort({ createdAt: -1 });
                return res.status(200).json((0, response_1.ok)("Orders history fetched", orders));
            }
            catch (err) {
                return res.status(500).json({ status: 500, message: err.message });
            }
        };
        // PUT /api/restaurant/profile
        // Fix
        this.updateProfile = async (req, res) => {
            try {
                const user = req.user;
                const restaurant = await Restaurant_1.default.findOneAndUpdate({ ownerAuthId: user._id }, { $set: { profile: req.body } }, { new: true });
                if (!restaurant)
                    return res.status(404).json((0, response_1.notFound)("Restaurant not found"));
                return res.status(200).json((0, response_1.ok)("Profile updated", restaurant));
            }
            catch (err) {
                return res.status(500).json({ status: 500, message: err.message });
            }
        };
    }
}
exports.default = new RestaurantController();
