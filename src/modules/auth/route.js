import express from "express";
import {
  forgotPassword,
  login,
  refreshToken,
  resendVerificationEmail,
  resetPassword,
  signup,
  verifyAccount,
  verifyPasswordResetToken,
} from "./controller.js";
import validateJwt from "../../middlewares/auth.js";
const auth = express.Router();

auth.post("/signup", signup);

auth.get("/verify-account/:token", verifyAccount);

auth.post("/resend-verification-email", resendVerificationEmail);

auth.post("/login", login);

auth.post("/forgot-password", forgotPassword);

auth.get("/verify-reset-password/:token", verifyPasswordResetToken);

auth.patch("/reset-password", resetPassword);

auth.post("/refresh-token", validateJwt, refreshToken);

export default auth;
