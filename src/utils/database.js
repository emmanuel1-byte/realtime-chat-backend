import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import logger from "./logger.js";
const { DATABASE_URI } = process.env;
import Message from "../modules/message/model.js";

async function connectToDatabase() {
  try {
    await mongoose.connect(DATABASE_URI);
    logger.info("Database connection sucessfull");
  } catch (err) {
    logger.error(err.stack);
    throw new Error(`Error connectiong to Databae: ${err.message}`);
  }
}

export default connectToDatabase;
