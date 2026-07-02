import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import {
  sendOTPHandler,
  verifyOTPHandler,
  registerHandler,
  loginHandler,
  refreshHandler,
  logoutHandler,
  getMeHandler,
} from "./auth.controller";

const router = Router();

// Public routes
router.post("/send-otp", sendOTPHandler);
router.post("/verify-otp", verifyOTPHandler);
router.post("/register", registerHandler);
router.post("/login", loginHandler);
router.post("/refresh", refreshHandler);

// Protected routes
router.post("/logout", authenticate, logoutHandler);
router.get("/me", authenticate, getMeHandler);

export default router;
