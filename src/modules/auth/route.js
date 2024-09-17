import express from "express";
import {
  forgotPassword,
  login,
  magicLinkLogin,
  refreshToken,
  resendVerificationEmail,
  resetPassword,
  signup,
  verifyAccount,
  verifyMagicToken,
  verifyPasswordResetToken,
} from "./controller.js";
import validateJwt from "../../middlewares/auth.js";
const auth = express.Router();

auth.post("/signup", signup);

auth.get("/verify-account/:token", verifyAccount);

auth.post("/resend-verification-email", resendVerificationEmail);

auth.post("/login", login);

auth.post("/magic-link-login", magicLinkLogin);

auth.get("/verify-magic-link/:token", verifyMagicToken)

auth.post("/forgot-password", forgotPassword);

auth.get("/verify-reset-password/:token", verifyPasswordResetToken);

auth.patch("/reset-password", resetPassword);

auth.post("/refresh-token", validateJwt, refreshToken);

export default auth;
