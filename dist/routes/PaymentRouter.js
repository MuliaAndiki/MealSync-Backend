"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const PaymentController_1 = __importDefault(require("../controllers/PaymentController"));
class PaymentRouter {
    constructor() {
        this.paymentRouter = express_1.default.Router();
        this.router();
    }
    router() {
        this.paymentRouter.post("/checkout", PaymentController_1.default.payment);
        this.paymentRouter.get("/checkout/:orderId", PaymentController_1.default.getCheckout);
    }
}
exports.default = new PaymentRouter().paymentRouter;
