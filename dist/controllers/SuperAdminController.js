"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Auth_1 = __importDefault(require("../models/Auth"));
const Restaurant_1 = __importDefault(require("../models/Restaurant"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const auth_1 = require("../middlewares/auth");
const auth_2 = require("../middlewares/auth");
const uploadsClodinary_1 = require("../utils/uploadsClodinary");
const multer_1 = require("../middlewares/multer");
const slug_1 = require("../utils/slug");
class SuperAdminController {
    constructor() {
        // POST /api/superadmin/restaurant
        this.createRestaurant = [
            auth_1.verifyToken,
            multer_1.uploadImages,
            (0, auth_2.requireRole)(["superadmin"]),
            async (req, res) => {
                try {
                    const { name, email, password, profile } = req.body;
                    if (!name || !email || !password) {
                        return res.status(400).json({
                            message: "Body Invalid. Mohon isi semua field wajib (name, email, password).",
                        });
                    }
                    const uniqueUrl = await (0, slug_1.generateUniqueRestaurantUrl)(name);
                    let documentUrl = {
                        logoUrl: "",
                        banner: "",
                        pitch: "",
                    };
                    if (req.files && req.files.logoRestaurant?.[0]) {
                        const file = req.files.logoRestaurant[0];
                        const buffer = file.buffer;
                        const result = await (0, uploadsClodinary_1.uploadCloudinary)(buffer, "logoRestaurant", file.originalname);
                        documentUrl.logoUrl = result.secure_url;
                    }
                    else if (req.body.logoRestaurant) {
                        const base64Data = req.body.logoRestaurant;
                        const buffer = Buffer.from(base64Data.split(",")[1], "base64");
                        const result = await (0, uploadsClodinary_1.uploadCloudinary)(buffer, "logoRestaurant", "image.png");
                        documentUrl.logoUrl = result.secure_url;
                    }
                    if (req.files && req.files.bannerRestaurant?.[0]) {
                        const file = req.files.bannerRestaurant[0];
                        const buffer = file.buffer;
                        const result = await (0, uploadsClodinary_1.uploadCloudinary)(buffer, "bannerRestaurant", file.originalname);
                        documentUrl.banner = result.secure_url;
                    }
                    else if (req.body.bannerRestaurant) {
                        const base64Data = req.body.bannerRestaurant;
                        const buffer = Buffer.from(base64Data.split(",")[1], "base64");
                        const result = await (0, uploadsClodinary_1.uploadCloudinary)(buffer, "bannerRestaurant", "image.png");
                        documentUrl.banner = result.secure_url;
                    }
                    if (req.files && req.files.pitchRestaurant?.[0]) {
                        const file = req.files.pitchRestaurant[0];
                        const buffer = file.buffer;
                        const result = await (0, uploadsClodinary_1.uploadCloudinary)(buffer, "pitchRestaurant", file.originalname);
                        documentUrl.pitch = result.secure_url;
                    }
                    else if (req.body.pitchRestaurant) {
                        const base64Data = req.body.pitchRestaurant;
                        const buffer = Buffer.from(base64Data.split(",")[1], "base64");
                        const result = await (0, uploadsClodinary_1.uploadCloudinary)(buffer, "pitchRestaurant", "image.png");
                        documentUrl.pitch = result.secure_url;
                    }
                    const hash = await bcryptjs_1.default.hash(password, 10);
                    const restaurantAuth = await Auth_1.default.create({
                        email,
                        fullName: name,
                        password: hash,
                        role: "restaurant",
                    });
                    const finalProfile = {
                        ...profile,
                        logoUrl: documentUrl.logoUrl || profile?.logoUrl || "",
                        banner: documentUrl.banner || profile?.banner || "",
                        pitch: documentUrl.pitch || profile.pitch || "",
                    };
                    const restaurant = await Restaurant_1.default.create({
                        name,
                        email,
                        uniqueUrl,
                        profile: finalProfile,
                        products: [],
                        chairId: [],
                        ownerAuthId: restaurantAuth._id,
                        createdBy: req.user?._id,
                    });
                    res.status(201).json({
                        message: "Restaurant created successfully",
                        data: {
                            restaurant,
                            account: {
                                email: restaurantAuth.email,
                                password,
                                role: restaurantAuth.role,
                            },
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
        // GET /api/superadmin/restaurants
        this.listRestaurants = [
            auth_1.verifyToken,
            async (req, res) => {
                try {
                    const restaurant = await Restaurant_1.default.find().populate("products");
                    res.status(200).json({
                        status: 200,
                        message: "Succesfuly Restaurants fetched ",
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
exports.default = new SuperAdminController();
