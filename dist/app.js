"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const AuthRouter_1 = __importDefault(require("./routes/AuthRouter"));
const UserRouter_1 = __importDefault(require("./routes/UserRouter"));
const SuperAdminRouter_1 = __importDefault(require("./routes/SuperAdminRouter"));
const RestaurantRouter_1 = __importDefault(require("./routes/RestaurantRouter"));
const RestaurantController_1 = __importDefault(require("./controllers/RestaurantController"));
const PaymentRouter_1 = __importDefault(require("./routes/PaymentRouter"));
const node_cron_1 = __importDefault(require("node-cron"));
class App {
    constructor() {
        this.app = (0, express_1.default)();
        this.middlewares();
        this.routes();
        this.runCron();
    }
    middlewares() {
        this.app.use((0, cors_1.default)({ origin: "*", optionsSuccessStatus: 200 }));
        this.app.use(express_1.default.urlencoded({ extended: false }));
        this.app.use(body_parser_1.default.json());
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.urlencoded({ extended: true }));
        this.app.use("/api/auth", AuthRouter_1.default);
        this.app.use("/api/user", UserRouter_1.default);
        this.app.use("/api/superAdmin", SuperAdminRouter_1.default);
        this.app.use("/api/restaurant", RestaurantRouter_1.default);
        this.app.use("/api/payment", PaymentRouter_1.default);
    }
    routes() {
        this.app.get("/", (req, res) => {
            res.json({
                message: "Hello World with TypeScript!",
                timestamp: new Date().toISOString(),
            });
        });
    }
    runCron() {
        node_cron_1.default.schedule("0 0 * * *", async () => {
            console.log("Running cron job to reset daily orders at midnight");
            await RestaurantController_1.default.deleteOrderRunTime();
        });
    }
}
exports.default = new App().app;
