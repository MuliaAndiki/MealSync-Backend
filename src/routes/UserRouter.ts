import express from "express";
import UserController from "../controllers/UserController";

class UserRouter {
  public userRouter;
  constructor() {
    this.userRouter = express.Router();
    this.routes();
  }

  private routes() {
    this.userRouter.post("/", UserController.AddToCart);
    this.userRouter.put("/cart/:_id", UserController.updateCartItem);
    this.userRouter.delete("/cart/:_id", UserController.deleteCartItem);
    this.userRouter.get("/orders/history", UserController.ordersHistory);
  }
}

export default new UserRouter().userRouter;
