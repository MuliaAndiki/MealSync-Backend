import express from "express";
import SuperAdminController from "../controllers/SuperAdminController";

class SuperAdminRouter {
  public superRouter;
  constructor() {
    this.superRouter = express.Router();
    this.router();
  }

  private router() {
    this.superRouter.post("/restaurant", SuperAdminController.createRestaurant);
  }
}

export default new SuperAdminRouter().superRouter;
