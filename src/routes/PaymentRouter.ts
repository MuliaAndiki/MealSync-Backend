import express from "express";
import PaymentController from "../controllers/PaymentController";

class PaymentRouter {
  public paymentRouter;
  constructor() {
    this.paymentRouter = express.Router();
    this.router();
  }

  private router() {
    // SetUp
    this.paymentRouter.get;
  }
}

export default new PaymentRouter().paymentRouter;
