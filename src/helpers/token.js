import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const { JWT_SECRET } = process.env;

export function verifyJwt(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { userId: decoded.sub };
  } catch (err) {
    throw err;
  }
}

export function generateVerificationToken(userId) {
  return {
    verificationToken: jwt.sign({ sub: userId }, JWT_SECRET, {
      algorithm: "HS256",
      expiresIn: "1h",
    }),
  };
}

export function generateMagicToken(userId) {
  return {
    magicToken: jwt.sign({ sub: userId }, JWT_SECRET, {
      algorithm: "HS256",
      expiresIn: "1h",
    }),
  };
}

export function generatePasswordRestToken(userId) {
  return {
    resetPasswordToken: jwt.sign({ sub: userId }, JWT_SECRET, {
      algorithm: "HS256",
      expiresIn: "1h",
    }),
  };
}

export function generateAccessToken(userId) {
  return {
    accessToken: jwt.sign({ sub: userId }, JWT_SECRET, {
      algorithm: "HS256",
      expiresIn: "20 days",
    }),
  };
}

export function generateRefreshToken(userId) {
  return {
    refreshToken: jwt.sign({ sub: userId }, JWT_SECRET, {
      algorithm: "HS256",
      expiresIn: "62 days",
    }),
  };
}
