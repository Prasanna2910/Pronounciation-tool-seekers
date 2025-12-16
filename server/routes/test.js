const express = require("express");
const route = express.Router();
const testController = require("../controllers/testController");
const authMiddleware = require("../middleware/authMiddleware");

// Public routes (if any, but getTestById seems to be used by logged in users too based on frontend logic)
// The frontend sends user_id, but we should verify the token matches the user if possible, or just require a valid token.
// For now, I'll protect everything as requested "add them in the proto also" implies we want auth everywhere.

route.get("/", authMiddleware, testController.getAllTests);
route.get("/:id/:level/:user_id", authMiddleware, testController.getTestById);

route.post("/", authMiddleware, testController.createTest);
route.post("/submit/:id", authMiddleware, testController.submitResult);
route.put("/test/:id", authMiddleware, testController.updateTest);
route.delete("/test/:id", authMiddleware, testController.deleteTest);

module.exports = route;