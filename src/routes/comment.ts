import express from "express";
const commentRouter = express.Router();
/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: Comment management
 */

/**
 * @swagger
 * /comments:
 *   get:
 *     summary: Get all comments
 *     tags: [Comments]
 *     responses:
 *       200:
 *         description: List of comments
 */
/**
 * @swagger
 * /comments/{id}:
 *   get:
 *     summary: Get a comment by ID
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment details
 *       404:
 *         description: Comment not found
 */
/**
 * @swagger
 * /comments/{id}:
 *   put:
 *     summary: Update a comment
 *     description: Updates the message of an existing comment. Requires JWT authentication.
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the comment to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: "This is my updated comment message."
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       404:
 *         description: Comment not found
 *       400:
 *         description: Invalid input data
 */
/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Delete a comment
 *     description: Removes a comment from the database. Requires JWT authentication.
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the comment to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       404:
 *         description: Comment not found
 */
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
