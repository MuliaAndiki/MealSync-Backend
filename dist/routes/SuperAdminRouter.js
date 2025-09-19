"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const SuperAdminController_1 = __importDefault(require("../controllers/SuperAdminController"));
class SuperAdminRouter {
    constructor() {
        this.superRouter = express_1.default.Router();
        this.router();
    }
    router() {
        this.superRouter.post("/restaurant", SuperAdminController_1.default.createRestaurant);
        this.superRouter.get("/restaurants", SuperAdminController_1.default.listRestaurants);
    }
}
exports.default = new SuperAdminRouter().superRouter;
