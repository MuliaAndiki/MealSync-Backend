import express from "express";
import UserController from "../controllers/UserController";

class UserRouter {
  public userRouter;
  constructor() {
    this.userRouter = express.Router();
    this.routes();
  }

  private routes() {
    this.userRouter.post("/cart/:productId", UserController.AddToCart);
    this.userRouter.get("/cart", UserController.getCart);
    this.userRouter.put("/cart/:_id", UserController.updateCartItem);
    this.userRouter.delete("/cart/:_id", UserController.deleteCartItem);
    this.userRouter.delete("/cart", UserController.deleteAllCartItem);
    this.userRouter.get("/orders/history", UserController.ordersHistory);
    this.userRouter.post("/order", UserController.createOrder);
    this.userRouter.get("/order/:_id", UserController.getOrderById);
    this.userRouter.get("/orders", UserController.getOrdersUser);
    this.userRouter.delete("/order/:orderId", UserController.cancelOrder);
  }
}

export default new UserRouter().userRouter;
