import { Router } from "express";
import authController from "../controllers/auth";

const router = Router();

// Register a new user
router.post("/register", authController.register);

// Login user
router.post("/login", authController.login);

// Logout user (invalidate refresh token)
router.post("/logout", authController.logout);

// Refresh access token
router.post("/refresh", authController.refresh);

export default router;
