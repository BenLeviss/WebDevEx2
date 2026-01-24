import express from "express";
const postRouter = express.Router();
import postsController from "../controllers/posts";
import commentController from "../controllers/comment";

// Add a New Post
postRouter.post("/", postsController.createPost);

// Posts All Posts / By sender
postRouter.get("/", postsController.getPosts);

// Get a Post by ID
postRouter.get("/:postId", postsController.getPostById);

// Update a Post
postRouter.put("/:postId", postsController.updatePostById);

// Delete a Post by ID
postRouter.delete("/:postId", postsController.deletePostById);

// Add new Comment 
postRouter.post("/:postId/comment", commentController.createComment);

// Get all comment for a post 
postRouter.get("/:postId/comment", commentController.getCommentsByPost);

export default postRouter;
