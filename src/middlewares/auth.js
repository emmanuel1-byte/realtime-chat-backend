import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import respond from "../utils/respond.js";
dotenv.config();
const { JWT_SECRET } = process.env;

function validateJwt(req, res, next) {
  const accessToken = req.headers.authorization?.split(" ")[1];
  if (!accessToken) return respond(res, 400, "Access token required!");
  try {
    const decoded = jwt.verify(accessToken, JWT_SECRET);
    req.userId = decoded.sub;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return respond(res, 401, "Access token has expired!");
    }
    return respond(res, 401, "Invalid access token");
  }
}

export default validateJwt;
