import { Router } from "express";
import userController from "../controllers/user";

const router = Router();

// Create a new user
router.post("/", userController.createUser);

// Get all users
router.get("/", userController.getAllUsers);

// Get all posts by a specific user
router.get("/:userId/posts", userController.getUserPosts);

// Get all comments by a specific user
router.get("/:userId/comments", userController.getUserComments);

// Get user by ID
router.get("/:userId", userController.getUserById);

// Update user by ID
router.put("/:userId", userController.updateUserById);

// Delete user by ID
router.delete("/:userId", userController.deleteUserById);

export default router;
