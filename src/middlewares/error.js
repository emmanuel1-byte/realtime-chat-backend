import Joi from "joi";
import respond from "../utils/respond.js";
import logger from "../utils/logger.js";

export function globalErrorHandler(err, req, res, next) {
  logger.error(err.message);
  if (err instanceof Joi.ValidationError) {
    return respond(res, 400, err.details[0].message);
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
