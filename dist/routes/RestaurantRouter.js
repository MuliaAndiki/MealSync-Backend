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
        this.restaurantRouter.get("/public/:uniqueUrl", RestaurantController_1.default.getByUniqueUrl);
        this.restaurantRouter.post("/products", RestaurantController_1.default.createProduct);
        this.restaurantRouter.put("/products/:_id", RestaurantController_1.default.updateProduct);
        this.restaurantRouter.get("/products", RestaurantController_1.default.getProduct);
        this.restaurantRouter.get("/products/:_id", RestaurantController_1.default.getProductId);
        this.restaurantRouter.delete("/products/:_id", RestaurantController_1.default.deleteProduct);
        this.restaurantRouter.get("/orders", RestaurantController_1.default.listOrders);
        this.restaurantRouter.get("/orders/history", RestaurantController_1.default.ordersHistory);
        this.restaurantRouter.put("/orders/:_id", RestaurantController_1.default.doneOrder);
        this.restaurantRouter.put("/profile", RestaurantController_1.default.updateProfile);
        this.restaurantRouter.post("/chair", RestaurantController_1.default.createChair);
        this.restaurantRouter.get("/chair", RestaurantController_1.default.getChairs);
        this.restaurantRouter.get("/profile", RestaurantController_1.default.getProfileRestaurant);
        this.restaurantRouter.get("/profile/:uniqueUrl", RestaurantController_1.default.getProfileRestaurant);
        this.restaurantRouter.delete("/chair/:_id", RestaurantController_1.default.deleteChair);
    }
}
exports.default = new RestaurantRouter().restaurantRouter;
