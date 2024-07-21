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
  resendVerificationEmailSchema,
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
    if (!user) return respond(res, 404, "User does not exist");
    if (user.verified === false) {
      user.verified = true;
      await user.save();
    }
    return respond(res, 200, "Token is valid");
  } catch (err) {
    next(err);
  }
}

export async function resendVerificationEmail(req, res, next) {
  try {
    const validatedData = await resendVerificationEmailSchema.validateAsync(
      req.body,
    );
    const user = await respository.fetchUserByEmail(validatedData.email);
    if (!user) return respond(res, 404, "User not found");
    if (user.verified === true)
      return respond(res, 409, "Email verified already!");
    const { verificationToken } = generateVerificationToken(user._id);
    mailer.emit("resendVerficationEmail", {
      to: user.email,
      subject: "Email verification",
      body: `${HOSTNAME}/api/auth/verify-account/${verificationToken}`,
    });
    return respond(res, 200, "Verfication email sent successfully");
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const validatedData = await loginSchema.validateAsync(req.body);
    const user = await respository.fetchUserByEmail(validatedData.email);
    if (!user) return respond(res, 404, "User does not exist");
    if (user.verified === false) return respond(res, 401, "verify your email");
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
    await respository.updatePassword(userId, validatedData);
    return respond(res, 200, "Passsord updated successfully");
  } catch (err) {
    next(err);
  }
}

export async function refreshToken(req, res, next) {
  try {
    const { userId } = verifyJwt(req.cookies.refreshToken);
    const user = await respository.fetchUserById(userId);
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
