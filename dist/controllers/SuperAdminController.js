"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Auth_1 = __importDefault(require("../models/Auth"));
const Restaurant_1 = __importDefault(require("../models/Restaurant"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const auth_1 = require("../middlewares/auth");
class SuperAdminController {
    constructor() {
        // POST /api/superadmin/restaurant
        this.createRestaurant = [
            auth_1.verifyToken,
            async (req, res) => {
                try {
                    const { name, email, password, uniqueUrl, profile } = req.body;
                    if (!name || !email || !password || !uniqueUrl) {
                        res.status(400).json({
                            status: 400,
                            message: "Body Invalid",
                        });
                        return;
                    }
                    const existingUser = await Auth_1.default.findOne({ email });
                    const existingRest = await Restaurant_1.default.findOne({
                        $or: [{ email }, { uniqueUrl }],
                    });
                    if (existingUser || existingRest) {
                        return res.status(400).json({
                            status: 400,
                            message: "Email or URL already used",
                        });
                    }
                    const hash = await bcryptjs_1.default.hash(password, 10);
                    const user = await Auth_1.default.create({
                        email,
                        fullName: name,
                        password: hash,
                        role: "restaurant",
                    });
                    const restaurant = await Restaurant_1.default.create({
                        name,
                        email,
                        uniqueUrl,
                        profile,
                        products: [],
                        ownerAuthId: user._id,
                    });
                    const newRestaurant = restaurant;
                    res.status(201).json({
                        status: 201,
                        message: "Succesfully Create Restaurant",
                        data: newRestaurant,
                    });
                }
                catch (error) {
                    res.status(500).json({
                        status: 500,
                        message: "Server Internal Error",
                        error: error instanceof Error ? error.message : error,
                    });
                    return;
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
