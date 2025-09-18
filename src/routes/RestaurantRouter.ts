import express from "express";
import RestaurantController from "../controllers/RestaurantController";

class RestaurantRouter {
  public restaurantRouter;
  constructor() {
    this.restaurantRouter = express.Router();
    this.routes();
  }

  private routes() {
    this.restaurantRouter.post("/products", RestaurantController.createProduct);
  }
}

export default new RestaurantRouter().restaurantRouter;
