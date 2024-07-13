import winston from "winston";

/*  Configures a Winston logger with the following settings:
 * - Logs at the 'info' level or higher
 * - Logs in JSON format
 * - Writes error logs to 'error.log'
 * - Writes combined logs to 'combined.log'
 * - Adds a console transport with color formatting in non-production environments
 */
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({
      dirname: "log",
      filename: "error.log",
      level: "error",
    }),
    new winston.transports.File({ dirname: "log", filename: "combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.colorize(),
    }),
  );
}

export default logger;
