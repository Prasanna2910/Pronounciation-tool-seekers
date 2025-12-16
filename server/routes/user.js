const express = require("express");
const route = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

route.post("/signup", userController.signup);
route.post("/login", userController.login);
route.post("/checkuser", userController.checkUser);
route.post("/google", userController.googleAuth);
route.get("/profile", authMiddleware, userController.getProfile);

module.exports = route;
