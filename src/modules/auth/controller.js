import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();
const { HOSTNAME } = process.env;
import respository from "./repository.js";
import {
  signupSchema,
  loginSchema,
  fetchTokenSchema,
  forgotPasswordSchema,
  updatePasswordSchema,
} from "./schema.js";
import mailer from "../../services/email/mail.js";
import {
  generateAccessToken,
  generatePasswordRestToken,
  generateRefreshToken,
  generateVerificationToken,
  verifyJwt,
} from "../../helpers/token.js";
import respond from "../../utils/respond.js";
import { setCookie } from "../../helpers/cookie.js";

export async function signup(req, res, next) {
  try {
    const validatedData = await signupSchema.validateAsync(req.body);
    const existingUser = await respository.fetchUserByEmail(
      validatedData.email,
    );
    if (existingUser) return respond(res, 409, "Email already exist");
    const newUser = await respository.createUser(validatedData);
    const { verificationToken } = generateVerificationToken(newUser._id);
    mailer.emit("verificationEmail", {
      to: newUser.email,
      subject: "Signup sucessfull",
      body: `${HOSTNAME}/api/auth/verify-account/${verificationToken}`,
    });
    return respond(res, 201, "Signup succesfull");
  } catch (err) {
    next(err);
  }
}

export async function verifyAccount(req, res, next) {
  try {
    const params = await fetchTokenSchema.validateAsync(req.params);
    const { userId } = verifyJwt(params.token);
    const user = await respository.fetchUserById(userId);
    user.verified = true;
    user.save();
    if (!user) return respond(res, 404, "User does not exist");
    return respond(res, 200, "Token is valid");
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const validatedData = await loginSchema.validateAsync(req.body);
    const user = await respository.fetchUserByEmail(validatedData.email);
    if (!user) return respond(res, 404, "User does not exist");
    if (!user.verified) return respond(res, 401, "verify your email");
    const isPasswordValid = await bcrypt.compare(
      validatedData.password,
      user.password,
    );
    if (!isPasswordValid) return respond(res, 401, "Invalid login credentials");
    const { accessToken } = generateAccessToken(user._id);
    const { refreshToken } = generateRefreshToken(user._id);
    setCookie(res, refreshToken);
    return respond(res, 200, "Login sucessfull", { access_token: accessToken });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const validatedData = await forgotPasswordSchema.validateAsync(req.body);
    const user = await respository.fetchUserByEmail(validatedData.email);
    if (!user) return respond(res, 404, "User does not exist");
    const { resetPasswordToken } = generatePasswordRestToken(user._id);
    mailer.emit("passwordResetEmail", {
      to: user.email,
      subject: "Reset Password",
      body: `${HOSTNAME}/api/auth/verify-reset-password/${resetPasswordToken}`,
    });
    return respond(res, 200, "Password reset email sent successfully");
  } catch (err) {
    next(err);
  }
}

export async function verifyPasswordResetToken(req, res, next) {
  try {
    const params = await fetchTokenSchema.validateAsync(req.params);
    const { userId } = verifyJwt(params.token);
    const user = await respository.fetchUserById(userId);
    if (!user) return respond(res, 404, "User does not exist");
    return respond(res, 200, "Token is valid");
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const validatedData = await updatePasswordSchema.validateAsync(req.body);
    const { userId } = verifyJwt(validatedData.token);
    const user = await respository.fetchUserById(userId);
    if (!user) return respond(res, 404, "User does not exist");
    respository.updatePassword(userId, validatedData);
    return respond(res, 200, "Passsord updated successfully");
  } catch (err) {
    next(err);
  }
}

export async function refreshToken(req, res, next) {
  try {
    const user = await respository.fetchUserById(req.userId);
    if (!user) return respond(res, 404, "User not found");
    const { accessToken } = generateAccessToken(user._id);
    const { refreshToken } = generateRefreshToken(user._id);
    setCookie(res, refreshToken);
    return respond(res, 200, "Token refreshed sucessfully", {
      access_token: accessToken,
    });
  } catch (err) {
    next(err);
  }
}
