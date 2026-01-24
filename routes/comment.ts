import express from "express";
const commentRouter = express.Router();
import commentController from "../controllers/comment";

// Get a All Comments
commentRouter.get("/", commentController.getAllComments);

// Get a Comment by ID
commentRouter.get("/:commentId", commentController.getCommentById);

// Update a Comment by ID
commentRouter.put("/:commentId", commentController.updateCommentById);

// Delete a Comment by ID
commentRouter.delete("/:commentId", commentController.deleteCommentById);

export default commentRouter; 
