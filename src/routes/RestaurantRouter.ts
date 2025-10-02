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
    this.restaurantRouter.put(
      "/products/:_id",
      RestaurantController.updateProduct
    );
    this.restaurantRouter.get("/products", RestaurantController.getProduct);
    this.restaurantRouter.delete(
      "/products/:_id",
      RestaurantController.deleteProduct
    );
    this.restaurantRouter.get("/orders", RestaurantController.listOrders);
    this.restaurantRouter.get(
      "/orders/history",
      RestaurantController.ordersHistory
    );
    this.restaurantRouter.put("/profile", RestaurantController.updateProfile);
    this.restaurantRouter.post('/chair/:_id', RestaurantController.createChair)
    this.restaurantRouter.get('/chair',RestaurantController.getChairs)
    
  }
}

export default new RestaurantRouter().restaurantRouter;
