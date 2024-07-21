import Joi from "joi";
import jwt from "jsonwebtoken";
import respond from "../utils/respond.js";
import logger from "../utils/logger.js";

export function globalErrorHandler(err, req, res, next) {
  logger.error(err.message);
  if (err instanceof Joi.ValidationError) {
    return respond(res, 400, err.details[0].message);
  }
  if (err instanceof jwt.TokenExpiredError) {
    return respond(res, 401, "Token expired!");
  } else if (err instanceof jwt.JsonWebTokenError) {
    return respond(res, 401, "Invalid token");
  }
  return respond(res, 500, "Internal Server Error");
}

export function routeNotFoundHandler(req, res) {
  return respond(
    res,
    404,
    "The endpoint you requested does not exist on this server",
  );
}
