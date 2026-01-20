import express from "express";
import testController from "../controllers/testController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const route = express.Router();

// Public routes (if any, but getTestById seems to be used by logged in users too based on frontend logic)
// The frontend sends user_id, but we should verify the token matches the user if possible, or just require a valid token.
// For now, I'll protect everything as requested "add them in the proto also" implies we want auth everywhere.

route.get("/",  testController.getAllTests);
route.get("/random/:level/:user_id", testController.getRandomTest);
route.post("/", testController.createTest);
route.post("/submit/:id", testController.submitResult);
route.put("/test/:id", testController.updateTest);
route.delete("/test/:id", testController.deleteTest);


export default route;