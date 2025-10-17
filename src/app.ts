import express, { Application, Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import authRouter from "./routes/AuthRouter";
import UserRouter from "./routes/UserRouter";
import SuperAdminRouter from "./routes/SuperAdminRouter";
import RestaurantRouter from "./routes/RestaurantRouter";
import RestaurantController from "./controllers/RestaurantController";
import PaymentRouter from "./routes/PaymentRouter";
import nodeCron from "node-cron";
class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.middlewares();
    this.routes();
    this.runCron();
  }

  private middlewares(): void {
    this.app.use(cors({ origin: "*", optionsSuccessStatus: 200 }));
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(bodyParser.json());
    this.app.use(express.json());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use("/api/auth", authRouter);
    this.app.use("/api/user", UserRouter);
    this.app.use("/api/superAdmin", SuperAdminRouter);
    this.app.use("/api/restaurant", RestaurantRouter);
    this.app.use("/api/payment", PaymentRouter);
  }

  private routes(): void {
    this.app.get("/", (req: Request, res: Response) => {
      res.json({
        message: "Hello World with TypeScript!",
        timestamp: new Date().toISOString(),
      });
    });
  }

  private runCron(): void {
    nodeCron.schedule("0 0 * * *", async () => {
      console.log("Running cron job to reset daily orders at midnight");
      await RestaurantController.deleteOrderRunTime();
    });
  }
}

export default new App().app;
