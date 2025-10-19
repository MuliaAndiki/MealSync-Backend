import express from "express";
import PaymentController from "../controllers/PaymentController";

class PaymentRouter {
  public paymentRouter;
  constructor() {
    this.paymentRouter = express.Router();
    this.router();
  }

  private router() {
    this.paymentRouter.post("/api/user/checkout", PaymentController.checkout);
    this.paymentRouter.get(
      "/api/user/checkout/:orderId",
      PaymentController.getCheckout
    );
  }
}

export default new PaymentRouter().paymentRouter;
