"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const UserController_1 = __importDefault(require("../controllers/UserController"));
class UserRouter {
    constructor() {
        this.userRouter = express_1.default.Router();
        this.routes();
    }
    routes() {
        this.userRouter.post("/cart/:productId", UserController_1.default.AddToCart);
        this.userRouter.get("/cart", UserController_1.default.getCart);
        this.userRouter.put("/cart/:_id", UserController_1.default.updateCartItem);
        this.userRouter.delete("/cart/:_id", UserController_1.default.deleteCartItem);
        this.userRouter.delete("/cart", UserController_1.default.deleteAllCartItem);
        this.userRouter.get("/orders/history", UserController_1.default.ordersHistory);
        this.userRouter.post("/order", UserController_1.default.createOrder);
    }
}
exports.default = new UserRouter().userRouter;
