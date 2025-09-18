"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const RestaurantController_1 = __importDefault(require("../controllers/RestaurantController"));
class RestaurantRouter {
    constructor() {
        this.restaurantRouter = express_1.default.Router();
        this.routes();
    }
    routes() {
        this.restaurantRouter.post("/products", RestaurantController_1.default.createProduct);
    }
}
exports.default = new RestaurantRouter().restaurantRouter;
