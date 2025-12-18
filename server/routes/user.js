import express from "express";
import userController from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const route = express.Router();

route.post("/signup", userController.signup);
route.post("/login", userController.login);
route.post("/checkuser", userController.checkUser);
route.post("/google", userController.googleAuth);
route.get("/profile", authMiddleware, userController.getProfile);

export default route;
