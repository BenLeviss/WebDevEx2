import express from "express";
const commentRouter = express.Router();
import commentController from "../controllers/comment";
import { authenticate } from "../middleware/auth";

// All comment routes require authentication
// Get All Comments
commentRouter.get("/", commentController.getAllComments);

// Get a Comment by ID
commentRouter.get("/:commentId", commentController.getCommentById);

// Update a Comment by ID
commentRouter.put("/:commentId", authenticate, commentController.updateCommentById);

// Delete a Comment by ID
commentRouter.delete("/:commentId", authenticate, commentController.deleteCommentById);

export default commentRouter;
