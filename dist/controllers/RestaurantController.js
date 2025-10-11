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
const multer_1 = require("../middlewares/multer");
const uploadsClodinary_1 = require("../utils/uploadsClodinary");
class RestaurantController {
    constructor() {
        // GET /api/restaurant/public/:uniqueUrl
        this.getByUniqueUrl = [
            async (req, res) => {
                try {
                    const { uniqueUrl } = req.params;
                    const restaurant = await Restaurant_1.default.findOne({ uniqueUrl });
                    if (!restaurant) {
                        res.status(404).json({
                            status: 404,
                            message: "Invalid QR / restaurant not found",
                        });
                        return;
                    }
                    const [products, chairs] = await Promise.all([
                        Product_1.default.find({ restaurantId: restaurant._id, isAvailable: true }),
                        Chair_1.default.find({ restaurantId: restaurant._id }),
                    ]);
                    res.status(200).json({
                        status: 200,
                        message: "Restaurant fetched by uniqueUrl",
                        data: {
                            restaurant: {
                                _id: restaurant._id,
                                name: restaurant.name,
                                uniqueUrl: restaurant.uniqueUrl,
                                profile: restaurant.profile,
                            },
                            products,
                            chairs,
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
        // POST /api/restaurant/products
        this.createProduct = [
            auth_1.verifyToken,
            multer_1.uploadImages,
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
                            message: "name and price and category are required",
                        });
                        return;
                    }
                    let documentUrl = { pictProduct: "" };
                    if (req.files && req.files.pictProduct?.[0]) {
                        const file = req.files.pictProduct[0];
                        const buffer = file.buffer;
                        const result = await (0, uploadsClodinary_1.uploadCloudinary)(buffer, "pictProduct", file.originalname);
                        documentUrl.pictProduct = result.secure_url;
                    }
                    else if (req.body.pictProduct) {
                        const base64Data = req.body.pictProduct;
                        const buffer = Buffer.from(base64Data.split(",")[1], "base64");
                        const result = await (0, uploadsClodinary_1.uploadCloudinary)(buffer, "logoRestaurant", "image.png");
                        documentUrl.pictProduct = result.secure_url;
                    }
                    const newProdouct = await Product_1.default.create({
                        name: prodouct.name,
                        price: prodouct.price,
                        category: prodouct.category,
                        description: prodouct.description,
                        restaurantId: restaurant._id,
                        pictProduct: documentUrl.pictProduct,
                        isAvailable: prodouct.isAvailable ?? true,
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
                            message: "Restaurant Not Found",
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
        // Get /api/restaurant/products/:_id
        this.getProductId = [
            auth_1.verifyToken,
            (0, auth_1.requireRole)(["restaurant"]),
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
                    const prodouct = await Product_1.default.findById(req.params._id);
                    if (!prodouct) {
                        res.status(404).json({
                            status: 404,
                            message: "product id not found",
                        });
                        return;
                    }
                    res.status(200).json({
                        status: 200,
                        message: "Succesfilly Get Product By Id",
                        data: prodouct,
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
        // POST /api/restaurant/chair
        this.createChair = [
            auth_1.verifyToken,
            async (req, res) => {
                try {
                    const { noChair, status } = req.body;
                    const user = req.user;
                    const userId = user._id;
                    const restaurant = await Restaurant_1.default.findOne({ ownerAuthId: userId });
                    if (!restaurant) {
                        res.status(404).json({
                            message: "Restaurant untuk user ini tidak ditemukan",
                        });
                        return;
                    }
                    const existingChair = await Chair_1.default.findOne({
                        restaurantId: restaurant._id,
                        noChair,
                    });
                    if (existingChair) {
                        res.status(409).json({
                            message: `Kursi nomor ${noChair} sudah terdaftar di restoran ini`,
                        });
                        return;
                    }
                    const newChair = new Chair_1.default({
                        noChair,
                        status: status || "empty",
                        restaurantId: restaurant._id,
                    });
                    await newChair.save();
                    restaurant.chairId.push(newChair._id);
                    await restaurant.save();
                    res.status(201).json({
                        status: 201,
                        message: "Success Create Chair",
                        data: newChair,
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
                    const restaurant = await Restaurant_1.default.findOne({ ownerAuthId: user._id });
                    if (!restaurant) {
                        res.status(404).json({
                            status: 404,
                            message: "Restaurant not found.",
                        });
                        return;
                    }
                    const chair = await Chair_1.default.findOne({
                        _id: req.params._id,
                        restaurantId: restaurant._id,
                    });
                    if (!chair) {
                        res.status(404).json({
                            status: 404,
                            message: "Chair not found or does not belong to this restaurant.",
                        });
                        return;
                    }
                    await Chair_1.default.findByIdAndDelete(chair._id);
                    await Restaurant_1.default.findByIdAndUpdate(restaurant._id, {
                        $pull: { chairId: chair._id },
                    });
                    res.status(200).json({
                        status: 200,
                        message: "Successfully deleted chair.",
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
        this.getProfileRestaurant = [
            auth_1.verifyToken,
            (0, auth_1.requireRole)(["restaurant", "user"]),
            async (req, res) => {
                try {
                    const user = req.user;
                    const userId = user._id;
                    const { uniqueUrl } = req.params;
                    let restaurant;
                    if (user.role === "restaurant") {
                        restaurant = await Restaurant_1.default.findOne({ ownerAuthId: userId });
                        if (!restaurant) {
                            res.status(404).json({
                                status: 404,
                                message: "Profil restoran tidak ditemukan untuk akun ini.",
                            });
                            return;
                        }
                    }
                    else {
                        if (!uniqueUrl) {
                            res.status(400).json({
                                status: 400,
                                message: "UniqueUrl restoran wajib untuk user biasa.",
                            });
                            return;
                        }
                        restaurant = await Restaurant_1.default.findOne({ uniqueUrl: uniqueUrl });
                        if (!restaurant) {
                            res.status(404).json({
                                status: 404,
                                message: "Restoran tidak ditemukan.",
                            });
                            return;
                        }
                    }
                    const [products, chairs] = await Promise.all([
                        Product_1.default.find({ restaurantId: restaurant._id }),
                        Chair_1.default.find({ restaurantId: restaurant._id }),
                    ]);
                    res.status(200).json({
                        status: 200,
                        message: "Berhasil mengambil profil restoran.",
                        data: {
                            ...restaurant.toObject(),
                            products,
                            chairs,
                            ownerId: restaurant.ownerAuthId,
                            restaurantId: restaurant._id,
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
    }
}
exports.default = new RestaurantController();
