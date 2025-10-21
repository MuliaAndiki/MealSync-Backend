import express from "express";
import RestaurantController from "../controllers/RestaurantController";

class RestaurantRouter {
  public restaurantRouter;
  constructor() {
    this.restaurantRouter = express.Router();
    this.routes();
  }

  private routes() {
    this.restaurantRouter.get(
      "/public/:uniqueUrl",
      RestaurantController.getByUniqueUrl
    );

    this.restaurantRouter.post("/products", RestaurantController.createProduct);
    this.restaurantRouter.put(
      "/products/:_id",
      RestaurantController.updateProduct
    );
    this.restaurantRouter.get("/products", RestaurantController.getProduct);
    this.restaurantRouter.get(
      "/products/:_id",
      RestaurantController.getProductId
    );
    this.restaurantRouter.delete(
      "/products/:_id",
      RestaurantController.deleteProduct
    );
    this.restaurantRouter.get("/orders", RestaurantController.listOrders);
    this.restaurantRouter.get(
      "/orders/history",
      RestaurantController.ordersHistory
    );
    this.restaurantRouter.put("/orders/:_id", RestaurantController.doneOrder);

    this.restaurantRouter.put("/profile", RestaurantController.updateProfile);
    this.restaurantRouter.post("/chair", RestaurantController.createChair);
    this.restaurantRouter.get("/chair", RestaurantController.getChairs);
    this.restaurantRouter.put("/chair/:_id", RestaurantController.updateChair);
    this.restaurantRouter.get(
      "/profile",
      RestaurantController.getProfileRestaurant
    );

    this.restaurantRouter.get(
      "/profile/:uniqueUrl",
      RestaurantController.getProfileRestaurant
    );

    this.restaurantRouter.delete(
      "/chair/:_id",
      RestaurantController.deleteChair
    );
  }
}

export default new RestaurantRouter().restaurantRouter;
