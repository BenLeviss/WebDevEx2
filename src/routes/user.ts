import { Router } from "express";
import userController from "../controllers/user";
import { authenticate } from "../middleware/auth";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */
/**
 * @swagger
 * /user:
 *   post:
 *     summary: Create a new user (register)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 */
/**
 * @swagger
 * /user/{userId}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details
 *       404:
 *         description: User not found
 *   put:
 *     summary: Update user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated
 *   delete:
 *     summary: Delete user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: User deleted
 */
/**
 * @swagger
 * /user/{userId}/posts:
 *   get:
 *     summary: Get all posts by a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of posts
 */
/**
 * @swagger
 * /user/{userId}/comments:
 *   get:
 *     summary: Get all comments by a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of comments
 */

// Create a new user (public - for registration)
router.post("/", userController.createUser);

// All other user routes require authentication
// Get all users
router.get("/", authenticate, userController.getAllUsers);

// Get all posts by a specific user
router.get("/:userId/posts", authenticate, userController.getUserPosts);

// Get all comments by a specific user
router.get("/:userId/comments", authenticate, userController.getUserComments);

// Get user by ID
router.get("/:userId", authenticate, userController.getUserById);

// Update user by ID
router.put("/:userId", authenticate, userController.updateUserById);

// Delete user by ID
router.delete("/:userId", authenticate, userController.deleteUserById);

export default router;
